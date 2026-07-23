from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import List, Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.reminder import ReminderCreate, ReminderResponse, ReminderStatusUpdate
from app.crud.reminder import (
    create_reminder,
    get_reminder_by_id,
    get_user_reminders,
    update_reminder_status,
    delete_reminder
)

router = APIRouter(tags=["Medication Reminders"])

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def schedule_reminder(
    reminder_data: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_reminder(db, current_user.id, reminder_data)

@router.get("", response_model=List[ReminderResponse])
def read_reminders(
    date_filter: Optional[str] = Query(None, description="ISO date format: YYYY-MM-DD"),
    status_filter: Optional[str] = Query(None, description="Filter by status: Pending, Taken, Skipped, Missed"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = None
    if date_filter:
        try:
            target_date = date.fromisoformat(date_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
    return get_user_reminders(db, current_user.id, target_date, status_filter)

@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_status(
    reminder_id: int,
    status_data: ReminderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = get_reminder_by_id(db, reminder_id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    if reminder.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this reminder"
        )
    
    updated = update_reminder_status(db, reminder_id, status_data.status)
    return updated

@router.delete("/{reminder_id}", status_code=status.HTTP_200_OK)
def remove_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminder = get_reminder_by_id(db, reminder_id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reminder not found"
        )
    if reminder.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this reminder"
        )
    delete_reminder(db, reminder_id)
    return {"detail": "Reminder deleted successfully"}

@router.post("/generate-today", status_code=status.HTTP_200_OK)
def trigger_generation_for_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger generation of all scheduled reminders for today
    for active medicines of the current user.
    """
    from datetime import date, datetime, time as pytime
    from app.models.medicine import Medicine
    from app.models.reminder import Reminder
    
    today = date.today()
    active_medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.start_date <= today,
        Medicine.end_date >= today
    ).all()
    
    generated_count = 0
    for medicine in active_medicines:
        times = [t.strip() for t in medicine.reminder_time.split(",") if t.strip()]
        for t_str in times:
            parts = t_str.split(":")
            if len(parts) >= 2:
                hh, mm = parts[0], parts[1]
                t_obj = pytime(int(hh), int(mm))
                
                # Check if reminder already exists
                existing = db.query(Reminder).filter(
                    Reminder.medicine_id == medicine.id,
                    Reminder.reminder_date == today,
                    Reminder.reminder_time == t_obj
                ).first()
                
                if not existing:
                    new_reminder = Reminder(
                        user_id=current_user.id,
                        medicine_id=medicine.id,
                        reminder_date=today,
                        reminder_time=t_obj,
                        status="Pending",
                        is_sent=True
                    )
                    db.add(new_reminder)
                    generated_count += 1
    
    if generated_count > 0:
        db.commit()
        
    return {"detail": f"Generated {generated_count} reminders for today."}
