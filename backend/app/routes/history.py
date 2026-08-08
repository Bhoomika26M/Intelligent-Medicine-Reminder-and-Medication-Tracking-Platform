from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
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
    patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user_id = current_user.id
    if patient_id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
        if not profile or (profile.caregiver_id != current_user.id and current_user.role.name != "Admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient's report"
            )
        target_user_id = patient_id
    return generate_adherence_report(db, target_user_id)

@router.get("", response_model=List[HistoryResponse])
def read_history(
    patient_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user_id = current_user.id
    if patient_id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
        if not profile or (profile.caregiver_id != current_user.id and current_user.role.name != "Admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this patient's history"
            )
        target_user_id = patient_id
    return get_user_history(db, target_user_id, skip, limit)
