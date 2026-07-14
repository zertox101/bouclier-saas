from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_user
from app.core.rbac.audit import audit_super_admin_action
from app.services.organization_service import OrganizationService
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


router = APIRouter(prefix="/api/admin/organizations", tags=["admin-organizations"])


class OrgCreate(BaseModel):
    name: str
    slug: str
    plan: str = "FREE"


class OrgUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[str] = None
    subscription_status: Optional[str] = None
    settings: Optional[dict] = None


class OrgResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    subscription_status: str
    settings: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=List[OrgResponse])
async def list_organizations(
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """SUPER_ADMIN only - list all organizations"""
    service = OrganizationService(db)
    orgs = service.list_all()
    return orgs


@router.post("", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: OrgCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """SUPER_ADMIN only - create organization"""
    service = OrganizationService(db)
    
    if service.get_by_slug(data.slug):
        raise HTTPException(status_code=400, detail="Organization slug already exists")
    
    org = service.create_organization(data.name, data.slug, data.plan)
    
    await audit_super_admin_action(db, current_user, "CREATE_ORG", target_org_id=org.id)
    
    return org


@router.get("/{org_id}", response_model=OrgResponse)
async def get_organization(
    org_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """SUPER_ADMIN - get any org"""
    service = OrganizationService(db)
    org = service.get_by_id(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.put("/{org_id}", response_model=OrgResponse)
async def update_organization(
    org_id: str,
    data: OrgUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """SUPER_ADMIN - update organization"""
    service = OrganizationService(db)
    org = service.update_organization(org_id, data.model_dump(exclude_unset=True))
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await audit_super_admin_action(db, current_user, "UPDATE_ORG", target_org_id=org_id)
    
    return org


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """SUPER_ADMIN - delete organization"""
    service = OrganizationService(db)
    
    if org_id == str(current_user.org_id):
        raise HTTPException(status_code=400, detail="Cannot delete your own organization")
    
    success = service.delete_organization(org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await audit_super_admin_action(db, current_user, "DELETE_ORG", target_org_id=org_id)


@router.get("/{org_id}/users/count")
async def get_org_user_count(
    org_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:orgs:manage")),
):
    """Get user count for organization"""
    service = OrganizationService(db)
    count = service.get_user_count(org_id)
    return {"org_id": org_id, "user_count": count}