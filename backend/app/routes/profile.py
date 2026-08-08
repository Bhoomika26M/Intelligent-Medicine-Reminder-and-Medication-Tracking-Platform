from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.schemas.profile import ProfileUpdate, ProfileResponse
from app.crud.user import get_profile_by_user_id, update_profile

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get("/caregivers", response_model=List[ProfileResponse])
def list_caregivers(db: Session = Depends(get_db)):
    from app.models.role import Role
    role = db.query(Role).filter(Role.name == "Caregiver").first()
    if not role:
        return []
    caregivers = db.query(Profile).join(User).filter(User.role_id == role.id).all()
    
    res = []
    for p in caregivers:
        res_p = ProfileResponse.model_validate(p)
        res_p.role = "Caregiver"
        res_p.completion_percentage = get_completion_pct(p)
        res.append(res_p)
    return res


def get_completion_pct(profile):
    fields = [
        profile.full_name,
        profile.age,
        profile.gender,
        profile.phone,
        profile.email,
        profile.address,
        profile.emergency_contact,
        profile.blood_group,
        profile.diseases,
        profile.profile_image,
        profile.height,
        profile.weight,
        profile.doctor_name,
        profile.medical_notes
    ]
    filled = sum(1 for f in fields if f is not None and str(f).strip() != "")
    return int((filled / len(fields)) * 100)


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

    profile_data = ProfileResponse.model_validate(profile)
    profile_data.role = current_user.role.name
    profile_data.completion_percentage = get_completion_pct(profile)
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
    response.completion_percentage = get_completion_pct(profile)
    return response


@router.get("/patients", response_model=List[ProfileResponse])
def list_my_patients(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.name not in ["Caregiver", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to caregivers and admins only."
        )
    patients = db.query(Profile).filter(Profile.caregiver_id == current_user.id).all()
    res = []
    for p in patients:
        res_p = ProfileResponse.model_validate(p)
        res_p.role = "Patient"
        res_p.completion_percentage = get_completion_pct(p)
        res.append(res_p)
    return res


@router.get("/all", response_model=List[ProfileResponse])
def list_all_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required"
        )
    profiles = db.query(Profile).all()
    res = []
    for p in profiles:
        user_obj = db.query(User).filter(User.id == p.user_id).first()
        res_p = ProfileResponse.model_validate(p)
        res_p.role = user_obj.role.name if user_obj else "Patient"
        res_p.completion_percentage = get_completion_pct(p)
        res.append(res_p)
    return res


@router.patch("/{user_id}/role")
def change_user_role(
    user_id: int,
    role_name: str = Query(..., description="Role name to change to (Patient, Caregiver, Admin)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required"
        )
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from app.models.role import Role
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role name")
    
    target_user.role_id = role.id
    db.commit()
    return {"detail": f"Role updated successfully to {role_name}"}


@router.delete("/{user_id}")
def delete_user_account(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permission required"
        )
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrator account"
        )
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(target_user)
    db.commit()
    return {"detail": "User account successfully deleted"}


@router.delete("", status_code=status.HTTP_200_OK)
def delete_own_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the currently logged-in user's own profile and account.
    All cascaded database elements (medicines, reminders, history) are cleaned up automatically.
    """
    db.delete(current_user)
    db.commit()
    return {"detail": "Your account and profile have been successfully deleted"}

