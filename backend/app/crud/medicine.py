from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.medicine import Medicine
from app.schemas.medicine import MedicineCreate, MedicineUpdate

def create_medicine(db: Session, user_id: int, medicine_data: MedicineCreate) -> Medicine:
    db_medicine = Medicine(
        user_id=user_id,
        **medicine_data.model_dump()
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def get_medicine_by_id(db: Session, medicine_id: int) -> Medicine:
    return db.query(Medicine).filter(Medicine.id == medicine_id).first()

def get_user_medicines(
    db: Session, 
    user_id: int, 
    search: str = None, 
    category: str = None, 
    sort_by: str = None, 
    skip: int = 0, 
    limit: int = 100
):
    query = db.query(Medicine).filter(Medicine.user_id == user_id)
    
    if search:
        query = query.filter(
            or_(
                Medicine.name.ilike(f"%{search}%"),
                Medicine.disease_category.ilike(f"%{search}%"),
                Medicine.medicine_type.ilike(f"%{search}%")
            )
        )
    if category:
        query = query.filter(Medicine.disease_category == category)
        
    if sort_by:
        if sort_by == "name":
            query = query.order_by(Medicine.name.asc())
        elif sort_by == "remaining_stock":
            query = query.order_by(Medicine.remaining_stock.asc())
        elif sort_by == "end_date":
            query = query.order_by(Medicine.end_date.asc())
    else:
        query = query.order_by(Medicine.id.desc())
        
    return query.offset(skip).limit(limit).all()

def update_medicine(db: Session, medicine_id: int, medicine_data: MedicineUpdate) -> Medicine:
    db_medicine = get_medicine_by_id(db, medicine_id)
    if not db_medicine:
        return None
        
    for key, value in medicine_data.model_dump(exclude_unset=True).items():
        setattr(db_medicine, key, value)
        
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

def delete_medicine(db: Session, medicine_id: int) -> bool:
    db_medicine = get_medicine_by_id(db, medicine_id)
    if not db_medicine:
        return False
    db.delete(db_medicine)
    db.commit()
    return True
