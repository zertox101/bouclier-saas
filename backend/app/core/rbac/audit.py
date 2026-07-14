from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.sql import AuditLog, User


async def audit_log(
    db: Session,
    user_id: int,
    action: str,
    entity_type: str = None,
    entity_id: str = None,
    metadata: Dict[str, Any] = None,
    org_id: str = None,
    ip_address: str = None,
) -> AuditLog:
    audit = AuditLog(
        org_id=org_id,
        user_id=str(user_id),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata_json=metadata or {},
        ip_address=ip_address,
        created_at=datetime.utcnow(),
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


async def audit_super_admin_action(
    db: Session,
    user: User,
    action: str,
    target_org_id: str = None,
    target_user_id: int = None,
    metadata: Dict[str, Any] = None,
    ip_address: str = None,
) -> Optional[AuditLog]:
    if user.role != "SUPER_ADMIN":
        return None

    return await audit_log(
        db=db,
        user_id=user.id,
        action=f"SUPER_ADMIN_{action}",
        entity_type="organization" if target_org_id else "platform",
        entity_id=target_org_id or "platform",
        metadata={
            "impersonated_org": target_org_id,
            "target_user": target_user_id,
            "original_org": str(user.org_id) if user.org_id else None,
            **(metadata or {}),
        },
        org_id=target_org_id or "platform",
        ip_address=ip_address,
    )


async def audit_permission_denied(
    db: Session,
    user: User,
    required_permissions: list,
    user_permissions: list,
    resource_type: str = None,
    resource_id: str = None,
    org_id: str = None,
    ip_address: str = None,
) -> AuditLog:
    return await audit_log(
        db=db,
        user_id=user.id,
        action="PERMISSION_DENIED",
        entity_type=resource_type,
        entity_id=resource_id,
        metadata={
            "required_permissions": required_permissions,
            "user_permissions": user_permissions,
            "user_role": user.role,
        },
        org_id=org_id or (str(user.org_id) if user.org_id else None),
        ip_address=ip_address,
    )


def get_client_ip(request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"