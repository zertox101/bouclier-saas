"""
Offensive Security Consultant (Ethical Hacker) Service
Production-ready Red Team / Purple Team / Bug Bounty / RE / Forensics / Malware Analysis
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import json, os, random, subprocess, uuid
from collections import defaultdict

router = APIRouter(prefix="/api/offensive", tags=["Offensive Consultant"])

# ── Engagement Models ──────────────────────────────────────────────────────────
ENGAGEMENT_TYPES = {
    "red-team": {
        "name": "Red Team Engagement",
        "description": "Full-scope adversarial simulation emulating real-world threat actors",
        "phases": ["Reconnaissance", "Weaponization", "Delivery", "Exploitation", "Installation", "C2", "Actions on Objectives"],
        "methodologies": ["MITRE ATT&CK", "PTES", "Intelligence-Driven"]
    },
    "purple-team": {
        "name": "Purple Team Exercise",
        "description": "Collaborative red vs blue team exercise to improve detection and response",
        "phases": ["Planning", "Attack Simulation", "Detection Validation", "Response Tuning", "Lessons Learned"],
        "methodologies": ["MITRE ATT&CK", "Sightings Framework"]
    },
    "bug-bounty": {
        "name": "Bug Bounty Program",
        "description": "Crowdsourced vulnerability discovery with responsible disclosure",
        "phases": ["Scope Definition", "Target Testing", "Vulnerability Triage", "Validation", "Disclosure"],
        "methodologies": ["OWASP Top 10", "Bugcrowd VRT"]
    },
    "re-engineering": {
        "name": "Reverse Engineering",
        "description": "Binary analysis, malware reverse engineering, and firmware analysis",
        "phases": ["Static Analysis", "Dynamic Analysis", "Debugging", "Decompilation", "Report"],
        "methodologies": ["IDA Pro", "Ghidra", "x64dbg"]
    },
    "forensics": {
        "name": "Digital Forensics & Incident Response",
        "description": "Post-incident forensic analysis, evidence collection, and timeline reconstruction",
        "phases": ["Collection", "Examination", "Analysis", "Reporting", "Presentation"],
        "methodologies": ["NIST SP 800-86", "SANS Forensic"]
    },
    "malware-analysis": {
        "name": "Malware Analysis & Intelligence",
        "description": "In-depth malware dissection, IoC extraction, and threat intelligence feed",
        "phases": ["Static Properties", "Code Analysis", "Behavioral", "Network Signatures", "Detection Rules"],
        "methodologies": ["YARA", "Sigma", "CAPA"]
    },
    "exploit-dev": {
        "name": "Exploit Development",
        "description": "Proof-of-concept exploit development for verified vulnerabilities",
        "phases": ["Vulnerability Research", "Fuzzing", "Crash Analysis", "Exploit Writing", "Weaponization"],
        "methodologies": ["CVSS", "CWE", "Exploit-DB"]
    }
}

# ── In-memory store for engagements, findings, tools ──────────────────────────
ENGAGEMENTS = []
FINDINGS_DB = []
TOOLKIT = [
    {"id": "TOOL-001", "name": "Nmap", "category": "recon", "description": "Network discovery and port scanning", "status": "ready"},
    {"id": "TOOL-002", "name": "Masscan", "category": "recon", "description": "High-speed port scanning", "status": "ready"},
    {"id": "TOOL-003", "name": "Gobuster", "category": "web", "description": "Directory/file brute-forcing", "status": "ready"},
    {"id": "TOOL-004", "name": "Nikto", "category": "web", "description": "Web server vulnerability scanner", "status": "ready"},
    {"id": "TOOL-005", "name": "SQLMap", "category": "exploit", "description": "SQL injection automation", "status": "ready"},
    {"id": "TOOL-006", "name": "Metasploit", "category": "exploit", "description": "Exploitation framework", "status": "ready"},
    {"id": "TOOL-007", "name": "Burp Suite", "category": "web", "description": "Web application security testing", "status": "ready"},
    {"id": "TOOL-008", "name": "Wireshark", "category": "network", "description": "Network traffic analysis", "status": "ready"},
    {"id": "TOOL-009", "name": "Ghidra", "category": "re", "description": "Reverse engineering framework", "status": "ready"},
    {"id": "TOOL-010", "name": "IDA Free", "category": "re", "description": "Interactive disassembler", "status": "ready"},
    {"id": "TOOL-011", "name": "Volatility", "category": "forensics", "description": "Memory forensics", "status": "ready"},
    {"id": "TOOL-012", "name": "YARA", "category": "malware", "description": "Malware pattern matching", "status": "ready"},
    {"id": "TOOL-013", "name": "Capa", "category": "malware", "description": "Malware capability analysis", "status": "ready"},
    {"id": "TOOL-014", "name": "Sigma", "category": "detection", "description": "Generic SIEM rule format", "status": "ready"},
    {"id": "TOOL-015", "name": "Hydra", "category": "exploit", "description": "Password brute-forcing", "status": "ready"},
    {"id": "TOOL-016", "name": "John the Ripper", "category": "exploit", "description": "Password cracking", "status": "ready"},
    {"id": "TOOL-017", "name": "Impacket", "category": "exploit", "description": "Windows protocol tools", "status": "ready"},
    {"id": "TOOL-018", "name": "BloodHound", "category": "ad", "description": "Active Directory attack path mapping", "status": "ready"},
    {"id": "TOOL-019", "name": "CrackMapExec", "category": "ad", "description": "AD post-exploitation", "status": "ready"},
    {"id": "TOOL-020", "name": "Responder", "category": "ad", "description": "LLMNR/NBT-NS poisoning", "status": "ready"},
]

for i in range(5):
    etype = random.choice(list(ENGAGEMENT_TYPES.keys()))
    ENGAGEMENTS.append({
        "id": f"ENG-{i+1:04d}",
        "type": etype,
        "title": f"{ENGAGEMENT_TYPES[etype]['name']} - {random.choice(['ACME Corp', 'Shield Internal', 'Client Alpha', 'Beta Infrastructure', 'Gamma Cloud'])}",
        "status": random.choice(["active", "active", "planning", "completed", "review"]),
        "target": random.choice(["10.0.0.0/24", "app.bouclier.saas", "api.client.com", "192.168.1.0/24", "cloud.example.org"]),
        "lead": "Senior Offensive Consultant",
        "start_date": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
        "completion": (datetime.now() + timedelta(days=random.randint(1, 60))).isoformat() if random.random() > 0.3 else None,
        "findings_count": random.randint(3, 25),
        "risk_score": random.randint(20, 95),
        "created_at": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat()
    })

VULN_TEMPLATES = [
    {"title": "SQL Injection in Authentication", "severity": "critical", "cwe": "CWE-89", "cvss": 9.8,
     "description": "Blind SQL injection in login form allows authentication bypass and data extraction.",
     "remediation": "Use parameterized queries. Implement WAF rules. Apply input validation."},
    {"title": "Remote Code Execution via File Upload", "severity": "critical", "cwe": "CWE-434", "cvss": 9.1,
     "description": "Unrestricted file upload allows PHP/ASP code execution on the web server.",
     "remediation": "Validate file types by content (not extension). Store uploads outside webroot."},
    {"title": "Stored Cross-Site Scripting (XSS)", "severity": "high", "cwe": "CWE-79", "cvss": 7.5,
     "description": "User input in comments/profile fields not sanitized, allowing stored XSS.",
     "remediation": "Implement CSP. Sanitize all user input. Use output encoding."},
    {"title": "Insecure Direct Object Reference (IDOR)", "severity": "high", "cwe": "CWE-639", "cvss": 7.2,
     "description": "API endpoints expose internal IDs without proper authorization checks.",
     "remediation": "Implement UUID-based identifiers. Enforce server-side authorization."},
    {"title": "Missing Security Headers", "severity": "medium", "cwe": "CWE-693", "cvss": 5.3,
     "description": "HTTP responses missing X-Frame-Options, CSP, HSTS, X-Content-Type-Options.",
     "remediation": "Add all security headers via web server configuration or middleware."},
    {"title": "Weak Password Policy", "severity": "medium", "cwe": "CWE-521", "cvss": 4.3,
     "description": "Minimum 6-character passwords allowed without complexity requirements.",
     "remediation": "Enforce 12+ char passwords, breach checking, and MFA."},
    {"title": "Sensitive Data Exposure in Logs", "severity": "high", "cwe": "CWE-532", "cvss": 6.5,
     "description": "Database credentials and session tokens logged in plaintext.",
     "remediation": "Implement structured logging with data masking. Remove sensitive fields from logs."},
    {"title": "Server-Side Request Forgery (SSRF)", "severity": "critical", "cwe": "CWE-918", "cvss": 8.8,
     "description": "URL fetch functionality allows internal network scanning and cloud metadata access.",
     "remediation": "Implement allowlist for outbound URLs. Block private IP ranges."},
    {"title": "Privilege Escalation via Sudo Misconfig", "severity": "high", "cwe": "CWE-269", "cvss": 7.8,
     "description": "Service account has sudo access to commands allowing root privilege escalation.",
     "remediation": "Audit sudoers file. Apply principle of least privilege."},
    {"title": "Open S3 Bucket", "severity": "critical", "cwe": "CWE-200", "cvss": 9.2,
     "description": "AWS S3 bucket publicly accessible containing customer PII and secrets.",
     "remediation": "Block public access at account level. Enable S3 Block Public Access."},
    {"title": "DNS Zone Transfer Enabled", "severity": "medium", "cwe": "CWE-200", "cvss": 5.0,
     "description": "DNS server allows zone transfer to unauthorized hosts, exposing full network map.",
     "remediation": "Restrict zone transfers to authorized secondary DNS servers only."},
    {"title": "Default Credentials on Admin Panel", "severity": "critical", "cwe": "CWE-798", "cvss": 9.0,
     "description": "Admin panel accessible with vendor default credentials (admin/admin).",
     "remediation": "Force password change on first login. Implement credential rotation policy."}
]

for i in range(30):
    v = random.choice(VULN_TEMPLATES)
    FINDINGS_DB.append({
        "id": f"VULN-{i+1:04d}",
        "engagement_id": random.choice(ENGAGEMENTS)["id"] if ENGAGEMENTS else "ENG-0001",
        **v,
        "confidence": random.randint(75, 100),
        "affected_asset": random.choice(["app.bouclier.saas", "api.bouclier.saas", "192.168.1.0/24", "cloud.bouclier.saas"]),
        "status": random.choice(["open", "open", "in_progress", "verified", "closed"]),
        "discovered_at": (datetime.now() - timedelta(days=random.randint(0, 60))).isoformat(),
        "poc": f"curl -X POST 'https://target.com/login' -d 'username=admin\\' OR \\'1\\'=\\'1&password=test'",
        "remediation_effort": random.choice(["Low", "Medium", "High"]),
        "remediation_deadline": (datetime.now() + timedelta(days=random.randint(7, 90))).isoformat()
    })

class EngagementRequest(BaseModel):
    type: str
    title: str
    target: str
    lead: Optional[str] = "Senior Offensive Consultant"

class FindingsExport(BaseModel):
    engagement_id: str
    format: str = "json"

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/status")
def consultant_status():
    """Offensive Consultant service health and capabilities"""
    return {
        "service": "Offensive Security Consultant",
        "role": "Senior Ethical Hacker / Red Team Lead",
        "status": "operational",
        "capabilities": list(ENGAGEMENT_TYPES.keys()),
        "engagement_types": ENGAGEMENT_TYPES,
        "tools_count": len(TOOLKIT),
        "active_engagements": sum(1 for e in ENGAGEMENTS if e["status"] == "active"),
        "total_findings": len(FINDINGS_DB),
        "version": "2.0-production"
    }

@router.get("/engagement-types")
def list_engagement_types():
    return {"types": ENGAGEMENT_TYPES}

@router.get("/engagements")
def list_engagements(type: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    results = ENGAGEMENTS
    if type: results = [e for e in results if e["type"] == type]
    if status: results = [e for e in results if e["status"] == status]
    return {"engagements": sorted(results, key=lambda x: x["created_at"], reverse=True), "total": len(results)}

@router.get("/engagements/{engagement_id}")
def get_engagement(engagement_id: str):
    eng = next((e for e in ENGAGEMENTS if e["id"] == engagement_id), None)
    if not eng: raise HTTPException(404, "Engagement not found")
    eng_findings = [f for f in FINDINGS_DB if f["engagement_id"] == engagement_id]
    return {"engagement": eng, "findings": eng_findings, "findings_count": len(eng_findings)}

@router.post("/engagements")
def create_engagement(req: EngagementRequest):
    if req.type not in ENGAGEMENT_TYPES:
        raise HTTPException(400, f"Invalid type. Options: {', '.join(ENGAGEMENT_TYPES.keys())}")
    eng = {
        "id": f"ENG-{len(ENGAGEMENTS)+1:04d}",
        "type": req.type,
        "title": req.title,
        "target": req.target,
        "lead": req.lead,
        "status": "planning",
        "start_date": datetime.now().isoformat(),
        "completion": None,
        "findings_count": 0,
        "risk_score": 0,
        "created_at": datetime.now().isoformat()
    }
    ENGAGEMENTS.append(eng)
    return {"status": "created", "engagement": eng}

@router.get("/findings")
def list_findings(severity: Optional[str] = Query(None), engagement_id: Optional[str] = Query(None)):
    results = FINDINGS_DB
    if severity: results = [f for f in results if f["severity"] == severity]
    if engagement_id: results = [f for f in results if f["engagement_id"] == engagement_id]
    risk = sum({"critical": 10, "high": 7, "medium": 4, "low": 1}.get(f["severity"], 0) for f in results) / max(len(results), 1)
    return {
        "findings": sorted(results, key=lambda x: x["discovered_at"], reverse=True),
        "total": len(results),
        "risk_score": round(risk, 1),
        "by_severity": {s: sum(1 for f in results if f["severity"] == s) for s in ["critical", "high", "medium", "low"]}
    }

@router.post("/findings/{finding_id}/status")
def update_finding_status(finding_id: str, status: str = Query(...)):
    finding = next((f for f in FINDINGS_DB if f["id"] == finding_id), None)
    if not finding: raise HTTPException(404, "Finding not found")
    if status not in ["open", "in_progress", "verified", "closed"]:
        raise HTTPException(400, "Invalid status")
    finding["status"] = status
    return {"status": "updated", "finding": finding}

@router.post("/engagements/{engagement_id}/export")
def export_findings(engagement_id: str):
    eng = next((e for e in ENGAGEMENTS if e["id"] == engagement_id), None)
    if not eng: raise HTTPException(404, "Engagement not found")
    eng_findings = [f for f in FINDINGS_DB if f["engagement_id"] == engagement_id]

    stats = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in eng_findings: stats[f["severity"]] = stats.get(f["severity"], 0) + 1
    total = len(eng_findings)
    risk = round((stats.get("critical",0)*10 + stats.get("high",0)*7 + stats.get("medium",0)*4 + stats.get("low",0)*1) / max(total, 1), 1)

    report = {
        "report_metadata": {
            "title": f"Offensive Security Assessment - {eng['title']}",
            "engagement_id": engagement_id,
            "type": eng["type"],
            "target": eng["target"],
            "lead": eng["lead"],
            "period": f"{eng['start_date']} to {eng.get('completion', 'ongoing')}",
            "generated_at": datetime.utcnow().isoformat(),
            "classification": "CONFIDENTIAL"
        },
        "executive_summary": {
            "total_findings": total,
            "risk_score": risk,
            "risk_rating": "Critical" if risk >= 8 else "High" if risk >= 6 else "Medium" if risk >= 3 else "Low",
            "by_severity": stats
        },
        "findings": [
            {
                "id": f["id"],
                "title": f["title"],
                "severity": f["severity"],
                "cwe": f["cwe"],
                "cvss": f["cvss"],
                "description": f["description"],
                "affected_asset": f["affected_asset"],
                "remediation": f["remediation"],
                "remediation_effort": f["remediation_effort"],
                "status": f["status"],
                "poc": f["poc"]
            }
            for f in eng_findings
        ]
    }
    return report

@router.get("/tools")
def list_tools(category: Optional[str] = Query(None)):
    results = TOOLKIT
    if category: results = [t for t in results if t["category"] == category]
    return {"tools": results, "total": len(results), "categories": list(set(t["category"] for t in TOOLKIT))}

@router.get("/dashboard")
def consultant_dashboard():
    active = sum(1 for e in ENGAGEMENTS if e["status"] == "active")
    planning = sum(1 for e in ENGAGEMENTS if e["status"] == "planning")
    completed = sum(1 for e in ENGAGEMENTS if e["status"] == "completed")

    sev_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in FINDINGS_DB: sev_dist[f["severity"]] = sev_dist.get(f["severity"], 0) + 1

    open_findings = sum(1 for f in FINDINGS_DB if f["status"] == "open")
    in_progress = sum(1 for f in FINDINGS_DB if f["status"] == "in_progress")
    verified = sum(1 for f in FINDINGS_DB if f["status"] == "verified")
    closed = sum(1 for f in FINDINGS_DB if f["status"] == "closed")

    risk = sum({"critical": 10, "high": 7, "medium": 4, "low": 1}.get(f["severity"], 0) for f in FINDINGS_DB) / max(len(FINDINGS_DB), 1)

    eng_by_type = defaultdict(int)
    for e in ENGAGEMENTS: eng_by_type[e["type"]] += 1

    return {
        "engagements": {"total": len(ENGAGEMENTS), "active": active, "planning": planning, "completed": completed, "by_type": dict(eng_by_type)},
        "findings": {"total": len(FINDINGS_DB), "open": open_findings, "in_progress": in_progress, "verified": verified, "closed": closed, "by_severity": sev_dist},
        "risk_score": round(risk, 1),
        "risk_rating": "Critical" if risk >= 8 else "High" if risk >= 6 else "Medium" if risk >= 3 else "Low",
        "tool_count": len(TOOLKIT),
        "last_updated": datetime.now().isoformat()
    }

@router.get("/report/html/{engagement_id}")
def generate_html_report(engagement_id: str):
    eng = next((e for e in ENGAGEMENTS if e["id"] == engagement_id), None)
    if not eng: raise HTTPException(404, "Engagement not found")
    eng_findings = [f for f in FINDINGS_DB if f["engagement_id"] == engagement_id]
    et = ENGAGEMENT_TYPES.get(eng["type"], {})

    stats = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in eng_findings: stats[f["severity"]] = stats.get(f["severity"], 0) + 1
    total = len(eng_findings)
    risk = round((stats.get("critical",0)*10 + stats.get("high",0)*7 + stats.get("medium",0)*4 + stats.get("low",0)*1) / max(total, 1), 1)
    risk_label = "Critical" if risk >= 8 else "High" if risk >= 6 else "Medium" if risk >= 3 else "Low"
    risk_color = {"Critical": "#dc2626", "High": "#ea580c", "Medium": "#ca8a04", "Low": "#2563eb"}.get(risk_label, "#6b7280")

    findings_rows = ""
    for f in sorted(eng_findings, key=lambda x: {"critical":0,"high":1,"medium":2,"low":3}.get(x["severity"],4)):
        sev_l = f["severity"]
        findings_rows += f"""
        <div class="finding">
            <div class="finding-header {sev_l}">
                <span class="finding-title">{f['title']}</span>
                <span class="sev-badge {sev_l}">{f['severity'].upper()}</span>
            </div>
            <div class="finding-body">
                <div class="finding-meta">CWE-{f['cwe']} | CVSS: {f.get('cvss','N/A')}</div>
                <p><strong>Description:</strong> {f['description']}</p>
                <p><strong>Affected:</strong> {f['affected_asset']}</p>
                <div class="ev-box">$ {f.get('poc','N/A')}</div>
                <p><strong>Remediation:</strong> {f['remediation']} <em>(Effort: {f['remediation_effort']})</em></p>
            </div>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>Offensive Security Report - {eng['title']}</title>
