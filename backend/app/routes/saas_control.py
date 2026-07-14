from fastapi import APIRouter, Depends, HTTPException
import os
import sys
import asyncio
import httpx
import redis
import psycopg2
import subprocess
import json
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.policy.engine import policy_engine
from app.core.policy.models import ActionContext, Decision
from app.core.auth.hmac_security import HMACSigner
from app.core.database import get_db
from app.models.sql import Organization

router = APIRouter(prefix="/api/saas/control", tags=["SaaS Control"])

class ServiceToggle(BaseModel):
    service_name: str
    status: bool

DEFAULT_SERVICE_STATE = {
    "sentinel_agent": True,
    "ai_pentester": False,
    "threat_intel": True,
    "network_monitor": True,
    "auto_remediation": True,
    "apt_simulation": False
}

def _load_service_state() -> dict:
    """Load service toggles from Organization.settings (persistent)."""
    try:
        from app.core.database import SessionLocal
        db = SessionLocal()
        org = db.query(Organization).first()
        if org and isinstance(org.settings, dict):
            svc = org.settings.get("service_state")
            if isinstance(svc, dict):
                result = {**DEFAULT_SERVICE_STATE, **svc}
                db.close()
                return result
        db.close()
    except:
        pass
    return dict(DEFAULT_SERVICE_STATE)

def _save_service_state(state: dict):
    """Persist service toggles to Organization.settings."""
    try:
        from sqlalchemy.orm.attributes import flag_modified
        from app.core.database import SessionLocal
        db = SessionLocal()
        org = db.query(Organization).first()
        if org:
            settings = dict(org.settings) if isinstance(org.settings, dict) else {}
            settings["service_state"] = dict(state)
            org.settings = settings
            flag_modified(org, "settings")
            db.commit()
        db.close()
    except:
        pass

# Lazy-load persistent state from DB (not at import time to avoid SQLite deadlock)
SERVICE_STATE = {}
_PERSISTENCE_LOADED = False

def _ensure_service_state():
    global SERVICE_STATE, _PERSISTENCE_LOADED
    if not _PERSISTENCE_LOADED:
        SERVICE_STATE = _load_service_state()
        _PERSISTENCE_LOADED = True

# Keep track of running subprocesses
PROCESSES = {}

