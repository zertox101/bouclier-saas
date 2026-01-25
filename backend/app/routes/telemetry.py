
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime, timedelta
import json
import asyncio

from app.core.database import get_db, redis_client
from app.models.telemetry_sql import TelemetrySensor, TelemetryEvent, TelemetryCounter
from app.services.redis_stream import stream_service

router = APIRouter(prefix="/telemetry", tags=["Real-Time Telemetry"])

# --- schemas ---
class IngestEvent(BaseModel):
    sensor_name: str
    sensor_type: str = "endpoint"
    event_type: str
    severity: str = "info"
    message: str
    payload: Dict = {}

class Heartbeat(BaseModel):
    sensor_name: str
    sensor_type: str
    status: str = "online"
    metadata: Dict = {}

# --- endpoints ---

@router.post("/events")
def ingest_event(evt: IngestEvent, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    org_id = "default" # TODO: extract from Auth header
    
    # 1. Resolve Sensor
    sensor = db.query(TelemetrySensor).filter(
        TelemetrySensor.org_id == org_id, 
        TelemetrySensor.name == evt.sensor_name
    ).first()
    
    if not sensor:
        sensor = TelemetrySensor(
            org_id=org_id, name=evt.sensor_name, type=evt.sensor_type, 
            status="online", last_seen_at=datetime.utcnow()
        )
        db.add(sensor)
        db.flush() 
    else:
        sensor.last_seen_at = datetime.utcnow()
        sensor.status = "online"
    
    # 2. Store Event
    telemetry = TelemetryEvent(
        org_id=org_id, sensor_id=sensor.id,
        event_type=evt.event_type, severity=evt.severity,
        message=evt.message, payload_json=evt.payload
    )
    db.add(telemetry)
    db.commit()
    
    # 3. Publish to Redis (Async)
    # Stream key: telemetry:events:{org_id}
    stream_data = {
        "id": telemetry.id,
        "type": evt.event_type,
        "severity": evt.severity,
        "message": evt.message,
        "sensor": evt.sensor_name,
        "created_at": telemetry.created_at.isoformat()
    }
    background_tasks.add_task(stream_service.publish, f"telemetry:events:{org_id}", stream_data)
    background_tasks.add_task(stream_service.update_counter, org_id, "events_count", 1)
    
    return {"status": "ingested", "id": telemetry.id}

@router.post("/heartbeat")
def heartbeat(hb: Heartbeat, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    org_id = "default"
    
    sensor = db.query(TelemetrySensor).filter(
        TelemetrySensor.org_id == org_id, 
        TelemetrySensor.name == hb.sensor_name
    ).first()
    
    if not sensor:
        sensor = TelemetrySensor(
            org_id=org_id, name=hb.sensor_name, type=hb.sensor_type,
            status=hb.status, metadata_json=hb.metadata
        )
        db.add(sensor)
    else:
        sensor.last_seen_at = datetime.utcnow()
        sensor.status = hb.status
        sensor.metadata_json = hb.metadata # update metadata
        
    db.commit()
    
    # Publish Health Update
    health_data = {
        "sensor": hb.sensor_name,
        "status": hb.status,
        "last_seen": sensor.last_seen_at.isoformat()
    }
    background_tasks.add_task(stream_service.publish, f"telemetry:health:{org_id}", health_data)
    
    return {"status": "ok"}

# --- SSE Stream ---

@router.get("/stream")
async def sse_stream(request: Request, channels: str = "events,health,kpi"):
    """
    Unified SSE Endpoint. Client assumes 'default' org for now.
    Channels: comma-separated list of streams to subscribe to.
    """
    org_id = "default"
    requested_channels = channels.split(",")
    
    async def event_generator():
        pubsub = redis_client.pubsub()
        
        subs = []
        if "events" in requested_channels: subs.append(f"telemetry:events:{org_id}")
        if "health" in requested_channels: subs.append(f"telemetry:health:{org_id}")
        if "alerts" in requested_channels: subs.append(f"telemetry:alerts:{org_id}")
        
        pubsub.subscribe(*subs)
        
        try:
            while True:
                if await request.is_disconnected():
                    break
                
                # 1. Process Real-time Messages
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    channel = message['channel'].decode().split(":")[1] # telemetry:events:default -> events
                    data = message['data'].decode()
                    yield f"event: {channel}\ndata: {data}\n\n"
                
                # 2. Emit Periodic KPI (every 5s approx) or Heartbeat
                # To avoid blocking, we use small sleeps and check rarely
                # In robust prod, use separate loop or async sleep
                
                # Simplify: Just yield a keep-alive every 1S if no message
                if not message:
                    await asyncio.sleep(0.5)
                    # yield f"event: ping\ndata: {{}}\n\n"

        finally:
            pubsub.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/sensors")
def list_sensors(db: Session = Depends(get_db)):
    # Check for dead sensors first (gap detection on read - lazy approach)
    # In prod, use background job
    timeout_threshold = datetime.utcnow() - timedelta(minutes=5)
    
    db.query(TelemetrySensor).filter(
        TelemetrySensor.last_seen_at < timeout_threshold,
        TelemetrySensor.status != "offline"
    ).update({"status": "offline"})
    db.commit()
    
    return db.query(TelemetrySensor).filter(TelemetrySensor.org_id == "default").all()
