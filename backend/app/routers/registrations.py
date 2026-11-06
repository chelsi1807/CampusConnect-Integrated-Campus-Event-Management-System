import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.certificate import Certificate
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.registration import RegistrationCreate, RegistrationResponse, RegistrationDetailResponse
from app.services.auth_service import get_current_user, require_role
from app.services.qr_service import generate_registration_code, generate_qr_base64
from app.services.email_service import send_notification

router = APIRouter(prefix="/registrations", tags=["Registrations"])

def enrich_registration_detail(reg: Registration, db: Session) -> RegistrationDetailResponse:
    event = reg.event
    has_attended = db.query(Attendance).filter(Attendance.registration_id == reg.id).first() is not None
    has_cert = db.query(Certificate).filter(Certificate.registration_id == reg.id).first() is not None
    has_feed = db.query(Feedback).filter(
        Feedback.event_id == reg.event_id,
        Feedback.user_id == reg.user_id
    ).first() is not None
    
    resp = RegistrationDetailResponse.model_validate(reg)
    resp.has_attended = has_attended
    resp.has_certificate = has_cert
    resp.has_feedback = has_feed
    
    if event:
        resp.event_title = event.title
        resp.event_date = event.date
        resp.event_start_time = event.start_time
        resp.event_end_time = event.end_time
        resp.event_venue = event.venue
        resp.event_status = event.status
        resp.event_banner_url = event.banner_url
        if event.category:
            resp.category_name = event.category.name
            resp.category_color = event.category.color
            
    return resp

@router.post("/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    reg_in: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch Event
    event = db.query(Event).filter(Event.id == reg_in.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # 2. Check Event Status
    if event.status != "approved":
        raise HTTPException(status_code=400, detail=f"Cannot register for an event with status '{event.status}'")
        
    # 3. Check Deadline
    try:
        # Check against date if deadline is in past
        now_str = datetime.now().strftime("%Y-%m-%d")
        if event.registration_deadline and event.registration_deadline < now_str:
            raise HTTPException(status_code=400, detail="The registration deadline for this event has passed")
    except Exception:
        pass

    # 4. Check for existing active registration
    existing_reg = db.query(Registration).filter(
        Registration.event_id == event.id,
        Registration.user_id == current_user.id
    ).first()
    
    if existing_reg:
        if existing_reg.status in ["confirmed", "waitlisted", "attended"]:
            raise HTTPException(
                status_code=400,
                detail=f"You already have an active registration for this event (Status: {existing_reg.status.capitalize()})"
            )
        # If previously cancelled, we can reactivate or create new
        if existing_reg.status == "cancelled":
            db.delete(existing_reg)
            db.commit()

    # 5. Check Capacity
    confirmed_count = db.query(Registration).filter(
        Registration.event_id == event.id,
        Registration.status.in_(["confirmed", "attended"])
    ).count()

    reg_status = "confirmed"
    waitlist_pos = None

    if confirmed_count >= event.capacity:
        # Seats full: check waitlist
        waitlist_count = db.query(Registration).filter(
            Registration.event_id == event.id,
            Registration.status == "waitlisted"
        ).count()

        if waitlist_count >= event.waitlist_capacity:
            raise HTTPException(
                status_code=400,
                detail="Sorry, this event and its waiting list are at maximum capacity."
            )
        
        reg_status = "waitlisted"
        waitlist_pos = waitlist_count + 1

    # 6. Generate unique code and QR payload
    reg_code = generate_registration_code(event.id, current_user.id)
    qr_payload = json.dumps({
        "code": reg_code,
        "event_id": event.id,
        "user_id": current_user.id,
        "student_name": current_user.full_name,
        "student_id": current_user.student_id or ""
    })
    qr_b64 = generate_qr_base64(qr_payload)

    # 7. Create registration
    new_reg = Registration(
        event_id=event.id,
        user_id=current_user.id,
        status=reg_status,
        registration_code=reg_code,
        qr_code_data=qr_b64,
        waitlist_position=waitlist_pos
    )
    db.add(new_reg)
    db.commit()
    db.refresh(new_reg)

    # 8. Send notification
    if reg_status == "confirmed":
        send_notification(
            db=db,
            user_id=current_user.id,
            title="Event Registration Confirmed!",
            message=f"You are officially registered for '{event.title}'. Your digital QR entry pass is ready.",
            notification_type="success",
            link="/student/registrations",
            user_email=current_user.email
        )
    else:
        send_notification(
            db=db,
            user_id=current_user.id,
            title="Added to Event Waitlist",
            message=f"You are on the waitlist (Position #{waitlist_pos}) for '{event.title}'. You will be notified automatically if a seat opens.",
            notification_type="info",
            link="/student/registrations",
            user_email=current_user.email
        )

    return new_reg

@router.get("/my-registrations", response_model=List[RegistrationDetailResponse])
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    registrations = db.query(Registration).filter(
        Registration.user_id == current_user.id,
        Registration.status != "cancelled"
    ).order_by(Registration.created_at.desc()).all()
    
    return [enrich_registration_detail(r, db) for r in registrations]

@router.post("/{registration_id}/cancel", response_model=RegistrationResponse)
def cancel_registration(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration record not found")
        
    if current_user.role != "admin" and reg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this registration")
        
    if reg.status == "cancelled":
        raise HTTPException(status_code=400, detail="Registration is already cancelled")
        
    if reg.status == "attended":
        raise HTTPException(status_code=400, detail="Cannot cancel after attendance has been marked")

    previous_status = reg.status
    event_id = reg.event_id
    
    # Mark as cancelled
    reg.status = "cancelled"
    reg.cancelled_at = datetime.now(timezone.utc)
    reg.waitlist_position = None
    db.commit()

    # If the cancelled participant was CONFIRMED, promote the first waitlisted participant!
    if previous_status == "confirmed":
        promoted_reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.status == "waitlisted"
        ).order_by(Registration.waitlist_position.asc()).first()

        if promoted_reg:
            promoted_reg.status = "confirmed"
            promoted_reg.waitlist_position = None
            db.commit()

            # Re-index remaining waitlisted participants
            remaining_waitlist = db.query(Registration).filter(
                Registration.event_id == event_id,
                Registration.status == "waitlisted"
            ).order_by(Registration.waitlist_position.asc()).all()

            for idx, w_reg in enumerate(remaining_waitlist, start=1):
                w_reg.waitlist_position = idx
            db.commit()

            # Notify the promoted participant
            event = db.query(Event).filter(Event.id == event_id).first()
            promoted_user = db.query(User).filter(User.id == promoted_reg.user_id).first()
            if event and promoted_user:
                send_notification(
                    db=db,
                    user_id=promoted_user.id,
                    title="Great News! Promoted to Confirmed Participant",
                    message=f"A seat became available for '{event.title}'. You have been automatically promoted from the waitlist to confirmed participant! Your QR pass is now active.",
                    notification_type="success",
                    link="/student/registrations",
                    user_email=promoted_user.email
                )

    return reg

@router.get("/event/{event_id}", response_model=List[RegistrationDetailResponse])
def get_event_registrations(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access participant records for this event")
        
    regs = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status != "cancelled"
    ).order_by(Registration.created_at.asc()).all()
    
    return [enrich_registration_detail(r, db) for r in regs]

