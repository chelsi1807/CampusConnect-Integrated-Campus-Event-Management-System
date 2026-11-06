from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse

class RegistrationCreate(BaseModel):
    event_id: int

class RegistrationResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    status: str  # 'confirmed', 'waitlisted', 'cancelled', 'attended'
    registration_code: str
    qr_code_data: str
    waitlist_position: Optional[int] = None
    created_at: datetime
    cancelled_at: Optional[datetime] = None
    
    # Details
    user: Optional[UserResponse] = None
    has_attended: Optional[bool] = False
    has_certificate: Optional[bool] = False
    has_feedback: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class RegistrationDetailResponse(RegistrationResponse):
    event_title: Optional[str] = None
    event_date: Optional[str] = None
    event_start_time: Optional[str] = None
    event_end_time: Optional[str] = None
    event_venue: Optional[str] = None
    event_status: Optional[str] = None
    event_banner_url: Optional[str] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None
