from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import User, Incident, AlertEvent, Asset

router = APIRouter(prefix="/api/org/dashboard", tags=["org-dashboard"])

@router.get("")
async def get_org_dashboard(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("dashboard:read")),
):
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)

    user_count = db.query(User).filter(User.org_id == org_id).count()
    active_today = db.query(User).filter(User.org_id == org_id, User.last_login >= day_ago).count() if db.query(User).filter(User.org_id == org_id, User.last_login.isnot(None)).first() else 0
    pending_invites = db.query(User).filter(User.org_id == org_id, User.is_active == False).count()

    total_incidents = db.query(Incident).filter(Incident.org_id == org_id).count()
    critical_incidents = db.query(Incident).filter(Incident.org_id == org_id, Incident.severity == "Critical").count()
    resolved_month = db.query(Incident).filter(
        Incident.org_id == org_id, Incident.status == "Resolved",
        Incident.updated_at >= now - timedelta(days=30)
    ).count()

    total_assets = db.query(Asset).filter(Asset.org_id == org_id).count()
    at_risk_assets = db.query(Asset).filter(Asset.org_id == org_id, Asset.risk_level.in_(["High", "Critical"])).count()
    security_score = round(max(0, 100 - (at_risk_assets / max(total_assets, 1)) * 50 - (critical_incidents / max(total_incidents, 1)) * 30), 1)

    alerts_24h = db.query(AlertEvent).filter(AlertEvent.org_id == org_id, AlertEvent.timestamp >= day_ago).count()

    last_scan = db.query(Incident.created_at).filter(Incident.org_id == org_id).order_by(Incident.created_at.desc()).first()
    last_scan_str = last_scan[0].isoformat() if last_scan else None

    return {
        "users": {"total": user_count, "active_today": active_today, "pending_invites": pending_invites},
        "incidents": {"total": total_incidents, "critical": critical_incidents, "resolved_this_month": resolved_month},
        "security_score": security_score,
        "alerts_24h": alerts_24h,
        "last_scan": last_scan_str,
    }
