from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.history import HistoryCreate, HistoryResponse, ReportSummary
from app.crud.history import create_history_record, get_user_history, generate_adherence_report

router = APIRouter(prefix="/history", tags=["Medication History & Reports"])

@router.post("", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED)
def record_history(
    history_data: HistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_history_record(db, current_user.id, history_data)

@router.get("/report", response_model=ReportSummary)
def read_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return generate_adherence_report(db, current_user.id)

@router.get("", response_model=List[HistoryResponse])
def read_history(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_history(db, current_user.id, skip, limit)
