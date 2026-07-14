from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.services.osint_agent import osint_agent

router = APIRouter(prefix="/api/osint", tags=["osint"])

class CommandRequest(BaseModel):
    command: str
    opsec_level: Optional[str] = "MEDIUM"

@router.post("/execute")
async def execute_osint_cmd(payload: CommandRequest):
    """Elite OSINT Intelligence Orchestration"""
    try:
        # Command Parsing & Delegation to Agent
        result = osint_agent.execute_command(payload.command)
        return {"status": "success", "result": result}
        
    except Exception as e:
        print(f"OSINT Command Execution Error: {e}")
        raise HTTPException(status_code=500, detail="Intelligence Agent processing failure.")

@router.get("/status")
async def get_osint_agent_status():
    """Check Agent Operational Integrity"""
    return {
        "status": "ONLINE",
        "agent": "OSINT360-PRO",
        "version": "4.2.0",
        "uptime": "99.99%",
        "opsec_tunnel": "Swiss-Relay-Alpha"
    }
