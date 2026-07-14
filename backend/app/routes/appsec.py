
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import base64
from datetime import datetime

from app.core.database import get_db
from app.models.appsec_sql import AppSecSession, AppSecRequest, AppSecFinding
from app.models.sql import User
from app.routes.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/appsec", tags=["AppSec / Burp Integration"])

class FindingCreate(BaseModel):
    title: str
    severity: str
    description: str
    owasp_category: str = "Uncategorized"

def parse_burp_item(item: Dict) -> Dict[str, Any]:
    # Defensive parsing of generic JSON export
    req = {}
    req['method'] = item.get('method', 'GET')
    req['url'] = item.get('url', '')
    req['status'] = item.get('status', item.get('response', {}).get('status', 0))
    
    # Redact sensitive headers
    headers = item.get('request', {}).get('headers', {})
    if 'Authorization' in headers:
        headers['Authorization'] = '[REDACTED]'
    if 'Cookie' in headers:
        headers['Cookie'] = '[REDACTED]'
    req['request_headers'] = headers
    
    return req

@router.post("/import")
async def import_appsec_session(
    file: UploadFile = File(...),
    name: str = "Imported Session",
    tool: str = "BURP",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve user org context
    org_id = current_user.org_id
    user_id = str(current_user.id)
    
    # Create Session
    session = AppSecSession(
        org_id=org_id,
        user_id=user_id,
        name=name,
        tool_source=tool,
        created_at=datetime.utcnow()
    )
    db.add(session)
    db.flush()
    
    # Process File
    content = await file.read()
    try:
        data = json.loads(content)
        items = data.get('items', []) if isinstance(data, dict) else data if isinstance(data, list) else []
        
        count = 0
        for item in items[:200]: # Limit 200 for MVP safety
            parsed = parse_burp_item(item)
            req_entry = AppSecRequest(
                session_id=session.id,
                method=parsed['method'],
                url=parsed['url'],
                status_code=parsed['status'],
                request_headers=parsed['request_headers']
            )
            db.add(req_entry)
            count += 1
            
        session.total_requests = count
        db.commit()
        return {"status": "success", "session_id": session.id, "imported_count": count}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Filter by org_id
    return db.query(AppSecSession).filter(AppSecSession.org_id == current_user.org_id).order_by(AppSecSession.created_at.desc()).all()

@router.get("/sessions/{session_id}")
def get_session_details(session_id: int, db: Session = Depends(get_db)):
    session = db.query(AppSecSession).filter(AppSecSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
        
    requests = db.query(AppSecRequest).filter(AppSecRequest.session_id == session_id).limit(50).all()
    findings = db.query(AppSecFinding).filter(AppSecFinding.session_id == session_id).all()
    
    return {
        "session": session,
        "requests": requests,
        "findings": findings
    }

@router.post("/sessions/{session_id}/findings")
def add_finding(session_id: int, finding: FindingCreate, db: Session = Depends(get_db)):
    session = db.query(AppSecSession).filter(AppSecSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")
        
    new_finding = AppSecFinding(
        session_id=session_id,
        title=finding.title,
        severity=finding.severity,
        description=finding.description,
        owasp_category=finding.owasp_category
    )
    db.add(new_finding)
    db.commit()
    return {"status": "created", "id": new_finding.id}
