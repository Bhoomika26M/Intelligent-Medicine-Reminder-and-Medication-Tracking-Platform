from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import List, Optional
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.medicine import Medicine
from app.models.history import MedicationHistory
from app.models.profile import Profile
from app.models.notification import Notification
from app.models.refill_prediction import RefillPrediction
from app.schemas.refill_prediction import RefillPredictionResponse

router = APIRouter(prefix="/refill", tags=["AI Refill Prediction Engine"])

def run_predictions_for_user(db: Session, user_id: int) -> List[RefillPrediction]:
    """
    Executes refill calculations for all active medicines of the user,
    saves predictions to the database, sends alerts, and returns the records.
    """
    today = date.today()
    
    # 1. Fetch user's medicines
    medicines = db.query(Medicine).filter(Medicine.user_id == user_id).all()
    predictions = []
    
    # Get user profile for name and caregiver link
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    patient_name = profile.full_name if (profile and profile.full_name) else "Patient"
    
    for medicine in medicines:
        # Calculate scheduled doses per day
        reminder_times = [t.strip() for t in medicine.reminder_time.split(",") if t.strip()]
        scheduled_per_day = len(reminder_times)
        if scheduled_per_day <= 0:
            scheduled_per_day = 1.0  # Default to 1 dose per day to avoid divide-by-zero
            
        # Get adherence modifier based on medication history
        history = db.query(MedicationHistory).filter(
            MedicationHistory.user_id == user_id,
            MedicationHistory.medicine_id == medicine.id
        ).all()
        
        if len(history) > 0:
            taken_count = sum(1 for h in history if h.status == "Taken")
            adherence_rate = taken_count / len(history)
        else:
            adherence_rate = 1.0  # Perfect adherence assumed initially
            
        # Average Daily Consumption
        average_daily_consumption = scheduled_per_day * adherence_rate
        if average_daily_consumption <= 0:
            average_daily_consumption = 1.0  # Default to avoid zero division
            
        # Calculate days left
        remaining = medicine.remaining_stock if medicine.remaining_stock is not None else 0
        days_left = int(remaining / average_daily_consumption)
        
        # Calculate estimated refill date
        estimated_refill_date = today + timedelta(days=days_left)
        
        # Low stock alert conditions (<= 5 remaining OR <= 5 days left)
        low_stock_alert = (remaining <= 5) or (days_left <= 5)
        
        # Look for existing predictions to update or create new ones
        prediction = db.query(RefillPrediction).filter(
            RefillPrediction.user_id == user_id,
            RefillPrediction.medicine_id == medicine.id
        ).first()
        
        if not prediction:
            prediction = RefillPrediction(
                user_id=user_id,
                medicine_id=medicine.id,
                remaining_quantity=remaining,
                average_daily_consumption=average_daily_consumption,
                estimated_refill_date=estimated_refill_date,
                days_left=days_left,
                low_stock_alert=low_stock_alert,
                last_calculated=datetime.utcnow()
            )
            db.add(prediction)
        else:
            prediction.remaining_quantity = remaining
            prediction.average_daily_consumption = average_daily_consumption
            prediction.estimated_refill_date = estimated_refill_date
            prediction.days_left = days_left
            prediction.low_stock_alert = low_stock_alert
            prediction.last_calculated = datetime.utcnow()
            
        # If low stock alert, trigger notifications
        if low_stock_alert:
            # Prevent spamming alerts: only send one alert per medicine per day
            start_of_today = datetime.combine(today, datetime.min.time())
            
            # 1. Patient Notification
            existing_pat_alert = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.title == f"Low Stock Warning: {medicine.name}",
                Notification.created_at >= start_of_today
            ).first()
            
            if not existing_pat_alert:
                msg = f"You are running low on {medicine.name}. Remaining: {remaining} pills (estimated {days_left} days left). Please arrange a refill."
                pat_notif = Notification(
                    user_id=user_id,
                    title=f"Low Stock Warning: {medicine.name}",
                    message=msg,
                    medicine_name=medicine.name,
                    dosage=medicine.dosage,
                    is_read=False
                )
                db.add(pat_notif)
                
            # 2. Caregiver Notification
            if profile and profile.caregiver_id:
                existing_cg_alert = db.query(Notification).filter(
                    Notification.user_id == profile.caregiver_id,
                    Notification.title == f"Patient Stock Warning: {medicine.name}",
                    Notification.created_at >= start_of_today
                ).first()
                
                if not existing_cg_alert:
                    msg = f"Your patient {patient_name} is running low on {medicine.name}. Remaining: {remaining} pills (estimated {days_left} days left)."
                    cg_notif = Notification(
                        user_id=profile.caregiver_id,
                        title=f"Patient Stock Warning: {medicine.name}",
                        message=msg,
                        medicine_name=medicine.name,
                        dosage=medicine.dosage,
                        is_read=False
                    )
                    db.add(cg_notif)
                    
        predictions.append(prediction)
        
    db.commit()
    
    # Reload from DB to ensure relationships and IDs are loaded
    for p in predictions:
        db.refresh(p)
        
    return predictions

@router.get("/predictions", response_model=List[RefillPredictionResponse])
def get_predictions(
    patient_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get refill predictions for the logged-in user or a caregiver's patient.
    Computes predictions on request to ensure they are up-to-date.
    """
    target_user_id = current_user.id
    if patient_id:
        profile = db.query(Profile).filter(Profile.user_id == patient_id).first()
        if not profile or (profile.caregiver_id != current_user.id and current_user.role.name != "Admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access predictions for this patient."
            )
        target_user_id = patient_id
        
    # Execute predictions dynamically to guarantee freshness
    predictions = run_predictions_for_user(db, target_user_id)
    return predictions

@router.post("/predictions/calculate", response_model=List[RefillPredictionResponse])
def force_recalculate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force an immediate recalculation of refill parameters."""
    predictions = run_predictions_for_user(db, current_user.id)
    return predictions

@router.post("/{medicine_id}/refill", response_model=RefillPredictionResponse)
def refill_medicine(
    medicine_id: int,
    refill_quantity: int = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform a manual stock refill for a specific medicine.
    Updates the medicine's remaining stock, triggers recalculation, and returns the prediction.
    """
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found"
        )
        
    # Verify ownership or caregiver link
    if medicine.user_id != current_user.id:
        profile = db.query(Profile).filter(Profile.user_id == medicine.user_id).first()
        if not profile or (profile.caregiver_id != current_user.id and current_user.role.name != "Admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to refill stock for this patient."
            )
            
    # Add stock
    medicine.remaining_stock = (medicine.remaining_stock or 0) + refill_quantity
    db.commit()
    
    # Recalculate predictions
    run_predictions_for_user(db, medicine.user_id)
    
    # Fetch final prediction
    prediction = db.query(RefillPrediction).filter(
        RefillPrediction.user_id == medicine.user_id,
        RefillPrediction.medicine_id == medicine.id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated prediction."
        )
        
    return prediction
