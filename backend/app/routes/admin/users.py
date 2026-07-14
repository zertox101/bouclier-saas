from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.rbac.dependencies import require_permission, get_current_user
from app.core.rbac.audit import audit_super_admin_action
from app.models.sql import User
from pydantic import BaseModel


router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    org_id: str = None
    org_name: str = None
    plan: str
    subscription_status: str
    is_active: bool
    last_login: str = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "ANALYST"
    org_id: str
    plan: str = "FREE"


class UserUpdate(BaseModel):
    role: str = None
    is_active: bool = None
    org_id: str = None


@router.get("", response_model=List[UserResponse])
async def list_all_users(
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:users:manage")),
    skip: int = 0,
    limit: int = 100,
):
    """SUPER_ADMIN only - list all users across all organizations"""
    users = db.query(User).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        org_name = None
        if user.organization:
            org_name = user.organization.name
        result.append(UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            org_id=str(user.org_id) if user.org_id else None,
            org_name=org_name,
            plan=user.plan,
            subscription_status=user.subscription_status,
            is_active=user.is_active,
            last_login=user.last_login.isoformat() if user.last_login else None,
            created_at=user.created_at.isoformat() if user.created_at else None,
            updated_at=user.updated_at.isoformat() if user.updated_at else None,
        ))
    return result


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:users:manage")),
):
    """SUPER_ADMIN - create user in any organization"""
    from app.core.security import hash_password
    from sqlalchemy import or_

    existing = db.query(User).filter(
        or_(User.email == data.email, User.username == data.username)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    if data.role not in ["SUPER_ADMIN", "ORG_ADMIN", "ANALYST"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
        org_id=data.org_id,
        plan=data.plan,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    org_name = None
    if user.organization:
        org_name = user.organization.name

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        org_id=str(user.org_id) if user.org_id else None,
        org_name=org_name,
        plan=user.plan,
        subscription_status=user.subscription_status,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:users:manage")),
):
    """SUPER_ADMIN - get any user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    org_name = None
    if user.organization:
        org_name = user.organization.name
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        org_id=str(user.org_id) if user.org_id else None,
        org_name=org_name,
        plan=user.plan,
        subscription_status=user.subscription_status,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:users:manage")),
):
    """SUPER_ADMIN - update any user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    await audit_super_admin_action(db, current_user, "UPDATE_USER", target_user_id=user_id)
    
    org_name = None
    if user.organization:
        org_name = user.organization.name
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        org_id=str(user.org_id) if user.org_id else None,
        org_name=org_name,
        plan=user.plan,
        subscription_status=user.subscription_status,
        is_active=user.is_active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat() if user.created_at else None,
        updated_at=user.updated_at.isoformat() if user.updated_at else None,
    )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("platform:users:manage")),
):
    """SUPER_ADMIN - delete any user"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    await audit_super_admin_action(db, current_user, "DELETE_USER", target_user_id=user_id)