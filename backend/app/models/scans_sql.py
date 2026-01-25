from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.sql import Base

class ScanJob(Base):
    __tablename__ = "scan_jobs"

    id = Column(Integer, primary_key=True, index=True)
    tool = Column(String, index=True)  # zap, nuclei
    target = Column(String, index=True)
    status = Column(String, default="pending", index=True)  # pending, running, completed, failed, stopped
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True)
    config_json = Column(JSON, default={})
    actor_user_id = Column(String, index=True, nullable=True)
    
    findings = relationship("Finding", back_populates="scan_job", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(Integer, primary_key=True, index=True)
    scan_job_id = Column(Integer, ForeignKey("scan_jobs.id"), index=True)
    severity = Column(String, index=True)  # critical, high, medium, low, info
    title = Column(String)
    description = Column(Text)
    evidence_json = Column(JSON, default={})  # request, response, etc.
    url = Column(String, index=True)
    param = Column(String, nullable=True)
    cwe = Column(String, nullable=True)
    owasp = Column(String, nullable=True)
    confidence = Column(String, nullable=True)  # certain, firm, tentative
    remediation = Column(Text, nullable=True)
    fingerprint_hash = Column(String, index=True)  # for deduplication
    created_at = Column(DateTime, default=datetime.utcnow)

    scan_job = relationship("ScanJob", back_populates="findings")
