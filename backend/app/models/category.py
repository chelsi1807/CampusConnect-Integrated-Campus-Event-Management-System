from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Calendar", nullable=False)  # Icon name
    color = Column(String(50), default="indigo", nullable=False)   # Color theme

    events = relationship("Event", back_populates="category")

