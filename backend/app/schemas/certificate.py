from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CertificateResponse(BaseModel):
    id: int
    certificate_number: str
    verification_code: str
    registration_id: int
    event_id: int
    user_id: int
    issued_at: datetime
    pdf_url: Optional[str] = None
    
    # Event & user details
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    student_name: Optional[str] = None
    student_id: Optional[str] = None
    organizer_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_number: Optional[str] = None
    issued_to: Optional[str] = None
    student_id: Optional[str] = None
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    event_venue: Optional[str] = None
    organizer_name: Optional[str] = None
    issued_at: Optional[datetime] = None
    message: str
