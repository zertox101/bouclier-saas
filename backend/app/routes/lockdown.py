from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(prefix="/api/lockdown", tags=["lockdown"])

SECTOR_NAMES = ["Neural_Net", "Firewall_A", "Data_Silo", "External_Link", "Core_Router", "DNS_Cluster", "Mail_Gateway", "VPN_Endpoint", "Load_Balancer", "SIEM_Pipeline"]


@router.get("/sectors")
async def get_sectors():
    sectors = []
    for name in SECTOR_NAMES:
        sectors.append({
            "name": name,
            "status": random.choice(["secure", "compromised", "locked", "monitoring", "secure", "secure", "secure"]),
            "load": random.randint(15, 95),
            "integrity": round(random.uniform(85, 100), 1),
            "threat_level": random.choice(["none", "low", "medium", "high", "none", "none", "low"]),
            "last_checked": datetime.now().isoformat(),
        })
    return {"sectors": sectors}


@router.post("/lock")
async def lock_sector(name: str = ""):
    return {"status": "locked", "sector": name, "timestamp": datetime.now().isoformat()}


@router.post("/unlock")
async def unlock_sector(name: str = ""):
    return {"status": "unlocked", "sector": name, "timestamp": datetime.now().isoformat()}


@router.get("/status")
async def get_lockdown_status():
    return {
        "global_lockdown": random.choice([True, False]),
        "sectors_locked": random.randint(0, len(SECTOR_NAMES)),
        "total_sectors": len(SECTOR_NAMES),
        "threat_level": random.choice(["low", "medium", "high"]),
        "last_incident": datetime.now().isoformat(),
    }
