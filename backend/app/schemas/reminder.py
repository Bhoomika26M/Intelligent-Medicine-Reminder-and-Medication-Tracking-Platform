from pydantic import BaseModel
from datetime import date, time
from typing import Optional
from app.schemas.medicine import MedicineResponse

class ReminderBase(BaseModel):
    reminder_date: date
    reminder_time: time
    status: str
    is_sent: bool = False
    is_enabled: bool = True  # Enable/Disable reminder

class ReminderCreate(BaseModel):
    medicine_id: int
    reminder_date: date
    reminder_time: str  # format "HH:MM:SS" or "HH:MM"

class ReminderStatusUpdate(BaseModel):
    status: str  # Taken, Skipped, Missed, Pending

class ReminderToggleUpdate(BaseModel):
    is_enabled: bool  # True = enabled, False = disabled

class ReminderResponse(ReminderBase):
    id: int
    user_id: int
    medicine_id: int
    medicine: Optional[MedicineResponse] = None

    class Config:
        from_attributes = True

