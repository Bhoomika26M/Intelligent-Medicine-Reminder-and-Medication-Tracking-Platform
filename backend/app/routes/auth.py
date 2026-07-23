from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, Token, UserResponse
from app.crud.user import get_user_by_email, create_user, get_role_by_name
from app.auth.jwt import verify_password, create_access_token, create_refresh_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


import logging

logger = logging.getLogger("PillSync.auth")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Explicit password validation
    if len(user_data.password) < 6:
        logger.warning(f"Registration validation failed: Password too short for {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password: Password must be at least 6 characters.",
        )

    # Explicit role validation
    allowed_roles = ["Patient", "Caregiver", "Admin"]
    if user_data.role not in allowed_roles:
        logger.warning(f"Registration validation failed: Invalid role '{user_data.role}' for {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_data.role}' is invalid. Choose 'Patient', 'Caregiver', or 'Admin'.",
        )

    try:
        db_user = get_user_by_email(db, user_data.email)
    except Exception as e:
        logger.exception("Registration check failed due to database connectivity issue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database unavailable",
        )

    if db_user:
        logger.warning(f"Registration failed: Email '{user_data.email}' already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    try:
        user = create_user(db, user_data)
        logger.info(f"User registered successfully: {user.email}")
        return UserResponse(id=user.id, email=user.email, role=user_data.role)
    except Exception as e:
        logger.exception("Registration failed during user creation transaction")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error: {str(e)}",
        )


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_data.email)
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/token", response_model=Token, include_in_schema=False)
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password-flow endpoint used by Swagger UI's 'Authorize' button."""
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    user_id_str = verify_token(refresh_token, is_refresh=True)
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    return Token(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout")
def logout():
    # Stateless logout is managed by the frontend; API acknowledges success
    return {"detail": "Successfully logged out"}
