from app.core.database import SessionLocal
from app.models.sql import AlertEvent, EventLog
from app.models.telemetry_sql import TelemetryEvent
from datetime import datetime

db = SessionLocal()
try:
    alert_count = db.query(AlertEvent).count()
    first_alert = db.query(AlertEvent).order_by(AlertEvent.timestamp.asc()).first()
    last_alert = db.query(AlertEvent).order_by(AlertEvent.timestamp.desc()).first()
    
    tele_count = db.query(TelemetryEvent).count()
    first_tele = db.query(TelemetryEvent).order_by(TelemetryEvent.created_at.asc()).first()
    last_tele = db.query(TelemetryEvent).order_by(TelemetryEvent.created_at.desc()).first()
    
    print(f"AlertEvents: {alert_count}")
    if first_alert:
        print(f"  First: {first_alert.timestamp}")
        print(f"  Last: {last_alert.timestamp}")
        
    print(f"TelemetryEvents: {tele_count}")
    if first_tele:
        print(f"  First: {first_tele.created_at}")
        print(f"  Last: {last_tele.created_at}")
finally:
    db.close()
