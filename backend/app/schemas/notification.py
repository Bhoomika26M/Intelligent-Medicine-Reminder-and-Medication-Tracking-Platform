from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    reminder_time: Optional[str] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    timestamp: str

    class Config:
        from_attributes = True
