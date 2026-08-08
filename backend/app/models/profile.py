from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    full_name = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    blood_group = Column(String(10), nullable=True)
    diseases = Column(Text, nullable=True)
    profile_image = Column(Text, nullable=True)  # Can store Base64 or URL
    
    # New Milestone 1 & 2 fields
    height = Column(String(50), nullable=True)
    weight = Column(String(50), nullable=True)
    doctor_name = Column(String(100), nullable=True)
    medical_notes = Column(Text, nullable=True)
    caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="profile", foreign_keys=[user_id])
