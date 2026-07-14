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
from fastapi import FastAPI, Request
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
app = FastAPI(title="SHIELD Security API", version="2.0")
from app.routers.overview import router as overview_router
app.include_router(overview_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "environment": "production",
        "neural_link": "stable"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL_ERROR | {request.method} {request.url.path} | {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)},
    )

from fastapi.responses import JSONResponse

# Mount static files for SDK downloads
static_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(static_path):
    os.makedirs(static_path)
app.mount("/static", StaticFiles(directory=static_path), name="static")

DEFAULT_ADMIN_CREATE = os.getenv("DEFAULT_ADMIN_CREATE", "true").lower() in ("1", "true", "yes")
DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME") or os.getenv("ADMIN_USER", "admin")
DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL") or os.getenv("ADMIN_EMAIL", "admin@local")
DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD") or os.getenv("ADMIN_PASS", "admin123")

# CORS configuration
# In production, this should be set via environment variable
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = allowed_origins_env.split(",")
else:
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "https://bouclier.local",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"[API] {request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)")
    return response
from app.routes.academy import router as academy_router
app.include_router(academy_router)
# Telemetry router — re-enabled with Redis caching for performance
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
from app.routes.saas_control import router as saas_control_router
app.include_router(saas_control_router)
from app.routes.incidents import router as incidents_router
app.include_router(incidents_router)
from app.routes.strategic_ai import router as strategic_ai_router
app.include_router(strategic_ai_router)
from app.routes.infrastructure import router as infrastructure_router
app.include_router(infrastructure_router)
from app.routes.mythos import router as mythos_router
app.include_router(mythos_router, prefix="/api")
from app.routes.raptor import router as raptor_router
app.include_router(raptor_router)
from app.routes.cicids_stream import router as cicids_stream_router
app.include_router(cicids_stream_router)
from app.routes.forensics import router as forensics_router
app.include_router(forensics_router, prefix="/api", tags=["forensics"])

# Network Dissector & Red Team routers
from app.routers.network_dissector import router as network_dissector_router
app.include_router(network_dissector_router, prefix="/api")
from app.routers.kali_tools import router as kali_tools_router
app.include_router(kali_tools_router)
from app.routers.red_team import router as red_team_router
app.include_router(red_team_router)

# Threat Analysis router
from app.routers.threat_analysis import router as threat_analysis_router
app.include_router(threat_analysis_router)

# API router (map/points, soc-expert/summary, etc.)
from app.routes.api import router as api_router
app.include_router(api_router)

# Kali Tools router (already included above)
# Duplicate inclusion removed

# Sentinel AI router
from app.routers.sentinel_ai import router as sentinel_ai_router
app.include_router(sentinel_ai_router)

# AI Pentester router
from app.routers.ai_pentester import router as ai_pentester_router
app.include_router(ai_pentester_router)

# Attack Graph router
from app.routes.attack_graph.router import router as attack_graph_router
app.include_router(attack_graph_router)

# Vector Store router
from app.routes.vector_store import router as vector_store_router
app.include_router(vector_store_router)

# Investigation router
from app.routers.investigation import router as investigation_router
app.include_router(investigation_router)

# SOC Expert Minimal router — DISABLED: real router from app.routes.soc_expert takes precedence
# from app.routers.soc_expert_minimal import router as soc_expert_router
# app.include_router(soc_expert_router)

# Auth router — enables /api/auth/login endpoint for NextAuth
from app.routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# Alerts router — public endpoints at /alerts
from app.routes.alerts import public_router as public_alerts_router
app.include_router(public_alerts_router)

# Alerts router — authenticated endpoints at /api/alerts
from app.routes.alerts import router as alerts_router
app.include_router(alerts_router, prefix="/api", tags=["alerts"])

# Events ingestion router (kali-attacker POST /api/events/ingest)
from app.routes.events import router as events_router
app.include_router(events_router, prefix="/api", tags=["events"])

# Admin routes (SUPER_ADMIN only)
from app.routes.admin.organizations import router as admin_orgs_router
from app.routes.admin.users import router as admin_users_router
from app.routes.admin.platform import router as admin_platform_router
app.include_router(admin_orgs_router)
app.include_router(admin_users_router)
app.include_router(admin_platform_router)

# Org Admin routes (ORG_ADMIN only)
from app.routes.org.users import router as org_users_router
from app.routes.org.settings import router as org_settings_router
from app.routes.org.subscription import router as org_subscription_router
from app.routes.org.dashboard import router as org_dashboard_router
from app.routes.org.security import router as org_security_router
from app.routes.org.audit_logs import router as org_audit_logs_router
from app.routes.org.documents import router as org_documents_router
app.include_router(org_users_router)
app.include_router(org_settings_router)
app.include_router(org_subscription_router)
app.include_router(org_dashboard_router)
app.include_router(org_security_router)
app.include_router(org_audit_logs_router)
app.include_router(org_documents_router)

# SOC Analyst routes (ANALYST only)
from app.routes.soc.dashboard import router as soc_dashboard_router
from app.routes.soc.incidents import router as soc_incidents_router
app.include_router(soc_dashboard_router)
app.include_router(soc_incidents_router)

