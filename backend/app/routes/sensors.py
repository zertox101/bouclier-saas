from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(prefix="/api/sensors", tags=["sensors"])

SENSOR_TYPES = ["Satellite", "Drone", "Cyber", "IoT", "Network", "Endpoint"]


@router.get("/stats")
async def get_sensor_stats():
    by_type = {st: random.randint(20, 2500) for st in SENSOR_TYPES}
    total = sum(by_type.values())
    return {
        "total": total,
        "active": int(total * random.uniform(0.6, 0.95)),
        "by_type": by_type,
        "by_status": {
            "online": int(total * 0.65),
            "offline": int(total * 0.10),
            "maintenance": int(total * 0.05),
            "deployed": int(total * 0.20),
        },
        "last_updated": datetime.now().isoformat(),
    }


@router.get("/health")
async def get_sensor_health():
    return {
        "overall_health": random.choice(["healthy", "degraded", "healthy", "healthy"]),
        "cpu_avg": round(random.uniform(20, 80), 1),
        "memory_avg": round(random.uniform(30, 85), 1),
        "uptime_avg": f"{random.randint(1, 365)}d {random.randint(0, 23)}h",
        "sensors_reporting": random.randint(1500, 3000),
    }
