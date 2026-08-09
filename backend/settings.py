from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.security import (
    get_current_user,
    hash_password,
    validate_password_strength,
    verify_password,
)
from database import get_db
from models import UserPreference, User

router = APIRouter(prefix="/settings", tags=["Settings"])

VALID_THEMES = ("dark", "light")
VALID_LANGUAGES = ("en",)


class PreferencesUpdate(BaseModel):
    push_notifications_enabled: Optional[bool] = None
    reminder_notifications_enabled: Optional[bool] = None
    refill_notifications_enabled: Optional[bool] = None
    advance_notice_minutes: Optional[int] = Field(default=None, ge=0, le=120)
    theme: Optional[str] = None
    language: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class PasswordUpdate(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


DEFAULT_PREFS = {
    "push_notifications_enabled": True,
    "reminder_notifications_enabled": True,
    "refill_notifications_enabled": True,
    "advance_notice_minutes": 0,
    "theme": "dark",
    "language": "en",
}


def _prefs_dict(pref: UserPreference | None) -> dict:
    if not pref:
        return dict(DEFAULT_PREFS)
    return {
        "push_notifications_enabled": pref.push_notifications_enabled,
        "reminder_notifications_enabled": pref.reminder_notifications_enabled,
        "refill_notifications_enabled": getattr(pref, "refill_notifications_enabled", True),
        "advance_notice_minutes": pref.advance_notice_minutes,
        "theme": getattr(pref, "theme", None) or "dark",
        "language": getattr(pref, "language", None) or "en",
    }


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role or "Patient",
    }


@router.get("/preferences")
def get_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    return _prefs_dict(pref)


@router.put("/preferences")
def update_preferences(
    data: PreferencesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.theme is not None and data.theme not in VALID_THEMES:
        raise HTTPException(status_code=400, detail="Invalid theme. Use 'dark' or 'light'.")
    if data.language is not None and data.language not in VALID_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported language.")

    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)

    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(pref, key, value)

    pref.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Preferences updated successfully", **_prefs_dict(pref)}


@router.get("/profile")
def get_profile(
    user: User = Depends(get_current_user),
):
    return _user_dict(user)


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    user.name = name
    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully", "user": _user_dict(user)}


@router.put("/password")
def update_password(
    data: PasswordUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    strength = validate_password_strength(data.new_password)
    if strength:
        raise HTTPException(status_code=400, detail=strength)

    if verify_password(data.new_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="New password must be different from the current one")

    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