# New production routes (threat-intel, playbooks, reports, tools, sensors, evidence, etc.)
from app.routes.threat_intel import router as threat_intel_router
app.include_router(threat_intel_router)
from app.routes.playbooks import router as playbooks_router
app.include_router(playbooks_router)
from app.routes.reports import router as reports_router
app.include_router(reports_router)
from app.routes.tools import router as tools_router
app.include_router(tools_router)
from app.routes.sensors import router as sensors_router
app.include_router(sensors_router)
from app.routes.evidence import router as evidence_router
app.include_router(evidence_router)
from app.routes.compliance import router as compliance_router
app.include_router(compliance_router)
from app.routes.client_incidents import router as client_incidents_router
app.include_router(client_incidents_router)
from app.routes.ai_training import router as ai_training_router
app.include_router(ai_training_router)
from app.routes.lockdown import router as lockdown_router
app.include_router(lockdown_router)
from app.routes.flipper import router as flipper_router
app.include_router(flipper_router)
from app.routes.network_lanes import router as network_lanes_router
app.include_router(network_lanes_router)
from app.routes.purple_team import router as purple_team_router
app.include_router(purple_team_router)
from app.routes.mitre import router as mitre_router
app.include_router(mitre_router)

# New module routes (Detection Engineering, Cloud, K8s, AD, IoT, Smart City)
from app.routes.detection import router as detection_router
app.include_router(detection_router)
from app.routes.cloud_sec import router as cloud_sec_router
app.include_router(cloud_sec_router)
from app.routes.k8s_sec import router as k8s_sec_router
app.include_router(k8s_sec_router)
from app.routes.ad_lab import router as ad_lab_router
app.include_router(ad_lab_router)
from app.routes.iot_sec import router as iot_sec_router
app.include_router(iot_sec_router)
from app.routes.smart_city import router as smart_city_router
app.include_router(smart_city_router)

# Offensive Security Consultant
from app.routes.offensive_consultant import router as offensive_consultant_router
app.include_router(offensive_consultant_router)
from app.routes.offensive_ws import router as offensive_ws_router
app.include_router(offensive_ws_router)

# Telemetry router — DISABLED: real endpoint is in app.routes.soc_expert
# The real /api/telemetry/stats endpoint is now in soc_expert router with database integration
# from app.routers.telemetry import router as telemetry_router
# app.include_router(telemetry_router)


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
        password_raw = str(DEFAULT_ADMIN_PASSWORD)
        password = password_raw[0:71] if len(password_raw) > 71 else password_raw
        hashed = hash_password(password)
        if existing:
            if not existing.is_active:
                existing.is_active = True
            existing.hashed_password = hashed
            existing.email = DEFAULT_ADMIN_EMAIL
            existing.username = DEFAULT_ADMIN_USERNAME
            existing.role = "SUPER_ADMIN"
            db.commit()
            print("Default admin user updated.")
            return
        user = User(
            username=DEFAULT_ADMIN_USERNAME,
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=hashed,
            role="SUPER_ADMIN",
            is_active=True,
        )
        db.add(user)
        db.commit()
        print("Default admin user ensured.")
    except Exception as exc:
        print(f"Default admin setup failed: {exc}")

