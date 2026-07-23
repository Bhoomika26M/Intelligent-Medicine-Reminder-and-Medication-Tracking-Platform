from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta, time as pytime
from typing import List, Dict, Any
from app.models.history import MedicationHistory
from app.models.medicine import Medicine
from app.schemas.history import HistoryCreate

def create_history_record(db: Session, user_id: int, history_data: HistoryCreate) -> MedicationHistory:
    target_date = history_data.date or date.today()
    if history_data.time:
        try:
            t_parsed = datetime.strptime(history_data.time, "%H:%M:%S").time()
        except ValueError:
            try:
                t_parsed = datetime.strptime(history_data.time, "%H:%M").time()
            except ValueError:
                t_parsed = datetime.now().time()
    else:
        t_parsed = datetime.now().time()
        
    db_history = MedicationHistory(
        user_id=user_id,
        medicine_id=history_data.medicine_id,
        status=history_data.status,
        date=target_date,
        time=t_parsed
    )
    db.add(db_history)
    
    # If the history record was recorded as Taken, decrement stock
    if history_data.status == "Taken":
        medicine = db.query(Medicine).filter(Medicine.id == history_data.medicine_id).first()
        if medicine and medicine.remaining_stock > 0:
            medicine.remaining_stock -= 1
            
    db.commit()
    db.refresh(db_history)
    return db_history

def get_user_history(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[MedicationHistory]:
    return db.query(MedicationHistory).filter(
        MedicationHistory.user_id == user_id
    ).order_by(
        MedicationHistory.date.desc(),
        MedicationHistory.time.desc()
    ).offset(skip).limit(limit).all()

def generate_adherence_report(db: Session, user_id: int) -> Dict[str, Any]:
    # Fetch all history records for the user
    history = db.query(MedicationHistory).filter(MedicationHistory.user_id == user_id).all()
    
    total = len(history)
    taken = sum(1 for h in history if h.status == "Taken")
    skipped = sum(1 for h in history if h.status == "Skipped")
    missed = sum(1 for h in history if h.status == "Missed")
    
    adherence_rate = (taken / total * 100) if total > 0 else 100.0
    
    # Group by date for Daily Report (last 14 days)
    daily_map = {}
    today = date.today()
    for i in range(14):
        d = today - timedelta(days=i)
        daily_map[d.isoformat()] = {"date": d.isoformat(), "taken": 0, "skipped": 0, "missed": 0}
        
    for h in history:
        d_str = h.date.isoformat()
        if d_str in daily_map:
            status = h.status.lower()
            if status in ["taken", "skipped", "missed"]:
                daily_map[d_str][status] += 1
                
    daily_report = sorted(list(daily_map.values()), key=lambda x: x["date"])
    
    # Weekly Report (last 4 weeks)
    weekly_map = {}
    for h in history:
        start_of_week = h.date - timedelta(days=h.date.weekday())
        w_str = start_of_week.isoformat()
        if w_str not in weekly_map:
            weekly_map[w_str] = {"week_commencing": w_str, "taken": 0, "skipped": 0, "missed": 0}
        status = h.status.lower()
        if status in ["taken", "skipped", "missed"]:
            weekly_map[w_str][status] += 1
            
    weekly_report = sorted(list(weekly_map.values()), key=lambda x: x["week_commencing"])[-4:]
    
    # Monthly Report (last 6 months)
    monthly_map = {}
    for h in history:
        m_str = h.date.strftime("%Y-%m")
        if m_str not in monthly_map:
            monthly_map[m_str] = {"month": m_str, "taken": 0, "skipped": 0, "missed": 0}
        status = h.status.lower()
        if status in ["taken", "skipped", "missed"]:
            monthly_map[m_str][status] += 1
            
    monthly_report = sorted(list(monthly_map.values()), key=lambda x: x["month"])[-6:]
    
    # Missed Dose Analysis
    missed_history = [h for h in history if h.status == "Missed"]
    
    missed_by_time = {"Morning (6am-12pm)": 0, "Afternoon (12pm-6pm)": 0, "Evening/Night (6pm-6am)": 0}
    missed_by_day = {"Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0, "Saturday": 0, "Sunday": 0}
    missed_by_medicine = {}
    
    for h in missed_history:
        # Time of day
        t = h.time
        if pytime(6, 0) <= t < pytime(12, 0):
            missed_by_time["Morning (6am-12pm)"] += 1
        elif pytime(12, 0) <= t < pytime(18, 0):
            missed_by_time["Afternoon (12pm-6pm)"] += 1
        else:
            missed_by_time["Evening/Night (6pm-6am)"] += 1
            
        # Day of week
        day_name = h.date.strftime("%A")
        if day_name in missed_by_day:
            missed_by_day[day_name] += 1
            
        # Medicine name
        med = db.query(Medicine).filter(Medicine.id == h.medicine_id).first()
        med_name = med.name if med else f"Medicine ID: {h.medicine_id}"
        missed_by_medicine[med_name] = missed_by_medicine.get(med_name, 0) + 1
        
    missed_dose_analysis = {
        "by_time_of_day": missed_by_time,
        "by_day_of_week": missed_by_day,
        "by_medicine": missed_by_medicine
    }
    
    return {
        "adherence_rate": round(adherence_rate, 2),
        "total_doses": total,
        "taken_count": taken,
        "skipped_count": skipped,
        "missed_count": missed,
        "daily_report": daily_report,
        "weekly_report": weekly_report,
        "monthly_report": monthly_report,
        "missed_dose_analysis": missed_dose_analysis
    }
