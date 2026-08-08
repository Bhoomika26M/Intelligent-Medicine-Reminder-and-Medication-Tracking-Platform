"""
PillSync – Intelligent Medicine Reminder & Medication Tracking Platform
FastAPI Application Entry Point

Milestones implemented:
  ✅ Milestone 1: Auth, JWT, Profiles, Roles, PostgreSQL, Swagger
  ✅ Milestone 2: Medicines, Reminders, History, Scheduler, Notifications
"""

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.medicine import router as medicine_router
from app.routes.reminder import router as reminder_router
from app.routes.history import router as history_router
from app.routes.notification import router as notification_router
from app.routes.ocr import router as ocr_router
from app.routes.refill import router as refill_router
from app.services.scheduler import start_scheduler, shutdown_scheduler
from app.services.notification import notifications_queue
from app.models.role import Role
from app.dependencies import get_current_user, get_db
from app.models.user import User

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PillSync")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown lifecycle.
    Replaces deprecated @app.on_event decorators.
    """
    # ── STARTUP ──────────────────────────────────────────────────────────────
    logger.info("PillSync API startup initiated...")

    # Create all SQLAlchemy model tables if they don't exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified / created.")

    from sqlalchemy import text
    # Run manual schema updates to prevent migrations crash
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height VARCHAR(50)"))
        db.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weight VARCHAR(50)"))
        db.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(100)"))
        db.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_notes TEXT"))
        db.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS caregiver_id INTEGER REFERENCES users(id) ON DELETE SET NULL"))
        
        db.execute(text("ALTER TABLE medicines ADD COLUMN IF NOT EXISTS before_food BOOLEAN DEFAULT FALSE"))
        db.execute(text("ALTER TABLE medicines ADD COLUMN IF NOT EXISTS after_food BOOLEAN DEFAULT FALSE"))
        db.execute(text("ALTER TABLE medicines ADD COLUMN IF NOT EXISTS disease VARCHAR(100)"))
        
        db.commit()
        logger.info("Database schema manual migrations successfully executed.")
    except Exception as e:
        db.rollback()
        logger.error(f"Manual database migration failed: {e}")
    finally:
        db.close()

    # Seed default roles: Patient, Caregiver, Admin
    db = SessionLocal()
    try:
        for r_name in ["Patient", "Caregiver", "Admin"]:
            if not db.query(Role).filter(Role.name == r_name).first():
                db.add(Role(name=r_name))
                logger.info(f"Seeded role: {r_name}")
        db.commit()
    except Exception as e:
        logger.error(f"Role seeding error: {e}")
    finally:
        db.close()

    # Start APScheduler background reminder cron
    start_scheduler()
    logger.info("APScheduler reminder cron started.")

    yield  # ── Application is RUNNING ─────────────────────────────────────

    # ── SHUTDOWN ─────────────────────────────────────────────────────────────
    shutdown_scheduler()
    logger.info("APScheduler stopped. Server shutting down.")


# ── OpenAPI / Swagger tag metadata ───────────────────────────────────────────
tags_metadata = [
    {
        "name": "Authentication",
        "description": "Register, login, token refresh and logout endpoints. JWT Bearer tokens required for all protected routes.",
    },
    {
        "name": "User Profile",
        "description": "Retrieve and update patient demographic, contact, and health profile information.",
    },
    {
        "name": "Medicine Management",
        "description": "Full CRUD operations for medications — add, view, edit, delete medicines with dosage, schedule, and stock tracking.",
    },
    {
        "name": "Medication Reminders",
        "description": "Schedule, retrieve, update and delete timed medication reminders. Mark doses as Taken, Skipped, or Missed.",
    },
    {
        "name": "Medication History & Reports",
        "description": "Track medication adherence history, generate daily/weekly/monthly compliance reports and missed-dose analytics.",
    },
    {
        "name": "System Notifications",
        "description": "Retrieve triggered push-notification alerts from the background APScheduler reminder service.",
    },
    {
        "name": "Health",
        "description": "API health check and platform info endpoints.",
    },
]

# ── FastAPI App Instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="PillSync – Medicine Reminder & Tracking API",
    description="""
## PillSync – Intelligent Medicine Reminder and Medication Tracking Platform

### Milestone 1 – Core Platform ✅
- **JWT Authentication** – Register, Login, Token Refresh
- **Role-Based Access Control** – Patient, Caregiver, Admin
- **User Profile Management** – Full demographic health profiles
- **PostgreSQL + SQLAlchemy ORM** – Relational data modeling with cascade relationships
- **Secure Password Hashing** – bcrypt via Passlib

### Milestone 2 – Clinical Features ✅
- **Medicine CRUD** – Add, Update, Delete, View medicines with dosage and stock tracking
- **Reminder Scheduler** – APScheduler cron generates reminders every minute automatically
- **Push Notification Queue** – In-memory notification system for frontend alerts
- **Medication History** – Mark doses as Taken / Skipped / Missed with full timeline
- **Adherence Reports** – Daily / Weekly / Monthly compliance statistics
- **Missed Dose Analytics** – Analysis by time of day, day of week, and medicine name
- **Low Stock Detection** – Automatic stock decrement on dose taken

### How to Authenticate
1. `POST /auth/register` – create account
2. `POST /auth/login` – get access + refresh tokens
3. Click **Authorize** button above → paste your `access_token`
4. All protected routes will now work
    """,
    version="2.0.0",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Global Exception Handlers for Verbose Logging ────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    if exc.status_code >= 500:
        logger.exception(f"HTTP {exc.status_code} Error: {exc.detail}")
    else:
        logger.warning(f"HTTP {exc.status_code} Warning: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception(f"Unhandled exception occurred on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# ── CORS – allow all origins for local dev (restrict in production) ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route Registration ────────────────────────────────────────────────────────
app.include_router(auth_router)                              # /auth/*
app.include_router(profile_router)                          # /profile
app.include_router(medicine_router, prefix="/medicine")     # /medicine  (singular)
app.include_router(medicine_router, prefix="/medicines")    # /medicines (plural - frontend)
app.include_router(reminder_router, prefix="/reminder")     # /reminder  (singular)
app.include_router(reminder_router, prefix="/reminders")    # /reminders (plural - frontend)
app.include_router(reminder_router, prefix="/schedule")     # /schedule (alias)
app.include_router(reminder_router, prefix="/schedules")    # /schedules (alias)
app.include_router(history_router)                          # /history/*
app.include_router(notification_router)                     # /notifications (database)
app.include_router(ocr_router)                               # /ocr/*
app.include_router(refill_router)                           # /refill/*


# ── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Platform root — returns API welcome and links to documentation."""
    return {
        "status": "ok",
        "platform": "PillSync – Intelligent Medicine Reminder & Tracking API",
        "version": "2.0.0",
        "documentation": "/docs",
        "redoc": "/redoc",
        "milestones": {
            "milestone_1": "✅ Auth, JWT, Profiles, Roles, PostgreSQL",
            "milestone_2": "✅ Medicines, Reminders, History, Scheduler, Notifications",
        },
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Kubernetes-style liveness probe / health check."""
    return {"status": "healthy", "service": "PillSync API"}
