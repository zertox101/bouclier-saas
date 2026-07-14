"""
Autonomous Planner Agent — observe() → plan() → act() → verify() → report()
Decides which Kali tools to run based on previous results, runs them, and reports.
"""
import os
import json
import time
import uuid
import subprocess
import threading
from typing import Dict, List, Any, Optional

JOBS: Dict[str, Dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()

TOOLS = {
    "nmap": {"cmd": ["nmap", "-sV", "-T4", "--top-ports", "100", "TARGET"], "timeout": 120, "phase": "recon"},
    "nikto": {"cmd": ["nikto", "-h", "TARGET", "-maxtime", "30s"], "timeout": 60, "phase": "vuln"},
    "searchsploit": {"cmd": ["searchsploit", "TARGET", "--json"], "timeout": 30, "phase": "exploit"},
    "nuclei_scan": {"cmd": ["nuclei", "-u", "URL", "-silent", "-severity", "critical,high", "-rl", "30", "-t", "cves/", "-t", "misconfiguration/"], "timeout": 90, "phase": "vuln"},
    "wpscan": {"cmd": ["wpscan", "--url", "TARGET", "--no-banner", "--format", "json"], "timeout": 60, "phase": "vuln"},
}


def _run(cmd: List[str], timeout: int = 30) -> str:
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return proc.stdout + proc.stderr
    except subprocess.TimeoutExpired:
        return f"[TIMEOUT] {timeout}s"
    except Exception as e:
        return f"[ERROR] {e}"


def _log(job: Dict, phase: str, level: str, msg: str):
    job["logs"].append({"timestamp": time.time(), "phase": phase, "level": level, "message": msg})


def _worker(job_id: str, target: str):
    with JOBS_LOCK:
        job = JOBS[job_id]

    _log(job, "INIT", "info", f"[PLANNER] Autonomous agent initialized for {target}")
    _log(job, "INIT", "info", "[PLANNER] Observe → Plan → Act → Verify → Report")
    time.sleep(0.5)

    # Phase 1: OBSERVE — gather target info
    job["current_phase"] = "OBSERVE"
    _log(job, "OBSERVE", "info", "[OBSERVE] Gathering target intelligence...")
    ping_out = _run(["ping", "-c", "1", "-W", "3", target], timeout=5)
    if "1 received" in ping_out or "ttl=" in ping_out.lower():
        _log(job, "OBSERVE", "success", f"[OBSERVE] Target {target} is reachable")
    else:
        _log(job, "OBSERVE", "warning", f"[OBSERVE] Target {target} may be unreachable, continuing anyway")
    time.sleep(0.3)

    # Phase 2: PLAN — decide which tools to run
    job["current_phase"] = "PLAN"
    _log(job, "PLAN", "info", "[PLAN] Analyzing target profile and selecting toolchain...")

    plan = [
        {"tool": "nmap", "reason": "Port discovery and service fingerprinting"},
    ]

    # Check if it looks like a web target
    if ":" in target or not target.replace(".", "").isdigit():
        plan.append({"tool": "nikto", "reason": "Web vulnerability scanning"})
        plan.append({"tool": "nuclei_scan", "reason": "CVE template scanning"})

    plan.append({"tool": "searchsploit", "reason": "Exploit database matching"})
    job["plan"] = plan
    _log(job, "PLAN", "success", f"[PLAN] Toolchain selected: {[p['tool'] for p in plan]}")
    time.sleep(0.3)

    # Phase 3: ACT — execute each tool
    job["current_phase"] = "ACT"
    findings: Dict[str, Any] = {"open_ports": [], "vulnerabilities": [], "exploits": []}

    for step in plan:
        tool = step["tool"]
        tool_cfg = TOOLS.get(tool)
        if not tool_cfg:
            _log(job, "ACT", "warning", f"[ACT] Unknown tool: {tool}, skipping")
            continue

        _log(job, "ACT", "info", f"[ACT] Running {tool} — {step['reason']}")

        # Strip protocol for TARGET (hostname:port), keep/add for URL
        raw_target = target.replace("http://", "").replace("https://", "")
        src_addr = raw_target.split(":")[0]  # hostname without port

        cmd = []
        for x in tool_cfg["cmd"]:
            if x == "TARGET":
                cmd.append(raw_target)
            elif x == "URL":
                url_target = f"http://{raw_target}" if not target.startswith("http") else target
                cmd.append(url_target)
            elif x == "SRC_ADDR":
                cmd.append(src_addr)
            elif x == "PORT":
                cmd.append(raw_target.split(":")[1] if ":" in raw_target else "80")
            else:
                cmd.append(x)

        # nmap doesn't accept host:port; build custom cmd
        if tool == "nmap":
            host_part = raw_target
            port_part = None
            if ":" in raw_target:
                parts = raw_target.rsplit(":", 1)
                if parts[1].isdigit():
                    host_part = parts[0]
                    port_part = parts[1]
            if port_part:
                cmd = ["nmap", "-sV", "-T4", "-p", port_part, host_part]
            else:
                cmd = ["nmap", "-sV", "-T4", "--top-ports", "100", host_part]

        # searchsploit: search for technology keywords instead of raw target
        if tool == "searchsploit":
            search_terms = set()
            prev_vulns = findings.get("vulnerabilities", [])
            for nikto_line in prev_vulns:
                for kw in ["Apache", "PHP", "Debian", "nginx", "IIS", "tomcat"]:
                    if kw.lower() in nikto_line.lower():
                        search_terms.add(kw.lower())
            candidates = list(search_terms) if search_terms else ["apache", "php", "webapp", "linux"]
            candidates.sort(key=lambda x: (len(x), x))
            search_query = candidates[0]
            _log(job, "ACT", "info", f"[searchsploit] Searching for: {search_query}")
            cmd = ["searchsploit", search_query, "--json"]
            tool_cfg["timeout"] = 60  # extend timeout for searchsploit

        out = _run(cmd, tool_cfg["timeout"])

        lines = out.splitlines()
        for line in lines:
            if line.strip():
                _log(job, "ACT", "info" if "error" not in line.lower() else "warning", f"  [{tool}] {line.strip()[:200]}")

        if tool == "nmap":
            for line in lines:
                if "/tcp" in line and "open" in line:
                    findings["open_ports"].append(line.strip())
        elif tool == "nikto":
            # capture lines with [OSVDB_CODE] finding patterns
            import re as _re
            for line in lines:
                if _re.search(r'\+ \[\d+\]', line):
                    findings["vulnerabilities"].append(line.strip())
                elif "CVE-" in line:
                    findings["vulnerabilities"].append(line.strip())
        elif tool == "searchsploit":
            try:
                j = json.loads(out)
                for entry in j.get("RESULTS_EXPLOIT", [])[:5]:
                    findings["exploits"].append(entry.get("Title", ""))
            except json.JSONDecodeError:
                for line in lines:
                    if "exploit" in line.lower() or "CVE" in line:
                        findings["exploits"].append(line.strip())

        time.sleep(0.5)

    job["findings"] = findings

    # Phase 4: VERIFY — check results quality
    job["current_phase"] = "VERIFY"
    vuln_count = len(findings.get("vulnerabilities", []))
    port_count = len(findings.get("open_ports", []))
    exploit_count = len(findings.get("exploits", []))

    _log(job, "VERIFY", "info", f"[VERIFY] Scan complete: {port_count} ports, {vuln_count} vulns, {exploit_count} exploits")
    if vuln_count > 0 or port_count > 0:
        _log(job, "VERIFY", "success", "[VERIFY] Valid findings detected — assessment reliable")
    else:
        _log(job, "VERIFY", "warning", "[VERIFY] No significant findings — target may be well-hardened")
    time.sleep(0.3)

    # Phase 5: REPORT — generate summary
    job["current_phase"] = "REPORT"
    _log(job, "REPORT", "info", "[REPORT] Generating autonomous assessment report...")

    risk = "LOW"
    if vuln_count > 5 or ("critical" in str(findings).lower()):
        risk = "CRITICAL"
    elif vuln_count > 2 or port_count > 5:
        risk = "HIGH"
    elif vuln_count > 0 or port_count > 0:
        risk = "MEDIUM"

    job["risk"] = risk
    job["status"] = "completed"

    _log(job, "REPORT", "error" if risk == "CRITICAL" else ("warning" if risk == "HIGH" else "success"),
         f"[REPORT] Autonomous assessment complete. Risk: {risk}")
    _log(job, "REPORT", "success", f"[REPORT] Target: {target} | Ports: {port_count} | Vulns: {vuln_count} | Exploits: {exploit_count}")

    with JOBS_LOCK:
        job["completed_at"] = time.time()


def start_agent(target: str, mode: str = "standard") -> str:
    job_id = f"planner_{uuid.uuid4().hex[:12]}"
    with JOBS_LOCK:
        JOBS[job_id] = {
            "job_id": job_id, "target": target, "mode": mode,
            "status": "running", "current_phase": "INIT",
            "logs": [], "findings": {}, "plan": [],
            "risk": None, "is_real": True,
            "created_at": time.time(), "completed_at": None,
        }
    thread = threading.Thread(target=_worker, args=(job_id, target), daemon=True)
    thread.start()
    return job_id


def get_job(job_id: str) -> Optional[Dict]:
    with JOBS_LOCK:
        return JOBS.get(job_id)


def list_jobs() -> List[Dict]:
    with JOBS_LOCK:
        return [{"job_id": jid, "target": j["target"], "status": j["status"],
                 "risk": j["risk"], "created_at": j["created_at"]}
                for jid, j in JOBS.items()]
