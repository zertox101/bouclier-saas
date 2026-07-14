from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import Incident
from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Optional


router = APIRouter(prefix="/api/soc/incidents", tags=["soc-incidents"])


class IncidentCreate(BaseModel):
    title: str
    description: str = ""
    severity: str = "Medium"
    status: str = "Open"
    owner: Optional[str] = None


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None


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

class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    owner: Optional[str] = None
    alerts: Optional[list] = None
    timeline: Optional[list] = None
    created_at: str = ""
    updated_at: str = ""

    @field_validator("created_at", "updated_at", mode="before")
    @classmethod
    def coerce_dt(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v or ""

    @field_validator("alerts", "timeline", mode="before")
    @classmethod
    def coerce_list(cls, v):
        return v or []

    @field_validator("severity", mode="before")
    @classmethod
    def normalize_severity(cls, v):
        return _normalize_severity(v)

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        return _normalize_status(v)

    class Config:
        from_attributes = True


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:read")),
    status: str = None,
    severity: str = None,
    skip: int = 0,
    limit: int = 50,
):
    """ANALYST - list incidents in their organization"""
    query = db.query(Incident).filter(Incident.org_id == org_id)
    
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    
    incidents = query.order_by(Incident.created_at.desc()).offset(skip).limit(limit).all()
    return incidents


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:write")),
):
    """ANALYST - create incident in their organization"""
    incident = Incident(
        org_id=org_id,
        title=data.title,
        description=data.description,
        severity=data.severity,
        status=data.status,
        owner=data.owner or current_user.username,
        timeline=[{
            "time": datetime.utcnow().isoformat(),
            "action": "Created",
            "user": current_user.username,
        }],
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:read")),
):
    """ANALYST - get incident in their organization"""
    incident = db.query(Incident).filter(
        Incident.id == incident_id, Incident.org_id == org_id
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.put("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int,
    data: IncidentUpdate,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:write")),
):
    """ANALYST - update incident in their organization"""
    incident = db.query(Incident).filter(
        Incident.id == incident_id, Incident.org_id == org_id
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(incident, key):
            setattr(incident, key, value)
    
    # Add to timeline
    if incident.timeline is None:
        incident.timeline = []
    incident.timeline.append({
        "time": datetime.utcnow().isoformat(),
        "action": "Updated",
        "user": current_user.username,
        "changes": list(update_data.keys()),
    })
    
    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:delete")),
):
    """ANALYST - delete incident in their organization"""
    incident = db.query(Incident).filter(
        Incident.id == incident_id, Incident.org_id == org_id
    ).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    db.delete(incident)
    db.commit()