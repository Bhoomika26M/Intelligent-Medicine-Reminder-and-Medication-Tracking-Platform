"""
JWT authentication helpers.
JWT is signed with a simple secret and returned to the client, which stores it in localStorage.
"""
import os
import time
import uuid
import jwt
from passlib.hash import bcrypt

SECRET_KEY = "pillsync-demo-secret"  # demo only
ALGORITHM = "HS256"
TOKEN_HOURS = 24


def hash_password(password: str) -> str:
    return bcrypt.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.verify(password, hashed)
    except Exception:
        return False


def create_token(user_id: str, is_guest: bool = False) -> str:
    payload = {
        "sub": user_id,
        "guest": is_guest,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_HOURS * 3600,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None


def new_user_id() -> str:
    return str(uuid.uuid4())
