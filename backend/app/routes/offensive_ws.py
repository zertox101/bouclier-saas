"""
WebSocket endpoints for Offensive Security Consultant
- Real-time dashboard stats streaming
- Tool execution via tools-api (nmap/masscan) with simulation fallback
"""
import asyncio
import json
import os
import random
import uuid
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .offensive_consultant import ENGAGEMENTS, FINDINGS_DB, TOOLKIT

router = APIRouter(prefix="/api/offensive", tags=["Offensive WebSocket"])

TOOLS_API_URL = os.getenv("TOOLS_API_URL", "http://tools-api:8100")
TOOLS_API_KEY = os.getenv("TOOLS_API_SECRET", "BOUCLIER_ALPHA_SESSION_2026")

SCAN_PHASES = [
    {"phase": "DNS Resolution", "progress": 5},
    {"phase": "Host Discovery", "progress": 15},
    {"phase": "Port Scanning", "progress": 35},
    {"phase": "Service Detection", "progress": 55},
    {"phase": "OS Fingerprinting", "progress": 70},
    {"phase": "Script Scanning", "progress": 85},
    {"phase": "Output Processing", "progress": 95},
    {"phase": "Complete", "progress": 100},
]

MOCK_PORTS = [
    {"port": 22, "state": "open", "service": "SSH", "version": "OpenSSH 8.9p1"},
    {"port": 80, "state": "open", "service": "HTTP", "version": "nginx 1.24.0"},
    {"port": 443, "state": "open", "service": "HTTPS", "version": "nginx 1.24.0"},
    {"port": 3306, "state": "open", "service": "MySQL", "version": "8.0.35"},
    {"port": 8080, "state": "open", "service": "HTTP-Proxy", "version": "Apache Tomcat 9.0"},
    {"port": 8443, "state": "open", "service": "HTTPS-Alt", "version": "Apache Tomcat 9.0"},
    {"port": 21, "state": "filtered", "service": "FTP"},
    {"port": 25, "state": "filtered", "service": "SMTP"},
    {"port": 3389, "state": "closed", "service": "RDP"},
]


def get_dashboard_snapshot():
    sev_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in FINDINGS_DB:
        sev_dist[f["severity"]] = sev_dist.get(f["severity"], 0) + 1
    active = sum(1 for e in ENGAGEMENTS if e["status"] == "active")
    risk = sum({"critical": 10, "high": 7, "medium": 4, "low": 1}.get(f["severity"], 0) for f in FINDINGS_DB) / max(len(FINDINGS_DB), 1)
    return {
        "type": "stats",
        "timestamp": datetime.now().isoformat(),
        "engagements": {
            "total": len(ENGAGEMENTS), "active": active,
            "planning": sum(1 for e in ENGAGEMENTS if e["status"] == "planning"),
            "completed": sum(1 for e in ENGAGEMENTS if e["status"] == "completed"),
        },
        "findings": {
            "total": len(FINDINGS_DB),
            "open": sum(1 for f in FINDINGS_DB if f["status"] == "open"),
            "in_progress": sum(1 for f in FINDINGS_DB if f["status"] == "in_progress"),
            "verified": sum(1 for f in FINDINGS_DB if f["status"] == "verified"),
            "closed": sum(1 for f in FINDINGS_DB if f["status"] == "closed"),
            "by_severity": sev_dist,
        },
        "risk_score": round(risk, 1),
    }


def _get_scan_params(target: str, scan_type: str):
    """Return (tool_id, input_payload) for the given scan type."""
    if scan_type == "masscan":
        return "mass_scan", {"target": target, "ports": "1-1000", "rate": 10000}
    return "nmap_advanced", {"target": target, "ports": "22,80,443,3306,8080,8443"}


