from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_number = Column(String(64), unique=True, index=True, nullable=False)
    verification_code = Column(String(64), unique=True, index=True, nullable=False)
    registration_id = Column(Integer, ForeignKey("registrations.id"), unique=True, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    pdf_path = Column(String(255), nullable=True)

    # Relationships
    registration = relationship("Registration", back_populates="certificate")
    event = relationship("Event", back_populates="certificates")
    user = relationship("User", back_populates="certificates")
