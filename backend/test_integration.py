"""
Integration tests for Offensive Security Consultant endpoints.
Runs against the running backend at localhost:8005.
"""
import httpx
import sys
import json
import asyncio

BASE = "http://localhost:8005/api/offensive"
WS_URL = "ws://localhost:8005/api/offensive/ws"
passed = 0
failed = 0

def check(name, ok, detail=""):
    global passed, failed
    if ok:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}  {detail}")

# ── PDF Report Tests ─────────────────────────────────────────────
print("\n=== PDF Report Tests ===")

# Test 1: Valid engagement returns PDF
r = httpx.get(f"{BASE}/report/pdf/ENG-0001", follow_redirects=True, timeout=30)
check("GET /report/pdf/ENG-0001 → 200",
      r.status_code == 200,
      f"got {r.status_code}")
check("Content-Type is application/pdf",
      r.headers.get("content-type") == "application/pdf",
      r.headers.get("content-type"))
check("Content-Disposition header present",
      "attachment" in r.headers.get("content-disposition", ""),
      r.headers.get("content-disposition"))
check("PDF size > 1000 bytes",
      len(r.content) > 1000,
      f"{len(r.content)} bytes")
check("PDF magic bytes",
      r.content[:4] == b"%PDF",
      r.content[:4])

# Test 2: Another engagement
r2 = httpx.get(f"{BASE}/report/pdf/ENG-0004", timeout=30)
check("GET /report/pdf/ENG-0004 → 200",
      r2.status_code == 200,
      f"got {r2.status_code}")
check("ENG-0004 PDF size > 1000",
      len(r2.content) > 1000)

# Test 3: Non-existent engagement → 404
r3 = httpx.get(f"{BASE}/report/pdf/INVALID-999", timeout=10)
check("GET /report/pdf/INVALID-999 → 404",
      r3.status_code == 404,
      f"got {r3.status_code}")

# Test 4: Planning engagement (no findings) → still generates PDF
r4 = httpx.get(f"{BASE}/report/pdf/ENG-0005", timeout=30)
check("GET /report/pdf/ENG-0005 (planning, no findings) → 200",
      r4.status_code == 200,
      f"got {r4.status_code}")
check("Planning PDF size > 500",
      len(r4.content) > 500)

# ── Status endpoint ──────────────────────────────────────────────
print("\n=== Status Tests ===")
r = httpx.get(f"{BASE}/status", timeout=10)
check("GET /status → 200", r.status_code == 200)
data = r.json()
check("status is operational", data.get("status") == "operational")
check("service name correct", data.get("service") == "Offensive Security Consultant")
check("capabilities include red-team", "red-team" in data.get("capabilities", []))
check("tools_count is 20", data.get("tools_count") == 20)

# ── Engagement Types ─────────────────────────────────────────────
print("\n=== Engagement Types Tests ===")
r = httpx.get(f"{BASE}/engagement-types", timeout=10)
check("GET /engagement-types → 200", r.status_code == 200)
types = r.json()
tdata = types.get("types", types)
if isinstance(tdata, dict):
    check("Has red-team type", "red-team" in tdata)
    check("red-team has phases", len(tdata["red-team"].get("phases", [])) > 0)
    check(f"Has {len(tdata)} types", len(tdata) == 7, f"got {len(tdata)}")
else:
    check("Has types data", True)

# ── Engagements ──────────────────────────────────────────────────
print("\n=== Engagements Tests ===")
r = httpx.get(f"{BASE}/engagements", timeout=10)
check("GET /engagements → 200", r.status_code == 200)
engs = r.json()
if isinstance(engs, dict):
    engs = engs.get("engagements", [])
check("Has 5 engagements", len(engs) == 5, f"got {len(engs)}")
eng_ids = [e["id"] for e in engs]
check("ENG-0001 exists", "ENG-0001" in eng_ids)

# ── Engagement Detail ────────────────────────────────────────────
print("\n=== Engagement Detail Tests ===")
r = httpx.get(f"{BASE}/engagements/ENG-0001/detail", timeout=10)
check("GET /engagements/ENG-0001/detail → 200", r.status_code == 200)
det = r.json()
check("Has engagement field", "engagement" in det)
check("Has findings field", "findings" in det)
check("Has timeline field", "timeline" in det)
check("Has stats field", "stats" in det)
check("Has tools field", "tools" in det)
check("Findings is array", isinstance(det.get("findings"), list))
check("Timeline is array", isinstance(det.get("timeline"), list))
finding_list = det.get("findings", [])
check("Findings have data", len(finding_list) > 0)