async def run_real_scan(target: str, scan_type: str, websocket: WebSocket):
    """Execute real nmap/masscan via tools-api, fallback to simulation."""
    import httpx

    tool_id, tool_input = _get_scan_params(target, scan_type)
    await websocket.send_json({
        "type": "scan_start", "target": target, "tool": scan_type,
        "timestamp": datetime.now().isoformat(),
    })

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{TOOLS_API_URL}/tools/run",
                headers={"X-Api-Key": TOOLS_API_KEY},
                json={"tool_id": tool_id, "input": tool_input},
            )
            if resp.status_code != 200:
                raise Exception(f"tools-api returned {resp.status_code}")
            job_data = resp.json()
            job_id = job_data["job_id"]

            # Poll for results
            all_logs_seen = set()
            all_logs = []
            for phase_info in SCAN_PHASES:
                await asyncio.sleep(random.uniform(0.3, 0.8))
                try:
                    job_resp = await client.get(f"{TOOLS_API_URL}/tools/jobs/{job_id}")
                    if job_resp.status_code == 200:
                        job_status = job_resp.json()
                        status = job_status.get("status", "running")
                        for log_entry in job_status.get("logs", []):
                            msg_text = log_entry.get("message", "")
                            if msg_text not in all_logs_seen:
                                all_logs_seen.add(msg_text)
                                all_logs.append(msg_text)
                                await websocket.send_json({
                                    "type": "scan_log", "target": target,
                                    "message": msg_text,
                                    "timestamp": datetime.now().isoformat(),
                                })
                        if status == "completed":
                            break
                except Exception:
                    pass

                await websocket.send_json({
                    "type": "scan_progress", "target": target,
                    "phase": phase_info["phase"], "progress": phase_info["progress"],
                    "timestamp": datetime.now().isoformat(),
                })

            # Final poll to ensure all logs collected
            try:
                await asyncio.sleep(0.5)
                job_resp = await client.get(f"{TOOLS_API_URL}/tools/jobs/{job_id}")
                if job_resp.status_code == 200:
                    for log_entry in job_resp.json().get("logs", []):
                        msg_text = log_entry.get("message", "")
                        if msg_text not in all_logs_seen:
                            all_logs_seen.add(msg_text)
                            all_logs.append(msg_text)
                            await websocket.send_json({
                                "type": "scan_log", "target": target,
                                "message": msg_text,
                                "timestamp": datetime.now().isoformat(),
                            })
            except Exception:
                pass

            # Parse port results from nmap/masscan logs
            import re as _re
            ports_found = []
            for line in all_logs:
                for single_line in line.split("\n"):
                    m = _re.search(r"^(\d+)/(tcp|udp)\s+(open|filtered|closed)\s+(\S+)", single_line.strip(), _re.IGNORECASE)
                    if m:
                        ports_found.append({
                            "port": int(m.group(1)),
                            "state": m.group(3).lower(),
                            "service": m.group(4),
                        })

            if ports_found:
                await websocket.send_json({
                    "type": "scan_result", "target": target,
                    "open_ports": len([p for p in ports_found if p["state"] == "open"]),
                    "filtered_ports": len([p for p in ports_found if p["state"] == "filtered"]),
                    "ports": ports_found,
                    "timestamp": datetime.now().isoformat(),
                })

            # Try to get final analysis
            try:
                analysis_resp = await client.get(f"{TOOLS_API_URL}/analysis/scan/{job_id}")
                if analysis_resp.status_code == 200:
                    analysis = analysis_resp.json()
                    await websocket.send_json({
                        "type": "scan_analysis", "target": target,
                        "analysis": analysis, "timestamp": datetime.now().isoformat(),
                    })
            except Exception:
                pass

            await websocket.send_json({
                "type": "scan_complete", "target": target,
                "job_id": job_id, "total_ports": len(ports_found),
                "duration_seconds": round(len(all_logs) * 0.5 + random.uniform(0, 5), 1),
                "timestamp": datetime.now().isoformat(),
            })

    except Exception as e:
        await websocket.send_json({
            "type": "scan_error", "target": target,
            "message": f"tools-api unavailable, using simulation: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        })
        await run_simulated_scan(target, scan_type, websocket)


MASSCAN_MOCK_PORTS = MOCK_PORTS + [
    {"port": 53, "state": "open", "service": "DNS", "version": "BIND 9.16"},
    {"port": 110, "state": "open", "service": "POP3", "version": "Dovecot 2.3"},
    {"port": 143, "state": "open", "service": "IMAP", "version": "Dovecot 2.3"},
    {"port": 445, "state": "open", "service": "SMB", "version": "Samba 4.15"},
    {"port": 993, "state": "open", "service": "IMAPS", "version": "Dovecot 2.3"},
    {"port": 995, "state": "open", "service": "POP3S", "version": "Dovecot 2.3"},
    {"port": 1433, "state": "open", "service": "MSSQL", "version": "SQL Server 2019"},
    {"port": 1521, "state": "open", "service": "OracleDB", "version": "19c"},
    {"port": 2375, "state": "open", "service": "Docker", "version": "20.10"},
    {"port": 2376, "state": "open", "service": "Docker-TLS", "version": "20.10"},
    {"port": 5432, "state": "open", "service": "PostgreSQL", "version": "14.0"},
    {"port": 6379, "state": "open", "service": "Redis", "version": "7.0"},
    {"port": 27017, "state": "open", "service": "MongoDB", "version": "6.0"},
]


async def run_simulated_scan(target: str, scan_type: str, websocket: WebSocket):
    """Simulated scan with mock results."""
    is_masscan = scan_type == "masscan"
    port_pool = MASSCAN_MOCK_PORTS if is_masscan else MOCK_PORTS
    ports_found = []
    for phase_info in SCAN_PHASES:
        await asyncio.sleep(random.uniform(0.3, 0.8))
        if phase_info["progress"] < 50:
            pool_size = min(len(port_pool), len(MOCK_PORTS) + 4 if is_masscan else len(MOCK_PORTS))
            new_ports = random.sample(port_pool, random.randint(0, min(3, pool_size)))
            for p in new_ports:
                if p not in ports_found:
                    ports_found.append(p)

        msg = {
            "type": "scan_progress", "target": target,
            "phase": phase_info["phase"], "progress": phase_info["progress"],
            "ports_found": len(ports_found),
            "timestamp": datetime.now().isoformat(),
        }
        await websocket.send_json(msg)

        if phase_info["progress"] >= 85:
            await websocket.send_json({
                "type": "scan_result", "target": target,
                "open_ports": len([p for p in ports_found if p["state"] == "open"]),
                "filtered_ports": len([p for p in ports_found if p["state"] == "filtered"]),
                "ports": ports_found,
                "timestamp": datetime.now().isoformat(),
            })

    await websocket.send_json({
        "type": "scan_complete", "target": target,
        "total_ports": len(ports_found),
        "duration_seconds": random.uniform(8, 25),
        "timestamp": datetime.now().isoformat(),
    })


async def run_mythos_analysis(target: str, scan_data: dict | None, websocket: WebSocket):
    """Run Mythos 5-phase Cyber Kill Chain analysis via tools-api."""
    import httpx
    import json as _json

    await websocket.send_json({
        "type": "mythos_start", "target": target,
        "timestamp": datetime.now().isoformat(),
    })

    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            resp = await client.post(
                f"{TOOLS_API_URL}/agent/analyze",
                headers={"X-Api-Key": TOOLS_API_KEY},
                json={"target": target, "mode": "mythos"},
            )
            if resp.status_code != 200:
                raise Exception(f"tools-api returned {resp.status_code}")

            job_data = resp.json()
            agent_job_id = job_data.get("agent_job_id")
            await websocket.send_json({
                "type": "mythos_log", "target": target,
                "message": f"Agent job {agent_job_id} launched",
                "timestamp": datetime.now().isoformat(),
            })

            # Poll for analysis results (up to 600s)
            seen_logs = set()
            for i in range(300):
                await asyncio.sleep(2)
                try:
                    poll = await client.get(f"{TOOLS_API_URL}/agent/jobs/{agent_job_id}")
                    if poll.status_code == 200:
                        job = poll.json()
                        for log_entry in job.get("logs", []):
                            log_msg = log_entry.get("message", "")
                            if log_msg and log_msg not in seen_logs:
                                seen_logs.add(log_msg)
                                await websocket.send_json({
                                    "type": "mythos_log", "target": target,
                                    "message": log_msg,
                                    "level": log_entry.get("level", "info"),
                                    "timestamp": datetime.now().isoformat(),
                                })

                        current_phase = job.get("current_phase", "?")
                        await websocket.send_json({
                            "type": "mythos_progress", "target": target,
                            "phase": current_phase,
                            "timestamp": datetime.now().isoformat(),
                        })

                        if job.get("status") == "completed":
                            findings = job.get("findings", {})
                            structured = findings.get("structured_findings", [])
                            raw = findings.get("raw_mythos_analysis", "")

                            # Send structured findings from deterministic data
                            for f in structured:
                                await websocket.send_json({
                                    "type": "mythos_finding", "target": target,
                                    "finding": f,
                                    "timestamp": datetime.now().isoformat(),
                                })

                            # Send LLM narrative as a final log
                            if raw and isinstance(raw, str) and raw.strip():
                                await websocket.send_json({
                                    "type": "mythos_log", "target": target,
                                    "message": f"[AI NARRATIVE] {raw[:500]}",
                                    "level": "info",
                                    "timestamp": datetime.now().isoformat(),
                                })

                            await websocket.send_json({
                                "type": "mythos_complete", "target": target,
                                "total_findings": len(structured),
                                "timestamp": datetime.now().isoformat(),
                            })
                            return
                except Exception:
                    await asyncio.sleep(1)

            await websocket.send_json({
                "type": "mythos_error", "target": target,
                "message": "Analysis timed out after 180s",
                "timestamp": datetime.now().isoformat(),
            })

    except Exception as e:
        await websocket.send_json({
            "type": "mythos_error", "target": target,
            "message": f"tools-api unavailable: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        })


async def run_wstg_scan(target_url: str, options: dict, websocket: WebSocket):
    """Execute OWASP WSTG-Scan via tools-api with real-time streaming."""
    import httpx

    await websocket.send_json({
        "type": "wstg_start", "target": target_url,
        "message": f"OWASP WSTG Scan initiated against {target_url}",
        "timestamp": datetime.now().isoformat(),
    })

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{TOOLS_API_URL}/tools/run",
                headers={"X-Api-Key": TOOLS_API_KEY},
                json={"tool_id": "wstg_scan", "input": {"url": target_url, **options}},
            )
            if resp.status_code != 200:
                raise Exception(f"tools-api returned {resp.status_code}")
            job_data = resp.json()
            job_id = job_data["job_id"]

            await websocket.send_json({
                "type": "wstg_log", "target": target_url,
                "message": f"Scan job {job_id} launched",
                "timestamp": datetime.now().isoformat(),
            })

            # Poll for results
            seen_logs = set()
            for i in range(120):
                await asyncio.sleep(3)
                try:
                    poll = await client.get(
                        f"{TOOLS_API_URL}/tools/jobs/{job_id}",
                        headers={"X-Api-Key": TOOLS_API_KEY},
                    )
                    if poll.status_code == 200:
                        job = poll.json()
                        for log in job.get("logs", []):
                            msg = log.get("message", "")
                            lvl = log.get("level", "info")
                            if msg and msg not in seen_logs:
                                seen_logs.add(msg)
                                await websocket.send_json({
                                    "type": "wstg_log", "target": target_url,
                                    "message": msg, "level": lvl,
                                    "timestamp": datetime.now().isoformat(),
                                })

                        status = job.get("status", "running")
                        pct = job.get("progress", i * 2)
                        await websocket.send_json({
                            "type": "wstg_progress", "target": target_url,
                            "progress": min(pct, 100), "status": status,
                            "timestamp": datetime.now().isoformat(),
                        })

                        if status in ("completed", "finished", "done"):
                            await websocket.send_json({
                                "type": "wstg_complete", "target": target_url,
                                "job_id": job_id, "status": status,
                                "timestamp": datetime.now().isoformat(),
                            })
                            return
                        if status == "failed":
                            raise Exception(job.get("error", "WSTG scan failed"))
                except httpx.TimeoutException:
                    await websocket.send_json({
                        "type": "wstg_log", "target": target_url,
                        "message": "Polling timeout — retrying...",
                        "level": "warn",
                        "timestamp": datetime.now().isoformat(),
                    })

            await websocket.send_json({
                "type": "wstg_error", "target": target_url,
                "message": "Scan timed out after 6 minutes",
                "timestamp": datetime.now().isoformat(),
            })

    except Exception as e:
        await websocket.send_json({
            "type": "wstg_error", "target": target_url,
            "message": f"WSTG scan error: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        })


async def run_raptor_scan(target: str, mode: str, websocket: WebSocket):
    """Execute RAPTOR autonomous security research via tools-api."""
    import httpx

    await websocket.send_json({
        "type": "raptor_start", "target": target, "mode": mode,
        "message": f"RAPTOR autonomous security research initiated against {target}",
        "timestamp": datetime.now().isoformat(),
    })

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{TOOLS_API_URL}/tools/run",
                headers={"X-Api-Key": TOOLS_API_KEY},
                json={"tool_id": "raptor_scan", "input": {"target": target, "mode": mode}},
            )
            if resp.status_code != 200:
                raise Exception(f"tools-api returned {resp.status_code}")
            job_data = resp.json()
            job_id = job_data["job_id"]

            await websocket.send_json({
                "type": "raptor_log", "target": target,
                "message": f"RAPTOR job {job_id} launched",
                "timestamp": datetime.now().isoformat(),
            })

            seen_logs = set()
            for i in range(120):
                await asyncio.sleep(3)
                try:
                    poll = await client.get(
                        f"{TOOLS_API_URL}/tools/jobs/{job_id}",
                        headers={"X-Api-Key": TOOLS_API_KEY},
                    )
                    if poll.status_code == 200:
                        job = poll.json()
                        for log in job.get("logs", []):
                            msg = log.get("message", "")
                            lvl = log.get("level", "info")
                            if msg and msg not in seen_logs:
                                seen_logs.add(msg)
                                await websocket.send_json({
                                    "type": "raptor_log", "target": target,
                                    "message": msg, "level": lvl,
                                    "timestamp": datetime.now().isoformat(),
                                })

                        status = job.get("status", "running")
                        pct = job.get("progress", min(i * 2, 95))
                        await websocket.send_json({
                            "type": "raptor_progress", "target": target,
                            "progress": pct, "status": status,
                            "timestamp": datetime.now().isoformat(),
                        })

                        if status in ("completed", "finished", "done"):
                            await websocket.send_json({
                                "type": "raptor_complete", "target": target,
                                "job_id": job_id, "status": status,
                                "timestamp": datetime.now().isoformat(),
                            })
                            return
                        if status == "failed":
                            raise Exception(job.get("error", "RAPTOR scan failed"))
                except httpx.TimeoutException:
                    await websocket.send_json({
                        "type": "raptor_log", "target": target,
                        "message": "Polling timeout — retrying...",
                        "level": "warn",
                        "timestamp": datetime.now().isoformat(),
                    })

            await websocket.send_json({
                "type": "raptor_error", "target": target,
                "message": "RAPTOR scan timed out after 6 minutes",
                "timestamp": datetime.now().isoformat(),
            })

    except Exception as e:
        await websocket.send_json({
            "type": "raptor_error", "target": target,
            "message": f"RAPTOR scan error: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        })


@router.websocket("/ws")
async def offensive_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data_raw = await asyncio.wait_for(websocket.receive_text(), timeout=30)
            msg = json.loads(data_raw)
            action = msg.get("action", "")

            if action == "stats":
                await websocket.send_json(get_dashboard_snapshot())

            elif action == "subscribe":
                while True:
                    await websocket.send_json(get_dashboard_snapshot())
                    await asyncio.sleep(5)

            elif action == "scan":
                target = msg.get("target", "127.0.0.1")
                scan_type = msg.get("scan_type", "nmap")
                await run_real_scan(target, scan_type, websocket)

            elif action == "mythos_analyze":
                target = msg.get("target", "127.0.0.1")
                scan_data = msg.get("scan_data")
                await run_mythos_analysis(target, scan_data, websocket)

            elif action == "wstg_scan":
                target_url = msg.get("target", msg.get("url", ""))
                options = {k: v for k, v in msg.items() if k in ("threads", "timeout", "delay", "insecure")}
                await run_wstg_scan(target_url, options, websocket)

            elif action == "raptor_scan":
                target = msg.get("target", "")
                mode = msg.get("mode", "scan")
                await run_raptor_scan(target, mode, websocket)

            elif action == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})

    except (asyncio.TimeoutError, WebSocketDisconnect):
        pass
    except Exception:
        pass
