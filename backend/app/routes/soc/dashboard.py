from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import Incident, Asset, AlertEvent, AuditLog


router = APIRouter(prefix="/api/soc", tags=["soc-dashboard"])


@router.get("/dashboard")
async def get_soc_dashboard(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:read")),
):
    """ANALYST - SOC dashboard with key metrics"""
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    
    # Incident metrics
    total_incidents = db.query(Incident).filter(Incident.org_id == org_id).count()
    open_incidents = db.query(Incident).filter(
        Incident.org_id == org_id, Incident.status == "Open"
    ).count()
    critical_incidents = db.query(Incident).filter(
        Incident.org_id == org_id, Incident.severity == "Critical"
    ).count()
    
    # Recent incidents
    recent_incidents = db.query(Incident).filter(
        Incident.org_id == org_id
    ).order_by(Incident.created_at.desc()).limit(5).all()
    
    # Asset metrics
    total_assets = db.query(Asset).filter(Asset.org_id == org_id).count()
    at_risk_assets = db.query(Asset).filter(
        Asset.org_id == org_id, Asset.risk_level.in_(["High", "Critical"])
    ).count()
    
    # Alert metrics (last 24h)
    alerts_24h = db.query(AlertEvent).filter(
        AlertEvent.org_id == org_id,
        AlertEvent.timestamp >= day_ago
    ).count()
    
    alerts_by_severity = db.query(
        AlertEvent.severity, func.count(AlertEvent.id)
    ).filter(
        AlertEvent.org_id == org_id,
        AlertEvent.timestamp >= day_ago
    ).group_by(AlertEvent.severity).all()
    
    return {
        "incidents": {
            "total": total_incidents,
            "open": open_incidents,
            "critical": critical_incidents,
            "recent": [
                {
                    "id": i.id,
                    "title": i.title,
                    "severity": i.severity,
                    "status": i.status,
                    "created_at": i.created_at.isoformat() if i.created_at else None,
                }
                for i in recent_incidents
            ],
        },
        "assets": {
            "total": total_assets,
            "at_risk": at_risk_assets,
        },
        "alerts_24h": {
            "total": alerts_24h,
            "by_severity": dict(alerts_by_severity),
        },
    }