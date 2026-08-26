from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Conversation, Message, Document, Feedback

def get_analytics(db: Session):
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()
    total_documents = db.query(Document).count()
    total_feedback = db.query(Feedback).count()
    
    avg_rating = db.query(func.avg(Feedback.rating)).scalar() or 0
    avg_rating = round(avg_rating, 2)
    
    recent_conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).limit(10).all()
    
    top_questions = db.query(Message).filter(Message.role == "user").order_by(Message.timestamp.desc()).limit(10).all()
    
    unanswered_questions = db.query(Message).filter(
        Message.role == "assistant",
        Message.content.like("%couldn't find reliable information%")
    ).order_by(Message.timestamp.desc()).limit(10).all()
    
    pos_feedback = db.query(Feedback).filter(Feedback.rating >= 4).count()
    neg_feedback = db.query(Feedback).filter(Feedback.rating <= 2).count()
    neutral_feedback = db.query(Feedback).filter(Feedback.rating == 3).count()
    
    return {
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "total_documents": total_documents,
        "total_feedback": total_feedback,
        "average_rating": avg_rating,
        "recent_conversations": [{"id": c.id, "title": c.title, "created_at": c.created_at} for c in recent_conversations],
        "top_questions": [{"id": m.id, "content": m.content, "timestamp": m.timestamp} for m in top_questions],
        "unanswered_questions": [{"id": m.id, "content": m.content, "timestamp": m.timestamp} for m in unanswered_questions],
        "feedback_summary": {
            "positive": pos_feedback,
            "negative": neg_feedback,
            "neutral": neutral_feedback
        }
    }
