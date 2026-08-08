from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class RefillPrediction(Base):
    __tablename__ = "refill_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=False)
    
    remaining_quantity = Column(Integer, nullable=False)
    average_daily_consumption = Column(Float, default=1.0, nullable=False)
    estimated_refill_date = Column(Date, nullable=True)
    days_left = Column(Integer, default=0, nullable=False)
    low_stock_alert = Column(Boolean, default=False, nullable=False)
    last_calculated = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", backref="refill_predictions")
    medicine = relationship("Medicine", backref="refill_predictions")
