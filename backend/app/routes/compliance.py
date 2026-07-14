from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/governance/compliance", tags=["compliance"])

FRAMEWORKS = [
    {"id": "SOC2", "name": "SOC 2 Type II", "category": "Audit", "progress": 98, "status": "compliant", "last_audit": (datetime.now() - timedelta(days=45)).isoformat(), "next_audit": (datetime.now() + timedelta(days=320)).isoformat(), "controls": 189, "passed": 185, "failed": 2, "trend": "up"},
    {"id": "ISO27001", "name": "ISO 27001:2022", "category": "ISMS", "progress": 94, "status": "compliant", "last_audit": (datetime.now() - timedelta(days=30)).isoformat(), "next_audit": (datetime.now() + timedelta(days=335)).isoformat(), "controls": 114, "passed": 107, "failed": 4, "trend": "stable"},
    {"id": "HIPAA", "name": "HIPAA Security Rule", "category": "Healthcare", "progress": 72, "status": "in_progress", "last_audit": (datetime.now() - timedelta(days=120)).isoformat(), "next_audit": (datetime.now() + timedelta(days=60)).isoformat(), "controls": 78, "passed": 56, "failed": 12, "trend": "up"},
    {"id": "GDPR", "name": "GDPR", "category": "Privacy", "progress": 100, "status": "compliant", "last_audit": (datetime.now() - timedelta(days=90)).isoformat(), "next_audit": (datetime.now() + timedelta(days=275)).isoformat(), "controls": 42, "passed": 42, "failed": 0, "trend": "stable"},
    {"id": "PCIDSS", "name": "PCI DSS 4.0", "category": "Payment", "progress": 65, "status": "in_progress", "last_audit": (datetime.now() - timedelta(days=200)).isoformat(), "next_audit": (datetime.now() + timedelta(days=30)).isoformat(), "controls": 240, "passed": 156, "failed": 34, "trend": "up"},
    {"id": "NIST", "name": "NIST CSF 2.0", "category": "Framework", "progress": 88, "status": "compliant", "last_audit": (datetime.now() - timedelta(days=60)).isoformat(), "next_audit": (datetime.now() + timedelta(days=120)).isoformat(), "controls": 96, "passed": 84, "failed": 7, "trend": "up"},
    {"id": "SOX", "name": "SOX Compliance", "category": "Financial", "progress": 91, "status": "compliant", "last_audit": (datetime.now() - timedelta(days=15)).isoformat(), "next_audit": (datetime.now() + timedelta(days=350)).isoformat(), "controls": 56, "passed": 51, "failed": 3, "trend": "stable"},
]


@router.get("")
@router.get("/")
async def list_frameworks():
    summary = {
        "total_frameworks": len(FRAMEWORKS),
        "compliant": sum(1 for f in FRAMEWORKS if f["status"] == "compliant"),
        "in_progress": sum(1 for f in FRAMEWORKS if f["status"] == "in_progress"),
        "overall_progress": round(sum(f["progress"] for f in FRAMEWORKS) / len(FRAMEWORKS), 1),
        "total_controls": sum(f["controls"] for f in FRAMEWORKS),
        "passed_controls": sum(f["passed"] for f in FRAMEWORKS),
        "failed_controls": sum(f["failed"] for f in FRAMEWORKS),
    }
    return {"frameworks": FRAMEWORKS, "summary": summary}


@router.get("/{framework_id}")
async def get_framework(framework_id: str):
    fw = next((f for f in FRAMEWORKS if f["id"] == framework_id.upper()), FRAMEWORKS[0])
    return {"framework": fw, "controls": [f"CTRL-{fw['id']}-{i+1:03d}" for i in range(fw['controls'])]}
