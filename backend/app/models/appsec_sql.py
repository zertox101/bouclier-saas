
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from datetime import datetime
from app.models.sql import Base

class AppSecSession(Base):
    __tablename__ = "appsec_sessions"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(String, index=True, nullable=False)
    user_id = Column(String, index=True) # instructor or learner
    name = Column(String, index=True) # e.g. "JuiceShop Scan 1"
    tool_source = Column(String) # BURP, ZAP, MITMPROXY
    total_requests = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class AppSecRequest(Base):
    __tablename__ = "appsec_requests"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("appsec_sessions.id"))
    method = Column(String)
    url = Column(String)
    status_code = Column(Integer)
    request_headers = Column(JSON, default={})
    response_headers = Column(JSON, default={})
    # Body skipped for MVP or stored in S3 if large. Here we assume metadata focus.
    
class AppSecFinding(Base):
    __tablename__ = "appsec_findings"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("appsec_sessions.id"))
    request_id = Column(Integer, ForeignKey("appsec_requests.id"), nullable=True)
    
    title = Column(String)
    severity = Column(String) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    owasp_category = Column(String) # e.g. A01:2021-Broken Access Control
    description = Column(Text)
    remediation = Column(Text)
    status = Column(String, default="open") # open, false_positive, fixed
    created_at = Column(DateTime, default=datetime.utcnow)
