
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, BigInteger
from datetime import datetime
from app.models.sql import Base

class TelemetrySensor(Base):
    __tablename__ = "telemetry_sensors"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    name = Column(String, index=True)
    type = Column(String) # endpoint, network, cloud
    status = Column(String, default="offline") # online, degraded, offline
    version = Column(String, nullable=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default={})

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    sensor_id = Column(Integer, ForeignKey("telemetry_sensors.id"), nullable=True)
    event_type = Column(String, index=True)
    severity = Column(String, default="info")
    message = Column(String)
    payload_json = Column(JSON, default={})
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class TelemetryCounter(Base):
    __tablename__ = "telemetry_counters"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, unique=True, index=True)
    window_seconds = Column(Integer, default=60)
    events_count = Column(Integer, default=0)
    alerts_count = Column(Integer, default=0)
    incidents_count = Column(Integer, default=0)
    tool_runs_count = Column(Integer, default=0)
    failures_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)
