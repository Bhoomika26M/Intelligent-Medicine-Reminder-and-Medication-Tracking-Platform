import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:mouni7780@localhost:5432/pillsync_db"
    JWT_SECRET_KEY: str = "supersecretkeypillsyncplatform2026!"
    JWT_REFRESH_SECRET_KEY: str = "supersecretrefreshkeypillsyncplatform2026!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        env_file_encoding = "utf-8"

settings = Settings()
