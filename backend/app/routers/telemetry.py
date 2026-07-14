"""
Telemetry Router - System-wide telemetry and statistics
"""
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from datetime import datetime
import random
import asyncio
import json

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])

GLOBAL_STATS = {
    "events": 25432,
    "alerts": 1234,
    "incidents": 8,
    "critical": 42,
    "high": 156,
    "medium": 543,
    "low": 1234,
}

clients = set()
recent_alerts = []

@router.post("/events")
async def receive_event(request: Request):
    event = await request.json()
    GLOBAL_STATS["events"] += 1
    severity = str(event.get("severity", "info")).lower()
    
    if "crit" in severity:
        GLOBAL_STATS["critical"] += 1
        GLOBAL_STATS["alerts"] += 1
    elif "high" in severity or "elev" in severity:
        GLOBAL_STATS["high"] += 1
        GLOBAL_STATS["alerts"] += 1
    elif "med" in severity or "moyen" in severity:
        GLOBAL_STATS["medium"] += 1
    else:
        GLOBAL_STATS["low"] += 1
        
    event["id"] = random.randint(10000, 99999)
    event["created_at"] = datetime.now().isoformat()
    
    # Store in recent alerts for geo_points
    if "payload" in event and "lat" in event["payload"]:
        recent_alerts.insert(0, {
            "id": event["id"],
            "severity": severity,
            "src_ip": event["payload"].get("src_ip", "Unknown"),
            "lat": event["payload"]["lat"],
            "lng": event["payload"]["lng"],
            "message": event.get("message", "Alert")
        })
        if len(recent_alerts) > 50:
            recent_alerts.pop()
    
    dead_clients = set()
    for client_queue in clients:
        try:
            client_queue.put_nowait(event)
        except asyncio.QueueFull:
            dead_clients.add(client_queue)
    for c in dead_clients:
        clients.remove(c)
        
    return {"status": "ok"}

@router.get("/stream")
async def stream_telemetry_events(request: Request, channels: str = "events"):
    client_queue = asyncio.Queue(maxsize=100)
    clients.add(client_queue)
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected(): break
                try:
                    event = await asyncio.wait_for(client_queue.get(), timeout=5.0)
                    yield f"event: events\ndata: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield f": heartbeat\n\n"
        finally:
            clients.remove(client_queue)
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@router.get("/stats")
async def get_telemetry_stats():
    # Simulate ambient traffic if no real events are coming
    GLOBAL_STATS["events"] += random.randint(5, 15)
    
    current_hour = datetime.now().hour
    alerts_over_time = []
    for i in range(24):
        h = (current_hour - 23 + i) % 24
        alerts_over_time.append({
            "hour": f"{h:02d}:00",
            "critical": random.randint(0, 5),
            "high": random.randint(2, 10),
            "medium": random.randint(5, 20),
            "low": random.randint(10, 30)
        })
        
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    attack_trends = [{"t": d, "DDoS": random.randint(10,50), "SQLi": random.randint(20,80), "Malware": random.randint(15,60)} for d in days]
    
    heatmap_data = []
    for day_idx in range(7):
        for hour_idx in range(8):
            heatmap_data.append([hour_idx, day_idx, random.randint(0, 100)])
            
    attack_types = [
        {"name": "Brute Force", "count": random.randint(300, 800)},
        {"name": "SQL Injection", "count": random.randint(100, 300)},
        {"name": "Malware", "count": random.randint(50, 150)},
        {"name": "DDoS", "count": random.randint(80, 250)},
        {"name": "Phishing", "count": random.randint(60, 200)}
    ]
    
    top_talkers = [
        {"ip": f"10.0.{random.randint(1,255)}.{random.randint(1,255)}", "count": random.randint(1000, 5000)}
        for _ in range(5)
    ]
    
    # Fill dummy alerts if empty
    if not recent_alerts:
        for _ in range(10):
            recent_alerts.append({
                "id": random.randint(1000,9999),
                "severity": random.choice(["critical", "high"]),
                "src_ip": "1.2.3.4",
                "lat": 34.0, "lng": -6.8, "message": "Dummy"
            })
    
    return {
        "counters": {
            "events": GLOBAL_STATS["events"],
            "alerts": GLOBAL_STATS["alerts"],
            "incidents": GLOBAL_STATS["incidents"]
        },
        "severity": {
            "critical": GLOBAL_STATS["critical"], "high": GLOBAL_STATS["high"],
            "medium": GLOBAL_STATS["medium"], "low": GLOBAL_STATS["low"],
            "Critique": GLOBAL_STATS["critical"], "Élevé": GLOBAL_STATS["high"],
            "Moyen": GLOBAL_STATS["medium"], "Faible": GLOBAL_STATS["low"]
        },
        "attack_types": attack_types,
        "timeline": alerts_over_time,
        "attack_trends": attack_trends,
        "heatmap": heatmap_data,
        "top_talkers": top_talkers,
        "alerts": recent_alerts,
        "ml_scatter": [[random.uniform(0, 1), random.uniform(0, 1)] for _ in range(20)],
        "health": {"active_nodes": 12},
        "timestamp": datetime.now().isoformat()
    }

@router.get("/alerts")
async def get_recent_alerts():
    return {"alerts": recent_alerts, "total": len(recent_alerts)}