def seed_demo_data(db) -> None:
    """Seed demo TelemetryEvent/Incident/AlertEvent data if tables are empty."""
    from sqlalchemy import func
    from app.models.telemetry_sql import TelemetryEvent, TelemetryCounter, TelemetrySensor
    from app.models.sql import Incident, AlertEvent, Organization
    from datetime import timedelta

    import sys
    print("[Seed] Starting...", flush=True)
    org = db.query(Organization).first()
    if not org:
        print("[Seed] Creating org", flush=True)
        org = Organization(id="00000000-0000-0000-0000-000000000001", name="Demo Org", slug="demo-org", plan="PRO")
        db.add(org)
        db.flush()
    print(f"[Seed] Org: {org.id}", flush=True)

    now = datetime.utcnow()
    import random

    # Seed TelemetryEvent only if empty
    tele_count = db.query(func.count(TelemetryEvent.id)).scalar()
    print(f"[Seed] TelemetryEvent count: {tele_count}", flush=True)
    if tele_count == 0:
        events_data = [
            {"event_type": "malware", "severity": "high", "source_ip": "185.255.35.226", "dest_ip": "10.0.1.10", "message": "Mirai variant detected"},
            {"event_type": "port_scan", "severity": "medium", "source_ip": "91.121.87.34", "dest_ip": "10.0.1.20", "message": "Port scan on 22/tcp"},
            {"event_type": "ddos", "severity": "critical", "source_ip": "45.33.32.156", "dest_ip": "10.0.1.10", "message": "Volumetric DDoS attack"},
            {"event_type": "brute_force", "severity": "high", "source_ip": "185.220.101.1", "dest_ip": "10.0.1.30", "message": "SSH brute force (150 attempts)"},
            {"event_type": "sql_injection", "severity": "critical", "source_ip": "103.235.46.92", "dest_ip": "10.0.1.20", "message": "SQLi attempt on /api/users"},
            {"event_type": "phishing", "severity": "medium", "source_ip": "198.51.100.7", "dest_ip": "10.0.2.50", "message": "Credential harvesting email"},
            {"event_type": "malware", "severity": "low", "source_ip": "10.0.0.15", "dest_ip": "10.0.1.10", "message": "Suspicious process creation"},
            {"event_type": "port_scan", "severity": "low", "source_ip": "10.0.0.22", "dest_ip": "10.0.1.20", "message": "Service discovery scan"},
            {"event_type": "ddos", "severity": "high", "source_ip": "78.46.89.12", "dest_ip": "10.0.1.10", "message": "SYN flood on port 443"},
            {"event_type": "brute_force", "severity": "medium", "source_ip": "10.0.0.50", "dest_ip": "10.0.1.30", "message": "FTP brute force detected"},
        ]
        for i, ed in enumerate(events_data):
            db.add(TelemetryEvent(
                org_id=org.id,
                event_type=ed["event_type"], severity=ed["severity"],
                payload_json={"src_ip": ed["source_ip"], "dst_ip": ed["dest_ip"]},
                message=ed["message"],
                created_at=now - timedelta(hours=i * 2),
            ))

        # Replicate across last 24h for richer timeline
        for hour in range(24):
            for ed in random.sample(events_data, 3):
                db.add(TelemetryEvent(
                    org_id=org.id,
                    event_type=ed["event_type"], severity=ed["severity"],
                    payload_json={"src_ip": ed["source_ip"], "dst_ip": ed["dest_ip"]},
                    message=ed["message"],
                    created_at=now - timedelta(hours=hour),
                ))

    # Seed AlertEvent only if empty
    ae_count = db.query(func.count(AlertEvent.id)).scalar()
    print(f"[Seed] AlertEvent count: {ae_count}", flush=True)
    if ae_count == 0:
        try:
            db.add(AlertEvent(timestamp=now - timedelta(minutes=30), src_ip="185.255.35.226", dst_ip="10.0.1.10", dst_port=443, type="SSH_BruteForce", severity="High", details={"attempts": 150}, org_id=org.id))
            db.add(AlertEvent(timestamp=now - timedelta(minutes=15), src_ip="45.33.32.156", dst_ip="10.0.1.10", dst_port=443, type="DDoS", severity="Critical", details={"rate": "1000 req/s"}, org_id=org.id))
            db.add(AlertEvent(timestamp=now - timedelta(hours=2), src_ip="103.235.46.92", dst_ip="10.0.1.20", dst_port=5432, type="SQL_Injection", severity="Medium", details={"query": "SELECT * FROM users"}, org_id=org.id))
            db.flush()
            print(f"[Seed] Inserted 3 AlertEvents for org={org.id}")
        except Exception as e:
            db.rollback()
            print(f"[Seed] AlertEvent insert failed: {e}")
            import traceback
            traceback.print_exc()

    # Seed Incident only if empty
    inc_count = db.query(func.count(Incident.id)).scalar()
    print(f"[Seed] Incident count: {inc_count}", flush=True)
    if inc_count == 0:
        try:
            db.add(Incident(title="Ransomware Attack", description="Encrypted critical files", severity="Critical", status="Open", owner="admin", org_id=org.id, created_at=now - timedelta(hours=2)))
            db.add(Incident(title="Phishing Campaign", description="Credential harvesting", severity="High", status="In Progress", owner="admin", org_id=org.id, created_at=now - timedelta(hours=5)))
            db.add(Incident(title="SQL Injection", description="DB exfiltration attempt", severity="Medium", status="Resolved", owner="admin", org_id=org.id, created_at=now - timedelta(days=1)))
            db.add(Incident(title="DDoS Attempt", description="Volumetric attack", severity="Low", status="Closed", owner="admin", org_id=org.id, created_at=now - timedelta(hours=3)))
            db.flush()
            print(f"[Seed] Inserted 4 Incidents for org={org.id}")
        except Exception as e:
            db.rollback()
            print(f"[Seed] Incident insert failed: {e}")

    db.commit()


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
            import app.models.soc_expert_sql
            Base.metadata.create_all(bind=engine)
            print("Database tables ensured.")
        if SessionLocal:
            db = SessionLocal()
            try:
                ensure_default_admin(db)
                seed_demo_data(db)
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
    
    try:
        from app.ml.model import detector
        if detector:
            print(f"[ML] Model loaded. Fitted: {detector.is_fitted}, Trained: {detector.total_trained}")
    except Exception as e:
        print(f"[ML] Model loading deferred: {e}")

    # CICIDS stream auto-start if dataset available
    try:
        from threading import Thread
        from app.routes.cicids_stream import auto_start_cicids
        t = Thread(target=auto_start_cicids, daemon=True)
        t.start()
        print("[CICIDS] Auto-start thread launched.")
    except Exception as e:
        print(f"[CICIDS] Auto-start skipped: {e}")

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

