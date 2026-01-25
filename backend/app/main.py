import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Explicitly load .env from the backend root
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)
from app.routes.api import router

app = FastAPI(title="SHIELD Security API", version="2.0")

DEFAULT_ADMIN_CREATE = os.getenv("DEFAULT_ADMIN_CREATE", "true").lower() in ("1", "true", "yes")
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@local")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
from app.routes.academy import router as academy_router
app.include_router(academy_router)
from app.routes.telemetry import router as telemetry_router
app.include_router(telemetry_router)
from app.routes.appsec import router as appsec_router
app.include_router(appsec_router)
from app.routes.scans import router as scans_router
app.include_router(scans_router)

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
        user = User(
            username=DEFAULT_ADMIN_USERNAME,
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
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
def on_startup() -> None:
    init_database()

if __name__ == "__main__":
    # Load History on Startup
    init_database()
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        from app.utils.seed_academy import seed_academy
        seed_academy(db)
        db.close()
    except Exception as e:
        print(f"Academy Seeding Error: {e}")

    print("""
╔══════════════════════════════════════════════════════════╗
║        SHIELD SECURITY API SERVER v2.0 - MODULAR         ║
║        Real-time Network Monitoring                      ║
╚══════════════════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=8005, log_level="info")
