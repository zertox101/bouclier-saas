from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.sql import Base

class PentestMission(Base):
    __tablename__ = "pentest_missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    client_name = Column(String, index=True)
    status = Column(String, default="planning", index=True) # planning, active, analysis, reporting, closed
    org_id = Column(String, index=True, default=None, nullable=True)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ISO 27001 Context
    compliance_standard = Column(String, default="ISO 27001:2022")
    
    # Template Sections (stored as JSON for flexibility, but could be separate tables)
    roe_json = Column(JSON, default={})        # Template 0
    recon_json = Column(JSON, default={})      # Template 1
    validation_json = Column(JSON, default={}) # Template 2
    exploitation_json = Column(JSON, default={}) # Template 3
    risk_scoring_json = Column(JSON, default={}) # Template 4
    executive_summary_json = Column(JSON, default={}) # Template 5 (Part 1)
    remediation_roadmap_json = Column(JSON, default={}) # Template 5 (Part 6)
    
    # Links to findings (m-to-m or just selected ID list in JSON)
    finding_ids = Column(JSON, default=[]) 

    actor_user_id = Column(Integer, ForeignKey("users.id"))
