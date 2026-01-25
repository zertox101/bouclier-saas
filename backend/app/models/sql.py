from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Boolean, BigInteger
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    src_ip = Column(String, index=True)
    dst_ip = Column(String)
    dst_port = Column(Integer)
    type = Column(String, index=True)  # SSH, DDoS, ML_Anomaly
    severity = Column(String) # Low, Medium, High, Critical
    details = Column(JSON)
    status = Column(String, default="new") # new, investigating, resolved

class TrafficStat(Base):
    __tablename__ = "traffic_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_packets = Column(Integer)
    country_distribution = Column(JSON) # Store as JSON {"US": 100, "CN": 50}

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="analyst") # analyst, admin
    org_id = Column(String, default="default", index=True)
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True)
    user_id = Column(String, index=True)
    action = Column(String, index=True) # LOGIN, CONFIG_CHANGE, REPORT_EXPORT
    entity_type = Column(String)
    entity_id = Column(String)
    metadata_json = Column(JSON, default={})
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp_epoch = Column(BigInteger, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String, index=True)
    host = Column(String, index=True)
    src_ip = Column(String, index=True)
    event_type = Column(String, index=True)
    status = Column(String)
    severity = Column(String, default="low")
    details = Column(JSON)

class CorrelatedAlert(Base):
    __tablename__ = "correlated_alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp_epoch = Column(BigInteger, index=True)
    rule_name = Column(String, index=True)
    user = Column(String, index=True)
    host = Column(String, index=True)
    severity = Column(String, default="medium")
    sequence = Column(JSON)
    details = Column(JSON)

class MlAlert(Base):
    __tablename__ = "ml_alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp_epoch = Column(BigInteger, index=True)
    user = Column(String, index=True)
    host = Column(String, index=True)
    anomaly_score = Column(Float)
    threshold = Column(Float)
    model_version = Column(String)
    details = Column(JSON)
