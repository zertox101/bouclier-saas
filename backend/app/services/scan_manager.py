import ipaddress
import socket
import logging
import requests
import json
import time
from typing import Optional
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.scans_sql import ScanJob, Finding

# Configure logger
logger = logging.getLogger(__name__)

TOOLS_API_URL = "http://localhost:8100"
ZAP_URL = "http://localhost:8080"

class ScanManager:
    
    @staticmethod
    def is_private_target(target: str) -> bool:
        """
        Ensures target is a private IP or resolves to one.
        Allows localhost.
        """
        try:
            # Extract hostname
            if "://" in target:
                hostname = urlparse(target).hostname
            else:
                hostname = target.split(":")[0].split("/")[0]
            
            if not hostname:
                return False

            # Resolve to IP
            try:
                ip_list = socket.getaddrinfo(hostname, None)
                ips = [x[4][0] for x in ip_list]
            except socket.gaierror:
                return False # Cannot resolve

            # Check all resolved IPs
            for ip_str in ips:
                ip = ipaddress.ip_address(ip_str)
                if not ip.is_private and not ip.is_loopback:
                    return False
            
            return True
        except Exception:
            return False

    @staticmethod
    def create_scan(db: Session, target: str, tool: str, user_id: str = None, org_id: Optional[str] = None) -> ScanJob:
        # 1. Security Check
        # Allow disabling check via env var for testing if needed, but per requirements default is strict
        # For now, simplistic implementation
        if not ScanManager.is_private_target(target):
            raise ValueError("Target must resolve to a private IP address.")

        # 2. Create DB Record
        scan = ScanJob(
            org_id=org_id,
            tool=tool,
            target=target,
            status="pending",
            actor_user_id=user_id,
            created_at=datetime.utcnow()
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan

    @staticmethod
    def start_scan_job(db: Session, scan_id: int):
        scan = db.query(ScanJob).filter(ScanJob.id == scan_id).first()
        if not scan:
            return
        
        scan.status = "running"
        scan.started_at = datetime.utcnow()
        db.commit()

        try:
            if scan.tool == "zap":
                ScanManager._run_zap(db, scan)
            elif scan.tool == "nuclei":
                ScanManager._run_nuclei(db, scan)
            else:
                raise ValueError("Unknown tool")
                
            scan.status = "completed"
        except Exception as e:
            logger.error(f"Scan failed: {e}")
            scan.status = "failed"
            # Log error finding?
        finally:
            scan.finished_at = datetime.utcnow()
            db.commit()

    @staticmethod
    def _run_zap(db: Session, scan: ScanJob):
        # 1. Spider
        logger.info(f"Starting ZAP Spider for {scan.target}")
        try:
            res = requests.get(f"{ZAP_URL}/JSON/spider/action/scan/", params={'url': scan.target})
            spider_id = res.json().get('scan')
            
            # Poll spider status
            while True:
                status_res = requests.get(f"{ZAP_URL}/JSON/spider/view/status/", params={'scanId': spider_id})
                progress = int(status_res.json().get('status', 0))
                if progress >= 100: break
                time.sleep(2)
        except Exception as e:
            logger.error(f"ZAP Spider failed: {e}")

        # 2. Results
        try:
            res = requests.get(f"{ZAP_URL}/JSON/alert/view/alerts/", params={'baseurl': scan.target})
            alerts = res.json().get('alerts', [])
            
            for alert in alerts:
                # Deduplication logic could go here
                finding = Finding(
                    org_id=scan.org_id,
                    scan_job_id=scan.id,
                    severity=alert.get('risk', 'info').lower(),
                    title=alert.get('alert'),
                    description=alert.get('description'),
                    url=alert.get('url'),
                    param=alert.get('param'),
                    cwe=alert.get('cweid'),
                    confidence=alert.get('confidence'),
                    remediation=alert.get('solution'),
                    fingerprint_hash=str(hash(alert.get('alert') + alert.get('url')))
                )
                db.add(finding)
            db.commit()
        except Exception as e:
            logger.error(f"ZAP alerting check failed: {e}")

    @staticmethod
    def _run_nuclei(db: Session, scan: ScanJob):
        # Call tools-api to run nuclei
        payload = {
            "tool_id": "nuclei_scan",
            "input": {
                "target": scan.target,
                "severity": "critical,high,medium"
            }
        }
        try:
            res = requests.post(f"{TOOLS_API_URL}/tools/run", json=payload)
            job_data = res.json()
            job_id = job_data.get('job_id')
            
            # Poll tools-api until done
            while True:
                status_res = requests.get(f"{TOOLS_API_URL}/tools/jobs/{job_id}")
                status_data = status_res.json()
                if status_data.get('status') != 'running':
                    # Parse logs for findings (assuming nuclei outputs findings to logs)
                    for log in status_data.get('logs', []):
                        msg = log.get('message', '')
                        # Nuclei logs findings in a specific format or JSON
                        # For now, let's assume we can parse a simple pattern or just log the event
                        if "[" in msg and "]" in msg:
                            # Mock parsing: [info] [cve-2021-...] ...
                            finding = Finding(
                                org_id=scan.org_id,
                                scan_job_id=scan.id,
                                severity="high" if "high" in msg.lower() else "medium" if "medium" in msg.lower() else "low",
                                title=f"Nuclei Finding: {msg[:50]}...",
                                description=msg,
                                url=scan.target,
                                fingerprint_hash=str(hash(msg))
                            )
                            db.add(finding)
                    break
                time.sleep(3)
            db.commit()
        except Exception as e:
            logger.error(f"Nuclei scan failed: {e}")

        
