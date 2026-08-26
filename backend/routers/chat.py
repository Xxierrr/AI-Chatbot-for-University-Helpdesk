import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, User, Conversation, Message
from auth import get_current_user
from services.rag_service import RAGService

router = APIRouter(prefix="/api", tags=["chat"])
rag_service = RAGService()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    user_id = current_user.id if current_user else None
    
    if request.conversation_id:
        conversation = db.query(Conversation).filter(Conversation.id == request.conversation_id).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.title == "New Conversation":
            conversation.title = request.message[:50] + ("..." if len(request.message) > 50 else "")
            db.commit()
    else:
        title = request.message[:50] + ("..." if len(request.message) > 50 else "")
        conversation = Conversation(user_id=user_id, title=title)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
    user_msg = Message(conversation_id=conversation.id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()
    
    recent_msgs = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.id.desc()).limit(10).all()
    history = [{"role": m.role, "content": m.content} for m in reversed(recent_msgs) if m.role != "user" or m.id != user_msg.id]
    
    response_data = rag_service.generate_answer(request.message, history)
    
    bot_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response_data["answer"],
        sources=json.dumps(response_data["sources"])
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    
    return {
        "conversation_id": conversation.id,
        "message": {
            "id": bot_msg.id,
            "content": bot_msg.content,
            "sources": response_data["sources"],
            "timestamp": bot_msg.timestamp
        }
    }

@router.get("/conversations")
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    convs = db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).all()
    return convs

@router.get("/conversations/{conv_id}")
def get_conversation_messages(conv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.timestamp.asc()).all()
    for m in messages:
        if m.sources:
            try:
                m.sources = json.loads(m.sources)
            except:
                m.sources = []
    return messages

@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.query(Message).filter(Message.conversation_id == conv_id).delete()
    db.delete(conv)
    db.commit()
    return {"status": "success"}
