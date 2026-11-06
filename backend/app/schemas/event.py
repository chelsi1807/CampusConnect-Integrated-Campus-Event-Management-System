from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.category import CategoryResponse
from app.schemas.user import UserResponse

class EventBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category_id: int
    date: str  # YYYY-MM-DD
    start_time: str
    end_time: str
    venue: str
    capacity: int = Field(..., gt=0)
    waitlist_capacity: int = Field(50, ge=0)
    registration_deadline: str
    banner_url: Optional[str] = None
    eligibility: str = "Open to all students"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    venue: Optional[str] = None
    capacity: Optional[int] = None
    waitlist_capacity: Optional[int] = None
    registration_deadline: Optional[str] = None
    banner_url: Optional[str] = None
    eligibility: Optional[str] = None

class EventReview(BaseModel):
    status: str  # 'approved', 'rejected'
    rejection_reason: Optional[str] = None

class EventResponse(EventBase):
    id: int
    organizer_id: int
    status: str
    rejection_reason: Optional[str] = None
    reviewed_by_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Nested relations
    category: Optional[CategoryResponse] = None
    organizer: Optional[UserResponse] = None
    
    # Computed metrics
    confirmed_count: Optional[int] = 0
    waitlist_count: Optional[int] = 0
    remaining_seats: Optional[int] = 0
    is_registered: Optional[bool] = False
    user_registration_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EventListResponse(BaseModel):
    events: List[EventResponse]
    total: int
