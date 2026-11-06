from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import AttendanceCheckInRequest, AttendanceResponse, AttendanceStatsResponse
from app.services.auth_service import require_role
from app.services.email_service import send_notification

router = APIRouter(prefix="/attendance", tags=["Attendance Tracking"])

@router.post("/check-in", response_model=AttendanceResponse)
def check_in_participant(
    check_in: AttendanceCheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    # 1. Fetch Event
    event = db.query(Event).filter(Event.id == check_in.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Verify permission: only the event's organizer or admin can mark attendance
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to mark attendance for this event")

    # 2. Find registration by registration_code or extract code if JSON string passed
    code = check_in.registration_code.strip()
    # Check if raw QR string with JSON was passed
    if "{" in code and "code" in code:
        import json
        try:
            parsed = json.loads(code)
            code = parsed.get("code", code)
        except Exception:
            pass

    reg = db.query(Registration).filter(
        Registration.registration_code == code,
        Registration.event_id == check_in.event_id
    ).first()

    if not reg:
        raise HTTPException(
            status_code=404,
            detail=f"Invalid QR code: No matching registration found for event '{event.title}'."
        )

    # 3. Check registration status
    if reg.status == "cancelled":
        raise HTTPException(status_code=400, detail="Check-in failed: This registration was previously cancelled.")
        
    if reg.status == "waitlisted":
        raise HTTPException(
            status_code=400,
            detail=f"Check-in failed: Participant is still on the waitlist (Position #{reg.waitlist_position}). Confirmed seats only."
        )

    # 4. Check for duplicate attendance (REQ-F20)
    existing_attendance = db.query(Attendance).filter(Attendance.registration_id == reg.id).first()
    if existing_attendance:
        time_formatted = existing_attendance.checked_in_at.strftime("%I:%M %p")
        raise HTTPException(
            status_code=400,
            detail=f"Participant '{reg.user.full_name}' was already checked in at {time_formatted}."
        )

    # 5. Record attendance
    now = datetime.now(timezone.utc)
    attendance_record = Attendance(
        registration_id=reg.id,
        event_id=event.id,
        user_id=reg.user_id,
        checked_in_at=now,
        verified_by_id=current_user.id,
        check_in_method=check_in.check_in_method
    )
    db.add(attendance_record)
    
    # Update registration status to attended
    reg.status = "attended"
    db.commit()
    db.refresh(attendance_record)

    # 6. Notify student
    student = reg.user
    send_notification(
        db=db,
        user_id=student.id,
        title="Attendance Checked In!",
        message=f"Your attendance for '{event.title}' was successfully recorded by {current_user.full_name}.",
        notification_type="success",
        link="/student/registrations",
        user_email=student.email
    )

    return attendance_record

@router.get("/event/{event_id}", response_model=List[AttendanceResponse])
def get_event_attendance_records(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    records = db.query(Attendance).filter(Attendance.event_id == event_id).order_by(Attendance.checked_in_at.desc()).all()
    return records

@router.get("/event/{event_id}/stats", response_model=AttendanceStatsResponse)
def get_event_attendance_stats(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    confirmed_count = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status.in_(["confirmed", "attended"])
    ).count()

    checked_in_count = db.query(Attendance).filter(Attendance.event_id == event_id).count()

    waitlist_count = db.query(Registration).filter(
        Registration.event_id == event_id,
        Registration.status == "waitlisted"
    ).count()

    rate = (checked_in_count / confirmed_count * 100.0) if confirmed_count > 0 else 0.0

    return {
        "event_id": event_id,
        "total_capacity": event.capacity,
        "confirmed_registrations": confirmed_count,
        "total_checked_in": checked_in_count,
        "attendance_rate": round(rate, 1),
        "waitlist_count": waitlist_count
    }

