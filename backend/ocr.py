"""OCR prescription scan endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.constants import DISEASE_CATEGORIES
from core.rate_limit import client_key, limiter
from core.security import get_current_user
from database import get_db
from models import Medicine, User
from services.medicines import MedicineSerializer
from services.ocr import OCRService, PrescriptionParser
from services.validation import find_existing, find_similar, normalize_name

router = APIRouter(prefix="/ocr", tags=["OCR"])

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
ALLOWED_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


class ScheduleIn(BaseModel):
    reminder_time: str
    days_of_week: Optional[str] = None


class ExtractedMedicineIn(BaseModel):
    name: str = Field(..., min_length=1)
    dosage: str = ""
    dosage_unit: str = ""
    medicine_type: str = "Tablet"
    disease_category: str = "General"
    instructions: str = ""
    duration: str = ""
    doctor_notes: str = ""
    reason: str = ""
    quantity: float = 30
    quantity_per_dose: float = 1
    confidence: float = 0.8
    schedules: List[ScheduleIn] = []
    merge_into_id: Optional[int] = None


class SaveExtractedRequest(BaseModel):
    medicines: List[ExtractedMedicineIn]


class ParseTextRequest(BaseModel):
    text: str = Field(..., min_length=3)


def _attach_matches(medicines: list, db: Session, user_id: int) -> list:
    """Annotate each extracted medicine with likely matches from the user's list."""
    for med in medicines:
        name = med.get("name") or ""
        med["normalized_name"] = normalize_name(name) or name
        existing = find_existing(db, user_id, name, dosage=med.get("dosage"), dosage_unit=med.get("dosage_unit"))
        similar = find_similar(db, user_id, name, limit=3)
        med["matches"] = [
            {
                "id": existing.id,
                "name": existing.name,
                "dosage": existing.dosage,
                "dosage_unit": existing.dosage_unit,
                "match_type": "exact",
            }
        ] if existing else similar
        med["match_required"] = bool(existing)
    return medicines


def _apply_merged_schedules(db: Session, medicine: Medicine, times: list[str]) -> None:
    """Add schedule times that are not already configured (no duplicates)."""
    existing_times = {s.reminder_time.strftime("%H:%M") for s in medicine.schedules}
    for t in times:
        if t not in existing_times:
            db.add(MedicineSerializer.build_schedule(medicine.id, t, None))


@router.post("/scan")
async def scan_prescription(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limiter.check(client_key(request, "ocr-scan"), limit=10, window_seconds=60)

    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_TYPES and not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload a PNG or JPG photo.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")

    filename = file.filename or "prescription.jpg"
    result = await OCRService().scan(data, filename)
    if result.get("medicines"):
        _attach_matches(result["medicines"], db, user.id)
    result["user_id"] = user.id
    return result


@router.post("/parse-text")
def parse_prescription_text(
    payload: ParseTextRequest,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    limiter.check(client_key(request, "ocr-text"), limit=20, window_seconds=60)
    medicines = PrescriptionParser().parse(payload.text)
    if medicines:
        _attach_matches(medicines, db, user.id)
    return {
        "engine": "text-parser",
        "raw_text": payload.text.strip(),
        "medicines": medicines,
        "count": len(medicines),
        "categories": list(DISEASE_CATEGORIES),
        "warning": None,
        "message": (
            f"Detected {len(medicines)} medicine(s)"
            if medicines
            else "No medicines detected in the provided text."
        ),
        "user_id": user.id,
    }


@router.post("/save")
def save_extracted_medicines(
    payload: SaveExtractedRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not payload.medicines:
        raise HTTPException(status_code=400, detail="No medicines to save")

    created = []
    merged = []
    try:
        for item in payload.medicines:
            name = item.name.strip()
            qty = max(float(item.quantity or 0), 0)

            if item.merge_into_id:
                existing = (
                    db.query(Medicine)
                    .filter(Medicine.id == item.merge_into_id, Medicine.user_id == user.id)
                    .first()
                )
                if not existing:
                    raise HTTPException(status_code=404, detail="Medicine to merge into not found")

                if qty > 0:
                    existing.stock_remaining = (existing.stock_remaining or 0) + qty
                    existing.quantity_total = (existing.quantity_total or 0) + qty
                if not existing.instructions and item.instructions:
                    existing.instructions = item.instructions
                if item.duration and not getattr(existing, "duration", None):
                    existing.duration = item.duration
                times = [s.reminder_time for s in item.schedules if s.reminder_time]
                _apply_merged_schedules(db, existing, times)
                merged.append(existing)
                continue

            medicine = Medicine(
                user_id=user.id,
                name=name,
                dosage=item.dosage,
                dosage_unit=item.dosage_unit,
                medicine_type=item.medicine_type or "Tablet",
                disease_category=item.disease_category or "General",
                instructions=item.instructions,
                is_active=True,
                quantity_total=qty,
                stock_remaining=qty,
                quantity_per_dose=max(float(item.quantity_per_dose or 1), 0.1),
            )
            db.add(medicine)
            db.flush()

            schedules = item.schedules or [ScheduleIn(reminder_time="08:00")]
            for sched in schedules:
                db.add(
                    MedicineSerializer.build_schedule(
                        medicine.id,
                        sched.reminder_time,
                        sched.days_of_week,
                    )
                )
            created.append(medicine)

        db.commit()
        for medicine in created + merged:
            db.refresh(medicine)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    if merged:
        message = f"Saved {len(created)} medicine(s), merged {len(merged)} existing medicine(s)"
    else:
        message = f"Saved {len(created)} medicine(s)"

    return {
        "message": message,
        "medicines": [MedicineSerializer.to_dict(m) for m in created],
        "merged": [MedicineSerializer.to_dict(m) for m in merged],
        "count": len(created),
        "user_id": user.id,
    }
