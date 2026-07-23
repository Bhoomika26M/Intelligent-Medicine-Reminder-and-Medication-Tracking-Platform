from sqlalchemy.orm import Session
from app.models.user import User
from app.models.profile import Profile
from app.models.role import Role
from app.schemas.user import UserRegister
from app.schemas.profile import ProfileUpdate
from app.auth.jwt import hash_password

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def get_role_by_name(db: Session, name: str) -> Role:
    return db.query(Role).filter(Role.name == name).first()

def create_user(db: Session, user_data: UserRegister) -> User:
    try:
        role = get_role_by_name(db, user_data.role)
        if not role:
            # Fallback to create the role if it doesn't exist
            role = Role(name=user_data.role)
            db.add(role)
            db.flush()
        
        hashed_pwd = hash_password(user_data.password)
        user = User(
            email=user_data.email,
            hashed_password=hashed_pwd,
            role_id=role.id
        )
        db.add(user)
        db.flush()  # Populates user.id without committing transaction

        # Auto-initialize user profile
        profile = Profile(
            user_id=user.id,
            email=user.email,
            full_name=user.email.split("@")[0].capitalize()
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise e

def get_profile_by_user_id(db: Session, user_id: int) -> Profile:
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def update_profile(db: Session, user_id: int, profile_data: ProfileUpdate) -> Profile:
    try:
        profile = get_profile_by_user_id(db, user_id)
        if not profile:
            profile = Profile(user_id=user_id)
            db.add(profile)
            db.flush()
        
        # Update fields
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
        
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise e
