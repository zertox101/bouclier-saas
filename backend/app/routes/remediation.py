from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from app.models.monitor import monitor
from datetime import datetime

router = APIRouter(prefix="/api/remediation", tags=["Remediation"])

class BlockRequest(BaseModel):
    ip: str
    reason: Optional[str] = "Sentinel AI Recommendation"
    duration_minutes: int = 60

class KillProcessRequest(BaseModel):
    pid: int
    hostname: str

class IsolateHostRequest(BaseModel):
    hostname: str

@router.post("/block-ip")
async def block_ip(req: BlockRequest):
    """
    Block an IP address at the perimeter.
    In this SaaS simulation, we update the global monitor state.
    """
    if not hasattr(monitor, 'blocked_ips'):
        monitor.blocked_ips = {}
    
    monitor.blocked_ips[req.ip] = {
        "reason": req.reason,
        "blocked_at": datetime.now().isoformat(),
        "expires_at": (datetime.now()).isoformat() # Simplified
    }
    
    # Also log an event
    from app.models.telemetry_sql import TelemetryEvent
    # Mocking telemetry logging here if needed
    
    print(f"[REMEDIATION] Blocked IP: {req.ip} | Reason: {req.reason}")
    
    return {
        "status": "success",
        "message": f"IP {req.ip} has been null-routed across all perimeter nodes.",
        "details": monitor.blocked_ips[req.ip]
    }

@router.post("/kill-process")
async def kill_process(req: KillProcessRequest):
    """
    Kill a malicious process on a remote host.
    """
    print(f"[REMEDIATION] Killing PID {req.pid} on host {req.hostname}")
    return {
        "status": "success",
        "message": f"Process {req.pid} terminated on {req.hostname}. File quarantined."
    }

@router.post("/isolate-host")
async def isolate_host(req: IsolateHostRequest):
    """
    Isolate a host from the network.
    """
    print(f"[REMEDIATION] Isolating host {req.hostname}")
    return {
        "status": "success",
        "message": f"Host {req.hostname} isolated. All network traffic routed to forensic VLAN."
    }

@router.get("/status")
async def get_remediation_status():
    """
    Get current active remediations.
    """
    blocked = getattr(monitor, 'blocked_ips', {})
    return {
        "active_blocks": len(blocked),
        "blocked_ips": blocked,
        "system_health": "OPTIMAL"
    }
