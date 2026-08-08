from pydantic import BaseModel, EmailStr
from typing import Optional

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    diseases: Optional[str] = None
    profile_image: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    doctor_name: Optional[str] = None
    medical_notes: Optional[str] = None
    caregiver_id: Optional[int] = None

class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    blood_group: Optional[str] = None
    diseases: Optional[str] = None
    profile_image: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    doctor_name: Optional[str] = None
    medical_notes: Optional[str] = None
    caregiver_id: Optional[int] = None
    role: Optional[str] = None
    completion_percentage: Optional[int] = 0

    class Config:
        from_attributes = True
