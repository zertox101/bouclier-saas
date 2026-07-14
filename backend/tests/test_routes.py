"""
Comprehensive integration tests for all major route groups:
auth, SOC, admin, org, health, and production routes.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models.sql import User
from app.core.database import get_db
from .conftest import (
    TestSessionLocal, make_token, ORG_ALPHA_ID, ORG_BETA_ID,
    override_get_db
)

app.dependency_overrides[get_db] = override_get_db
transport = ASGITransport(app=app)


# ── Health ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"


# ── Auth ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_valid():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/login", json={"email": "super@test.com", "password": "test123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "SUPER_ADMIN"


@pytest.mark.asyncio
async def test_login_invalid_password():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/login", json={"email": "super@test.com", "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_inactive_user():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    user.is_active = False
    db.commit()
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/login", json={"email": "analyst@alpha.com", "password": "test123"})
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_me_valid_token():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "admin@alpha.com"


@pytest.mark.asyncio
async def test_me_no_token():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_new_user():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/register", json={
            "username": "newuser", "email": "new@test.com", "password": "test123"
        })
    assert resp.status_code == 200
    assert resp.json()["user"]["role"] == "ANALYST"


@pytest.mark.asyncio
async def test_register_duplicate():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/auth/register", json={
            "username": "superadmin", "email": "super@test.com", "password": "test123"
        })
    assert resp.status_code == 400


# ── SOC Routes ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_soc_dashboard_own_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/soc/dashboard", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "incidents" in data
    assert data["incidents"]["total"] == 3  # 3 incidents for Org Alpha


@pytest.mark.asyncio
async def test_soc_dashboard_wrong_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/soc/dashboard", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_BETA_ID
        })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_soc_dashboard_no_auth():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/soc/dashboard")
    assert resp.status_code == 401


# ── Admin Routes (SUPER_ADMIN) ────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_list_orgs_as_super_admin():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/admin/organizations", headers={
            "Authorization": f"Bearer {token}"
        })
    assert resp.status_code == 200
    assert len(resp.json()) >= 2


@pytest.mark.asyncio
async def test_admin_list_orgs_as_org_admin():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/admin/organizations", headers={
            "Authorization": f"Bearer {token}"
        })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_platform_health():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/admin/platform/health", headers={
            "Authorization": f"Bearer {token}"
        })
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_admin_create_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/admin/organizations", headers={
            "Authorization": f"Bearer {token}"
        }, json={"name": "Test Org", "slug": "test-org", "plan": "FREE"})
    assert resp.status_code == 201
    assert resp.json()["slug"] == "test-org"


# ── Org Routes (ORG_ADMIN) ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_org_dashboard():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/dashboard", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data["users"]["total"] >= 2  # org_admin + analyst
    assert data["incidents"]["total"] == 3


@pytest.mark.asyncio
async def test_org_users_list():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/users", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) >= 2
    emails = [u["email"] for u in users]
    assert "admin@alpha.com" in emails
    assert "analyst@alpha.com" in emails


@pytest.mark.asyncio
async def test_org_create_user():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/org/users", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        }, json={
            "username": "newanalyst", "email": "newanalyst@alpha.com",
            "password": "test123", "role": "ANALYST"
        })
    assert resp.status_code == 201
    assert resp.json()["email"] == "newanalyst@alpha.com"


@pytest.mark.asyncio
async def test_org_create_user_duplicate():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/org/users", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        }, json={
            "username": "analyst", "email": "analyst@alpha.com",
            "password": "test123", "role": "ANALYST"
        })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_org_user_get_by_id():
    db = TestSessionLocal()
    admin = db.query(User).filter(User.email == "admin@alpha.com").first()
    target = db.query(User).filter(User.email == "analyst@alpha.com").first()
    token = make_token(admin)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"/api/org/users/{target.id}", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    assert resp.json()["email"] == "analyst@alpha.com"


@pytest.mark.asyncio
async def test_org_user_get_not_found():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/users/99999", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_org_settings():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/settings", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    assert resp.json()["name"] == "Org Alpha"


@pytest.mark.asyncio
async def test_org_update_settings():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.put("/api/org/settings", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        }, json={"name": "Org Alpha Renamed"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Org Alpha Renamed"


@pytest.mark.asyncio
async def test_org_security():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/security", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2  # at least 2 incidents for alpha


@pytest.mark.asyncio
async def test_org_audit_logs():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/audit-logs", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 3  # 3 audit logs for alpha


@pytest.mark.asyncio
async def test_org_subscription():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/subscription", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    assert resp.json()["plan"] == "PRO"


@pytest.mark.asyncio
async def test_org_subscription_update_plan():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.put("/api/org/subscription/plan", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        }, params={"plan": "ENTERPRISE"})
    assert resp.status_code == 200
    assert resp.json()["plan"] == "ENTERPRISE"


@pytest.mark.asyncio
async def test_org_documents():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/documents", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code == 200
    data = resp.json()
    assert "documents" in data or isinstance(data, list)


# ── Production Routes (generated data) ────────────────────────────────

@pytest.mark.asyncio
async def test_threat_intel():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/threat-intel", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code in (200, 404)


@pytest.mark.asyncio
async def test_playbooks():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/playbooks", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        })
    assert resp.status_code in (200, 404)


@pytest.mark.asyncio
async def test_reports():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/reports")
    assert resp.status_code in (200, 404)


@pytest.mark.asyncio
async def test_mitre():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/mitre")
    assert resp.status_code in (200, 404)


# ── RBAC Cross-Org Isolation ─────────────────────────────────────────

@pytest.mark.asyncio
async def test_org_admin_cannot_see_beta_incidents():
    """ORG_ADMIN of alpha should see 0 incidents for beta"""
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/org/security", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_BETA_ID
        })
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_analyst_cannot_manage_users():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    token = make_token(user)
    db.close()
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/org/users", headers={
            "Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID
        }, json={
            "username": "shouldfail", "email": "fail@alpha.com",
            "password": "test123", "role": "ANALYST"
        })
    assert resp.status_code == 403
