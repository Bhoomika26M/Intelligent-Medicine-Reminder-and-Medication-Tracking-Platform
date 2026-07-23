from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MedicationHistory(Base):
    __tablename__ = "medication_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(String(20), nullable=False)  # Taken, Missed, Skipped
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)

    user = relationship("User", back_populates="history_records")
    medicine = relationship("Medicine", back_populates="history_records")
