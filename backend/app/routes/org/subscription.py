from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import Organization
from pydantic import BaseModel, ConfigDict


router = APIRouter(prefix="/api/org/subscription", tags=["org-subscription"])


class SubscriptionResponse(BaseModel):
    plan: str
    subscription_status: str
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=SubscriptionResponse)
async def get_subscription(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("billing:read")),
):
    """ORG_ADMIN - get subscription info"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return {
        "plan": org.plan,
        "subscription_status": org.subscription_status,
        "stripe_customer_id": org.stripe_customer_id,
        "stripe_subscription_id": org.stripe_subscription_id,
    }


@router.put("/plan")
async def update_plan(
    plan: str,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("billing:manage")),
):
    """ORG_ADMIN - update organization plan"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if plan not in ["FREE", "PRO", "ENTERPRISE"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    org.plan = plan
    org.subscription_status = "ACTIVE" if plan != "FREE" else "INACTIVE"
    db.commit()
    db.refresh(org)
    
    return {"message": "Plan updated", "plan": org.plan, "status": org.subscription_status}