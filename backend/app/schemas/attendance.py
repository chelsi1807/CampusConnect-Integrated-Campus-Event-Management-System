from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse

class AttendanceCheckInRequest(BaseModel):
    registration_code: str
    event_id: int
    check_in_method: str = "qr_scan"  # 'qr_scan', 'manual'

class AttendanceResponse(BaseModel):
    id: int
    registration_id: int
    event_id: int
    user_id: int
    checked_in_at: datetime
    verified_by_id: int
    check_in_method: str
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AttendanceStatsResponse(BaseModel):
    event_id: int
    total_capacity: int
    confirmed_registrations: int
    total_checked_in: int
    attendance_rate: float
    waitlist_count: int
