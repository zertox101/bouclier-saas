from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.scans_sql import ScanJob, Finding
from app.schemas.scans import ScanCreate, ScanResponse, ScanDetail, FindingResponse
from app.services.scan_manager import ScanManager

router = APIRouter(prefix="/api/scans", tags=["Web Security Scans"])

@router.post("/", response_model=ScanResponse)
def create_scan(
    scan: ScanCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        # TODO: Get user ID from current_user
        job = ScanManager.create_scan(db, scan.target, scan.tool, user_id="admin")
        background_tasks.add_task(ScanManager.start_scan_job, db, job.id)
        return job
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ScanResponse])
def list_scans(db: Session = Depends(get_db)):
    jobs = db.query(ScanJob).order_by(ScanJob.created_at.desc()).all()
    # Populate findings_count for the response model
    for job in jobs:
        job.findings_count = db.query(Finding).filter(Finding.scan_job_id == job.id).count()
    return jobs

@router.get("/{id}", response_model=ScanDetail)
def get_scan(id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanJob).filter(ScanJob.id == id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    scan.findings_count = db.query(Finding).filter(Finding.scan_job_id == id).count()
    return scan

@router.get("/{id}/findings", response_model=List[FindingResponse])
def get_findings(id: int, db: Session = Depends(get_db)):
    return db.query(Finding).filter(Finding.scan_job_id == id).all()
