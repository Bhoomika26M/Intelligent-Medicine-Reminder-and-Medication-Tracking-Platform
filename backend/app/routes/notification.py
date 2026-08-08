from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["System Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    
    res = []
    for n in notifications:
        res.append(NotificationResponse(
            id=n.id,
            user_id=n.user_id,
            title=n.title,
            message=n.message,
            is_read=n.is_read,
            created_at=n.created_at,
            timestamp=n.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            medicine_name=n.medicine_name,
            dosage=n.dosage,
            reminder_time=n.reminder_time
        ))
    return res

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id != current_user.id and current_user.role.name != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return NotificationResponse(
        id=notif.id,
        user_id=notif.user_id,
        title=notif.title,
        message=notif.message,
        is_read=notif.is_read,
        created_at=notif.created_at,
        timestamp=notif.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        medicine_name=notif.medicine_name,
        dosage=notif.dosage,
        reminder_time=notif.reminder_time
    )

@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notif.user_id != current_user.id and current_user.role.name != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(notif)
    db.commit()
    return {"detail": "Notification deleted successfully"}

@router.delete("", status_code=status.HTTP_200_OK)
def clear_all_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id).delete()
    db.commit()
    return {"detail": "All notifications cleared"}
