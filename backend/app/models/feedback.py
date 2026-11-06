from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    rating = Column(Integer, nullable=False)  # Overall 1-5
    content_rating = Column(Integer, default=5, nullable=False)  # 1-5
    organization_rating = Column(Integer, default=5, nullable=False)  # 1-5
    venue_rating = Column(Integer, default=5, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    event = relationship("Event", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_user_feedback"),
    )
