"""
Tests for Offensive Security Consultant endpoints.
All endpoints use in-memory data (no DB) — no auth required.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)
BASE = "/api/offensive"


@pytest.mark.asyncio
async def test_consultant_status():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "operational"
    assert data["service"] == "Offensive Security Consultant"
    assert "red-team" in data["capabilities"]
    assert data["tools_count"] == 20


@pytest.mark.asyncio
async def test_engagement_types():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagement-types")
    assert resp.status_code == 200
    data = resp.json()
    assert "types" in data
    assert "red-team" in data["types"]
    assert "purple-team" in data["types"]
    assert "bug-bounty" in data["types"]


@pytest.mark.asyncio
async def test_list_engagements():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements")
    assert resp.status_code == 200
    data = resp.json()
    assert "engagements" in data
    assert data["total"] > 0
    for e in data["engagements"]:
        assert "id" in e
        assert "type" in e
        assert "title" in e
        assert "status" in e
        assert "target" in e


@pytest.mark.asyncio
async def test_list_engagements_filtered_by_type():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements", params={"type": "red-team"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(e["type"] == "red-team" for e in data["engagements"])


@pytest.mark.asyncio
async def test_list_engagements_filtered_by_status():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements", params={"status": "active"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(e["status"] == "active" for e in data["engagements"])


@pytest.mark.asyncio
async def test_get_engagement():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/engagements")
    eng_id = list_resp.json()["engagements"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements/{eng_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["engagement"]["id"] == eng_id
    assert "findings" in data
    assert "findings_count" in data


@pytest.mark.asyncio
async def test_get_engagement_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements/ENG-9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_engagement_detail():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/engagements")
    eng_id = list_resp.json()["engagements"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/engagements/{eng_id}/detail")
    assert resp.status_code == 200
    data = resp.json()
    assert "engagement" in data
    assert "findings" in data
    assert "timeline" in data
    assert len(data["timeline"]) >= 5
    assert "stats" in data
    assert "risk_score" in data["stats"]
    assert "severity_distribution" in data["stats"]
    assert "tools" in data
    assert len(data["tools"]) > 0


@pytest.mark.asyncio
async def test_create_engagement():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/engagements", json={
            "type": "red-team",
            "title": "Test Engagement - pytest",
            "target": "10.0.0.0/24"
        })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "created"
    assert data["engagement"]["type"] == "red-team"
    assert data["engagement"]["status"] == "planning"


@pytest.mark.asyncio
async def test_create_engagement_invalid_type():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/engagements", json={
            "type": "invalid-type",
            "title": "Bad",
            "target": "test"
        })
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_list_findings():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/findings")
    assert resp.status_code == 200
    data = resp.json()
    assert "findings" in data
    assert data["total"] > 0
    assert "risk_score" in data
    assert "by_severity" in data
    for f in data["findings"]:
        assert "id" in f
        assert "title" in f
        assert "severity" in f


@pytest.mark.asyncio
async def test_list_findings_filtered():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/findings", params={"severity": "critical"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(f["severity"] == "critical" for f in data["findings"])


@pytest.mark.asyncio
async def test_get_finding_detail():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/findings")
    finding_id = list_resp.json()["findings"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/findings/{finding_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == finding_id
    assert "title" in data
    assert "severity" in data
    assert "cwe" in data
    assert "cvss" in data
    assert "description" in data
    assert "remediation" in data
    assert "remediation_steps" in data
    assert len(data["remediation_steps"]) >= 2
    assert "references" in data
    assert len(data["references"]) >= 2
    assert "attack_vector" in data
    assert "tags" in data
    assert len(data["tags"]) >= 2
    assert "poc" in data
    assert "confidence" in data


@pytest.mark.asyncio
async def test_get_finding_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/findings/VULN-9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_finding_status():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/findings")
    finding_id = list_resp.json()["findings"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/findings/{finding_id}/status", params={"status": "verified"})
    assert resp.status_code == 200
    assert resp.json()["finding"]["status"] == "verified"


@pytest.mark.asyncio
async def test_update_finding_status_invalid():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/findings")
    finding_id = list_resp.json()["findings"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/findings/{finding_id}/status", params={"status": "invalid"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_export_findings():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/engagements")
    eng_id = list_resp.json()["engagements"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/engagements/{eng_id}/export")
    assert resp.status_code == 200
    data = resp.json()
    assert "report_metadata" in data
    assert data["report_metadata"]["engagement_id"] == eng_id
    assert "executive_summary" in data
    assert "findings" in data


@pytest.mark.asyncio
async def test_export_findings_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/engagements/ENG-9999/export")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_tools():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/tools")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 20
    assert "categories" in data
    for t in data["tools"]:
        assert "id" in t
        assert "name" in t
        assert "category" in t


@pytest.mark.asyncio
async def test_list_tools_filtered():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/tools", params={"category": "recon"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(t["category"] == "recon" for t in data["tools"])


@pytest.mark.asyncio
async def test_dashboard():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "engagements" in data
    assert "findings" in data
    assert "risk_score" in data
    assert "risk_rating" in data
    assert "tool_count" in data
    assert data["engagements"]["total"] > 0
    assert data["findings"]["total"] > 0


@pytest.mark.asyncio
async def test_generate_html_report():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        list_resp = await client.get(f"{BASE}/engagements")
    eng_id = list_resp.json()["engagements"][0]["id"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/report/html/{eng_id}")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")
    assert "Offensive Security Assessment Report" in resp.text
    assert "CONFIDENTIAL" in resp.text
    assert "Executive Summary" in resp.text
    assert "Prioritized Recommendations" in resp.text


@pytest.mark.asyncio
async def test_generate_html_report_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/report/html/ENG-9999")
    assert resp.status_code == 404


# ── Scan param helpers ──────────────────────────────────────────

def test_get_scan_params_nmap():
    from app.routes.offensive_ws import _get_scan_params
    tool_id, inp = _get_scan_params("1.2.3.4", "nmap")
    assert tool_id == "nmap_advanced"
    assert inp["target"] == "1.2.3.4"
    assert inp["ports"] == "22,80,443,3306,8080,8443"


def test_get_scan_params_masscan():
    from app.routes.offensive_ws import _get_scan_params
    tool_id, inp = _get_scan_params("1.2.3.4", "masscan")
    assert tool_id == "mass_scan"
    assert inp["target"] == "1.2.3.4"
    assert inp["ports"] == "1-1000"
    assert inp["rate"] == 10000


def test_get_scan_params_cidr_masscan():
    from app.routes.offensive_ws import _get_scan_params
    tool_id, inp = _get_scan_params("192.168.1.0/24", "masscan")
    assert tool_id == "mass_scan"
    assert inp["target"] == "192.168.1.0/24"
    assert "1-1000" in inp["ports"]


def test_get_scan_params_default():
    from app.routes.offensive_ws import _get_scan_params
    tool_id, inp = _get_scan_params("host.local", "unknown_type")
    assert tool_id == "nmap_advanced"
