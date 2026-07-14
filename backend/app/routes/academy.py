
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.models.academy_sql import (
    AcademyModule, AcademyCourse, AcademyLab, AcademyLabSession, 
    AcademyEvent, AcademyAuditEvent, AcademyWriteup
)
from app.models.sql import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/academy", tags=["Academy"])

# --- DTOs ---
class LabStartRequest(BaseModel):
    lab_id: int
    cohort_id: Optional[int] = None

class ToolRunRequest(BaseModel):
    lab_session_id: int
    tool_id: str
    params: dict

class WriteupUpdate(BaseModel):
    markdown: str

# --- Endpoints ---

@router.get("/catalog")
def get_catalog(db: Session = Depends(get_db)):
    modules = db.query(AcademyModule).all()
    # Simple nested serialization would be better with Pydantic schemata but keeping it simple
    return modules

@router.get("/labs")
def get_labs(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AcademyLab).filter(AcademyLab.enabled == True)
    if category:
        query = query.filter(AcademyLab.category == category)
    return query.all()

@router.post("/labs/{lab_id}/start")
def start_lab(lab_id: int, req: LabStartRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    
    lab = db.query(AcademyLab).filter(AcademyLab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")

    # Create Session
    session = AcademyLabSession(
        org_id=current_user.org_id,
        lab_id=lab_id,
        cohort_id=req.cohort_id,
        user_id=user_id,
        status="active"
    )
    db.add(session)
    
    # Audit
    audit = AcademyAuditEvent(
        org_id=current_user.org_id, user_id=user_id, action="LAB_START",
        entity_type="lab", entity_id=str(lab_id), metadata_json={}
    )
    db.add(audit)
    db.commit()
    return {"status": "started", "session_id": session.id}

@router.post("/labs/{lab_id}/stop")
def stop_lab(lab_id: int, session_id: int, db: Session = Depends(get_db)):
    session = db.query(AcademyLabSession).filter(AcademyLabSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
    
    session.ended_at = datetime.utcnow()
    session.status = "closed"
    db.commit()
    return {"status": "stopped"}

@router.post("/tools/run")
def run_tool_safe(req: ToolRunRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Verify Session
    session = db.query(AcademyLabSession).filter(AcademyLabSession.id == req.lab_session_id, AcademyLabSession.status == "active").first()
    if not session:
        raise HTTPException(403, "Lab session not active")
    
    # 2. Get Lab Config
    lab = db.query(AcademyLab).filter(AcademyLab.id == session.lab_id).first()
    
    # 3. Allowlist Check
    allowed_tools = lab.tools_allowlist_json or []
    if req.tool_id not in allowed_tools:
        raise HTTPException(403, f"Tool '{req.tool_id}' not allowed in this lab")
    
    # 4. Resolve Internal Target (simulated)
    # In real impl, use lab.endpoints_json to get target IP
    target = lab.endpoints_json.get("target_host", "localhost") if lab.endpoints_json else "localhost"
    
    # 5. Log Audit
    audit = AcademyAuditEvent(
        org_id=session.org_id, user_id=session.user_id, action="TOOL_RUN",
        entity_type="tool", entity_id=req.tool_id, metadata_json=req.params
    )
    db.add(audit)
    db.commit()
    
    # 6. Execute (Mocked / Forward to Tools API)
    # Here we would call httpx.post("http://tools-api:8000/tools/academy/run", ...)
    # For now, we synthesize an event
    
    evt = AcademyEvent(
        org_id=session.org_id, lab_session_id=session.id, event_type="TOOL_OUTPUT",
        payload_json={"tool": req.tool_id, "output": f"Scanning {target}...\n[+] Open port 80\n[+] Finished."}
    )
    db.add(evt)
    db.commit()
    
    return {"status": "queued", "audit_id": audit.id}

@router.get("/stream/telemetry")
async def stream_telemetry(lab_session_id: int, db: Session = Depends(get_db)):
    # SSE Endpoint Placeholder - reusing existing SSE logic pattern
    # In FastApi usually streaming response
    return {"msg": "Connect to /api/events/stream filtered by session_id via frontend"}

@router.post("/writeups/{session_id}")
def update_writeup(session_id: int, update: WriteupUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    
    writeup = db.query(AcademyWriteup).filter(AcademyWriteup.lab_session_id == session_id).first()
    if not writeup:
        writeup = AcademyWriteup(
            org_id=current_user.org_id, lab_session_id=session_id, user_id=user_id,
            markdown=update.markdown
        )
        db.add(writeup)
    else:
        writeup.markdown = update.markdown
        writeup.updated_at = datetime.utcnow()
    
    db.commit()
    return {"status": "saved"}
