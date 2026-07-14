from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SIGNALGUARD API GATEWAY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app = FastAPI(
    title="SignalGuard API Gateway",
    description="Enterprise Gateway for HumanLayer Security Platform (HX-Core)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MODELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class VoiceSessionRequest(BaseModel):
    client_id: str
    stream_type: str = "webrtc" # or 'sip'
    encoding: str = "opus"

class CampaignRequest(BaseModel):
    name: str
    target_group: str
    scenario_id: str
    voice_clone_id: Optional[str] = None

class Alert(BaseModel):
    id: str
    timestamp: datetime
    severity: str
    source: str
    description: str
    status: str

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUTES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import httpx

# Microservice URLs
REDOPS_URL = "http://localhost:8001"
BLUEOPS_URL = "http://localhost:8002"

# --- Voice Service Proxy ---
voice_router = APIRouter(prefix="/api/v1/voice", tags=["Voice Edge"])

@voice_router.get("/sessions")
async def list_voice_sessions():
    # still mock for now until Voice service implemented
    return [
        {"id": "V-1029", "status": "active", "channel": "Encrypted #892", "encoding": "opus", "risk": "safe"},
        {"id": "V-1033", "status": "active", "channel": "Encrypted #991", "encoding": "opus", "risk": "safe"},
        {"id": "V-1045", "status": "active", "channel": "Encrypted #112", "encoding": "opus", "risk": "high", "flags": ["deepfake"]}
    ]

@voice_router.post("/session")
async def create_voice_session(request: VoiceSessionRequest):
    session_id = str(uuid.uuid4())
    return {
        "status": "initialized",
        "session_id": session_id,
        "websocket_url": f"wss://voice-edge.signalguard.internal/stream/{session_id}",
        "vad_enabled": True
    }

@voice_router.post("/session/{session_id}/terminate")
async def terminate_session(session_id: str):
    return {"status": "terminated", "session_id": session_id, "timestamp": datetime.now()}

# --- RedOps Service Proxy ---
redops_router = APIRouter(prefix="/api/v1/redops", tags=["Red Team Operations"])

@redops_router.post("/campaign")
async def start_campaign(campaign: CampaignRequest):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{REDOPS_URL}/campaigns", json=campaign.dict())
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"RedOps Service Unreachable: {e}")

# --- BlueOps Service Proxy ---
blueops_router = APIRouter(prefix="/api/v1/blueops", tags=["Blue Team Defense"])

@blueops_router.get("/alerts", response_model=List[Alert])
async def get_alerts():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{BLUEOPS_URL}/alerts")
            return resp.json()
        except Exception as e:
            # Fallback to empty if service down
            print(f"BlueOps Error: {e}")
            return []

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# APP ASSEMBLY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.include_router(voice_router)
app.include_router(redops_router)
app.include_router(blueops_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
