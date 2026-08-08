from pydantic import BaseModel
from datetime import date
from typing import Optional

class MedicineBase(BaseModel):
    name: str
    disease_category: Optional[str] = None
    dosage: str
    medicine_type: Optional[str] = None
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    before_food: bool = False
    after_food: bool = False
    disease: Optional[str] = None
    frequency: str
    instructions: Optional[str] = None
    quantity: int
    remaining_stock: int
    start_date: date
    end_date: date
    reminder_time: str  # Comma-separated times, e.g. "08:00,13:00,20:00"
    medicine_image: Optional[str] = None

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    disease_category: Optional[str] = None
    dosage: Optional[str] = None
    medicine_type: Optional[str] = None
    morning: Optional[bool] = None
    afternoon: Optional[bool] = None
    night: Optional[bool] = None
    before_food: Optional[bool] = None
    after_food: Optional[bool] = None
    disease: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    quantity: Optional[int] = None
    remaining_stock: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    reminder_time: Optional[str] = None
    medicine_image: Optional[str] = None

class MedicineResponse(MedicineBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
