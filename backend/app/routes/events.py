from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sql import EventLog
from app.models.events import EventIngestRequest, EventLogResponse
from app.services.stream import publish_event
from app.services.geoip import get_geoip_cached
from app.models.monitor import monitor

router = APIRouter()

def _parse_timestamp_iso(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    try:
        text = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(text)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return int(parsed.timestamp())
    except Exception:
        return None


def require_db(db: Session = Depends(get_db)) -> Session:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return db


@router.post("/events/ingest", response_model=EventLogResponse)
def ingest_event(payload: EventIngestRequest, db: Session = Depends(require_db)):
    timestamp_epoch = (
        payload.timestamp_epoch
        or _parse_timestamp_iso(payload.timestamp_iso)
        or int(datetime.utcnow().timestamp())
    )
    details = payload.details or {}
    dst_ip = payload.dst_ip or details.get("dst_ip")
    if dst_ip:
        details.setdefault("dst_ip", dst_ip)
    event = EventLog(
        timestamp_epoch=timestamp_epoch,
        timestamp=datetime.utcfromtimestamp(timestamp_epoch),
        user=payload.user,
        host=payload.host,
        src_ip=payload.src_ip,
        event_type=payload.event_type,
        status=payload.status,
        severity=payload.severity or "low",
        details=details,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # GeoIP Enrichment
    src_geo = {}
    if event.src_ip:
        try:
            geo_data = get_geoip_cached(event.src_ip)
            if geo_data:
                src_geo = geo_data
        except Exception:
            pass

    # Update Global Monitor State (for Overview Dashboard)
    try:
        sev = (event.severity or "low").capitalize()
        if sev == "Critical": sev = "Critique"
        elif sev == "High": sev = "Élevé"
        elif sev == "Medium": sev = "Moyen"
        
        if sev in monitor.severity_counts:
            monitor.severity_counts[sev] += 1
            
        country_code = src_geo.get("country", {}).get("iso_code") or src_geo.get("country_code")
        if country_code:
            monitor.traffic_by_country[country_code] += 1
            
        # Add to memory events
        monitor.events.append({
            "id": event.id,
            "timestamp": event.timestamp.isoformat(),
            "src_ip": event.src_ip,
            "type": event.event_type,
            "severity": event.severity,
            "status": event.status
        })
        if len(monitor.events) > 100:
            monitor.events.pop(0)
    except Exception as e:
        print(f"Error updating monitor: {e}")

    # Stream payload with robust GeoIP fields
    stream_payload = {
        "id": event.id,
        "timestamp_epoch": event.timestamp_epoch,
        "user": event.user,
        "host": event.host,
        "src_ip": event.src_ip,
        "dst_ip": dst_ip,
        "event_type": event.event_type,
        "status": event.status,
        "severity": event.severity,
        "details": event.details,
        # Flattened Geo Fields - fallback to top-level or nested location
        "src_lat": src_geo.get("latitude") or src_geo.get("location", {}).get("lat"),
        "src_lon": src_geo.get("longitude") or src_geo.get("location", {}).get("lon"),
        "src_country": src_geo.get("country_name") or src_geo.get("country", {}).get("name"),
        "src_country_iso": src_geo.get("country_code") or src_geo.get("country", {}).get("iso_code"),
        "src_city": src_geo.get("city_name") or src_geo.get("city", {}).get("name"),
    }

    publish_event(stream_payload)

    return EventLogResponse(
        id=event.id,
        timestamp_epoch=event.timestamp_epoch,
        user=event.user,
        host=event.host,
        src_ip=event.src_ip,
        event_type=event.event_type,
        status=event.status,
        severity=event.severity,
        details=event.details,
    )


@router.post("/ingest", response_model=EventLogResponse)
def ingest_event_alias(payload: EventIngestRequest, db: Session = Depends(require_db)):
    return ingest_event(payload, db)


@router.get("/events/logs", response_model=list[EventLogResponse])
def list_events(
    db: Session = Depends(require_db),
    user: Optional[str] = Query(None),
    host: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(EventLog)
    if user:
        query = query.filter(EventLog.user == user)
    if host:
        query = query.filter(EventLog.host == host)
    if event_type:
        query = query.filter(EventLog.event_type == event_type)
    if severity:
        query = query.filter(EventLog.severity == severity)

    events = query.order_by(EventLog.timestamp_epoch.desc()).limit(limit).all()
    return [
        EventLogResponse(
            id=event.id,
            timestamp_epoch=event.timestamp_epoch,
            user=event.user,
            host=event.host,
            src_ip=event.src_ip,
            event_type=event.event_type,
            status=event.status,
            severity=event.severity,
            details=event.details,
        )
        for event in events
    ]
