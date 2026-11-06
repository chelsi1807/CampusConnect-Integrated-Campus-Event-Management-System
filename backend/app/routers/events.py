from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.event import Event
from app.models.category import Category
from app.models.registration import Registration
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate, EventReview, EventResponse, EventListResponse
from app.services.auth_service import get_current_user, require_role
from app.services.email_service import send_notification

router = APIRouter(prefix="/events", tags=["Events"])

def enrich_event_response(event: Event, db: Session, user: Optional[User] = None) -> EventResponse:
    confirmed_count = db.query(Registration).filter(
        Registration.event_id == event.id,
        Registration.status.in_(["confirmed", "attended"])
    ).count()
    
    waitlist_count = db.query(Registration).filter(
        Registration.event_id == event.id,
        Registration.status == "waitlisted"
    ).count()
    
    remaining_seats = max(0, event.capacity - confirmed_count)
    
    is_registered = False
    user_status = None
    if user:
        reg = db.query(Registration).filter(
            Registration.event_id == event.id,
            Registration.user_id == user.id,
            Registration.status != "cancelled"
        ).first()
        if reg:
            is_registered = True
            user_status = reg.status

    data = EventResponse.model_validate(event)
    data.confirmed_count = confirmed_count
    data.waitlist_count = waitlist_count
    data.remaining_seats = remaining_seats
    data.is_registered = is_registered
    data.user_registration_status = user_status
    return data

@router.get("/", response_model=EventListResponse)
def get_events(
    category_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    only_available: Optional[bool] = False,
    featured: Optional[bool] = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    # By default, public listing only returns approved or completed events
    if status_filter:
        query = query.filter(Event.status == status_filter)
    else:
        query = query.filter(Event.status.in_(["approved", "completed"]))
        
    if category_id:
        query = query.filter(Event.category_id == category_id)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Event.title.ilike(search_pattern)) | 
            (Event.description.ilike(search_pattern)) |
            (Event.venue.ilike(search_pattern))
        )
        
    if date_from:
        query = query.filter(Event.date >= date_from)
    if date_to:
        query = query.filter(Event.date <= date_to)
        
    total = query.count()
    events = query.order_by(Event.date.asc(), Event.start_time.asc()).offset((page - 1) * limit).limit(limit).all()
    
    enriched = [enrich_event_response(e, db) for e in events]
    
    if only_available:
        enriched = [e for e in enriched if (e.remaining_seats or 0) > 0]
        
    return {"events": enriched, "total": total}

@router.get("/organizer/my-events", response_model=List[EventResponse])
def get_organizer_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    query = db.query(Event)
    if current_user.role == "organizer":
        query = query.filter(Event.organizer_id == current_user.id)
    events = query.order_by(Event.created_at.desc()).all()
    return [enrich_event_response(e, db, current_user) for e in events]

@router.get("/admin/pending-approvals", response_model=List[EventResponse])
def get_pending_events(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    events = db.query(Event).filter(Event.status == "pending").order_by(Event.created_at.desc()).all()
    return [enrich_event_response(e, db, admin_user) for e in events]

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return enrich_event_response(event, db)

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    category = db.query(Category).filter(Category.id == event_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category selected")
        
    # Default banner image if none provided
    banner = event_in.banner_url
    if not banner:
        banner = f"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"

    # Admin created events can be auto-approved, organizer events start as pending
    initial_status = "approved" if current_user.role == "admin" else "pending"

    event = Event(
        **event_in.model_dump(exclude={"banner_url"}),
        banner_url=banner,
        organizer_id=current_user.id,
        status=initial_status
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Notify admins if pending
    if initial_status == "pending":
        admins = db.query(User).filter(User.role == "admin").all()
        for adm in admins:
            send_notification(
                db=db,
                user_id=adm.id,
                title="New Event Submitted for Approval",
                message=f"Organizer {current_user.full_name} submitted '{event.title}' for administrative review.",
                notification_type="warning",
                link="/admin/approvals",
                user_email=adm.email
            )
            
    return enrich_event_response(event, db, current_user)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Only creator or admin can update
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")
        
    for key, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
        
    db.commit()
    db.refresh(event)
    return enrich_event_response(event, db, current_user)

@router.post("/{event_id}/review", response_model=EventResponse)
def review_event(
    event_id: int,
    review: EventReview,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if review.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be either 'approved' or 'rejected'")
        
    event.status = review.status
    event.rejection_reason = review.rejection_reason if review.status == "rejected" else None
    event.reviewed_by_id = admin_user.id
    event.reviewed_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(event)
    
    # Notify event organizer
    status_label = "approved" if review.status == "approved" else "rejected"
    msg = f"Your event '{event.title}' has been {status_label} by the administrator."
    if review.rejection_reason:
        msg += f" Reason: {review.rejection_reason}"
        
    send_notification(
        db=db,
        user_id=event.organizer_id,
        title=f"Event {status_label.capitalize()}: {event.title}",
        message=msg,
        notification_type="success" if review.status == "approved" else "warning",
        link=f"/events/{event.id}",
        user_email=event.organizer.email if event.organizer else None
    )
    
    return enrich_event_response(event, db, admin_user)

@router.post("/{event_id}/status", response_model=EventResponse)
def change_event_status(
    event_id: int,
    status_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    valid_statuses = ["pending", "approved", "rejected", "cancelled", "completed"]
    if status_name not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    event.status = status_name
    db.commit()
    db.refresh(event)
    return enrich_event_response(event, db, current_user)
