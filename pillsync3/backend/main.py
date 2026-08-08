"""
FastAPI application for PillSync.

Run locally with:
    uvicorn main:app --reload --port 8000

All data is stored in TinyDB JSON files (see database.py).
Authentication uses JWT stored in localStorage on the client.
"""
import os
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from database import (
    users_table, medicines_table, history_table, reminders_table,
    User, Medicine, History,
)
from auth import (
    hash_password, verify_password, create_token, decode_token, new_user_id,
)
from ocr import extract_text, parse_medicine_info
from scheduler import start_scheduler

app = FastAPI(title="PillSync API")

# Allow the Vite dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = users_table.get(User.id == payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


@app.post("/api/auth/register")
def register(body: RegisterIn):
    if users_table.get(User.email == body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_user_id()
    users_table.insert({
        "id": user_id,
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "is_guest": False,
    })
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "name": body.name, "email": body.email, "is_guest": False}}


@app.post("/api/auth/login")
def login(body: LoginIn):
    user = users_table.get(User.email == body.email)
    if not user or not verify_password(body.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "is_guest": user.get("is_guest", False)}}


@app.post("/api/auth/guest")
def guest_login():
    user_id = new_user_id()
    guest_name = f"Guest_{user_id[:6]}"
    users_table.insert({
        "id": user_id,
        "name": guest_name,
        "email": f"{user_id}@guest.local",
        "password": "",
        "is_guest": True,
    })
    token = create_token(user_id, is_guest=True)
    return {"token": token, "user": {"id": user_id, "name": guest_name, "email": "", "is_guest": True}}


@app.get("/api/auth/me")
def me(user=Depends(get_current_user)):
    return {"id": user["id"], "name": user["name"], "email": user["email"], "is_guest": user.get("is_guest", False)}


# ---------------------------------------------------------------------------
# Medicines
# ---------------------------------------------------------------------------
class MedicineIn(BaseModel):
    name: str
    dosage: str = ""
    quantity: str = ""
    frequency: str = ""
    times: list[str] = []          # e.g. ["Morning", "Night"]
    reminder_time: str = ""       # "HH:MM"
    start_date: str = ""
    end_date: str = ""
    notes: str = ""
    current_stock: int = 0


@app.get("/api/medicines")
def list_medicines(user=Depends(get_current_user)):
    return medicines_table.search(Medicine.user_id == user["id"])


@app.post("/api/medicines")
def add_medicine(body: MedicineIn, user=Depends(get_current_user)):
    import uuid
    med = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **body.dict(),
    }
    medicines_table.insert(med)
    return med


@app.put("/api/medicines/{med_id}")
def update_medicine(med_id: str, body: MedicineIn, user=Depends(get_current_user)):
    existing = medicines_table.get(Medicine.id == med_id)
    if not existing or existing["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicines_table.update(body.dict(), Medicine.id == med_id)
    return medicines_table.get(Medicine.id == med_id)


@app.delete("/api/medicines/{med_id}")
def delete_medicine(med_id: str, user=Depends(get_current_user)):
    existing = medicines_table.get(Medicine.id == med_id)
    if not existing or existing["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicines_table.remove(Medicine.id == med_id)
    history_table.remove(History.medicine_id == med_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Medication history
# ---------------------------------------------------------------------------
class HistoryIn(BaseModel):
    medicine_id: str
    status: str   # "Taken" or "Missed"
    date: str = ""
    time: str = ""


@app.get("/api/history")
def list_history(user=Depends(get_current_user)):
    return history_table.search(History.user_id == user["id"])


@app.post("/api/history")
def add_history(body: HistoryIn, user=Depends(get_current_user)):
    import uuid
    now = datetime.now()
    record = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "medicine_id": body.medicine_id,
        "status": body.status,
        "date": body.date or now.strftime("%Y-%m-%d"),
        "time": body.time or now.strftime("%H:%M"),
    }
    history_table.insert(record)
    return record


@app.delete("/api/history/{hid}")
def delete_history(hid: str, user=Depends(get_current_user)):
    rec = history_table.get(History.id == hid)
    if not rec or rec["user_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Record not found")
    history_table.remove(History.id == hid)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
@app.get("/api/analytics")
def analytics(user=Depends(get_current_user)):
    meds = medicines_table.search(Medicine.user_id == user["id"])
    history = history_table.search(History.user_id == user["id"])

    taken = sum(1 for h in history if h["status"] == "Taken")
    missed = sum(1 for h in history if h["status"] == "Missed")
    total = taken + missed
    adherence = round((taken / total) * 100, 1) if total else 0

    today = datetime.now().strftime("%Y-%m-%d")
    today_records = [h for h in history if h["date"] == today]
    taken_today = sum(1 for h in today_records if h["status"] == "Taken")
    missed_today = sum(1 for h in today_records if h["status"] == "Missed")

    low_stock = [m for m in meds if m.get("current_stock", 0) < 5]
    refill_soon = []
    for m in meds:
        stock = m.get("current_stock", 0)
        daily = len(m.get("times", [])) or 1
        remaining = stock / daily if daily else 0
        if remaining <= 5:
            refill_soon.append({**m, "remaining_days": round(remaining, 1)})

    return {
        "total_medicines": len(meds),
        "taken_count": taken,
        "missed_count": missed,
        "adherence": adherence,
        "taken_today": taken_today,
        "missed_today": missed_today,
        "low_stock": low_stock,
        "refill_soon": refill_soon,
        "today_records": today_records,
    }


# ---------------------------------------------------------------------------
# OCR
# ---------------------------------------------------------------------------
@app.post("/api/ocr")
async def ocr(image: UploadFile = File(...), user=Depends(get_current_user)):
    image_bytes = await image.read()
    text = extract_text(image_bytes)
    info = parse_medicine_info(text)
    return info


# ---------------------------------------------------------------------------
# Reminders (list of upcoming reminder times for the dashboard)
# ---------------------------------------------------------------------------
@app.get("/api/reminders")
def list_reminders(user=Depends(get_current_user)):
    meds = medicines_table.search(Medicine.user_id == user["id"])
    now = datetime.now()
    upcoming = []
    for m in meds:
        if m.get("reminder_time"):
            upcoming.append({
                "medicine_id": m["id"],
                "name": m["name"],
                "dosage": m.get("dosage", ""),
                "reminder_time": m["reminder_time"],
            })
    upcoming.sort(key=lambda r: r["reminder_time"])
    return upcoming


@app.on_event("startup")
def on_startup():
    start_scheduler()
    print("PillSync API started. Scheduler running.")
