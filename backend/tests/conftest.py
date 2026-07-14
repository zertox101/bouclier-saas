"""
Shared pytest fixtures for backend integration tests.
"""
import pytest, os, tempfile
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.sql import Base, User, Organization, Incident, Asset, AlertEvent, AuditLog
import app.models.connectors_sql  # ensure sql_connectors table is registered
from app.core.database import get_db
from app.core.security import hash_password, create_access_token
from app.core.rbac.permissions import get_permissions_for_role
from app.main import app

DB_PATH = os.path.join(tempfile.gettempdir(), f"test_bouclier_rbac.db")
TEST_DATABASE_URL = f"sqlite:///{DB_PATH}"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

ORG_ALPHA_ID = "11111111-1111-1111-1111-111111111111"
ORG_BETA_ID = "22222222-2222-2222-2222-222222222222"


def seed_db(db):
    db.execute(text("PRAGMA foreign_keys = OFF"))
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.execute(text("PRAGMA foreign_keys = ON"))

    org1 = Organization(id=ORG_ALPHA_ID, name="Org Alpha", slug="org-alpha", plan="PRO")
    org2 = Organization(id=ORG_BETA_ID, name="Org Beta", slug="org-beta", plan="FREE")
    db.add_all([org1, org2])
    db.flush()

    super_admin = User(
        username="superadmin", email="super@test.com",
        hashed_password=hash_password("test123"), role="SUPER_ADMIN", is_active=True,
        org_id=None
    )
    org_admin = User(
        username="orgadmin", email="admin@alpha.com",
        hashed_password=hash_password("test123"), role="ORG_ADMIN", is_active=True,
        org_id=ORG_ALPHA_ID
    )
    analyst = User(
        username="analyst", email="analyst@alpha.com",
        hashed_password=hash_password("test123"), role="ANALYST", is_active=True,
        org_id=ORG_ALPHA_ID
    )
    analyst_beta = User(
        username="analyst_beta", email="analyst@beta.com",
        hashed_password=hash_password("test123"), role="ANALYST", is_active=True,
        org_id=ORG_BETA_ID
    )
    db.add_all([super_admin, org_admin, analyst, analyst_beta])
    db.flush()

    now = datetime.utcnow()
    incident1 = Incident(title="Ransomware Attack", description="Encrypted critical files", severity="Critical", status="Open", owner="analyst", org_id=ORG_ALPHA_ID, created_at=now - timedelta(hours=2))
    incident2 = Incident(title="Phishing Campaign", description="Credential harvesting emails", severity="High", status="In Progress", owner="analyst", org_id=ORG_ALPHA_ID, created_at=now - timedelta(hours=5))
    incident3 = Incident(title="SQL Injection", description="DB exfiltration attempt", severity="Medium", status="Resolved", owner="analyst", org_id=ORG_ALPHA_ID, created_at=now - timedelta(days=1))
    incident4 = Incident(title="DDoS Attempt", description="Volumetric attack on port 443", severity="Low", status="Closed", owner="analyst", org_id=ORG_BETA_ID, created_at=now - timedelta(hours=3))
    db.add_all([incident1, incident2, incident3, incident4])
    db.flush()

    asset1 = Asset(asset_tag="SRV-WEB-01", name="Production Web Server", type="Server", ip_address="10.0.1.10", risk_level="High", status="Warning", org_id=ORG_ALPHA_ID)
    asset2 = Asset(asset_tag="FW-01", name="Main Firewall", type="Firewall", ip_address="10.0.0.1", risk_level="Low", status="Healthy", org_id=ORG_ALPHA_ID)
    asset3 = Asset(asset_tag="WS-ADMIN-05", name="Admin Workstation", type="Workstation", ip_address="10.0.2.50", risk_level="Medium", status="Suspicious", org_id=ORG_ALPHA_ID)
    asset4 = Asset(asset_tag="SRV-DB-01", name="Database Server", type="Server", ip_address="10.0.1.20", risk_level="Critical", status="Healthy", org_id=ORG_BETA_ID)
    db.add_all([asset1, asset2, asset3, asset4])
    db.flush()

    alert1 = AlertEvent(timestamp=now - timedelta(minutes=30), src_ip="10.0.0.99", dst_ip="10.0.1.10", dst_port=443, type="SSH_BruteForce", severity="High", details={"attempts": 150}, org_id=ORG_ALPHA_ID)
    alert2 = AlertEvent(timestamp=now - timedelta(minutes=15), src_ip="10.0.0.99", dst_ip="10.0.1.10", dst_port=22, type="SSH_BruteForce", severity="Critical", details={"attempts": 500}, org_id=ORG_ALPHA_ID)
    alert3 = AlertEvent(timestamp=now - timedelta(hours=2), src_ip="10.0.3.5", dst_ip="10.0.1.10", dst_port=443, type="DDoS", severity="Medium", details={"rate": "1000 req/s"}, org_id=ORG_BETA_ID)
    db.add_all([alert1, alert2, alert3])
    db.flush()

    audit1 = AuditLog(org_id=ORG_ALPHA_ID, user_id="orgadmin", action="LOGIN", entity_type="session", entity_id="sess-001", ip_address="10.0.0.10", created_at=now - timedelta(hours=1))
    audit2 = AuditLog(org_id=ORG_ALPHA_ID, user_id="analyst", action="INCIDENT_UPDATE", entity_type="incident", entity_id="1", ip_address="10.0.0.20", created_at=now - timedelta(minutes=45))
    audit3 = AuditLog(org_id=ORG_ALPHA_ID, user_id="orgadmin", action="REPORT_EXPORT", entity_type="report", entity_id="rpt-001", ip_address="10.0.0.10", created_at=now - timedelta(minutes=30))
    audit4 = AuditLog(org_id=ORG_BETA_ID, user_id="analyst_beta", action="LOGIN", entity_type="session", entity_id="sess-002", ip_address="10.0.0.30", created_at=now - timedelta(hours=2))
    db.add_all([audit1, audit2, audit3, audit4])
    db.commit()


Base.metadata.create_all(bind=test_engine)
seed_db(TestSessionLocal())


@pytest.fixture(autouse=True)
def setup_db():
    db = TestSessionLocal()
    seed_db(db)
    db.close()
    yield


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def make_token(user: User) -> str:
    permissions = get_permissions_for_role(user.role)
    return create_access_token({
        "sub": str(user.id),
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "org_id": str(user.org_id) if user.org_id else None,
        "permissions": permissions,
    })
