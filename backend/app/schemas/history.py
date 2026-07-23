from pydantic import BaseModel
from datetime import date, time
from typing import Optional, List, Dict, Any
from app.schemas.medicine import MedicineResponse

class HistoryBase(BaseModel):
    status: str  # Taken, Missed, Skipped
    date: date
    time: time

class HistoryCreate(BaseModel):
    medicine_id: int
    status: str  # Taken, Missed, Skipped
    date: Optional[date] = None  # defaults to today
    time: Optional[str] = None  # HH:MM:SS, defaults to now

class HistoryResponse(HistoryBase):
    id: int
    user_id: int
    medicine_id: int
    medicine: Optional[MedicineResponse] = None

    class Config:
        from_attributes = True

class ReportSummary(BaseModel):
    adherence_rate: float
    total_doses: int
    taken_count: int
    skipped_count: int
    missed_count: int
    daily_report: List[Dict[str, Any]]
    weekly_report: List[Dict[str, Any]]
    monthly_report: List[Dict[str, Any]]
    missed_dose_analysis: Dict[str, Any]
