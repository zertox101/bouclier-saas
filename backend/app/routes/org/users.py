from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_org_id_required
from app.models.sql import User
from pydantic import BaseModel, ConfigDict


router = APIRouter(prefix="/api/org/users", tags=["org-users"])


class OrgUserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "ANALYST"


class OrgUserUpdate(BaseModel):
    role: str = None
    is_active: bool = None


class OrgUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    plan: str
    subscription_status: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=List[OrgUserResponse])
async def list_org_users(
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("users:read")),
):
    """ORG_ADMIN - list users in their organization"""
    users = db.query(User).filter(User.org_id == org_id).all()
    return users


@router.post("", response_model=OrgUserResponse, status_code=status.HTTP_201_CREATED)
async def create_org_user(
    data: OrgUserCreate,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("users:manage")),
):
    """ORG_ADMIN - create user in their organization"""
    from app.core.security import hash_password
    from sqlalchemy import or_
    
    existing = db.query(User).filter(
        or_(User.email == data.email, User.username == data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    if data.role not in ["ORG_ADMIN", "ANALYST"]:
        raise HTTPException(status_code=400, detail="Invalid role for organization user")
    
    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        org_id=org_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=OrgUserResponse)
async def get_org_user(
    user_id: int,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("users:read")),
):
    """ORG_ADMIN - get user in their organization"""
    user = db.query(User).filter(User.id == user_id, User.org_id == org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=OrgUserResponse)
async def update_org_user(
    user_id: int,
    data: OrgUserUpdate,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("users:manage")),
):
    """ORG_ADMIN - update user in their organization"""
    user = db.query(User).filter(User.id == user_id, User.org_id == org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "role" and value not in ["ORG_ADMIN", "ANALYST"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_org_user(
    user_id: int,
    db: Session = Depends(get_db),
    org_id: str = Depends(get_current_org_id_required),
    current_user = Depends(require_permission("users:manage")),
):
    """ORG_ADMIN - delete user in their organization"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user = db.query(User).filter(User.id == user_id, User.org_id == org_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()