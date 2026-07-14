from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/network", tags=["network"])


@router.get("/lanes")
async def get_network_lanes():
    return {
        "lanes": [
            {"name": "DMZ Cluster", "bandwidth": 12450, "peak": 18200, "color": "#10b981"},
            {"name": "Internal API", "bandwidth": 45200, "peak": 61000, "color": "#3b82f6"},
            {"name": "Auth Bridge", "bandwidth": 8900, "peak": 12300, "color": "#f59e0b"},
            {"name": "DB Mesh", "bandwidth": 7200, "peak": 9800, "color": "#ef4444"},
            {"name": "CDN Edge", "bandwidth": 28400, "peak": 45000, "color": "#8b5cf6"},
            {"name": "VPN Tunnel", "bandwidth": 5600, "peak": 7200, "color": "#06b6d4"},
        ],
        "units": "Mbps",
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/traffic")
async def get_traffic_data():
    now = datetime.now()
    points = []
    for i in range(60):
        points.append({
            "time": (now - timedelta(minutes=59 - i)).isoformat(),
            "inbound": random.randint(1000, 20000),
            "outbound": random.randint(800, 18000),
            "total": random.randint(2000, 38000),
        })
    return {"traffic": points, "unit": "Mbps", "period": "60min"}
