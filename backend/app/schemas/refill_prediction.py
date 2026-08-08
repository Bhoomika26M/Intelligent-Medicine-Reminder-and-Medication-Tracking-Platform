from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class RefillPredictionBase(BaseModel):
    remaining_quantity: int
    average_daily_consumption: float
    estimated_refill_date: Optional[date] = None
    days_left: int
    low_stock_alert: bool

class RefillPredictionCreate(RefillPredictionBase):
    user_id: int
    medicine_id: int

class RefillPredictionResponse(RefillPredictionBase):
    id: int
    user_id: int
    medicine_id: int
    last_calculated: datetime

    class Config:
        from_attributes = True
