from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), unique=True, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    checked_in_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    verified_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in_method = Column(String(30), default="qr_scan", nullable=False)  # 'qr_scan', 'manual'

    # Relationships
    registration = relationship("Registration", back_populates="attendance")
    event = relationship("Event", back_populates="attendances")
    user = relationship("User", foreign_keys=[user_id])
    verified_by = relationship("User", foreign_keys=[verified_by_id])

