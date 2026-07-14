from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.scans_sql import ScanJob, Finding
from app.schemas.scans import ScanCreate, ScanResponse, ScanDetail, FindingResponse
from app.services.scan_manager import ScanManager
from app.routes.auth import get_current_user
from app.models.sql import User

router = APIRouter(prefix="/api/scans", tags=["Web Security Scans"])

@router.post("/", response_model=ScanResponse)
def create_scan(
    scan: ScanCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        job = ScanManager.create_scan(
            db, 
            scan.target, 
            scan.tool, 
            user_id=str(current_user.id),
            org_id=current_user.org_id
        )
        background_tasks.add_task(ScanManager.start_scan_job, db, job.id)
        return job
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ScanResponse])
def list_scans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = db.query(ScanJob).filter(
        ScanJob.org_id == current_user.org_id
    ).order_by(ScanJob.created_at.desc()).all()
    
    # Populate findings_count for the response model
    for job in jobs:
        job.findings_count = db.query(Finding).filter(Finding.scan_job_id == job.id).count()
    return jobs

@router.get("/{id}", response_model=ScanDetail)
def get_scan(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(ScanJob).filter(
        ScanJob.id == id,
        ScanJob.org_id == current_user.org_id
    ).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    scan.findings_count = db.query(Finding).filter(Finding.scan_job_id == id).count()
    return scan

@router.get("/{id}/findings", response_model=List[FindingResponse])
def get_findings(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # First verify scan ownership
    scan = db.query(ScanJob).filter(
        ScanJob.id == id,
        ScanJob.org_id == current_user.org_id
    ).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    return db.query(Finding).filter(Finding.scan_job_id == id).all()
