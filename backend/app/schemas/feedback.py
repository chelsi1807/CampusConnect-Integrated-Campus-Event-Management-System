from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse

class FeedbackCreate(BaseModel):
    event_id: int
    rating: int = Field(..., ge=1, le=5)
    content_rating: int = Field(5, ge=1, le=5)
    organization_rating: int = Field(5, ge=1, le=5)
    venue_rating: int = Field(5, ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    event_id: int
    user_id: int
    rating: int
    content_rating: int
    organization_rating: int
    venue_rating: int
    comment: Optional[str] = None
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FeedbackSummaryResponse(BaseModel):
    event_id: int
    total_feedbacks: int
    average_rating: float
    average_content: float
    average_organization: float
    average_venue: float
    rating_distribution: dict
    recent_feedbacks: List[FeedbackResponse]
