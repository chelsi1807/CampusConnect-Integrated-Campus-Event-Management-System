from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Status: 'confirmed', 'waitlisted', 'cancelled', 'attended'
    status = Column(String(20), default="confirmed", index=True, nullable=False)
    registration_code = Column(String(64), unique=True, index=True, nullable=False)
    qr_code_data = Column(Text, nullable=False)
    waitlist_position = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    cancelled_at = Column(DateTime, nullable=True)

    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")
    attendance = relationship("Attendance", back_populates="registration", uselist=False, cascade="all, delete-orphan")
    certificate = relationship("Certificate", back_populates="registration", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_user_registration"),
    )
