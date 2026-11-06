from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    organizer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    date = Column(String(20), nullable=False)  # ISO date string YYYY-MM-DD
    start_time = Column(String(20), nullable=False)  # e.g., "10:00 AM"
    end_time = Column(String(20), nullable=False)    # e.g., "04:00 PM"
    venue = Column(String(200), nullable=False)
    capacity = Column(Integer, nullable=False)
    waitlist_capacity = Column(Integer, default=50, nullable=False)
    registration_deadline = Column(String(30), nullable=False)  # ISO string or date
    banner_url = Column(String(500), nullable=True)
    eligibility = Column(String(255), default="Open to all students", nullable=False)
    
    # Status: 'pending', 'approved', 'rejected', 'cancelled', 'completed'
    status = Column(String(20), default="pending", index=True, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    category = relationship("Category", back_populates="events")
    organizer = relationship("User", foreign_keys=[organizer_id], back_populates="organized_events")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="event", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="event", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
