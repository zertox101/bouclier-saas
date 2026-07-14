import os
import sys

# Standardize path resolution for the 'app' package
backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

import uvicorn
import time
import json
import random
from datetime import datetime
from fastapi import FastAPI
import logging
from logging.handlers import RotatingFileHandler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# SECURITY LOGGING SETUP
LOG_FILE = "logs/security.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[
        RotatingFileHandler(LOG_FILE, maxBytes=10*1024*1024, backupCount=5),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("SHIELD")
logger.info("Initializing Shield AI Engine - Persistent Logging Active")

# Explicitly load .env from the backend root
env_path = os.path.join(backend_root, '.env')
load_dotenv(dotenv_path=env_path)
from app.routes.api import router

app = FastAPI(title="SHIELD Security API", version="2.0")

# Mount static files for SDK downloads
static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

DEFAULT_ADMIN_CREATE = os.getenv("DEFAULT_ADMIN_CREATE", "true").lower() in ("1", "true", "yes")
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@local")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

# CORS 
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
from app.routes.academy import router as academy_router
app.include_router(academy_router)
from app.routes.telemetry import router as telemetry_router
app.include_router(telemetry_router, prefix="/api")
from app.routes.appsec import router as appsec_router
app.include_router(appsec_router)
from app.routes.scans import router as scans_router
app.include_router(scans_router)
from app.routes.threat_map import router as threat_map_router
app.include_router(threat_map_router)
from app.routes.governance import router as governance_router
app.include_router(governance_router)
from app.routes.assets import router as assets_router
app.include_router(assets_router, prefix="/api", tags=["assets"])
from app.routes.osint import router as osint_router
app.include_router(osint_router)
from app.routes.malware import router as malware_router
app.include_router(malware_router)
from app.routes.remediation import router as remediation_router
app.include_router(remediation_router)
from app.routes.settings import router as settings_router
app.include_router(settings_router, prefix="/api")
from app.routes.soc_expert import router as soc_expert_router
app.include_router(soc_expert_router)
from app.routes.ai_intel import router as ai_intel_router
app.include_router(ai_intel_router)
from app.routes.ai_reasoning import router as ai_reasoning_router
app.include_router(ai_reasoning_router)
from app.routes.datasets import router as datasets_router
app.include_router(datasets_router)


def ensure_default_admin(db) -> None:
    if not DEFAULT_ADMIN_CREATE:
        return
    try:
        from sqlalchemy import or_
        from app.models.sql import User
        from app.core.security import hash_password
        existing = db.query(User).filter(
            or_(User.username == DEFAULT_ADMIN_USERNAME, User.email == DEFAULT_ADMIN_EMAIL)
        ).first()
        if existing:
            return
        password_raw = str(DEFAULT_ADMIN_PASSWORD)
        # Bcrypt has a 72-byte limit, so we protect against longer passwords.
        password = password_raw[0:71] if len(password_raw) > 71 else password_raw
            
        user = User(
            username=DEFAULT_ADMIN_USERNAME,
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=hash_password(password),
            role="admin",
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("Default admin user ensured.")
    except Exception as exc:
        print(f"Default admin setup failed: {exc}")

def init_database() -> None:
    # Ensure tables exist and load recent history for the dashboard.
    try:
        from app.core.database import SessionLocal, engine
        if engine:
            from app.models.sql import Base
            # Import other models to ensure they are registered with Base.metadata
            import app.models.academy_sql
            import app.models.telemetry_sql
            import app.models.appsec_sql
            import app.models.connectors_sql
            import app.models.scans_sql
            import app.models.governance_sql
            Base.metadata.create_all(bind=engine)
            print("Database tables ensured.")
        if SessionLocal:
            db = SessionLocal()
            try:
                ensure_default_admin(db)
                from app.models.monitor import monitor
                monitor.load_history(db)
            finally:
                db.close()
            print("Loaded historical events from DB.")
    except Exception as e:
        print(f"Startup DB Load Error: {e}")


@app.on_event("startup")
async def on_startup() -> None:
    init_database()
    from app.services.memory import init_memory
    try:
        init_memory()
    except Exception as e:
        print(f"Memory Init Warning: {e}")
    
    # REMOVED: Background monitoring is now handled by Celery workers
    # to ensure real-time scalability and distributed intelligence.
    print("[System] Background Security Tasks migrated to Celery Layer.")

if __name__ == "__main__":
    # Direct execution setup (e.g. for seeding or local tests)
    import uvicorn
    try:
        # We only seed manually here, the main init happens in on_startup when uvicorn loads
        from app.core.database import SessionLocal
        db = SessionLocal()
        from app.utils.seed_academy import seed_academy
        seed_academy(db)
        db.close()
    except Exception as e:
        print(f"Direct Setup Warning (Check if DB is already init): {e}")

    print("SHIELD SECURITY API SERVER v2.0 - MODULAR")
    print("Real-time Network Monitoring")
    uvicorn.run(app, host="0.0.0.0", port=8005, log_level="info")

