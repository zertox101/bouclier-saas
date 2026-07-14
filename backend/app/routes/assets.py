from fastapi import APIRouter, Depends, HTTPException, Query  # type: ignore
from sqlalchemy.orm import Session  # type: ignore
from typing import List, Optional
from app.core.database import get_db  # type: ignore
from app.models.sql import Asset, User  # type: ignore
from app.routes.auth import get_current_user
from pydantic import BaseModel  # type: ignore
from datetime import datetime

router = APIRouter()

class AssetBase(BaseModel):
    asset_tag: str
    name: str
    type: str
    ip_address: str
    risk_level: str = "Low"
    status: str = "Healthy"
    performance_load: int = 0

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: int
    org_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/assets")
def list_assets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    import psutil  # type: ignore
    
    org_id = current_user.org_id
    # Fetch from DB
    assets_list = []
    try:
        query = db.query(Asset).filter(Asset.org_id == org_id)
        if search:
            query = query.filter(Asset.name.ilike(f"%{search}%") | Asset.ip_address.ilike(f"%{search}%"))
        db_assets = query.offset(skip).limit(limit).all()
        
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent()
        
        for a in db_assets:
            assets_list.append({
                "id": a.id,
                "asset_tag": a.asset_tag,
                "name": a.name,
                "type": a.type,
                "ip_address": a.ip_address,
                "risk_level": a.risk_level,
                "status": a.status,
                "performance_load": int(cpu),
                "ram_load": int(mem.percent),
                "net_load": [10, 20, 15, 30, 25, 40, 35],
                "org_id": a.org_id,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "updated_at": a.updated_at.isoformat() if a.updated_at else None
            })
    except Exception as e:
        print(f"Error fetching DB assets: {e}")

    real_assets = []
    idx: int = 10000
    try:
        if_addrs = psutil.net_if_addrs()
        if_stats = psutil.net_if_stats()
        mem = psutil.virtual_memory()
        
        for iface_name, addrs in if_addrs.items():
            ip_val = "Unknown"
            for addr in addrs:
                if addr.family.name == 'AF_INET':
                    ip_val = addr.address
                    break
            
            stats = if_stats.get(iface_name)
            is_up = stats.isup if stats else False
            cpu = psutil.cpu_percent()
            
            real_assets.append({
                "id": idx,
                "asset_tag": f"IFACE-{idx}",
                "name": iface_name,
                "type": "network",
                "ip_address": ip_val,
                "risk_level": "Low",
                "status": "Healthy" if is_up else "Offline",
                "performance_load": int(cpu),
                "ram_load": int(mem.percent),
                "net_load": [5, 12, 8, 20, 15, 10, 5],
                "org_id": "system",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
            idx = idx + 1  # type: ignore
    except Exception as e:
        print(f"Error fetching real assets: {e}")
        
    return assets_list + real_assets

@router.post("/assets", response_model=AssetResponse)
def create_asset(payload: AssetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # org_id comes from authenticated session
    new_asset = Asset(
        **payload.dict(),
        org_id=current_user.org_id
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.get("/assets/{asset_id}", response_model=AssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"status": "success"}
