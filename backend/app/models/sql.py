from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Boolean, BigInteger, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

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
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)

class TrafficStat(Base):
    __tablename__ = "traffic_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    total_packets = Column(Integer)
    country_distribution = Column(JSON) # Store as JSON {"US": 100, "CN": 50}
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    plan = Column(String, default="FREE")
    stripe_customer_id = Column(String, unique=True, nullable=True)
    stripe_subscription_id = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, default="INACTIVE")
    settings = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="ANALYST")  # SUPER_ADMIN, ORG_ADMIN, ANALYST
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)
    organization = relationship("Organization")
    plan = Column(String, default="free")
    subscription_status = Column(String, default="active")
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)
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
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)

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
    status = Column(String, default="new")
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)

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
    status = Column(String, default="new")
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=True)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    type = Column(String)  # Firewall, Server, Workstation, etc.
    ip_address = Column(String, index=True)
    risk_level = Column(String, default="Low") # Low, Medium, High
    status = Column(String, default="Healthy") # Healthy, Warning, Breached, Suspicious
    performance_load = Column(Integer, default=0)
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    severity = Column(String, default="Medium") # Critical, High, Medium, Low
    status = Column(String, default="Open") # Open, In Progress, Resolved, Closed
    owner = Column(String, index=True)
    alerts = Column(JSON, default=[]) # List of alert IDs
    timeline = Column(JSON, default=[]) # List of {time: str, action: str, user: str}
    org_id = Column(String, ForeignKey("organizations.id"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
