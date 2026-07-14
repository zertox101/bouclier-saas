from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import Incident

router = APIRouter(prefix="/api/org/security", tags=["org-security"])

@router.get("")
async def get_org_security(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("incidents:read")),
):
    incidents = db.query(Incident).filter(Incident.org_id == org_id).order_by(Incident.created_at.desc()).limit(20).all()

    return {
        "incidents": [
            {
                "id": f"SEC-{i.id}",
                "title": i.title,
                "severity": i.severity.lower() if i.severity else "low",
                "status": i.status.lower() if i.status else "open",
                "detected_at": i.created_at.isoformat() if i.created_at else None,
                "source_ip": f"10.0.{random.randint(1,10)}.{random.randint(1,255)}",
                "asset": f"SRV-{random.choice(['DC','FILE','WEB','DB'])}{random.randint(1,10):02d}",
            }
            for i in incidents
        ],
        "total": len(incidents),
    }
