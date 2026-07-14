"""
Tests for Mythos Intelligence endpoints.
- REST API (phases, intel, stacks, content, analyses, analyze)
- All use in-memory data — no external dependencies when using scan_data
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

transport = ASGITransport(app=app)
BASE = "/api/mythos"


@pytest.mark.asyncio
async def test_phases():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/phases")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 5
    assert data[0]["phase"] == 1
    assert data[0]["name"] == "RECONNAISSANCE"
    assert data[4]["phase"] == 5
    assert data[4]["name"] == "COVER TRACKS"


@pytest.mark.asyncio
async def test_intel_list():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/intel")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    for doc in data:
        assert "id" in doc
        assert "title" in doc
        assert doc["category"] == "Intelligence"


@pytest.mark.asyncio
async def test_stacks_list():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/stacks")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) > 0
    for doc in data:
        assert "id" in doc
        assert "title" in doc
        assert doc["category"] == "Hardening Guide"


@pytest.mark.asyncio
async def test_content_doc():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/content/docs/00a-executive-summary.md")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "00a-executive-summary.md"
    assert "content_md" in data
    assert len(data["content_md"]) > 0


@pytest.mark.asyncio
async def test_content_stack():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/content/stacks/credential-security.md")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == "credential-security.md"
    assert "content_md" in data


@pytest.mark.asyncio
async def test_content_invalid_category():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/content/invalid/doc.md")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_content_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/content/docs/nonexistent.md")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_analyses_list_empty():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_analyze_with_scan_data():
    """Test analyze with scan_data — uses direct fallback, no tools-api needed."""
    payload = {
        "target": "192.168.1.100",
        "scan_data": {
            "ports": [
                {"port": 22, "state": "open", "service": "SSH", "version": "OpenSSH 8.9p1"},
                {"port": 80, "state": "open", "service": "HTTP", "version": "Apache 2.4.41"},
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "analysis_id" in data
    assert data["status"] == "running"
    assert data["analysis_id"].startswith("MYTHOS-")

    # Wait for completion (fallback is synchronous in thread)
    import asyncio
    await asyncio.sleep(3)

    # Check analysis details
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses/{data['analysis_id']}")
    assert resp.status_code == 200
    detail = resp.json()
    assert detail["summary"]["total_findings"] >= 9
    assert detail["summary"]["risk_score"] > 0

    # Verify phases are populated
    assert len(detail["phases"]) >= 4
    phase_names = [p["name"] for p in detail["phases"]]
    assert "RECONNAISSANCE" in phase_names
    assert "COVER TRACKS" in phase_names


@pytest.mark.asyncio
async def test_analyze_no_scan_data():
    """Test analyze without scan_data — calls tools-api in Docker, might still be running."""
    payload = {"target": "test.local"}
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "running"

    # Accept either completed or running (tools-api may be slow in Docker)
    import asyncio
    await asyncio.sleep(3)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses/{data['analysis_id']}")
    assert resp.status_code == 200
    detail = resp.json()
    # Analysis may still be running via tools-api; just check it exists
    assert detail["status"] in ("running", "completed")


@pytest.mark.asyncio
async def test_analysis_not_found():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses/NONEXISTENT")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_analyze_with_service_specific_findings():
    """Verify service-specific findings are generated (SSH, HTTP, DB)."""
    payload = {
        "target": "test.local",
        "scan_data": {
            "ports": [
                {"port": 22, "state": "open", "service": "SSH", "version": "OpenSSH 8.9p1"},
                {"port": 3306, "state": "open", "service": "MySQL", "version": "8.0.35"},
                {"port": 21, "state": "open", "service": "FTP", "version": "vsftpd 3.0.3"},
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/analyze", json=payload)
    assert resp.status_code == 200
    analysis_id = resp.json()["analysis_id"]

    import asyncio
    await asyncio.sleep(3)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses/{analysis_id}")
    assert resp.status_code == 200
    detail = resp.json()

    findings = detail["findings"]
    finding_names = [f["name"] for f in findings]

    assert any("SSH" in n for n in finding_names), "Should have SSH findings"
    assert any("MySQL" in n or "Database" in n for n in finding_names), "Should have DB findings"
    assert any("FTP" in n or "Anonymous" in n for n in finding_names), "Should have FTP findings"
    assert any("Persistence" in n for n in finding_names), "Should have persistence findings"
    assert any("Evasion" in n or "COVER" in n.upper() for n in finding_names), "Should have cover tracks findings"


@pytest.mark.asyncio
async def test_analyze_with_empty_ports():
    """Test with empty ports array — should handle gracefully."""
    payload = {
        "target": "test.local",
        "scan_data": {"ports": []}
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(f"{BASE}/analyze", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "running"

    import asyncio
    await asyncio.sleep(2)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(f"{BASE}/analyses/{data['analysis_id']}")
    assert resp.status_code == 200
    detail = resp.json()
    # Empty ports → fallback skipped (no ports to analyze) or tools-api path
    assert detail["status"] in ("completed", "running")
    if detail["status"] == "completed":
        assert len(detail["findings"]) == 0
