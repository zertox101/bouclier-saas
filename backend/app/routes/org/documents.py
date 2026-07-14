from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/org/documents", tags=["org-documents"])

DOC_TYPES = ["policy", "report", "compliance", "training", "incident", "playbook"]

@router.get("")
async def get_org_documents():
    docs = []
    for i in range(1, random.randint(3, 12)):
        doc_type = random.choice(DOC_TYPES)
        docs.append({
            "id": f"DOC-{random.randint(1000,9999)}",
            "title": random.choice([
                "Security Policy v3.2", "Incident Response Plan", "Data Protection Policy",
                "SOC 2 Audit Report", "Penetration Test Results", "Risk Assessment Q2",
                "Employee Security Training", "Network Architecture Review", "Vendor Security Assessment",
                "Business Continuity Plan", "Disaster Recovery Plan", "Access Control Policy",
            ]),
            "type": doc_type,
            "size": f"{random.randint(10, 5000)} KB",
            "uploaded_by": random.choice(["admin@org.com", "compliance@org.com", "security@org.com"]),
            "uploaded_at": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat(),
            "status": random.choice(["published", "draft", "archived", "under_review"]),
        })
    docs.sort(key=lambda x: x["uploaded_at"], reverse=True)
    return {"documents": docs, "total": len(docs)}
