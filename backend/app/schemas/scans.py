from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanCreate(BaseModel):
    target: str
    tool: str  # zap, nuclei
    config: Optional[Dict[str, Any]] = {}

class FindingResponse(BaseModel):
    id: int
    scan_job_id: int
    severity: str
    title: str
    description: Optional[str]
    url: str
    param: Optional[str]
    cwe: Optional[str]
    confidence: Optional[str]
    remediation: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

class ScanResponse(BaseModel):
    id: int
    tool: str
    target: str
    status: str
    created_at: datetime
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
    findings_count: Optional[int] = 0

    class Config:
        orm_mode = True

class ScanDetail(ScanResponse):
    config_json: Dict[str, Any]
    findings: List[FindingResponse] = []
