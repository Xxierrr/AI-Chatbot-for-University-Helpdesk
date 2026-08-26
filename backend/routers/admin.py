import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db, User, Document, Message, Feedback
from auth import require_admin
from services.document_service import DocumentService
from services.analytics_service import get_analytics
from config import settings

router = APIRouter(prefix="/api/admin", tags=["admin"])
doc_service = DocumentService()

@router.get("/documents")
def list_documents(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return db.query(Document).all()

@router.post("/documents")
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    ext = file.filename.split('.')[-1].lower()
    if ext not in ['pdf', 'doc', 'docx', 'txt']:
        raise HTTPException(status_code=400, detail="Invalid file type")
        
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{os.urandom(8).hex()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    
    new_doc = Document(
        title=title,
        filename=filename,
        original_filename=file.filename,
        category=category,
        file_size=file_size,
        status="processing"
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    result = doc_service.process_document(file_path, file.filename, title, category, new_doc.id)
    if result["status"] == "error":
        new_doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=result["message"])
        
    new_doc.status = "ready"
    new_doc.chunk_count = result["chunk_count"]
    db.commit()
    
    return new_doc

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_service.delete_document_chunks(doc_id)
    
    file_path = os.path.join(settings.UPLOAD_DIR, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
    db.delete(doc)
    db.commit()
    return {"status": "success"}

@router.get("/analytics")
def analytics(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return get_analytics(db)

@router.get("/unanswered")
def unanswered(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    msgs = db.query(Message).filter(
        Message.role == "assistant",
        Message.content.like("%couldn't find reliable information%")
    ).order_by(Message.timestamp.desc()).all()
    return msgs

@router.get("/feedback")
def get_all_feedback(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()
