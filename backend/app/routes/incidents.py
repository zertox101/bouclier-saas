from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.sql import Incident, User
from app.routes.auth import oauth2_scheme_optional

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


def _normalize_severity(s):
    if not s:
        return "low"
    s = s.lower()
    if s in ("critical", "critique"):
        return "critical"
    if s in ("high", "haut", "elevé", "élevé"):
        return "high"
    if s in ("medium", "moyen"):
        return "medium"
    return "low"

def _normalize_status(s):
    if not s:
        return "open"
    s = s.lower().replace("_", " ").replace("-", " ")
    if s in ("open", "ouvert"):
        return "open"
    if s in ("in progress", "in_progress", "en cours"):
        return "in_progress"
    if s in ("resolved", "résolu", "resolu"):
        return "resolved"
    if s in ("closed", "fermé", "ferme"):
        return "closed"
    return "open"

def _sanitize_incident(inc):
    return {
        "id": inc.id,
        "title": inc.title,
        "description": inc.description,
        "severity": _normalize_severity(inc.severity),
        "status": _normalize_status(inc.status),
        "owner": inc.owner,
        "alerts": inc.alerts or [],
        "timeline": inc.timeline or [],
        "org_id": inc.org_id,
        "created_at": inc.created_at.isoformat() if inc.created_at else None,
        "updated_at": inc.updated_at.isoformat() if inc.updated_at else None,
    }

def _resolve_org(request: Request, token: Optional[str] = None) -> str:
    org_id = request.headers.get("X-Organization-ID")
    if org_id:
        return org_id
    if token:
        try:
            payload = decode_access_token(token)
            if payload and payload.get("org_id"):
                return payload["org_id"]
        except Exception:
            pass
    return "default"

class TimelineItem(BaseModel):
    time: str
    action: str
    user: str

class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str
    owner: str
    alerts: Optional[List[str]] = []

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    owner: Optional[str] = None
    description: Optional[str] = None

@router.get("/")
def list_incidents(request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_org(request, token)
    return [_sanitize_incident(i) for i in db.query(Incident).filter(Incident.org_id == org_id).order_by(Incident.created_at.desc()).all()]

@router.get("/{incident_id}")
def get_incident(incident_id: int, request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_org(request, token)
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.org_id == org_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return _sanitize_incident(incident)

@router.post("/")
def create_incident(req: IncidentCreate, request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_org(request, token)
    new_incident = Incident(
        title=req.title,
        description=req.description,
        severity=req.severity,
        owner=req.owner,
        alerts=req.alerts,
        org_id=org_id,
        timeline=[{
            "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "action": "Incident Created",
            "user": req.owner
        }]
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return _sanitize_incident(new_incident)

@router.patch("/{incident_id}")
def update_incident(incident_id: int, req: IncidentUpdate, request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_org(request, token)
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.org_id == org_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    if req.status:
        incident.status = req.status
        incident.timeline.append({
            "time": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "action": f"Status updated to {req.status}",
            "user": "System"
        })
    if req.severity:
        incident.severity = req.severity
    if req.owner:
        incident.owner = req.owner
    if req.description:
        incident.description = req.description
        
    db.commit()
    db.refresh(incident)
    return _sanitize_incident(incident)

@router.delete("/{incident_id}")
def delete_incident(incident_id: int, request: Request, db: Session = Depends(get_db), token: Optional[str] = Depends(oauth2_scheme_optional)):
    org_id = _resolve_org(request, token)
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.org_id == org_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"status": "success"}
