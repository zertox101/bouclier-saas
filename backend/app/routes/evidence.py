from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/evidence", tags=["evidence"])

EVIDENCE_TYPES = ["PCAP", "Memory Dump", "Disk Image", "Log File", "Screenshot", "Email", "Artifact", "Binary"]
EVIDENCE_STATUS = ["collected", "analyzing", "analyzed", "archived", "legal_hold"]
CHAIN_OF_CUSTODY = ["Analyst A", "Analyst B", "Analyst C", "Forensic Lab", "Cloud Storage"]


@router.get("")
@router.get("/")
async def list_evidence():
    artifacts = []
    for i in range(10):
        etype = random.choice(EVIDENCE_TYPES)
        artifacts.append({
            "id": f"EV-{i+1:04d}",
            "name": f"evidence_{etype.lower().replace(' ','_')}_{datetime.now().strftime('%Y%m%d')}_{i+1}",
            "type": etype,
            "size": f"{random.randint(1, 5000)} MB",
            "status": random.choice(EVIDENCE_STATUS),
            "sha256": "".join(random.choices("0123456789abcdef", k=64)),
            "md5": "".join(random.choices("0123456789abcdef", k=32)),
            "case_id": f"CASE-{random.randint(1000, 9999)}",
            "collected_by": random.choice(CHAIN_OF_CUSTODY),
            "collected_at": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat(),
            "storage_location": f"s3://bouclier-evidence/{random.choice(['casablanca','paris','dubai'])}/{datetime.now().strftime('%Y/%m')}/",
            "chain_of_custody": random.sample(CHAIN_OF_CUSTODY, k=random.randint(2, 4)),
            "legal_hold": random.choice([True, False]),
            "tags": random.sample(["critical", "forensics", "incident", "legal", "pcap", "memory", "disk"], k=random.randint(1, 4)),
        })
    return {"artifacts": artifacts, "total": len(artifacts)}


@router.get("/{evidence_id}")
async def get_evidence(evidence_id: str):
    return {
        "id": evidence_id,
        "name": f"Evidence {evidence_id}",
        "type": random.choice(EVIDENCE_TYPES),
        "status": "analyzed",
        "sha256": "".join(random.choices("0123456789abcdef", k=64)),
        "analysis_results": {
            "malicious": random.choice([True, False]),
            "confidence": random.randint(50, 100),
            "findings": random.sample(["Malware Detected", "Suspicious Network Activity", "Data Exfiltration", "C2 Communication", "Persistence Mechanism"], k=random.randint(1, 3)),
        },
    }
