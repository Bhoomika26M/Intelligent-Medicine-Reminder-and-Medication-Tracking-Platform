from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    
    reminder_date = Column(Date, nullable=False)
    reminder_time = Column(Time, nullable=False)
    status = Column(String(20), default="Pending", nullable=False)  # Pending, Taken, Skipped, Missed
    is_sent = Column(Boolean, default=False, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)  # Enable/Disable individual reminder

    user = relationship("User", back_populates="reminders")
    medicine = relationship("Medicine", back_populates="reminders")
