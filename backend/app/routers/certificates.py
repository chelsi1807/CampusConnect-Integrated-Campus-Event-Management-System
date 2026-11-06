import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.certificate import CertificateResponse, CertificateVerifyResponse
from app.services.auth_service import get_current_user, require_role
from app.services.certificate_service import generate_certificate_pdf
from app.services.email_service import send_notification

router = APIRouter(prefix="/certificates", tags=["Digital Certificates"])

def create_certificate_for_registration(reg: Registration, db: Session) -> Certificate:
    # Verify attendance
    attendance = db.query(Attendance).filter(Attendance.registration_id == reg.id).first()
    if not attendance:
        raise HTTPException(
            status_code=400,
            detail="Cannot issue certificate: Participant has not attended this event."
        )

    # Check if certificate already exists
    existing = db.query(Certificate).filter(Certificate.registration_id == reg.id).first()
    if existing:
        return existing

    # Generate unique certificate number & verification code
    year = datetime.now().year
    random_id = uuid.uuid4().hex[:6].upper()
    cert_number = f"CERT-{year}-CC{reg.event_id}{reg.user_id}-{random_id}"
    verification_code = uuid.uuid4().hex

    event = reg.event
    user = reg.user

    # Generate PDF
    pdf_path = generate_certificate_pdf(
        certificate_number=cert_number,
        verification_code=verification_code,
        student_name=user.full_name,
        student_id=user.student_id or "",
        event_title=event.title,
        event_date=event.date,
        event_venue=event.venue,
        organizer_name=event.organizer.full_name if event.organizer else "CampusConnect",
        output_dir="certificates"
    )

    cert = Certificate(
        certificate_number=cert_number,
        verification_code=verification_code,
        registration_id=reg.id,
        event_id=event.id,
        user_id=user.id,
        pdf_path=pdf_path
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    # Notify student
    send_notification(
        db=db,
        user_id=user.id,
        title="Certificate of Participation Ready!",
        message=f"Congratulations! Your digital certificate for '{event.title}' is now available to view and download.",
        notification_type="success",
        link="/student/certificates",
        user_email=user.email
    )

    return cert

@router.post("/generate/{registration_id}", response_model=CertificateResponse)
def generate_single_certificate(
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin", "student"]))
):
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")

    # If student, they can only generate for their own registration
    if current_user.role == "student" and reg.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # If organizer, must own event
    if current_user.role == "organizer" and reg.event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this event")

    cert = create_certificate_for_registration(reg, db)
    return enrich_certificate_response(cert)

@router.post("/batch-generate/{event_id}", response_model=List[CertificateResponse])
def batch_generate_certificates(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["organizer", "admin"]))
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user.role != "admin" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Find all attended registrations
    attendances = db.query(Attendance).filter(Attendance.event_id == event_id).all()
    if not attendances:
        raise HTTPException(status_code=400, detail="No participants have attended this event yet.")

    generated_certs = []
    for att in attendances:
        reg = att.registration
        if reg:
            cert = create_certificate_for_registration(reg, db)
            generated_certs.append(enrich_certificate_response(cert))

    return generated_certs

def enrich_certificate_response(cert: Certificate) -> CertificateResponse:
    resp = CertificateResponse.model_validate(cert)
    resp.pdf_url = f"/api/certificates/download/{cert.certificate_number}"
    if cert.event:
        resp.event_title = cert.event.title
        resp.event_date = cert.event.date
        resp.organizer_name = cert.event.organizer.full_name if cert.event.organizer else "CampusConnect"
    if cert.user:
        resp.student_name = cert.user.full_name
        resp.student_id = cert.user.student_id
    return resp

@router.get("/my-certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).order_by(Certificate.issued_at.desc()).all()
    return [enrich_certificate_response(c) for c in certs]

@router.get("/download/{certificate_number}")
def download_certificate(
    certificate_number: str,
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.certificate_number == certificate_number).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    if not cert.pdf_path or not os.path.exists(cert.pdf_path):
        # Regenerate if file missing
        reg = cert.registration
        event = cert.event
        user = cert.user
        pdf_path = generate_certificate_pdf(
            certificate_number=cert.certificate_number,
            verification_code=cert.verification_code,
            student_name=user.full_name,
            student_id=user.student_id or "",
            event_title=event.title,
            event_date=event.date,
            event_venue=event.venue,
            organizer_name=event.organizer.full_name if event.organizer else "CampusConnect",
            output_dir="certificates"
        )
        cert.pdf_path = pdf_path
        db.commit()

    return FileResponse(
        cert.pdf_path,
        media_type="application/pdf",
        filename=f"CampusConnect_Certificate_{cert.certificate_number}.pdf"
    )

@router.get("/verify/{verification_code}", response_model=CertificateVerifyResponse)
def verify_certificate(
    verification_code: str,
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(
        (Certificate.verification_code == verification_code) |
        (Certificate.certificate_number == verification_code)
    ).first()

    if not cert:
        return {
            "is_valid": False,
            "message": "Verification failed: No official CampusConnect certificate exists with this code."
        }

    return {
        "is_valid": True,
        "certificate_number": cert.certificate_number,
        "issued_to": cert.user.full_name if cert.user else "Unknown Student",
        "student_id": cert.user.student_id if cert.user else None,
        "event_title": cert.event.title if cert.event else "Unknown Event",
        "event_date": cert.event.date if cert.event else "N/A",
        "event_venue": cert.event.venue if cert.event else "Campus",
        "organizer_name": cert.event.organizer.full_name if (cert.event and cert.event.organizer) else "Academic Affairs",
        "issued_at": cert.issued_at,
        "message": "Certificate is verified and authentically issued by CampusConnect."
    }

