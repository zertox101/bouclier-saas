from fastapi import APIRouter
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel
from typing import Optional
import random

router = APIRouter(prefix="/api/soc/playbooks", tags=["playbooks"])

PLAYBOOK_SEVERITY = ["critical", "high", "medium", "low"]
PLAYBOOK_STATUS = ["active", "draft", "archived", "testing"]
PLAYBOOK_CATEGORIES = [
    "Malware Response", "Phishing Response", "Network Compromise",
    "Data Breach", "Insider Threat", "DDoS Mitigation",
    "Ransomware Response", "Web Attack", "Social Engineering",
    "Unauthorized Access",
]

_PLAYBOOKS = [
    {
        "id": f"PB-{i+1:04d}",
        "name": f"{random.choice(PLAYBOOK_CATEGORIES)} Playbook",
        "category": random.choice(PLAYBOOK_CATEGORIES),
        "severity": random.choice(PLAYBOOK_SEVERITY),
        "status": random.choice(PLAYBOOK_STATUS),
        "version": f"v{random.randint(1,3)}.{random.randint(0,9)}",
        "steps": random.randint(5, 20),
        "estimated_time": f"{random.randint(15, 240)}min",
        "owner": random.choice(["Alice", "Bob", "Charlie", "Diana", "Eve"]),
        "last_updated": (datetime.now() - timedelta(days=random.randint(0, 90))).isoformat(),
        "last_tested": (datetime.now() - timedelta(days=random.randint(0, 180))).isoformat() if random.random() > 0.3 else None,
        "test_success_rate": random.randint(60, 100),
    }
    for i in range(15)
]


class PlaybookCreate(BaseModel):
    name: str
    category: str
    severity: str
    steps: list[str]


@router.get("")
@router.get("/")
async def list_playbooks():
    return {"playbooks": _PLAYBOOKS, "total": len(_PLAYBOOKS)}


@router.get("/{playbook_id}")
async def get_playbook(playbook_id: str):
    pb = next((p for p in _PLAYBOOKS if p["id"] == playbook_id), _PLAYBOOKS[0])
    return {"playbook": pb}


@router.post("")
@router.post("/")
async def create_playbook(pb: PlaybookCreate):
    return {"id": f"PB-{len(_PLAYBOOKS)+1:04d}", "name": pb.name, "status": "draft"}


@router.get("/categories")
async def get_categories():
    return {"categories": PLAYBOOK_CATEGORIES}