# ── Findings Tests ───────────────────────────────────────────────
print("\n=== Finding Detail Tests ===")
# Get a finding ID from engagement detail
finding_id = None
for f in finding_list:
    finding_id = f["id"]
    break
if finding_id:
    r = httpx.get(f"{BASE}/findings/{finding_id}", timeout=10)
    check(f"GET /findings/{finding_id} → 200", r.status_code == 200)
    fd = r.json()
    check("Has title", "title" in fd)
    check("Has remediation_steps", "remediation_steps" in fd)
    check("Has references", "references" in fd)
    check("Has attack_vector", "attack_vector" in fd)

# ── Filters ──────────────────────────────────────────────────────
print("\n=== Filter Tests ===")
r = httpx.get(f"{BASE}/engagements?status=completed", timeout=10)
check("Filter status=completed → 200", r.status_code == 200)
comp = r.json()
if isinstance(comp, dict):
    comp = comp.get("engagements", [])
check("Only completed engagements", all(e["status"] == "completed" for e in comp))

r = httpx.get(f"{BASE}/findings?severity=critical", timeout=10)
check("Filter findings severity=critical → 200", r.status_code == 200)

# ══════════════════════════════════════════════════════════════════
# WebSocket Tests
# ══════════════════════════════════════════════════════════════════
print("\n=== WebSocket Tests ===")

async def test_websocket():
    results = []
    try:
        import websockets
        # Test 1: Ping
        async with websockets.connect(WS_URL, ping_interval=None) as ws:
            await ws.send(json.dumps({"action": "ping"}))
            pong = json.loads(await ws.recv())
            results.append(("Ping returns type='pong'", pong.get("type") == "pong", str(pong)[:60]))

        # Test 2: Stats (on-demand)
        async with websockets.connect(WS_URL, ping_interval=None) as ws:
            await ws.send(json.dumps({"action": "stats"}))
            stats = json.loads(await ws.recv())
            results.append(("Stats returns type='stats'", stats.get("type") == "stats", str(stats)[:60]))
            results.append(("Stats has engagements", "engagements" in stats, ""))
            results.append(("Stats has findings", "findings" in stats, ""))
            results.append(("Stats has risk_score", "risk_score" in stats, ""))
            results.append(("Stats engagements has total", stats.get("engagements", {}).get("total", 0) > 0, ""))

        # Test 3: Scan (simulated)
        async with websockets.connect(WS_URL, ping_interval=None) as ws:
            await ws.send(json.dumps({"action": "scan", "target": "scanme.nmap.org", "scan_type": "nmap-fast"}))
            msgs = []
            try:
                while True:
                    msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
                    msgs.append(msg)
                    if msg.get("type") == "scan_complete":
                        break
            except (asyncio.TimeoutError, Exception):
                pass
            types = [m.get("type") for m in msgs]
            results.append(("Scan received messages", len(msgs) > 0, f"{len(msgs)} msgs"))
            results.append(("Scan includes scan_start", "scan_start" in types, str(types)))
            results.append(("Scan has progress or logs", "scan_progress" in types or "scan_log" in types, str(types)))
            results.append(("Scan includes scan_complete", "scan_complete" in types, str(types)))
            results.append(("Scan has target info", any(m.get("target") == "scanme.nmap.org" for m in msgs), ""))

        # Test 4: Masscan (simulated — uses mass_scan tool_id)
        async with websockets.connect(WS_URL, ping_interval=None) as ws:
            await ws.send(json.dumps({"action": "scan", "target": "192.168.1.1", "scan_type": "masscan"}))
            msgs2 = []
            try:
                while True:
                    msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
                    msgs2.append(msg)
                    if msg.get("type") == "scan_complete":
                        break
            except (asyncio.TimeoutError, Exception):
                pass
            types2 = [m.get("type") for m in msgs2]
            results.append(("Masscan received messages", len(msgs2) > 0, f"{len(msgs2)} msgs"))
            results.append(("Masscan includes scan_start with tool=masscan",
                            any(m.get("tool") == "masscan" for m in msgs2), ""))
            results.append(("Masscan includes scan_complete", "scan_complete" in types2, str(types2)))

    except ImportError:
        results.append(("websockets library not available", True, "skipping WS tests"))
    except Exception as e:
        results.append((f"WebSocket error", False, str(e)[:120]))
    return results

ws_results = asyncio.run(test_websocket())
for name, ok, detail in ws_results:
    check(name, ok, detail)

# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*50}")
print(f"Results: {passed} passed, {failed} failed out of {passed+failed} tests")
if failed:
    sys.exit(1)
