from sqlalchemy import Column, Integer, String, Text, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    name = Column(String(100), nullable=False)
    disease_category = Column(String(100), nullable=True)
    dosage = Column(String(50), nullable=False)
    medicine_type = Column(String(50), nullable=True)  # e.g., Pill, Syrup, Capsule
    
    morning = Column(Boolean, default=False, nullable=False)
    afternoon = Column(Boolean, default=False, nullable=False)
    night = Column(Boolean, default=False, nullable=False)
    
    frequency = Column(String(50), nullable=False)  # e.g., Daily, Weekly, Alternating
    instructions = Column(Text, nullable=True)
    
    before_food = Column(Boolean, default=False, nullable=False)
    after_food = Column(Boolean, default=False, nullable=False)
    disease = Column(String(100), nullable=True)
    
    quantity = Column(Integer, nullable=False)
    remaining_stock = Column(Integer, nullable=False)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reminder_time = Column(String(100), nullable=False)  # Comma-separated times (e.g. "08:00,13:00,20:00")
    medicine_image = Column(Text, nullable=True)  # Base64 string or image URL

    user = relationship("User", back_populates="medicines")
    reminders = relationship("Reminder", back_populates="medicine", cascade="all, delete-orphan")
    history_records = relationship("MedicationHistory", back_populates="medicine", cascade="all, delete-orphan")
