import os
import json

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.governance_sql import PentestMission
from pydantic import BaseModel

router = APIRouter(prefix="/governance", tags=["Governance & Compliance"])

class MissionCreate(BaseModel):
    title: str
    client_name: str
    compliance_standard: str = "ISO 27001:2022"

class MissionUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    roe_json: Optional[dict] = None
    recon_json: Optional[dict] = None
    validation_json: Optional[dict] = None
    exploitation_json: Optional[dict] = None
    risk_scoring_json: Optional[dict] = None
    executive_summary_json: Optional[dict] = None
    remediation_roadmap_json: Optional[dict] = None
    finding_ids: Optional[List[int]] = None

@router.post("/missions")
def create_mission(mission: MissionCreate, db: Session = Depends(get_db)):
    db_mission = PentestMission(
        title=mission.title,
        client_name=mission.client_name,
        compliance_standard=mission.compliance_standard
    )
    db.add(db_mission)
    db.commit()
    db.refresh(db_mission)
    return db_mission

@router.get("/missions")
def list_missions(db: Session = Depends(get_db)):
    return db.query(PentestMission).order_by(PentestMission.created_at.desc()).all()

@router.get("/missions/{mission_id}")
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(PentestMission).filter(PentestMission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.patch("/missions/{mission_id}")
def update_mission(mission_id: int, update: MissionUpdate, db: Session = Depends(get_db)):
    mission = db.query(PentestMission).filter(PentestMission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(mission, key, value)
    
    db.commit()
    db.refresh(mission)
    return mission

@router.delete("/missions/{mission_id}")
def delete_mission(mission_id: int, db: Session = Depends(get_db)):
    mission = db.query(PentestMission).filter(PentestMission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    db.delete(mission)
    db.commit()
    return {"status": "deleted"}

from fastapi.responses import StreamingResponse
from app.services.report_exporter import PentestReportGenerator

@router.get("/missions/{mission_id}/export")
def export_mission_report(mission_id: int, format: str = "pdf", template: str = "senior", db: Session = Depends(get_db)):
    mission = db.query(PentestMission).filter(PentestMission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    ml_metadata_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "models", "model_metadata.json")
    ai_reasoning_json = {}
    if os.path.exists(ml_metadata_path):
        with open(ml_metadata_path, "r", encoding="utf-8") as f:
            ai_reasoning_json = json.load(f)

    # Prepare data for generator
    mission_data = {
        "id": mission.id,
        "title": mission.title,
        "client_name": mission.client_name,
        "compliance_standard": mission.compliance_standard,
        "roe_json": mission.roe_json,
        "recon_json": mission.recon_json,
        "risk_scoring_json": mission.risk_scoring_json,
        "executive_summary_json": mission.executive_summary_json,
        "remediation_roadmap_json": mission.remediation_roadmap_json,
        "ai_reasoning_json": ai_reasoning_json,
    }
    
    if format == "pdf":
        pdf_buffer = PentestReportGenerator.generate_mission_pdf(mission_data)
        filename = f"Pentest_Report_{mission.client_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    elif format == "markdown":
        # Select MD template from library
        template_path = f"app/templates/library/{template}_template.md"
        if not os.path.exists(template_path):
            template_path = "app/templates/library/iso_27001_template.md" # Fallback
            
        with open(template_path, "r", encoding="utf-8") as f:
            md_content = f.read()
            
        # Basic substitution logic
        md_content = md_content.replace("{{MISSION_TITLE}}", mission.title or "N/A")
        md_content = md_content.replace("{{CLIENT_NAME}}", mission.client_name or "N/A")
        md_content = md_content.replace("{{COMPLIANCE_STANDARD}}", mission.compliance_standard or "ISO 27001")
        md_content = md_content.replace("{{DATE}}", datetime.now().strftime('%Y-%m-%d'))
        md_content = md_content.replace("{{MISSION_ID}}", str(mission.id))
        md_content = md_content.replace("{{EXECUTIVE_SUMMARY}}", (mission.executive_summary_json or {}).get("summary", "N/A"))
        
        from io import BytesIO
        md_buffer = BytesIO(md_content.encode("utf-8"))
        filename = f"Pentest_Report_{mission.client_name.replace(' ', '_')}.md"
        return StreamingResponse(
            md_buffer,
            media_type="text/markdown",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

@router.get("/templates")
def list_available_templates():
    return [
        {"id": "senior", "name": "Cyver Core Modern (Senior PDF)", "format": "pdf", "style": "pro"},
        {"id": "oscp", "name": "OSCP Exam Style (Markdown)", "format": "markdown", "style": "technical"},
        {"id": "iso_27001", "name": "ISO 27001 Official (Markdown)", "format": "markdown", "style": "compliance"},
        {"id": "nist", "name": "NIST 800-115 (Markdown)", "format": "markdown", "style": "federal"},
    ]
