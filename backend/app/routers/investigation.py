"""
Investigation Workspace Router - Forensic Analysis
Provides timeline, evidence management, and case investigation tools
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import os

router = APIRouter(prefix="/api/investigation", tags=["investigation"])


class InvestigationCase(BaseModel):
    """Investigation case details"""
    case_id: str
    title: str
    severity: str
    status: str
    assigned_to: str
    created_at: str


class TimelineEvent(BaseModel):
    """Event in investigation timeline"""
    timestamp: str
    stage: str
    description: str
    severity: str
    source: str
    details: Optional[Dict[str, Any]] = None


class Evidence(BaseModel):
    """Evidence item"""
    evidence_id: str
    case_id: str
    filename: str
    file_type: str
    size: int
    hash_md5: str
    hash_sha256: str
    collected_by: str
    collected_at: str
    chain_of_custody: List[Dict[str, str]]


class InvestigationNote(BaseModel):
    """Investigation note"""
    note_id: str
    case_id: str
    content: str
    author: str
    created_at: str
    tags: List[str]


@router.get("/cases")
async def get_cases(status: Optional[str] = None, limit: int = 20):
    """
    Get list of investigation cases
    """
    
    statuses = ["open", "investigating", "contained", "closed"]
    severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    
    cases = [
        {
            "case_id": f"CASE-{2024000 + i}",
            "title": random.choice([
                "Suspicious Login Activity",
                "Malware Infection",
                "Data Exfiltration Attempt",
                "Unauthorized Access",
                "Phishing Campaign",
                "Ransomware Attack"
            ]),
            "severity": random.choice(severities),
            "status": random.choice(statuses) if not status else status,
            "assigned_to": random.choice(["Alice Chen", "Bob Smith", "Carol Davis", "SOC Team"]),
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            "events_count": random.randint(5, 50),
            "evidence_count": random.randint(2, 15),
            "notes_count": random.randint(3, 20)
        }
        for i in range(limit)
    ]
    
    return {"cases": cases, "total": len(cases)}


@router.get("/{case_id}")
async def get_case_details(case_id: str):
    """
    Get detailed information about a case
    """
    
    case = {
        "case_id": case_id,
        "title": "Suspicious Login Activity - Multiple Failed Attempts",
        "description": "Multiple failed login attempts detected from unusual geographic locations",
        "severity": "HIGH",
        "status": "investigating",
        "assigned_to": "Alice Chen",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "affected_systems": [
            "WEB-SERVER-01",
            "DB-SERVER-02",
            "AUTH-SERVICE"
        ],
        "attack_vectors": [
            "Brute Force",
            "Credential Stuffing"
        ],
        "mitre_tactics": [
            "Initial Access",
            "Credential Access"
        ],
        "iocs": [
            "192.168.1.100",
            "malicious-domain.com",
            "suspicious.exe"
        ],
        "timeline_events": random.randint(10, 30),
        "evidence_items": random.randint(5, 15),
        "notes": random.randint(8, 25),
        "related_cases": [f"CASE-{2024000 + i}" for i in range(1, 4)]
    }
    
    return case


@router.get("/{case_id}/timeline")
async def get_timeline(case_id: str):
    """
    Get investigation timeline for a case
    """
    
    base_time = datetime.now() - timedelta(hours=6)
    
    stages = [
        ("Initial Detection", "Automated alert triggered by SIEM", "info"),
        ("Reconnaissance", "Attacker scanned network for vulnerabilities", "warning"),
        ("Initial Access", "Exploit attempt on web application", "warning"),
        ("Execution", "Malicious payload executed on target system", "danger"),
        ("Persistence", "Backdoor installed for future access", "danger"),
        ("Privilege Escalation", "Admin credentials compromised", "critical"),
        ("Defense Evasion", "Security tools disabled by attacker", "critical"),
        ("Discovery", "Network enumeration performed", "warning"),
        ("Lateral Movement", "Spread to additional hosts detected", "danger"),
        ("Collection", "Sensitive data accessed", "critical"),
        ("Exfiltration", "Data transfer to external server", "critical"),
        ("Impact", "Systems encrypted by ransomware", "critical")
    ]
    
    timeline = []
    for i, (stage, description, severity) in enumerate(stages[:random.randint(6, 10)]):
        timeline.append({
            "event_id": f"EVT-{case_id}-{i+1:03d}",
            "timestamp": (base_time + timedelta(minutes=i*20)).isoformat(),
            "stage": stage,
            "description": description,
            "severity": severity,
            "source": random.choice(["SIEM", "EDR", "Firewall", "IDS", "Manual Analysis"]),
            "details": {
                "ip_address": f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
                "user": random.choice(["admin", "user123", "service_account", "unknown"]),
                "process": random.choice(["powershell.exe", "cmd.exe", "svchost.exe", "unknown.exe"])
            }
        })
    
    return {
        "case_id": case_id,
        "timeline": timeline,
        "total_events": len(timeline),
        "duration": f"{len(timeline) * 20} minutes",
        "current_stage": timeline[-1]["stage"] if timeline else "Unknown"
    }


@router.get("/{case_id}/correlation-graph")
async def get_correlation_graph(case_id: str):
    """
    Get correlation graph showing relationships between entities
    """
    
    nodes = [
        {"id": case_id, "label": "Primary Case", "type": "case", "severity": "high"},
        {"id": "IP-192.168.1.100", "label": "Attacker IP", "type": "ip", "severity": "critical"},
        {"id": "HOST-WEB-01", "label": "Web Server", "type": "host", "severity": "high"},
        {"id": "HOST-DB-01", "label": "Database", "type": "host", "severity": "medium"},
        {"id": "HOST-FILE-01", "label": "File Server", "type": "host", "severity": "medium"},
        {"id": "USER-admin", "label": "Admin Account", "type": "user", "severity": "high"},
        {"id": "USER-service", "label": "Service Account", "type": "user", "severity": "medium"},
        {"id": "FILE-malware.exe", "label": "Malware", "type": "file", "severity": "critical"},
        {"id": "DOMAIN-evil.com", "label": "C2 Server", "type": "domain", "severity": "critical"},
        {"id": "PROCESS-powershell", "label": "PowerShell", "type": "process", "severity": "warning"}
    ]
    
    edges = [
        {"from": "IP-192.168.1.100", "to": case_id, "label": "initiated", "type": "attack"},
        {"from": case_id, "to": "HOST-WEB-01", "label": "targeted", "type": "impact"},
        {"from": "HOST-WEB-01", "to": "HOST-DB-01", "label": "lateral_movement", "type": "propagation"},
        {"from": "HOST-WEB-01", "to": "HOST-FILE-01", "label": "lateral_movement", "type": "propagation"},
        {"from": case_id, "to": "USER-admin", "label": "compromised", "type": "credential"},
        {"from": "USER-admin", "to": "HOST-DB-01", "label": "accessed", "type": "access"},
        {"from": "HOST-WEB-01", "to": "FILE-malware.exe", "label": "dropped", "type": "malware"},
        {"from": "FILE-malware.exe", "to": "DOMAIN-evil.com", "label": "connected", "type": "c2"},
        {"from": "FILE-malware.exe", "to": "PROCESS-powershell", "label": "executed", "type": "execution"},
        {"from": "PROCESS-powershell", "to": "USER-service", "label": "created", "type": "persistence"}
    ]
    
    return {
        "case_id": case_id,
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "graph_type": "directed"
    }


@router.post("/{case_id}/evidence")
async def add_evidence(case_id: str, file: UploadFile = File(...), collected_by: str = "SOC Analyst"):
    """
    Upload evidence file for a case
    """
    
    # Create evidence directory if it doesn't exist
    evidence_dir = f"evidence/{case_id}"
    os.makedirs(evidence_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(evidence_dir, file.filename)
    
    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Generate hashes (simplified)
        import hashlib
        md5_hash = hashlib.md5(contents).hexdigest()
        sha256_hash = hashlib.sha256(contents).hexdigest()
        
        evidence = {
            "evidence_id": f"EVD-{case_id}-{random.randint(1000, 9999)}",
            "case_id": case_id,
            "filename": file.filename,
            "file_type": file.content_type or "application/octet-stream",
            "size": len(contents),
            "hash_md5": md5_hash,
            "hash_sha256": sha256_hash,
            "file_path": file_path,
            "collected_by": collected_by,
            "collected_at": datetime.now().isoformat(),
            "chain_of_custody": [
                {
                    "action": "collected",
                    "by": collected_by,
                    "timestamp": datetime.now().isoformat()
                }
            ],
            "status": "uploaded"
        }
        
        return evidence
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload evidence: {str(e)}")


@router.get("/{case_id}/evidence")
async def get_evidence(case_id: str):
    """
    Get all evidence for a case
    """
    
    evidence_items = [
        {
            "evidence_id": f"EVD-{case_id}-{1000 + i}",
            "filename": random.choice([
                "memory_dump.raw",
                "network_capture.pcap",
                "malware_sample.exe",
                "system_logs.txt",
                "registry_export.reg",
                "disk_image.dd"
            ]),
            "file_type": random.choice(["application/octet-stream", "text/plain", "application/x-pcap"]),
            "size": random.randint(1024, 1024*1024*100),
            "collected_by": random.choice(["Alice Chen", "Bob Smith", "SOC Team"]),
            "collected_at": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
            "hash_md5": f"{random.randint(0, 0xffffffff):08x}" * 4,
            "hash_sha256": f"{random.randint(0, 0xffffffff):08x}" * 8,
            "status": random.choice(["uploaded", "analyzed", "archived"])
        }
        for i in range(random.randint(3, 10))
    ]
    
    return {
        "case_id": case_id,
        "evidence": evidence_items,
        "total": len(evidence_items)
    }


@router.post("/{case_id}/notes")
async def add_note(case_id: str, content: str, author: str = "SOC Analyst", tags: List[str] = []):
    """
    Add investigation note to a case
    """
    
    note = {
        "note_id": f"NOTE-{case_id}-{random.randint(1000, 9999)}",
        "case_id": case_id,
        "content": content,
        "author": author,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "tags": tags if tags else ["investigation", "analysis"],
        "attachments": []
    }
    
    return note


@router.get("/{case_id}/notes")
async def get_notes(case_id: str):
    """
    Get all notes for a case
    """
    
    notes = [
        {
            "note_id": f"NOTE-{case_id}-{1000 + i}",
            "content": random.choice([
                "Initial analysis shows signs of credential stuffing attack",
                "Found suspicious PowerShell execution in event logs",
                "Malware sample submitted to sandbox for analysis",
                "Contacted affected user for additional information",
                "Blocked attacker IP at firewall level",
                "Reviewing access logs for lateral movement indicators"
            ]),
            "author": random.choice(["Alice Chen", "Bob Smith", "Carol Davis"]),
            "created_at": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat(),
            "tags": random.sample(["investigation", "analysis", "malware", "network", "forensics"], k=random.randint(1, 3))
        }
        for i in range(random.randint(5, 15))
    ]
    
    return {
        "case_id": case_id,
        "notes": notes,
        "total": len(notes)
    }


@router.get("/{case_id}/export-report")
async def export_report(case_id: str, format: str = "pdf"):
    """
    Export investigation report
    """
    
    report = {
        "report_id": f"RPT-{case_id}-{datetime.now().strftime('%Y%m%d')}",
        "case_id": case_id,
        "format": format,
        "generated_at": datetime.now().isoformat(),
        "sections": [
            "Executive Summary",
            "Timeline of Events",
            "Technical Analysis",
            "Evidence Inventory",
            "IOCs and Artifacts",
            "Recommendations",
            "Appendices"
        ],
        "status": "generated",
        "download_url": f"/api/investigation/{case_id}/download-report/{format}",
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }
    
    return report


@router.post("/{case_id}/close")
async def close_case(case_id: str, resolution: str, notes: str):
    """
    Close an investigation case
    """
    
    closure = {
        "case_id": case_id,
        "status": "closed",
        "resolution": resolution,
        "closure_notes": notes,
        "closed_by": "SOC Manager",
        "closed_at": datetime.now().isoformat(),
        "total_duration": f"{random.randint(2, 48)} hours",
        "events_analyzed": random.randint(50, 500),
        "evidence_collected": random.randint(5, 20),
        "actions_taken": [
            "Blocked malicious IPs",
            "Isolated affected systems",
            "Reset compromised credentials",
            "Applied security patches",
            "Updated detection rules"
        ]
    }
    
    return closure