<style>
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ font-family:'Segoe UI',sans-serif; color:#1f2937; background:#f9fafb; }}
    .container {{ max-width:1100px; margin:0 auto; padding:40px 20px; }}
    .cover {{ background:linear-gradient(135deg,#0f172a,#1e293b); color:white; padding:60px 40px; border-radius:16px; margin-bottom:30px; }}
    .cover h1 {{ font-size:2em; }}
    .cover .sub {{ opacity:0.8; margin-top:10px; }}
    .cover .cls {{ display:inline-block; background:#ef4444; padding:6px 16px; border-radius:20px; margin-top:20px; font-weight:bold; font-size:0.8em; }}
    .section {{ background:white; border-radius:12px; padding:25px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1); }}
    .section h2 {{ color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:15px; }}
    .stats {{ display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }}
    .stat {{ text-align:center; padding:15px; border-radius:8px; color:white; }}
    .stat.n {{ background:#dc2626; }} .stat.h {{ background:#ea580c; }} .stat.m {{ background:#ca8a04; }} .stat.l {{ background:#2563eb; }} .stat.i {{ background:#6b7280; }}
    .stat .num {{ font-size:2em; font-weight:bold; }}
    .stat .lbl {{ font-size:0.75em; opacity:0.9; }}
    .risk-box {{ background:#f1f5f9; border-radius:8px; padding:20px; margin:15px 0; text-align:center; }}
    .risk-bar {{ height:14px; background:#e2e8f0; border-radius:7px; overflow:hidden; margin:10px 0; }}
    .risk-fill {{ height:100%; border-radius:7px; background:{risk_color}; width:{min(risk*10,100)}%; }}
    .finding {{ border:1px solid #e2e8f0; border-radius:8px; margin:12px 0; overflow:hidden; }}
    .finding-header {{ padding:12px 15px; display:flex; justify-content:space-between; align-items:center; }}
    .finding-header.critical {{ background:#fef2f2; border-left:4px solid #dc2626; }}
    .finding-header.high {{ background:#fff7ed; border-left:4px solid #ea580c; }}
    .finding-header.medium {{ background:#fefce8; border-left:4px solid #ca8a04; }}
    .finding-header.low {{ background:#eff6ff; border-left:4px solid #2563eb; }}
    .sev-badge {{ padding:3px 10px; border-radius:12px; font-size:0.7em; font-weight:700; color:white; }}
    .sev-badge.critical {{ background:#dc2626; }} .sev-badge.high {{ background:#ea580c; }} .sev-badge.medium {{ background:#ca8a04; }} .sev-badge.low {{ background:#2563eb; }}
    .finding-body {{ padding:15px; font-size:0.9em; }}
    .finding-body p {{ margin:8px 0; }}
    .finding-meta {{ font-size:0.8em; color:#64748b; margin-bottom:8px; }}
    .ev-box {{ background:#1e293b; color:#e2e8f0; padding:12px; border-radius:6px; font-family:monospace; font-size:0.85em; margin:8px 0; overflow-x:auto; }}
    table {{ width:100%; border-collapse:collapse; margin:10px 0; font-size:0.9em; }}
    th,td {{ padding:8px 10px; text-align:left; border-bottom:1px solid #e2e8f0; }}
    th {{ background:#f8fafc; font-weight:600; }}
    .footer {{ text-align:center; padding:20px; color:#64748b; font-size:0.8em; }}
    .meta-grid {{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }}
    .meta-item {{ background:rgba(255,255,255,0.08); padding:12px; border-radius:6px; }}
    .meta-item label {{ font-size:0.75em; opacity:0.7; display:block; }}
    .meta-item span {{ font-weight:600; }}
</style></head><body>
<div class="container">
    <div class="cover">
        <h1>Offensive Security Assessment Report</h1>
        <div class="sub">{eng['title']} ({et.get('name', eng['type'])})</div>
        <div class="meta-grid" style="max-width:500px;margin:20px auto;">
            <div class="meta-item"><label>Target</label><span>{eng['target']}</span></div>
            <div class="meta-item"><label>Lead</label><span>{eng['lead']}</span></div>
            <div class="meta-item"><label>Type</label><span>{eng['type']}</span></div>
            <div class="meta-item"><label>Status</label><span>{eng['status']}</span></div>
        </div>
        <div class="cls">CONFIDENTIAL</div>
    </div>
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="stats">
            <div class="stat n"><div class="num">{stats.get("critical",0)}</div><div class="lbl">Critical</div></div>
            <div class="stat h"><div class="num">{stats.get("high",0)}</div><div class="lbl">High</div></div>
            <div class="stat m"><div class="num">{stats.get("medium",0)}</div><div class="lbl">Medium</div></div>
            <div class="stat l"><div class="num">{stats.get("low",0)}</div><div class="lbl">Low</div></div>
            <div class="stat i"><div class="num">{total}</div><div class="lbl">Total</div></div>
        </div>
        <div class="risk-box">
            <strong>Overall Risk Rating: {risk_label}</strong> ({risk}/10)
            <div class="risk-bar"><div class="risk-fill"></div></div>
        </div>
    </div>
    <div class="section">
        <h2>Engagement Scope</h2>
        <table>
            <tr><th>Target</th><td>{eng['target']}</td></tr>
            <tr><th>Type</th><td>{et.get('name', eng['type'])}</td></tr>
            <tr><th>Phases</th><td>{', '.join(et.get('phases', []))}</td></tr>
            <tr><th>Methodologies</th><td>{', '.join(et.get('methodologies', []))}</td></tr>
            <tr><th>Lead Consultant</th><td>{eng['lead']}</td></tr>
            <tr><th>Period</th><td>{eng['start_date']} to {eng.get('completion', 'Ongoing')}</td></tr>
        </table>
    </div>
    <div class="section">
        <h2>Detailed Findings ({total})</h2>
        {findings_rows if findings_rows else '<p style="color:#64748b;text-align:center;padding:20px;">No findings to display.</p>'}
    </div>
    <div class="section">
        <h2>Prioritized Recommendations</h2>
        <ol>{''.join(f'<li><strong>[{f["severity"].upper()}]</strong> {f["title"]}: {f["remediation"]}</li>' for f in sorted(eng_findings, key=lambda x: {"critical":0,"high":1,"medium":2,"low":3}.get(x["severity"],4))[:10])}</ol>
    </div>
    <div class="footer">
        <p>Generated by SHIELD Offensive Security Consultant | {datetime.now().strftime('%Y-%m-%d %H:%M')} | CONFIDENTIAL</p>
    </div>
</div></body></html>"""
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html)


@router.get("/engagements/{engagement_id}/detail")
def get_engagement_detail(engagement_id: str):
    eng = next((e for e in ENGAGEMENTS if e["id"] == engagement_id), None)
    if not eng: raise HTTPException(404, "Engagement not found")

    eng_findings = [f for f in FINDINGS_DB if f["engagement_id"] == engagement_id]
    et = ENGAGEMENT_TYPES.get(eng["type"], {})
    phases = et.get("phases", [])

    severity_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    status_breakdown = {}
    for f in eng_findings:
        severity_dist[f["severity"]] = severity_dist.get(f["severity"], 0) + 1
        status_breakdown[f["status"]] = status_breakdown.get(f["status"], 0) + 1

    total = len(eng_findings)
    risk_score = round(
        sum({"critical": 10, "high": 7, "medium": 4, "low": 1}.get(f["severity"], 0) for f in eng_findings) / max(total, 1),
        1
    )

    timeline = []
    if phases:
        num_entries = min(random.randint(5, 8), len(phases))
        selected = random.sample(phases, num_entries) if num_entries < len(phases) else phases
        base_date = datetime.fromisoformat(eng["start_date"]) if isinstance(eng["start_date"], str) else eng["start_date"]
        for i, phase in enumerate(selected):
            timeline.append({
                "phase": phase,
                "date": (base_date + timedelta(days=i * random.randint(2, 5))).isoformat(),
                "status": random.choice(["completed", "completed", "in_progress", "pending"]),
                "description": f"{phase} phase for {eng['title']}"
            })

    type_to_categories = {
        "red-team": ["recon", "web", "exploit", "network", "ad"],
        "purple-team": ["recon", "web", "exploit", "detection", "network"],
        "bug-bounty": ["recon", "web", "exploit"],
        "re-engineering": ["re"],
        "forensics": ["forensics", "network"],
        "malware-analysis": ["malware", "re", "network", "detection"],
        "exploit-dev": ["exploit", "web", "re"]
    }
    relevant_categories = type_to_categories.get(eng["type"], [])
    relevant_tools = [t for t in TOOLKIT if t["category"] in relevant_categories]

    return {
        "engagement": eng,
        "findings": eng_findings,
        "findings_count": total,
        "timeline": sorted(timeline, key=lambda x: x["date"]),
        "stats": {
            "severity_distribution": severity_dist,
            "status_breakdown": status_breakdown,
            "risk_score": risk_score,
            "risk_rating": "Critical" if risk_score >= 8 else "High" if risk_score >= 6 else "Medium" if risk_score >= 3 else "Low",
            "total_findings": total
        },
        "tools": relevant_tools
    }


@router.get("/findings/{finding_id}")
def get_finding_detail(finding_id: str):
    finding = next((f for f in FINDINGS_DB if f["id"] == finding_id), None)
    if not finding: raise HTTPException(404, "Finding not found")

    remediation_text = finding.get("remediation", "")
    steps = [s.strip().rstrip(".") for s in remediation_text.split(".") if s.strip()]
    remediation_steps = steps[:5] if steps else ["Apply the recommended fix"]

    cwe_id = finding.get("cwe", "CWE-000")
    cwe_num = cwe_id.replace("CWE-", "")
    references = [
        {"title": f"{cwe_id} Details", "url": f"https://cwe.mitre.org/data/definitions/{cwe_num}.html"},
        {"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/"},
        {"title": "CVSS Calculator", "url": "https://www.first.org/cvss/calculator/3.1"}
    ]

    title_lower = finding.get("title", "").lower()
    desc_lower = finding.get("description", "").lower()

    if "sql" in title_lower or "injection" in title_lower:
        attack_vector = "SQL Injection via user input fields"
    elif "xss" in title_lower or "cross-site" in title_lower or "cross site" in title_lower:
        attack_vector = "Cross-Site Scripting via unsanitized user input"
    elif "rce" in title_lower or "remote code" in title_lower or "file upload" in title_lower:
        attack_vector = "Remote Code Execution through file upload or command injection"
    elif "idor" in title_lower or "insecure direct" in title_lower:
        attack_vector = "Insecure Direct Object Reference through predictable identifiers"
    elif "ssrf" in title_lower or "server-side" in title_lower:
        attack_vector = "Server-Side Request Forgery via URL parameter manipulation"
    elif "privilege" in title_lower or "escalation" in title_lower:
        attack_vector = "Privilege Escalation through misconfigured permissions"
    elif "s3" in title_lower or "bucket" in title_lower:
        attack_vector = "Misconfigured cloud storage with public access enabled"
    elif "dns" in title_lower:
        attack_vector = "DNS misconfiguration allowing information disclosure"
    elif "default credential" in title_lower or "default password" in title_lower:
        attack_vector = "Use of default credentials on administrative interfaces"
    elif "header" in title_lower:
        attack_vector = "Missing or misconfigured HTTP security headers"
    elif "password" in title_lower or "weak" in title_lower:
        attack_vector = "Weak authentication mechanisms allowing brute-force attacks"
    elif "exposure" in title_lower or "log" in title_lower:
        attack_vector = "Sensitive data exposure through insecure logging practices"
    else:
        attack_vector = f"Exploitation of {finding.get('cwe', 'unknown vulnerability')} via affected asset"

    tags = []
    tag_mapping = {
        "web": ["web", "http", "xss", "sql", "injection", "csrf", "ssrf", "header"],
        "authentication": ["auth", "login", "password", "credential", "session", "bypass"],
        "sqli": ["sql", "injection", "database"],
        "xss": ["xss", "cross-site", "cross site", "script"],
        "rce": ["rce", "remote code", "code execution", "file upload"],
        "idor": ["idor", "insecure direct", "authorization"],
        "ssrf": ["ssrf", "server-side", "url fetch"],
        "privesc": ["privilege", "escalation", "sudo"],
        "cloud": ["s3", "bucket", "cloud", "aws"],
        "network": ["network", "dns", "port", "service"],
        "configuration": ["misconfig", "header", "policy", "weak"],
        "data-exposure": ["exposure", "exposed", "leak", "log", "pii"],
        "recon": ["recon", "discovery", "information disclosure", "zone transfer"]
    }
    for tag, keywords in tag_mapping.items():
        if any(kw in title_lower or kw in desc_lower for kw in keywords):
            tags.append(tag)
    if not tags:
        tags = ["general"]

    return {
        **finding,
        "remediation_steps": remediation_steps,
        "references": references,
        "attack_vector": attack_vector,
        "tags": tags
    }


@router.get("/report/pdf/{engagement_id}")
def generate_pdf_report(engagement_id: str):
    """Generate a PDF report for an engagement using ReportLab."""
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.units import inch
    from fastapi.responses import StreamingResponse

    eng = next((e for e in ENGAGEMENTS if e["id"] == engagement_id), None)
    if not eng:
        raise HTTPException(404, "Engagement not found")
    eng_findings = [f for f in FINDINGS_DB if f["engagement_id"] == engagement_id]
    et = ENGAGEMENT_TYPES.get(eng["type"], {})

    stats = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f in eng_findings:
        stats[f["severity"]] = stats.get(f["severity"], 0) + 1
    total = len(eng_findings)
    risk = round((stats.get("critical", 0)*10 + stats.get("high", 0)*7 + stats.get("medium", 0)*4 + stats.get("low", 0)*1) / max(total, 1), 1)
    risk_label = "Critical" if risk >= 8 else "High" if risk >= 6 else "Medium" if risk >= 3 else "Low"

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, title=f"Offensive Report - {eng['title']}")
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle("CoverTitle", parent=styles["Title"], fontSize=22, spaceAfter=6, textColor=colors.HexColor("#1e293b"))
    subtitle_style = ParagraphStyle("CoverSub", parent=styles["Normal"], fontSize=11, textColor=colors.HexColor("#64748b"), spaceAfter=20)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=14, spaceAfter=10, textColor=colors.HexColor("#0f172a"))
    normal = styles["Normal"]
    finding_title = ParagraphStyle("FindingTitle", parent=styles["Normal"], fontSize=10, fontName="Helvetica-Bold")

    elements = []
    elements.append(Paragraph(f"Offensive Security Assessment Report", title_style))
    elements.append(Paragraph(f"{eng['title']} ({et.get('name', eng['type'])})", subtitle_style))
    elements.append(Spacer(1, 12))

    meta_data = [
        ["Target", eng["target"]],
        ["Lead", eng["lead"]],
        ["Type", eng["type"]],
        ["Status", eng["status"]],
        ["Period", f"{eng['start_date'][:10] if eng['start_date'] else 'N/A'} to {(eng.get('completion') or 'Ongoing')[:10] if eng.get('completion') else 'Ongoing'}"],
    ]
    meta_table = Table(meta_data, colWidths=[2*inch, 3.5*inch])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1e293b")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Executive Summary", section_style))
    sev_data = [["Severity", "Count"]]
    for sev in ["critical", "high", "medium", "low"]:
        sev_data.append([sev.capitalize(), str(stats.get(sev, 0))])
    sev_data.append(["Total", str(total)])
    sev_table = Table(sev_data, colWidths=[2*inch, 1*inch])
    sev_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    elements.append(sev_table)
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(f"<b>Overall Risk Rating: {risk_label}</b> ({risk}/10)", normal))
    elements.append(Spacer(1, 20))

    elements.append(Paragraph("Detailed Findings", section_style))
    from xml.sax.saxutils import escape as xml_escape
    from reportlab.platypus import Preformatted
    poc_style = ParagraphStyle("POC", parent=styles["Code"], fontSize=7, backColor=colors.HexColor("#f1f5f9"), borderPadding=6)
    for f in sorted(eng_findings, key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}.get(x["severity"], 4)):
        elements.append(Paragraph(f"<b>[{f['severity'].upper()}]</b> {xml_escape(f['title'])}", finding_title))
        elements.append(Paragraph(f"<i>{xml_escape(str(f.get('cwe', 'N/A')))} | CVSS: {f.get('cvss', 'N/A')} | Asset: {xml_escape(f['affected_asset'])}</i>", normal))
        elements.append(Paragraph(f"<b>Description:</b> {xml_escape(f['description'])}", normal))
        elements.append(Paragraph(f"<b>Remediation:</b> {xml_escape(f['remediation'])}", normal))
        if f.get("poc"):
            elements.append(Preformatted(f["poc"], poc_style))
        elements.append(Spacer(1, 10))

    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Generated by SHIELD Offensive Security Consultant | {datetime.now().strftime('%Y-%m-%d %H:%M')} | CONFIDENTIAL", ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#94a3b8"), alignment=1)))

    doc.build(elements)
    buf.seek(0)

    return StreamingResponse(
        buf, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=offensive_report_{engagement_id}.pdf"}
    )
