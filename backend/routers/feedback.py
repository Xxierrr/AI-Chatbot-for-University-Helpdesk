from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Feedback, Message, User
from auth import get_current_user

router = APIRouter(prefix="/api/feedback", tags=["feedback"])

class FeedbackCreate(BaseModel):
    message_id: int
    rating: int
    comment: Optional[str] = None

@router.post("")
def submit_feedback(data: FeedbackCreate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user)):
    msg = db.query(Message).filter(Message.id == data.message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
    fb = Feedback(
        message_id=data.message_id,
        user_id=current_user.id if current_user else None,
        rating=data.rating,
        comment=data.comment
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb

@router.get("/{message_id}")
def get_feedback(message_id: int, db: Session = Depends(get_db)):
    fb = db.query(Feedback).filter(Feedback.message_id == message_id).all()
    return fb
