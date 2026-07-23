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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_medicine(db, current_user.id, medicine_data)

@router.get("", response_model=List[MedicineResponse])
def read_medicines(
    search: Optional[str] = Query(None, description="Search term for name/category/type"),
    category: Optional[str] = Query(None, description="Filter by disease category"),
    sort_by: Optional[str] = Query(None, description="Sort options: name, remaining_stock, end_date"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_medicines(db, current_user.id, search, category, sort_by, skip, limit)

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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this medicine"
        )
    delete_medicine(db, medicine_id)
    return {"detail": "Medicine deleted successfully"}
