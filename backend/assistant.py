"""Medication guide assistant — context-aware help from the user's medicines.

Tries OpenRouter (Gemma via OPENROUTER_API_KEY) with a context-rich system
prompt built from the user's real data. Falls back to a rule-based engine
when the AI service is unavailable or not configured.
"""

import json
import logging
import os

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.security import get_current_user
from core.time_utils import day_bounds, today_local
from database import get_db
from models import MedicationHistory, Medicine, User
from services.ocr import DEFAULT_MODEL, OPENROUTER_URL, REQUEST_TIMEOUT_SECONDS
from services.refill import RefillPredictionEngine

logger = logging.getLogger("pillsync-assistant")

router = APIRouter(prefix="/assistant", tags=["Assistant"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)


def _build_context(db: Session, user: User, medicines: list[Medicine], refill: dict) -> dict:
    """Gather the user's real data for the AI system prompt."""
    today = today_local()
    day_start, day_end = day_bounds(today)
    today_records = (
        db.query(MedicationHistory)
        .filter(
            MedicationHistory.user_id == user.id,
            MedicationHistory.scheduled_datetime >= day_start,
            MedicationHistory.scheduled_datetime <= day_end,
        )
        .order_by(MedicationHistory.scheduled_datetime.asc())
        .all()
    )

    meds = []
    for m in medicines:
        meds.append(
            {
                "name": m.name,
                "dosage": f"{m.dosage}{m.dosage_unit}".strip(),
                "medicine_type": m.medicine_type,
                "disease_category": m.disease_category,
                "instructions": m.instructions or None,
                "quantity_per_dose": m.quantity_per_dose,
                "stock_remaining": m.stock_remaining,
                "schedule": [
                    f"{s.reminder_time.strftime('%H:%M')} ({s.days_of_week})"
                    if s.days_of_week
                    else s.reminder_time.strftime("%H:%M")
                    for s in m.schedules
                    if s.is_active
                ],
            }
        )

    today_schedule = [
        {
            "time": r.scheduled_datetime.strftime("%H:%M"),
            "medicine": r.medicine.name if r.medicine else "Unknown",
            "status": r.status,
        }
        for r in today_records
    ]

    return {
        "user_name": user.name,
        "date": today.isoformat(),
        "medicines": meds,
        "today_schedule": today_schedule,
        "refill_summary": {
            "total_tracked": refill.get("total_tracked", 0),
            "low_stock_count": refill.get("low_stock_count", 0),
            "predictions": [
                {
                    "name": p["name"],
                    "stock_remaining": p["stock_remaining"],
                    "days_remaining": p["days_remaining"],
                    "status": p["status"],
                    "recommended_refill_date": p.get("recommended_refill_date"),
                }
                for p in refill.get("predictions", [])[:5]
            ],
            "alerts": [a["alert_message"] for a in refill.get("alerts", [])[:3]],
        },
    }


SYSTEM_PROMPT = (
    "You are the PillSync Medication Guide, a helpful assistant inside a medication "
    "tracking app. You answer questions about the user's own medication data provided "
    "below. Follow these rules:\n"
    "1. Answer ONLY from the provided context. If the data is missing, say so.\n"
    "2. Keep answers short (under 120 words) and use plain markdown with bullet lists.\n"
    "3. Never invent medicine names, dosages, or schedules.\n"
    "4. Remind users to consult a doctor or pharmacist for medical, side-effect, or "
    "interaction advice — do not give medical advice yourself.\n"
    "5. Use the user's first name naturally when greeting.\n"
    "Here is the user's current data as JSON:\n"
)


def _rule_based_reply(db: Session, user: User, medicines: list[Medicine], refill: dict, msg: str) -> str:
    """Local fallback used when the AI service is unavailable."""
    if any(k in msg for k in ("hello", "hi", "hey")):
        return (
            f"Hello {user.name.split()[0]}! I can help with your medication list, "
            "dosages, schedule, and refill status. What would you like to know?"
        )
    if "refill" in msg or "stock" in msg:
        if not refill["predictions"]:
            return "You don't have medicines with stock tracking yet. Add quantity when creating a medicine."
        lines = []
        for p in refill["predictions"][:5]:
            days = p["days_remaining"]
            days_txt = f"{days} days left" if days is not None else "no schedule"
            lines.append(f"• {p['name']}: {p['stock_remaining']} units ({days_txt}) — {p['status']}")
        alerts = refill["alerts"][:3]
        extra = ""
        if alerts:
            extra = "\n\nAlerts:\n" + "\n".join(f"• {a['alert_message']}" for a in alerts)
        return "Refill overview:\n" + "\n".join(lines) + extra
    if "schedule" in msg or "tomorrow" in msg or "when" in msg:
        if not medicines:
            return "No active medicines yet. Add medicines to see your schedule."
        lines = []
        for m in medicines:
            times = ", ".join(s.reminder_time.strftime("%H:%M") for s in m.schedules if s.is_active) or "no times"
            lines.append(f"• {m.name} {m.dosage}{m.dosage_unit}: {times}")
        return "Your active schedule:\n" + "\n".join(lines)
    if "dosage" in msg or "dose" in msg or "how much" in msg:
        if not medicines:
            return "You don't have medicines added yet."
        lines = [f"• {m.name}: {m.dosage}{m.dosage_unit} ({m.quantity_per_dose} per dose)" for m in medicines]
        return "Current dosages:\n" + "\n".join(lines) + "\n\nAlways follow your clinician's instructions."
    if "side effect" in msg or "interaction" in msg:
        return (
            "I can summarize your medication list, but I can't give medical advice about "
            "side effects or interactions. Please consult your doctor or pharmacist."
        )
    if "prescription" in msg or "explain" in msg or "list" in msg:
        if not medicines:
            return "No medicines on file. Use Medicines or Scanner to add some."
        lines = []
        for m in medicines:
            lines.append(
                f"• {m.name} {m.dosage}{m.dosage_unit} — {m.disease_category} — "
                f"{len([s for s in m.schedules if s.is_active])} reminder(s)"
            )
        return "Your medications:\n" + "\n".join(lines)
    return (
        "I can help with: your dosages, schedule, refill/stock status, and medicine list. "
        "Ask something like “What are my dosages?” or “Any refill alerts?”"
    )


def _ask_openrouter(api_key: str, model: str, context: dict, question: str) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT + json.dumps(context, ensure_ascii=False)},
            {"role": "user", "content": question},
        ],
        "max_tokens": 700,
        "temperature": 0.3,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = client.post(OPENROUTER_URL, headers=headers, json=payload)
        if response.status_code != 200:
            raise RuntimeError(f"OpenRouter returned HTTP {response.status_code}")
        body = response.json()
    content = body["choices"][0]["message"]["content"]
    return str(content).strip()


@router.post("/chat")
def chat(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    medicines = (
        db.query(Medicine)
        .filter(Medicine.user_id == user.id, Medicine.is_active.is_(True))
        .all()
    )
    msg = data.message.strip().lower()
    question = data.message.strip()
    refill = RefillPredictionEngine(db, user.id).summary()

    reply = None
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if api_key:
        model = os.getenv("OPENROUTER_MODEL", "").strip() or DEFAULT_MODEL
        try:
            context = _build_context(db, user, medicines, refill)
            reply = _ask_openrouter(api_key, model, context, question)
        except Exception as exc:
            logger.warning("OpenRouter assistant call failed, using fallback: %s", exc.__class__.__name__)

    if not reply:
        reply = _rule_based_reply(db, user, medicines, refill, msg)

    return {
        "reply": reply,
        "disclaimer": "PillSync provides medication organization help, not medical advice.",
    }
