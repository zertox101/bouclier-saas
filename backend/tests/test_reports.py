"""
Tests for Advanced Reports endpoints.
All endpoints use in-memory/data from DB — some endpoints require DB.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)
BASE = "/api/reports"


@pytest.mark.asyncio
async def test_report_templates():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/templates")
    assert resp.status_code == 200
    data = resp.json()
    assert "templates" in data
    templates = {t["id"] for t in data["templates"]}
    assert "soc-executive" in templates
    assert "soc-daily" in templates
    assert "soc-weekly" in templates
    assert "soc-monthly" in templates
    assert "pentest-executive" in templates
    assert "pentest-technical" in templates
    assert "pentest-compliance" in templates
    assert "mythos-kill-chain" in templates
    assert len(data["templates"]) == 8


@pytest.mark.asyncio
async def test_generate_soc_executive_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-executive")
    assert resp.status_code == 200
    assert "text/html" in resp.headers.get("content-type", "")
    assert "SOC Executive Summary" in resp.text
    assert "SHIELD" in resp.text


@pytest.mark.asyncio
async def test_generate_soc_daily_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-daily")
    assert resp.status_code == 200
    assert "SOC Daily Operations Report" in resp.text


@pytest.mark.asyncio
async def test_generate_soc_weekly_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-weekly")
    assert resp.status_code == 200
    assert "SOC Weekly" in resp.text


@pytest.mark.asyncio
async def test_generate_soc_monthly_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-monthly")
    assert resp.status_code == 200
    assert "SOC Monthly" in resp.text


@pytest.mark.asyncio
async def test_generate_pentest_executive_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/pentest-executive")
    assert resp.status_code == 200
    assert "Pentest Executive Summary" in resp.text
    assert "Vulnerability Assessment" in resp.text or "Pentest" in resp.text


@pytest.mark.asyncio
async def test_generate_pentest_technical_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/pentest-technical")
    assert resp.status_code == 200
    assert "Pentest Technical Report" in resp.text


@pytest.mark.asyncio
async def test_generate_pentest_compliance_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/pentest-compliance")
    assert resp.status_code == 200
    assert "Compliance" in resp.text


@pytest.mark.asyncio
async def test_generate_mythos_kill_chain_html():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/mythos-kill-chain")
    assert resp.status_code == 200
    assert "Kill Chain" in resp.text or "Mythos" in resp.text or "MITRE" in resp.text


@pytest.mark.asyncio
async def test_generate_invalid_type():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/invalid-type")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_generate_json():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-executive/json")
    assert resp.status_code == 200
    data = resp.json()
    assert data["report_type"] == "soc-executive"
    assert "generated_at" in data
    assert "metrics" in data


@pytest.mark.asyncio
async def test_generate_json_pentest():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/pentest-technical/json")
    assert resp.status_code == 200
    data = resp.json()
    assert data["report_type"] == "pentest-technical"
    assert "findings" in data


@pytest.mark.asyncio
async def test_generate_json_invalid():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/invalid/json")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_report_history():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/history")
    assert resp.status_code == 200
    data = resp.json()
    assert "reports" in data
    assert len(data["reports"]) > 0
    for r in data["reports"]:
        assert "id" in r
        assert "type" in r
        assert "title" in r
        assert "status" in r
        assert "risk_score" in r
        assert "generated_by" in r


@pytest.mark.asyncio
async def test_report_history_filtered():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/history", params={"type": "soc-executive"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(r["type"] == "soc-executive" for r in data["reports"])


@pytest.mark.asyncio
async def test_report_history_limit():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/history", params={"limit": 3})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["reports"]) > 0


@pytest.mark.asyncio
async def test_generate_with_custom_hours():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/generate/soc-daily", params={"hours": 48})
    assert resp.status_code == 200
    assert "SOC Daily" in resp.text


@pytest.mark.asyncio
async def test_all_templates_produce_valid_html():
    template_ids = [
        "soc-executive", "soc-daily", "soc-weekly", "soc-monthly",
        "pentest-executive", "pentest-technical", "pentest-compliance",
        "mythos-kill-chain",
    ]
    for t_id in template_ids:
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(f"{BASE}/generate/{t_id}")
        assert resp.status_code == 200, f"Failed for {t_id}"
        html = resp.text
        assert "<!DOCTYPE html>" in html, f"Missing DOCTYPE for {t_id}"
        assert "</html>" in html, f"Missing closing html for {t_id}"
