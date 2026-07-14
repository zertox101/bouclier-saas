"""
Integration tests for RBAC tenant isolation.

Tests the multi-tenant RBAC system:
- SUPER_ADMIN can access all organizations
- ORG_ADMIN can only access their own org
- ANALYST can only access their own org SOC data
- X-Organization-ID header enforcement
- Permission-based endpoint access
- Inactive user blocking
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


@pytest.mark.asyncio
async def test_super_admin_can_access_all_orgs():
    app.dependency_overrides[get_db] = override_get_db
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID}
        )
        assert resp.status_code in (200, 404), f"SUPER_ADMIN should access org alpha, got {resp.status_code}"

        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_BETA_ID}
        )
        assert resp.status_code in (200, 404), f"SUPER_ADMIN should access org beta, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_org_admin_blocked_from_other_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_BETA_ID}
        )
        assert resp.status_code == 403, f"ORG_ADMIN should get 403 for other org, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_analyst_blocked_from_other_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_BETA_ID}
        )
        assert resp.status_code == 403, f"ANALYST should get 403 for other org, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_super_admin_can_access_no_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/admin/organizations",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code in (200, 404), f"SUPER_ADMIN should access admin endpoints, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_org_admin_uses_own_org_without_header():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code in (200, 404), f"ORG_ADMIN should use own org without header, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_analyst_uses_own_org_without_header():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code in (200, 404), f"ANALYST should use own org without header, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_org_admin_can_access_own_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "admin@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID}
        )
        assert resp.status_code in (200, 404), f"ORG_ADMIN should access own org, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_analyst_can_access_own_org():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID}
        )
        assert resp.status_code in (200, 404), f"ANALYST should access own org, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_inactive_user_blocked():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "analyst@alpha.com").first()
    user.is_active = False
    db.commit()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/soc/dashboard",
            headers={"Authorization": f"Bearer {token}", "X-Organization-ID": ORG_ALPHA_ID}
        )
        assert resp.status_code == 403, f"Inactive user should get 403, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_admin_endpoint_requires_super_admin():
    db = TestSessionLocal()
    for email in ["admin@alpha.com", "analyst@alpha.com"]:
        user = db.query(User).filter(User.email == email).first()
        token = make_token(user)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(
                "/api/admin/platform/health",
                headers={"Authorization": f"Bearer {token}"}
            )
            assert resp.status_code == 403, f"{email} should get 403 on admin endpoint, got {resp.status_code}"
    db.close()


@pytest.mark.asyncio
async def test_org_can_access_admin_endpoints():
    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "super@test.com").first()
    token = make_token(user)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/admin/organizations",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code in (200, 404), f"SUPER_ADMIN should access org list, got {resp.status_code}"
    db.close()
