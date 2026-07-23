from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.crud.user import get_profile_by_user_id, update_profile

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("", response_model=ProfileResponse)
def read_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    # Build a response dict and inject the role name from the user relationship.
    # We do NOT set a SQLAlchemy attribute directly — instead we pass it to the schema.
    profile_data = ProfileResponse.model_validate(profile)
    profile_data.role = current_user.role.name
    return profile_data


@router.put("", response_model=ProfileResponse)
def edit_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = update_profile(db, current_user.id, profile_data)
    response = ProfileResponse.model_validate(profile)
    response.role = current_user.role.name
    return response
