from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import psutil
import os
import json
import uuid
from datetime import datetime

from app.core.database import get_db
from app.routes.auth import get_current_user_optional
from app.models.sql import User, AuditLog, AlertEvent, EventLog, Organization
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/settings", tags=["Settings & Platform Control"])

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class NotificationPrefs(BaseModel):
    security_anomalies: bool = True
    scan_reports: bool = True
    audit_logs: bool = False
    ai_insights: bool = True

class ApiKeyCreate(BaseModel):
    name: str
    scope: str = "read"

class UpgradeRequest(BaseModel):
    new_plan: str


def _get_org_settings(db: Session, org_id: str) -> dict:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        return {}
    return org.settings if isinstance(org.settings, dict) else (json.loads(org.settings) if org.settings else {})

def _save_org_settings(db: Session, org_id: str, settings: dict):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    org.settings = settings
    db.commit()


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user_optional)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "org_id": current_user.org_id,
        "plan": current_user.plan,
        "subscription_status": current_user.subscription_status
    }

@router.put("/profile")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    if data.username:
        current_user.username = data.username
    if data.email:
        current_user.email = str(data.email)
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "username": current_user.username, "email": current_user.email}

@router.post("/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated"}

@router.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    settings = _get_org_settings(db, current_user.org_id)
    return settings.get("notifications", {
        "security_anomalies": True,
        "scan_reports": True,
        "audit_logs": False,
        "ai_insights": True,
    })

@router.put("/notifications")
def update_notifications(data: NotificationPrefs, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    settings = _get_org_settings(db, current_user.org_id)
    settings["notifications"] = data.model_dump()
    _save_org_settings(db, current_user.org_id, settings)
    return {"status": "success"}

@router.get("/api-keys")
def list_api_keys(current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    settings = _get_org_settings(db, current_user.org_id)
    return settings.get("api_keys", [])

@router.post("/api-keys")
def create_api_key(data: ApiKeyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    settings = _get_org_settings(db, current_user.org_id)
    api_keys = settings.setdefault("api_keys", [])
    new_key = {
        "id": len(api_keys) + 1,
        "name": data.name,
        "key": f"sk_shield_{uuid.uuid4().hex[:12]}",
        "scope": data.scope,
        "created_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "last_used": None
    }
    api_keys.append(new_key)
    _save_org_settings(db, current_user.org_id, settings)
    return {"status": "success", **new_key}

@router.delete("/api-keys/{key_id}")
def delete_api_key(key_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    settings = _get_org_settings(db, current_user.org_id)
    api_keys = settings.get("api_keys", [])
    settings["api_keys"] = [k for k in api_keys if k.get("id") != key_id]
    _save_org_settings(db, current_user.org_id, settings)
    return {"status": "success", "deleted": key_id}

@router.get("/org")
def get_org_info(current_user: User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        return {"name": "DEMO", "active_nodes": 3, "team_slots": "1 / 5", "plan": "FREE"}
    return {
        "name": org.name,
        "slug": org.slug,
        "plan": org.plan,
        "subscription_status": org.subscription_status,
        "settings": org.settings or {},
        "created_at": str(org.created_at) if org.created_at else None
    }

@router.put("/org")
def update_org(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if "name" in data:
        org.name = data["name"]
    if "plan" in data:
        org.plan = data["plan"]
    db.commit()
    return {"status": "success", "name": org.name, "plan": org.plan}

@router.post("/upgrade")
def upgrade_plan(data: UpgradeRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    new_plan = data.new_plan.lower()
    if new_plan not in ["free", "pro", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid plan type")
    current_user.plan = new_plan
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if org:
        org.plan = new_plan.upper()
    db.commit()
    return {"status": "success", "new_plan": current_user.plan}

@router.get("/system-health")
def get_system_health():
    cpu = psutil.cpu_percent()
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return {
        "cpu": f"{cpu}%",
        "memory": f"{round(mem.used / (1024**3), 1)} GB",
        "memory_percent": f"{mem.percent}%",
        "disk": f"{disk.percent}%",
        "status": "OPTIMAL" if cpu < 80 else "HIGH_LOAD"
    }

@router.post("/purge")
def purge_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required for purge")
    db.query(AlertEvent).delete()
    db.query(EventLog).delete()
    db.query(AuditLog).delete()
    db.commit()
    return {"status": "success", "message": "All datasets and logs purged successfully"}