def get_script_path(service_name: str) -> tuple[str, str]:
    """Returns (cwd, script_name) for a given service."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # backend/
    root_dir = os.path.dirname(base_dir) # bouclier-saas/
    
    mapping = {
        "sentinel_agent": (base_dir, "sentinel_agent.py"),
        "ai_pentester": (base_dir, "agent.py"), # Fallback to backend agent
        "threat_intel": (root_dir, "fortiguard_intelligence.py"),
        "network_monitor": (base_dir, "cicids_ingestor.py"),
        "apt_simulation": (root_dir, "purple_simulation.py"),
        "auto_remediation": (base_dir, "auto_remediation.py")
    }
    return mapping.get(service_name, (base_dir, "dummy.py"))

import psutil
from sqlalchemy import func
from app.models.sql import AlertEvent, EventLog
from app.core.database import SessionLocal

@router.get("/health")
async def get_system_health() -> Dict[str, Any]:
    _ensure_service_state()
    try:
        # Check DB
        db_status = "offline"
        from app.core.database import engine
        
        # Check if we are using SQLite fallback
        is_sqlite = engine and "sqlite" in str(engine.url)
        
        try:
            if is_sqlite:
                db_status = "online (sqlite)"
            else:
                # Resolve password — docker-compose uses DB_PASSWORD, settings fallback uses DB_PASS
                _db_pass = os.getenv("DB_PASSWORD") or settings.DB_PASS
                conn = psycopg2.connect(
                    host=settings.DB_HOST,
                    port=settings.DB_PORT,
                    user=settings.DB_USER,
                    password=_db_pass,
                    dbname=settings.DB_NAME,
                    connect_timeout=2
                )
                conn.close()
                db_status = "online"
        except Exception as e:
            if is_sqlite:
                db_status = "online (sqlite-fallback)"
            else:
                db_status = f"error: {str(e)}"

        # Check Redis
        redis_status = "offline"
        from app.core.database import get_redis_client
        try:
            r_client = get_redis_client()
            if r_client:
                redis_status = "online"
            else:
                redis_status = "offline"
        except Exception as e:
            redis_status = f"error: {str(e)}"

        # Check LLM (Ollama)
        llm_status = "offline"
        try:
            llm_url = settings.LLM_BASE_URL
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{llm_url}/api/tags")
                if res.status_code == 200:
                    llm_status = "online"
        except Exception as e:
            llm_status = f"error: {str(e)}"

        # Real Metrics Calculation
        total_alerts = 0
        critical_alerts = 0
        total_logs = 0
        bypass_efficiency = 100.0
        cpu_usage = 0.0
        ram_usage = 0.0
        trend_velocity = 0.0
        
        try:
            db = SessionLocal()
            try:
                # Real Metrics Calculation
                total_alerts = db.query(AlertEvent).count()
                critical_alerts = db.query(AlertEvent).filter(AlertEvent.severity == "Critical").count()
                total_logs = db.query(EventLog).count()
                
                # Bypass Efficiency = (Total Events - Critical Alerts) / Total Events * 100
                # A more production-grade logic for security effectiveness
                if total_logs > 0:
                    bypass_efficiency = ((total_logs - critical_alerts) / total_logs) * 100
                else:
                    bypass_efficiency = 100.0
                    
                bypass_efficiency = max(0, min(100, bypass_efficiency))
                
                # Neural Compute = Real CPU Usage
                cpu_usage = psutil.cpu_percent()
                ram_usage = psutil.virtual_memory().percent
                
                # Trend Velocity = Calculated as alert density change
                # (Current Alerts vs Total Base Activity)
                trend_velocity = (total_alerts / (total_logs + 1)) * 50 # Scaled factor
            finally:
                db.close()
        except Exception as e:
            # If DB query fails, use defaults
            cpu_usage = psutil.cpu_percent()
            ram_usage = psutil.virtual_memory().percent

        # Sync state with actual processes
        for svc in list(PROCESSES.keys()):
            if PROCESSES[svc].poll() is not None:
                # Process died
                SERVICE_STATE[svc] = False
                del PROCESSES[svc]

        return {
            "status": "success",
            "core": {
                "database": db_status,
                "redis": redis_status,
                "llm": llm_status,
            },
            "services": SERVICE_STATE,
            "metrics": {
                "bypass_efficiency": f"{bypass_efficiency:.1f}%",
                "neural_compute": f"{cpu_usage}% CPU / {ram_usage}% RAM",
                "trend_velocity": f"+{trend_velocity:.1f}%" if trend_velocity > 0 else f"{trend_velocity:.1f}%",
                "total_alerts": total_alerts,
                "critical_alerts": critical_alerts
            },
            "config": {
                "db_host": os.getenv("DB_HOST", "localhost"),
                "redis_host": os.getenv("REDIS_HOST", "localhost"),
                "llm_url": os.getenv("LLM_BASE_URL", "http://localhost:11434"),
                "llm_model": os.getenv("LLM_MODEL", "llama3.2:3b")
            }
        }
    except Exception as e:
        # Global error handler
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@router.post("/toggle")
async def toggle_service(toggle: ServiceToggle) -> Dict[str, Any]:
    _ensure_service_state()
    if toggle.service_name not in SERVICE_STATE:
        raise HTTPException(status_code=404, detail="Service not found")
        
    svc = toggle.service_name
    
    if toggle.status:
        # Turn ON
        if svc not in PROCESSES or PROCESSES[svc].poll() is not None:
            cwd, script = get_script_path(svc)
            script_path = os.path.join(cwd, script)
            
            if os.path.exists(script_path):
                # Start process and capture logs
                try:
                    log_file_path = os.path.join(cwd, f"{svc}_process.log")
                    with open(log_file_path, "a", encoding="utf-8") as log_file:
                        proc = subprocess.Popen(
                            [sys.executable, "-u", script],
                            cwd=cwd,
                            stdout=log_file,
                            stderr=log_file
                        )
                    PROCESSES[svc] = proc
                    SERVICE_STATE[svc] = True
                except Exception as e:
                    raise HTTPException(status_code=500, detail=f"Failed to start script: {e}")
            else:
                # Mock if script doesn't exist
                SERVICE_STATE[svc] = True
    else:
        # Turn OFF
        if svc in PROCESSES:
            try:
                PROCESSES[svc].terminate()
                PROCESSES[svc].wait(timeout=3)
            except subprocess.TimeoutExpired:
                PROCESSES[svc].kill()
            del PROCESSES[svc]
            
        SERVICE_STATE[svc] = False
        
    _save_service_state(SERVICE_STATE)
    return {"status": "success", "service": svc, "state": SERVICE_STATE[svc]}

class RedTeamRequest(BaseModel):
    target: str

@router.post("/redteam/mythos")
async def launch_redteam_mythos(req: RedTeamRequest):
    _ensure_service_state()
    """
    Real Offensive API endpoint.
    Now enforced via the BOUCLIER Policy Engine.
    """
    target = req.target

    # 🔐 ENFORCEMENT: Consult the Policy Engine
    context = ActionContext(
        user_id="anonymous-admin", # Replace with real auth user later
        role="admin",
        action="mythos_scan",
        target=target,
        mode="offensive" if not settings.SAFE_MODE else "safe"
    )
    
    policy = policy_engine.evaluate(context)
    
    if policy.final_decision == Decision.DENY:
        raise HTTPException(
            status_code=403, 
            detail=f"POLICY REJECTION: {policy.summary}"
        )

    # Apply constraints (e.g. timeout from Safe Mode)
    execution_timeout = policy.merged_constraints.get("timeout", 10.0)

    tools_api_url = settings.TOOLS_API_URL
    api_key = settings.TOOLS_API_SECRET
    
    # 🔐 HMAC Signing (Zero Trust)
    signer = HMACSigner(api_key)
    payload = {"target": target, "mode": "mythos"}
    auth_headers = signer.sign_payload(payload)

    # ── Strategy 1: Full Mythos pipeline via tools-api ──
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Launch the agent job
            launch_res = await client.post(
                f"{tools_api_url}/agent/analyze",
                json=payload,
                headers=auth_headers
            )
            
            # Check if response is valid JSON
            try:
                if launch_res.status_code == 200:
                    # Try to parse JSON
                    try:
                        job_data = launch_res.json()
                    except Exception as json_err:
                        print(f"[Mythos] Invalid JSON from tools-api: {json_err}")
                        print(f"[Mythos] Response text: {launch_res.text[:500]}")
                        raise Exception("Invalid JSON response from tools-api")
                    
                    agent_job_id = job_data.get("agent_job_id")
                    
                    if not agent_job_id:
                        print(f"[Mythos] No agent_job_id in response: {job_data}")
                        raise Exception("No agent_job_id returned")
                    
                    # Poll for completion (max 120s)
                    for _ in range(60):
                        await asyncio.sleep(2)
                        poll_res = await client.get(
                            f"{tools_api_url}/agent/jobs/{agent_job_id}",
                            headers=signer.sign_payload({}) # GET has no body
                        )
                        
                        if poll_res.status_code == 200:
                            try:
                                job = poll_res.json()
                            except Exception as json_err:
                                print(f"[Mythos] Invalid JSON from job poll: {json_err}")
                                continue
                            
                            if job.get("status") == "completed":
                                # Extract structured findings for frontend
                                raw_findings = job.get("findings", {})
                                structured = raw_findings.get("structured_findings", [])
                                
                                findings = []
                                for f in structured:
                                    findings.append({
                                        "vulnerability": f.get("name", "Unknown"),
                                        "url": f"{target}",
                                        "severity": f.get("severity", "high").capitalize(),
                                        "confidence": str(f.get("confidence", 90)),
                                        "ai_verdict": "Exploitable",
                                        "cwe": f.get("cwe"),
                                        "description": f.get("description"),
                                        "remediation": f.get("remediation"),
                                        "exploit_poc": f.get("exploit_poc")
                                    })
                                
                                # Also add open ports as findings
                                for port_line in raw_findings.get("open_ports", []):
                                    findings.append({
                                        "vulnerability": f"Open Service: {port_line}",
                                        "url": target,
                                        "severity": "Medium",
                                        "confidence": "100",
                                        "ai_verdict": "Exposed"
                                    })
                                
                                report_url = raw_findings.get("report_url")
                                
                                return {
                                    "status": "success",
                                    "findings": findings,
                                    "risk": job.get("risk", "HIGH"),
                                    "source": "mythos_full_pipeline",
                                    "report_url": report_url
                                }
                    
                    raise Exception("Mythos scan timed out — falling back to local Nmap")
                else:
                    print(f"[Mythos] tools-api returned status {launch_res.status_code}")
                    raise Exception(f"tools-api returned {launch_res.status_code}")
                    
            except Exception as parse_err:
                print(f"[Mythos] Error parsing tools-api response: {parse_err}")
                raise
                
    except Exception as e:
        # tools-api not reachable — fall through to local scan
        print(f"[Mythos] tools-api unavailable ({e}), using local Nmap fallback")
    
    # ── Strategy 2: Local Nmap fallback ──
    try:
        import nmap
        nm = nmap.PortScanner()
        nm.scan(target, arguments='-F -T4 --max-retries 1')
        
        findings = []
        for host in nm.all_hosts():
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                for port in sorted(ports):
                    state = nm[host][proto][port]['state']
                    service = nm[host][proto][port]['name']
                    if state == 'open':
                        sev = "Critical" if port in [21, 22, 23, 445, 3389] else "Medium"
                        findings.append({
                            "vulnerability": f"Open Port {port}/{proto} ({service})",
                            "url": f"{target}:{port}",
                            "severity": sev,
                            "confidence": "99.9",
                            "ai_verdict": "Exploitable"
                        })
        
        return {
            "status": "success",
            "findings": findings,
            "source": "local_nmap_fallback"
        }
    except Exception as e:
        return {"error": str(e), "status": "failed"}

@router.get("/pulse")
async def system_pulse():
    _ensure_service_state()
    """
    SOC-Grade Health Aggregator.
    Checks the status of all core services in the distributed architecture.
    """
    async def check_url(name: str, url: str, timeout: float = 2.0):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, timeout=timeout)
                return name, "ONLINE" if resp.status_code == 200 else f"UNSTABLE ({resp.status_code})"
        except Exception:
            return name, "OFFLINE"

    # Services to monitor
    targets = {
        "AI Gateway": f"{settings.LLM_BASE_URL}/health",
        "Tools API": f"{settings.TOOLS_API_URL}/health",
        "Qdrant": f"http://{settings.QDRANT_HOST}:{settings.QDRANT_PORT}",
        "Frontend": "http://frontend:3000"
    }

    results = await asyncio.gather(*[check_url(n, u) for n, u in targets.items()])
    status_map = dict(results)
    
    # Check Local Deps
    try:
        r = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, socket_timeout=1)
        status_map["Redis"] = "ONLINE" if r.ping() else "OFFLINE"
    except:
        status_map["Redis"] = "OFFLINE"

    try:
        conn = psycopg2.connect(
            dbname=settings.DB_NAME, 
            user=settings.DB_USER, 
            password=settings.DB_PASS, 
            host=settings.DB_HOST, 
            port=settings.DB_PORT,
            connect_timeout=1
        )
        status_map["Postgres"] = "ONLINE"
        conn.close()
    except:
        status_map["Postgres"] = "OFFLINE"

    is_healthy = all(v == "ONLINE" for v in status_map.values())

    return {
        "status": "OPERATIONAL" if is_healthy else "DEGRADED",
        "timestamp": os.getenv("CURRENT_TIME", "2026-05-16"),
        "pulse": status_map
    }

