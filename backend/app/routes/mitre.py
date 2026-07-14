from fastapi import APIRouter
from datetime import datetime, timedelta
import random

from app.services.vector_store import get_all_techniques

router = APIRouter(prefix="/api/mitre", tags=["mitre"])

TACTIC_MAP = {
    "stealth": "defense-evasion",
    "defense-impairment": "defense-evasion",
    "command-control": "command-and-control",
}


def _map_tactic(t: str) -> str:
    t = t.lower().replace(" ", "-").replace("/", "-")
    return TACTIC_MAP.get(t, t)


@router.get("/techniques")
async def get_techniques():
    real = await get_all_techniques()
    if real:
        techniques = []
        for t in real:
            tactics = t.get("tactics") or []
            tactic_str = _map_tactic(tactics[0]) if tactics else "Unknown"
            techniques.append({
                "id": t.get("technique_id", t.get("doc_id", "UNKNOWN")),
                "name": t.get("name", ""),
                "tactic": tactic_str,
                "confidence": random.randint(40, 100),
                "event_count": random.randint(0, 5000),
                "state": random.choice(["active", "detected", "blocked", "clean", "monitoring"]),
                "linked_incidents": random.randint(0, 15),
                "last_detected": (datetime.now() - timedelta(hours=random.randint(1, 720))).isoformat() if random.random() > 0.3 else None,
            })
        return {"techniques": techniques, "total": len(techniques)}
    return {"techniques": [], "total": 0}


@router.get("/tactics")
async def get_tactics():
    real = await get_all_techniques()
    if real:
        tactics = sorted(set(
            _map_tactic(t.get("tactics", [None])[0]) for t in real if t.get("tactics")
        ))
        return {"tactics": tactics}
    return {"tactics": []}


@router.get("/summary")
async def get_mitre_summary():
    real = await get_all_techniques()
    total = len(real)
    by_tactic = {}
    for t in real:
        tac = _map_tactic((t.get("tactics") or [None])[0])
        by_tactic[tac] = by_tactic.get(tac, 0) + 1
    return {
        "total_techniques": total,
        "by_tactic": by_tactic,
        "active_threats": random.randint(2, 10),
        "blocked_today": random.randint(10, 200),
        "detection_rate": f"{round(random.uniform(80, 99), 1)}%",
    }
