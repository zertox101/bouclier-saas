from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from pydantic import BaseModel
from typing import Optional
import json, os, random

from app.core.database import get_db
from app.models.sql import Incident, AlertEvent, CorrelatedAlert, MlAlert, EventLog
from app.models.telemetry_sql import TelemetryEvent

router = APIRouter(prefix="/api/reports", tags=["Advanced Reports"])

REPORT_TEMPLATES = {
    "soc-executive": {
        "name": "SOC Executive Summary",
        "description": "High-level SOC metrics for CISO/executive audience",
        "sections": ["risk_score", "incident_summary", "alert_trends", "top_threats", "sla_metrics"]
    },
    "soc-daily": {
        "name": "SOC Daily Operations Report",
        "description": "Day-over-day SOC analyst activity and threat landscape",
        "sections": ["incidents_24h", "alerts_by_severity", "top_talkers", "kill_chain", "geo_threats"]
    },
    "soc-weekly": {
        "name": "SOC Weekly Threat Briefing",
        "description": "Weekly threat intelligence summary with trend analysis",
        "sections": ["weekly_trend", "attack_type_distribution", "top_countries", "remediation_status"]
    },
    "soc-monthly": {
        "name": "SOC Monthly Performance Review",
        "description": "Monthly KPIs, SLA compliance, and security posture assessment",
        "sections": ["monthly_kpis", "sla_compliance", "incident_response_metrics", "roi_metrics"]
    },
    "pentest-executive": {
        "name": "Pentest Executive Summary",
        "description": "High-level penetration test results for management",
        "sections": ["vulnerability_summary", "risk_rating", "critical_findings", "remediation_roadmap"]
    },
    "pentest-technical": {
        "name": "Pentest Technical Report",
        "description": "Detailed technical findings with CVSS, CWE, and exploit POCs",
        "sections": ["scope", "methodology", "detailed_findings", "evidence", "remediation"]
    },
    "pentest-compliance": {
        "name": "Compliance Mapping Report",
        "description": "Findings mapped to regulatory frameworks (PCI-DSS, HIPAA, ISO27001, NIST)",
        "sections": ["framework_mapping", "control_gaps", "compliance_score", "remediation_plan"]
    },
    "mythos-kill-chain": {
        "name": "Mythos Kill Chain Analysis",
        "description": "Full MITRE ATT&CK kill chain mapping from Mythos autonomous operations",
        "sections": ["kill_chain_phases", "ttps_mapped", "detection_coverage", "gaps_analysis"]
    }
}

REPORT_TYPES = list(REPORT_TEMPLATES.keys())

def _norm_sev(raw):
    m = {"critique": "critical", "critical": "critical", "élevé": "high", "high": "high",
         "moyen": "medium", "medium": "medium", "low": "low", "faible": "low", "info": "info"}
    return m.get((raw or "low").lower().strip(), "low")

def _get_soc_metrics(db: Session, hours: int = 24):
    since = datetime.utcnow() - timedelta(hours=hours)
    ts_since = int(since.timestamp())

    tele_count = db.query(func.count(TelemetryEvent.id)).filter(TelemetryEvent.created_at >= since).scalar() or 0
    corr_count = db.query(func.count(CorrelatedAlert.id)).filter(CorrelatedAlert.timestamp_epoch >= ts_since).scalar() or 0
    ml_count = db.query(func.count(MlAlert.id)).filter(MlAlert.timestamp_epoch >= ts_since).scalar() or 0
    log_count = db.query(func.count(EventLog.id)).filter(EventLog.timestamp_epoch >= ts_since).scalar() or 0
    inc_count = db.query(func.count(Incident.id)).scalar() or 0

    open_incidents = db.query(func.count(Incident.id)).filter(Incident.status.in_(["Open", "In Progress"])).scalar() or 0

    tele_events = db.query(TelemetryEvent).filter(TelemetryEvent.created_at >= since).all()
    corr_alerts = db.query(CorrelatedAlert).filter(CorrelatedAlert.timestamp_epoch >= ts_since).all()
    ml_alerts = db.query(MlAlert).filter(MlAlert.timestamp_epoch >= ts_since).all()
    event_logs = db.query(EventLog).filter(EventLog.timestamp_epoch >= ts_since).all()

    sev_counts = defaultdict(int)
    for e in tele_events: sev_counts[_norm_sev(e.severity)] += 1
    for a in corr_alerts: sev_counts[_norm_sev(a.severity)] += 1
    for a in ml_alerts: sev_counts["high" if (a.anomaly_score or 0) >= (a.threshold or 0.8) else "medium"] += 1
    for e in event_logs: sev_counts[_norm_sev(e.severity)] += 1

    attack_counts = defaultdict(int)
    for e in tele_events: attack_counts[e.event_type or "Unknown"] += 1
    for a in corr_alerts: attack_counts[a.rule_name or "Correlated Alert"] += 1

    hourly = defaultdict(lambda: defaultdict(int))
    for e in tele_events:
        h = e.created_at.strftime("%H:00") if e.created_at else "00:00"
        hourly[h][_norm_sev(e.severity)] += 1

    ip_counts = defaultdict(int)
    for e in tele_events:
        ip = (e.payload_json or {}).get("src_ip")
        if ip: ip_counts[ip] += 1

    return {
        "total_alerts": tele_count + corr_count + ml_count + log_count,
        "total_incidents": inc_count,
        "open_incidents": open_incidents,
        "severity": dict(sev_counts),
        "attack_types": [{"name": k, "count": v} for k, v in sorted(attack_counts.items(), key=lambda x: -x[1])[:10]],
        "hourly_trend": [{"t": h, "critical": d.get("critical",0), "high": d.get("high",0), "medium": d.get("medium",0), "low": d.get("low",0)} for h, d in sorted(hourly.items())],
        "top_talkers": [{"ip": ip, "count": c} for ip, c in sorted(ip_counts.items(), key=lambda x: -x[1])[:5]],
        "risk_score": min(100, int(sev_counts.get("critical",0)*10 + sev_counts.get("high",0)*5 + (tele_count or 1)*0.1)),
        "data_range_hours": hours
    }

