from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import Organization
from pydantic import BaseModel, ConfigDict


router = APIRouter(prefix="/api/org/settings", tags=["org-settings"])


class OrgSettingsUpdate(BaseModel):
    name: str = None
    settings: dict = None


class OrgSettingsResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    subscription_status: str
    settings: dict
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=OrgSettingsResponse)
async def get_org_settings(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("settings:manage")),
):
    """ORG_ADMIN - get organization settings"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put("", response_model=OrgSettingsResponse)
async def update_org_settings(
    data: OrgSettingsUpdate,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("settings:manage")),
):
    """ORG_ADMIN - update organization settings"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(org, key):
            setattr(org, key, value)
    
    db.commit()
    db.refresh(org)
    return org