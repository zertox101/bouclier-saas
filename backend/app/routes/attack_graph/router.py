import os
import re
import asyncio
import httpx
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/attack-graph", tags=["attack-graph"])
TOOLS_API_URL = os.getenv("TOOLS_API_URL", "http://tools-api:8100")
TOOLS_API_SECRET = os.getenv("TOOLS_API_SECRET", "BOUCLIER_ALPHA_SESSION_2026")
POLL_INTERVAL = 2.0
MAX_POLLS = 45


async def _run_and_poll(client: httpx.AsyncClient, tool_id: str, input_data: dict, timeout: int = 90) -> str:
    resp = await client.post(
        f"{TOOLS_API_URL}/tools/run",
        json={"tool_id": tool_id, "input": input_data},
        headers={"X-Api-Key": TOOLS_API_SECRET},
    )
    if resp.status_code != 200:
        return ""
    body = resp.json()
    job_id = body.get("job_id")
    if not job_id:
        return ""
    for _ in range(MAX_POLLS):
        await asyncio.sleep(POLL_INTERVAL)
        job_resp = await client.get(
            f"{TOOLS_API_URL}/tools/jobs/{job_id}",
            headers={"X-Api-Key": TOOLS_API_SECRET},
        )
        if job_resp.status_code != 200:
            continue
        job_data = job_resp.json()
        status = job_data.get("status", "running")
        if status in ("completed", "error"):
            logs = job_data.get("logs", [])
            return "\n".join(l.get("message", "") for l in logs)
    return ""


def _parse_nmap_output(raw: str) -> List[Dict[str, str]]:
    ports = []
    for line in raw.splitlines():
        line_stripped = line.strip()
        m = re.match(r"^(\d+)/(tcp|udp)\s+open\s+(\S+)", line_stripped)
        if m:
            ports.append({"port": f"{m.group(1)}/{m.group(2)}", "service": m.group(3), "full": line_stripped})
    return ports


def _parse_nikto_vulns(raw: str) -> List[str]:
    vulns = []
    for line in raw.splitlines():
        if "OSVDB" in line or "CVE" in line:
            vulns.append(line.strip()[:100])
    return vulns


@router.post("/generate")
async def generate_attack_graph(target: str = Query(..., min_length=3)):
    """Generate an attack graph from real scan data against a target."""
    async with httpx.AsyncClient(timeout=120) as client:
        nmap_raw, nikto_raw = await asyncio.gather(
            _run_and_poll(client, "network_recon", {"target": target}),
            _run_and_poll(client, "nikto_webscan", {"target": target}),
        )

    nodes = []
    edges = []

    tid = "target"
    nodes.append({"id": tid, "label": target, "group": "target", "severity": "info"})

    rid = "recon"
    nodes.append({"id": rid, "label": "Reconnaissance", "group": "phase", "severity": "info"})
    edges.append({"source": tid, "target": rid, "label": "initiates"})

    open_ports = _parse_nmap_output(nmap_raw)
    for p in open_ports:
        pid = f"port_{p['port'].replace('/', '_')}"
        nodes.append({"id": pid, "label": f"Port {p['port']} - {p['service']}", "group": "recon", "severity": "medium"})
        edges.append({"source": rid, "target": pid, "label": "discovers"})

    if open_ports:
        eid = "enumeration"
        nodes.append({"id": eid, "label": "Enumeration", "group": "phase", "severity": "info"})
        edges.append({"source": rid, "target": eid, "label": "completed"})
        for p in open_ports[:8]:
            pid = f"port_{p['port'].replace('/', '_')}"
            vid = f"vuln_{p['port'].replace('/', '_')}"
            nodes.append({"id": vid, "label": f"{p['service']} on {p['port']}", "group": "vuln", "severity": "high"})
            edges.append({"source": pid, "target": vid, "label": "exposes"})
            edges.append({"source": eid, "target": vid, "label": "identifies"})

    nikto_vulns = _parse_nikto_vulns(nikto_raw)
    has_enum = "enumeration" in [e["id"] for e in nodes if e.get("group") == "phase"]

    for i, v in enumerate(nikto_vulns):
        vid = f"nikto_{i}"
        sev = "critical" if "CRITICAL" in v else "high"
        nodes.append({"id": vid, "label": v[:80], "group": "vuln", "severity": sev})
        source = "enumeration" if has_enum else rid
        edges.append({"source": source, "target": vid, "label": "finds"})

    if nikto_vulns and not has_enum:
        eid = "enumeration"
        nodes.append({"id": eid, "label": "Enumeration", "group": "phase", "severity": "info"})
        edges.append({"source": rid, "target": eid, "label": "completed"})

    caid = "credential_access"
    nodes.append({"id": caid, "label": "Credential Access", "group": "phase", "severity": "warning"})
    if has_enum or nikto_vulns:
        edges.append({"source": "enumeration" if has_enum else rid, "target": caid, "label": "proceeds"})

    incid = "incident"
    nodes.append({"id": incid, "label": "Incident", "group": "incident", "severity": "critical"})
    edges.append({"source": caid, "target": incid, "label": "leads_to"})

    return {"nodes": nodes, "edges": edges, "target": target}
