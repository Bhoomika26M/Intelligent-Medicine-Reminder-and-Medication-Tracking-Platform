from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.crud.medicine import (
    create_medicine,
    get_medicine_by_id,
    get_user_medicines,
    update_medicine,
    delete_medicine
)

router = APIRouter(tags=["Medicine Management"])

@router.post("", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def add_medicine(
    medicine_data: MedicineCreate,
    patient_id: Optional[int] = Query(None, description="Patient ID to add medicine for (Caregiver use-case)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user_id = current_user.id
    if patient_id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
        if not profile or profile.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to manage this patient's medicines"
            )
        target_user_id = patient_id

    from app.models.medicine import Medicine
    existing = db.query(Medicine).filter(
        Medicine.user_id == target_user_id,
        Medicine.name.ilike(medicine_data.name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A medicine named '{medicine_data.name}' is already registered for this user."
        )
    return create_medicine(db, target_user_id, medicine_data)

@router.get("", response_model=List[MedicineResponse])
def read_medicines(
    search: Optional[str] = Query(None, description="Search term for name/category/type"),
    category: Optional[str] = Query(None, description="Filter by disease category"),
    sort_by: Optional[str] = Query(None, description="Sort options: name, remaining_stock, end_date"),
    patient_id: Optional[int] = Query(None, description="Patient ID to fetch medicines for (Caregiver use-case)"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user_id = current_user.id
    if patient_id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
        if not profile or profile.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this patient's medicines"
            )
        target_user_id = patient_id

    return get_user_medicines(db, target_user_id, search, category, sort_by, skip, limit)

@router.get("/{medicine_id}", response_model=MedicineResponse)
def read_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medicine = get_medicine_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    if medicine.user_id != current_user.id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == medicine.user_id).first()
        if not profile or profile.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this medicine"
            )
    return medicine

@router.put("/{medicine_id}", response_model=MedicineResponse)
def edit_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medicine = get_medicine_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    if medicine.user_id != current_user.id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == medicine.user_id).first()
        if not profile or profile.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this medicine"
            )
    return update_medicine(db, medicine_id, medicine_data)

@router.delete("/{medicine_id}", status_code=status.HTTP_200_OK)
def remove_medicine(
    medicine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medicine = get_medicine_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
    if medicine.user_id != current_user.id:
        from app.models.profile import Profile
        profile = db.query(Profile).filter(Profile.user_id == medicine.user_id).first()
        if not profile or profile.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this medicine"
            )
    delete_medicine(db, medicine_id)
    return {"detail": "Medicine deleted successfully"}
