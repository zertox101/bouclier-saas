from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import random

router = APIRouter(prefix="/api/flipper", tags=["flipper"])

PAYLOAD_LIBRARY = [
    {"id": "passgrabber", "name": "PassGrabber", "description": "Extract saved credentials from browser", "category": "Credential Access", "risk": "high"},
    {"id": "reverseshell", "name": "ReverseShell", "description": "Establish reverse TCP connection", "category": "Execution", "risk": "critical"},
    {"id": "exfil_docs", "name": "Exfil_Docs", "description": "Exfiltrate documents over encrypted channel", "category": "Exfiltration", "risk": "critical"},
    {"id": "defeatamsi", "name": "DefeatAMSI", "description": "Bypass Windows AMSI protection", "category": "Defense Evasion", "risk": "high"},
    {"id": "rickroll", "name": "RickRoll", "description": "Deploy harmless prank payload", "category": "Humor", "risk": "low"},
    {"id": "keylogger", "name": "KeyLogger", "description": "Capture keystrokes on target system", "category": "Collection", "risk": "high"},
    {"id": "screenshot", "name": "ScreenShot", "description": "Capture desktop screenshot remotely", "category": "Collection", "risk": "medium"},
    {"id": "persistence", "name": "Persist", "description": "Install persistence mechanism via registry", "category": "Persistence", "risk": "high"},
]


class PayloadRequest(BaseModel):
    payload_id: str
    target: Optional[str] = None


@router.get("/payloads")
async def list_payloads():
    categories = sorted(set(p["category"] for p in PAYLOAD_LIBRARY))
    return {"payloads": PAYLOAD_LIBRARY, "categories": categories, "total": len(PAYLOAD_LIBRARY)}


@router.post("/deploy")
async def deploy_payload(req: PayloadRequest):
    payload = next((p for p in PAYLOAD_LIBRARY if p["id"] == req.payload_id), None)
    if not payload:
        raise HTTPException(404, f"Payload {req.payload_id} not found")
    return {
        "status": "deployed",
        "payload": payload["name"],
        "target": req.target or "localhost",
        "session_id": f"FLIP-{random.randint(10000, 99999)}",
        "success": random.random() > 0.2,
    }


@router.get("/stats")
async def get_stats():
    return {
        "active_sessions": random.randint(0, 10),
        "total_payloads": len(PAYLOAD_LIBRARY),
        "deployments_today": random.randint(0, 50),
        "success_rate": f"{round(random.uniform(70, 98), 1)}%",
    }
