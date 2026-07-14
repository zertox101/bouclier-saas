from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/client/incidents", tags=["client-incidents"])

CLIENTS = ["Acme Corp", "Globex Inc", "Initech", "Hooli", "Cyberdyne Systems", "Wonka Industries", "Stark Industries", "Wayne Enterprises"]


@router.get("")
@router.get("/")
async def list_client_incidents():
    incidents = []
    for i in range(15):
        severity = random.choice(["critical", "high", "medium", "low"])
        incidents.append({
            "id": f"INC-{i+1:05d}",
            "client": random.choice(CLIENTS),
            "title": f"{random.choice(['Malicious Email','Suspicious Login','Data Access Anomaly','Phishing Campaign','Ransomware Attempt','DDoS Attack','Insider Threat','Policy Violation','Unauthorized Access','Malware Detected'])}",
            "severity": severity,
            "status": random.choice(["open", "investigating", "contained", "resolved", "closed"]),
            "detected_at": (datetime.now() - timedelta(hours=random.randint(1, 720))).isoformat(),
            "resolved_at": (datetime.now() - timedelta(hours=random.randint(0, 24))).isoformat() if random.random() > 0.5 else None,
            "business_impact": f"{random.choice(['Data Exfiltration','Service Disruption','Financial Loss','Reputational Damage','Compliance Violation'])}: ${random.randint(1000, 500000)}",
            "assigned_to": random.choice(["Alice", "Bob", "Charlie", "Diana"]),
            "actions_taken": random.sample(["Blocked IP", "Isolated Host", "Reset Credentials", "Updated Firewall", "Patched Vulnerability", "Deployed IOC"], k=random.randint(1, 3)),
        })
    return {"incidents": incidents, "total": len(incidents)}
