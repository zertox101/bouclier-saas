from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import AuditLog

router = APIRouter(prefix="/api/org/audit-logs", tags=["org-audit-logs"])

@router.get("")
async def get_org_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("audit:read")),
):
    logs = db.query(AuditLog).filter(
        AuditLog.org_id == org_id
    ).order_by(desc(AuditLog.created_at)).limit(limit).all()

    return {
        "logs": [
            {
                "id": f"LOG-{log.id}",
                "timestamp": log.created_at.isoformat() if log.created_at else None,
                "user": log.user_id or "system",
                "action": log.action or "unknown",
                "details": f"{log.entity_type} {log.entity_id}" if log.entity_type else "",
                "ip": log.ip_address or "0.0.0.0",
                "status": "success",
            }
            for log in logs
        ],
        "total": len(logs),
    }