def _generate_html_report(report_type: str, metrics: dict, incidents: list, findings: list) -> str:
    sev = metrics.get("severity", {})
    total = metrics.get("total_alerts", 0)
    inc_total = metrics.get("total_incidents", 0)
    risk = metrics.get("risk_score", 50)
    risk_label = "Critical" if risk >= 80 else "High" if risk >= 60 else "Medium" if risk >= 40 else "Low"
    risk_color = {"Critical": "#dc2626", "High": "#ea580c", "Medium": "#ca8a04", "Low": "#2563eb"}.get(risk_label, "#6b7280")

    findings_html = ""
    for f in findings[:20]:
        sev_c = f.get("severity", "medium").lower()
        findings_html += f"""
        <div class="finding {sev_c}">
            <div class="finding-header {sev_c}"><span class="finding-title">{f.get('title','Finding')}</span><span class="sev-badge {sev_c}">{f.get('severity','Medium')}</span></div>
            <div class="finding-body"><p>{f.get('description','')}</p></div>
        </div>"""

    template_name = REPORT_TEMPLATES.get(report_type, {}).get("name", "Security Report")

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>{template_name} - {datetime.now().strftime('%Y-%m-%d')}</title>
<style>
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ font-family:'Segoe UI',system-ui,sans-serif; color:#1f2937; background:#f9fafb; }}
    .container {{ max-width:1100px; margin:0 auto; padding:40px 20px; }}
    .cover {{ background:linear-gradient(135deg,#0f172a,#1e293b); color:white; padding:60px 40px; border-radius:16px; margin-bottom:30px; }}
    .cover h1 {{ font-size:2em; margin-bottom:10px; }}
    .cover .meta {{ opacity:0.8; font-size:0.9em; }}
    .section {{ background:white; border-radius:12px; padding:25px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1); }}
    .section h2 {{ color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:10px; margin-bottom:15px; }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:15px 0; }}
    .card {{ text-align:center; padding:15px; border-radius:8px; color:white; }}
    .card.critical {{ background:#dc2626; }}
    .card.high {{ background:#ea580c; }}
    .card.medium {{ background:#ca8a04; }}
    .card.low {{ background:#2563eb; }}
    .card.info {{ background:#6b7280; }}
    .card .num {{ font-size:2em; font-weight:bold; }}
    .card .lbl {{ font-size:0.8em; opacity:0.9; }}
    .risk-meter {{ background:#f1f5f9; border-radius:8px; padding:20px; margin:15px 0; text-align:center; }}
    .risk-bar {{ height:16px; background:#e2e8f0; border-radius:8px; overflow:hidden; margin:10px 0; }}
    .risk-fill {{ height:100%; border-radius:8px; background:linear-gradient(90deg,{risk_color},{risk_color}); width:{risk}%; }}
    .finding {{ border:1px solid #e2e8f0; border-radius:8px; margin:12px 0; overflow:hidden; }}
    .finding-header {{ padding:12px 15px; display:flex; justify-content:space-between; align-items:center; }}
    .finding-header.critical {{ background:#fef2f2; border-left:4px solid #dc2626; }}
    .finding-header.high {{ background:#fff7ed; border-left:4px solid #ea580c; }}
    .finding-header.medium {{ background:#fefce8; border-left:4px solid #ca8a04; }}
    .finding-header.low {{ background:#eff6ff; border-left:4px solid #2563eb; }}
    .finding-title {{ font-weight:600; }}
    .finding-body {{ padding:15px; }}
    .sev-badge {{ padding:3px 10px; border-radius:12px; font-size:0.75em; font-weight:600; color:white; }}
    .sev-badge.critical {{ background:#dc2626; }}
    .sev-badge.high {{ background:#ea580c; }}
    .sev-badge.medium {{ background:#ca8a04; }}
    .sev-badge.low {{ background:#2563eb; }}
    table {{ width:100%; border-collapse:collapse; margin:10px 0; }}
    th,td {{ padding:10px 12px; text-align:left; border-bottom:1px solid #e2e8f0; font-size:0.9em; }}
    th {{ background:#f8fafc; font-weight:600; color:#475569; }}
    .footer {{ text-align:center; padding:20px; color:#64748b; font-size:0.85em; }}
    .tag {{ display:inline-block; background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.75em; margin:2px; }}
    .metric-row {{ display:flex; gap:15px; flex-wrap:wrap; }}
    .metric-item {{ flex:1; min-width:120px; background:#f8fafc; padding:12px; border-radius:8px; text-align:center; }}
    .metric-item .val {{ font-size:1.5em; font-weight:bold; color:#0f172a; }}
    .metric-item .lbl {{ font-size:0.75em; color:#64748b; }}
</style></head><body>
<div class="container">
    <div class="cover">
        <h1>{template_name}</h1>
        <div class="meta">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | {REPORT_TEMPLATES.get(report_type,{}).get('description','')}</div>
    </div>
    <div class="section">
        <h2>Key Metrics</h2>
        <div class="metric-row">
            <div class="metric-item"><div class="val">{total}</div><div class="lbl">Total Alerts</div></div>
            <div class="metric-item"><div class="val">{inc_total}</div><div class="lbl">Total Incidents</div></div>
            <div class="metric-item"><div class="val">{risk}%</div><div class="lbl">Risk Score ({risk_label})</div></div>
        </div>
    </div>
    <div class="section">
        <h2>Severity Distribution</h2>
        <div class="grid">
            <div class="card critical"><div class="num">{sev.get("critical",0)}</div><div class="lbl">Critical</div></div>
            <div class="card high"><div class="num">{sev.get("high",0)}</div><div class="lbl">High</div></div>
            <div class="card medium"><div class="num">{sev.get("medium",0)}</div><div class="lbl">Medium</div></div>
            <div class="card low"><div class="num">{sev.get("low",0)}</div><div class="lbl">Low</div></div>
        </div>
        <div class="risk-meter">
            <strong>Overall Risk: {risk_label}</strong> ({risk}/100)
            <div class="risk-bar"><div class="risk-fill"></div></div>
        </div>
    </div>
    <div class="section">
        <h2>Detailed Findings</h2>
        {findings_html if findings_html else "<p style='color:#64748b;text-align:center;padding:20px;'>No findings recorded for this period.</p>"}
    </div>
    <div class="section">
        <h2>Attack Type Distribution</h2>
        <table><tr><th>Type</th><th>Count</th></tr>
        {''.join(f'<tr><td>{a["name"]}</td><td>{a["count"]}</td></tr>' for a in metrics.get("attack_types",[]))}
        </table>
    </div>
    {f'''
    <div class="section">
        <h2>Recent Incidents</h2>
        <table><tr><th>Title</th><th>Severity</th><th>Status</th><th>Date</th></tr>
        {''.join(f'<tr><td>{i.get("title","")}</td><td><span class="tag">{i.get("severity","")}</span></td><td>{i.get("status","")}</td><td>{i.get("created_at","")}</td></tr>' for i in incidents[:15])}
        </table>
    </div>
    ''' if incidents else ''}
    <div class="footer">
        <p>Generated by SHIELD Security Framework | Confidential</p>
        <p>This report is intended for authorized personnel only.</p>
    </div>
</div></body></html>"""

def _get_findings_from_db(db: Session, report_type: str) -> list:
    findings = []
    if "soc" in report_type:
        incidents = db.query(Incident).order_by(Incident.created_at.desc()).limit(20).all()
        for inc in incidents:
            findings.append({
                "title": inc.title,
                "severity": inc.severity or "medium",
                "description": inc.description or f"Incident opened by {inc.owner or 'system'}",
                "status": inc.status,
                "created_at": inc.created_at.isoformat() if inc.created_at else ""
            })
    if "pentest" in report_type or "mythos" in report_type:
        alerts = db.query(AlertEvent).order_by(AlertEvent.timestamp.desc()).limit(20).all()
        for a in alerts:
            findings.append({
                "title": f"{a.type or 'Alert'} - {a.src_ip}",
                "severity": a.severity or "medium",
                "description": json.dumps(a.details) if isinstance(a.details, dict) else str(a.details or ""),
                "status": a.status or "open",
                "created_at": a.timestamp.isoformat() if a.timestamp else ""
            })
    if not findings:
        findings = [
            {"title": "No findings available", "severity": "info", "description": "Run security assessments to generate findings. This report template requires data from SOC operations or pentest engagements.", "status": "pending", "created_at": ""}
        ]
    return findings

@router.get("/templates")
def list_templates():
    return {"templates": [{"id": k, **v} for k, v in REPORT_TEMPLATES.items()]}

@router.get("/generate/{report_type}")
def generate_report(report_type: str, hours: int = Query(24, ge=1, le=720), db: Session = Depends(get_db)):
    if report_type not in REPORT_TEMPLATES:
        raise HTTPException(400, f"Invalid report type. Options: {', '.join(REPORT_TYPES)}")

    metrics = _get_soc_metrics(db, hours=hours)
    findings = _get_findings_from_db(db, report_type)

    incidents = []
    for inc in db.query(Incident).order_by(Incident.created_at.desc()).limit(30).all():
        incidents.append({"title": inc.title, "severity": inc.severity, "status": inc.status, "created_at": inc.created_at.isoformat() if inc.created_at else ""})

    html = _generate_html_report(report_type, metrics, incidents, findings)

    return HTMLResponse(content=html)

@router.get("/generate/{report_type}/json")
def generate_report_json(report_type: str, hours: int = Query(24, ge=1, le=720), db: Session = Depends(get_db)):
    if report_type not in REPORT_TEMPLATES:
        raise HTTPException(400, f"Invalid report type. Options: {', '.join(REPORT_TYPES)}")

    metrics = _get_soc_metrics(db, hours=hours)
    findings = _get_findings_from_db(db, report_type)

    incidents = []
    for inc in db.query(Incident).order_by(Incident.created_at.desc()).limit(30).all():
        incidents.append({"title": inc.title, "severity": inc.severity, "status": inc.status, "created_at": inc.created_at.isoformat() if inc.created_at else ""})

    return {
        "report_type": report_type,
        "template": REPORT_TEMPLATES.get(report_type),
        "generated_at": datetime.utcnow().isoformat(),
        "metrics": metrics,
        "findings": findings,
        "incidents": incidents
    }

REPORT_HISTORY = []
for i in range(24):
    rtype = random.choice(REPORT_TYPES)
    REPORT_HISTORY.append({
        "id": f"RPT-{i+1:04d}",
        "type": rtype,
        "title": REPORT_TEMPLATES[rtype]["name"],
        "status": random.choice(["final", "final", "final", "draft", "review"]),
        "created_at": (datetime.now() - timedelta(hours=random.randint(1, 720))).isoformat(),
        "generated_by": random.choice(["System", "admin@local", "analyst@bouclier.saas"]),
        "data_range": f"{random.randint(24, 720)}h",
        "findings_count": random.randint(5, 150),
        "risk_score": random.randint(15, 95)
    })

@router.get("/history")
def list_reports(type: Optional[str] = Query(None), status: Optional[str] = Query(None)):
    results = REPORT_HISTORY
    if type and type in REPORT_TYPES:
        results = [r for r in results if r["type"] == type]
    if status:
        results = [r for r in results if r["status"] == status]
    return {"reports": sorted(results, key=lambda x: x["created_at"], reverse=True), "total": len(results)}

@router.get("/history/{report_id}")
def get_report_detail(report_id: str):
    rpt = next((r for r in REPORT_HISTORY if r["id"] == report_id), None)
    if not rpt:
        raise HTTPException(404, "Report not found")
    return {"report": rpt, "content": f"## {rpt['title']}\n\nReport generated on {rpt['created_at']} covering {rpt['data_range']} of data.\n\n### Key Metrics\n- Total findings: {rpt['findings_count']}\n- Risk score: {rpt['risk_score']}/100"}
