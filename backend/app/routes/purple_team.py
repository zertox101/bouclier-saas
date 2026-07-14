from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/purple-team", tags=["purple-team"])

ATTACK_TECHNIQUES = [
    "T1566_Phishing", "T1059_CommandScripting", "T1485_DataDestruction",
    "T1027_Obfuscation", "T1071_AppLayerProtocol", "T1041_ExfilOverC2",
    "T1003_CredentialDumping", "T1547_BootLogonInit", "T1134_AccessTokenManip",
    "T1053_ScheduledTask", "T1055_ProcessInjection", "T1550_UseAlternateAuth",
    "T1021_RemoteServices", "T1048_ExfilOverAltProtocol", "T1090_Proxy",
    "T1204_UserExecution",
]


@router.get("/executions")
async def get_executions():
    executions = []
    for i in range(8):
        executions.append({
            "id": f"EXEC-{i+1:04d}",
            "technique": random.choice(ATTACK_TECHNIQUES),
            "result": random.choice(["detected", "blocked", "missed", "partial"]),
            "severity": random.choice(["critical", "high", "medium", "low"]),
            "executed_at": (datetime.now() - timedelta(hours=random.randint(1, 720))).isoformat(),
            "host": f"web-{random.randint(1, 20)}.bouclier.local",
            "tier": random.choice(["Tier 1", "Tier 2", "Tier 3", "Tier 4"]),
            "coverage_gap": random.choice([True, False]),
        })
    return {"executions": executions, "total": len(executions)}


@router.get("/coverage")
async def get_coverage():
    return {
        "overall_coverage": round(random.uniform(60, 95), 1),
        "tier1_coverage": round(random.uniform(70, 100), 1),
        "tier2_coverage": round(random.uniform(60, 95), 1),
        "tier3_coverage": round(random.uniform(50, 85), 1),
        "tier4_coverage": round(random.uniform(30, 70), 1),
        "total_techniques": len(ATTACK_TECHNIQUES),
        "tested": random.randint(10, 50),
        "gaps": random.randint(0, 5),
    }


@router.get("/gaps")
async def get_gaps():
    gaps = []
    for i in range(random.randint(1, 4)):
        gaps.append({
            "id": f"GAP-{i+1:04d}",
            "technique": random.choice(ATTACK_TECHNIQUES),
            "description": f"Detection gap for {random.choice(['Windows Event Logs', 'Network Traffic', 'Endpoint Telemetry', 'DNS Queries', 'Process Monitoring'])}",
            "severity": random.choice(["critical", "high", "medium"]),
            "status": random.choice(["open", "in_progress", "scheduled"]),
            "remediation": f"Deploy {random.choice(['Sysmon', 'EDR Sensor', 'Network Monitor', 'Log Collector', 'Honeypot'])}",
        })
    return {"gaps": gaps}
