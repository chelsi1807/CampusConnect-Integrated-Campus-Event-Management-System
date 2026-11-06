from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.event import Event
from app.models.feedback import Feedback
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackSummaryResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/feedback", tags=["Event Feedback"])

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == feedback_in.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if participant attended or registered
    reg = db.query(Registration).filter(
        Registration.event_id == feedback_in.event_id,
        Registration.user_id == current_user.id
    ).first()
    
    if not reg or reg.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="You can only submit feedback for events you registered for."
        )

    # Check if already submitted
    existing = db.query(Feedback).filter(
        Feedback.event_id == feedback_in.event_id,
        Feedback.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already submitted feedback for this event."
        )

    feedback = Feedback(
        event_id=feedback_in.event_id,
        user_id=current_user.id,
        rating=feedback_in.rating,
        content_rating=feedback_in.content_rating,
        organization_rating=feedback_in.organization_rating,
        venue_rating=feedback_in.venue_rating,
        comment=feedback_in.comment
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("/event/{event_id}", response_model=FeedbackSummaryResponse)
def get_event_feedback_summary(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view feedback for this event")

    feedbacks = db.query(Feedback).filter(Feedback.event_id == event_id).order_by(Feedback.created_at.desc()).all()
    total = len(feedbacks)

    if total == 0:
        return {
            "event_id": event_id,
            "total_feedbacks": 0,
            "average_rating": 0.0,
            "average_content": 0.0,
            "average_organization": 0.0,
            "average_venue": 0.0,
            "rating_distribution": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
            "recent_feedbacks": []
        }

    avg_rating = sum(f.rating for f in feedbacks) / total
    avg_content = sum(f.content_rating for f in feedbacks) / total
    avg_org = sum(f.organization_rating for f in feedbacks) / total
    avg_venue = sum(f.venue_rating for f in feedbacks) / total

    dist = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for f in feedbacks:
        key = str(f.rating)
        dist[key] = dist.get(key, 0) + 1

    return {
        "event_id": event_id,
        "total_feedbacks": total,
        "average_rating": round(avg_rating, 2),
        "average_content": round(avg_content, 2),
        "average_organization": round(avg_org, 2),
        "average_venue": round(avg_venue, 2),
        "rating_distribution": dist,
        "recent_feedbacks": feedbacks[:15]
    }

@router.get("/my-feedback/{event_id}")
def check_user_feedback(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fb = db.query(Feedback).filter(
        Feedback.event_id == event_id,
        Feedback.user_id == current_user.id
    ).first()
    return {"has_submitted": fb is not None, "feedback": fb}

