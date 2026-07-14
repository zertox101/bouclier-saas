"""Seed the alerts database with findings from the last offensive agent scan (DVWA target).
This is REAL data from REAL Nikto/nmap scans executed by the offensive agent."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.models.sql import CorrelatedAlert, MlAlert
from datetime import datetime

ALERTS = [
    {
        "rule_name": "Cookie Without HttpOnly Flag - PHPSESSID",
        "user": "dvwa-admin",
        "host": "172.24.0.5:80",
        "severity": "medium",
        "details": {"finding": "PHPSESSID cookie created without httponly flag", "nikto_id": "95", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Cookie Without HttpOnly Flag - security",
        "user": "dvwa-admin",
        "host": "172.24.0.5:80",
        "severity": "medium",
        "details": {"finding": "security cookie created without httponly flag", "nikto_id": "95", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Outdated Apache Version (2.4.25)",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "high",
        "details": {"finding": "Apache/2.4.25 appears to be outdated (current is 2.4.66)", "nikto_id": "600050", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Missing Strict-Transport-Security Header",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "medium",
        "details": {"finding": "Suggested security header missing: strict-transport-security", "nikto_id": "013587", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Missing Content-Security-Policy Header",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "medium",
        "details": {"finding": "Suggested security header missing: content-security-policy", "nikto_id": "013587", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Missing X-Content-Type-Options Header",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "low",
        "details": {"finding": "Suggested security header missing: x-content-type-options", "nikto_id": "013587", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Directory Indexing Enabled - /config/",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "high",
        "details": {"finding": "Directory indexing found on /config/", "nikto_id": "750500", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Config Directory Information Disclosure",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "high",
        "details": {"finding": "Configuration information may be available remotely via /config/", "nikto_id": "000998", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Directory Indexing Enabled - /docs/",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "medium",
        "details": {"finding": "Directory indexing found on /docs/", "nikto_id": "750500", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Admin Login Page Exposed - /login.php",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "high",
        "details": {"finding": "Admin login page/section found at /login.php", "nikto_id": "006333", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Missing Referrer-Policy Header",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "low",
        "details": {"finding": "Suggested security header missing: referrer-policy", "nikto_id": "013587", "target": "172.24.0.5"},
    },
    {
        "rule_name": "Missing Permissions-Policy Header",
        "user": "system",
        "host": "172.24.0.5:80",
        "severity": "low",
        "details": {"finding": "Suggested security header missing: permissions-policy", "nikto_id": "013587", "target": "172.24.0.5"},
    },
]

now = int(datetime.utcnow().timestamp())
db = SessionLocal()

# Skip if already seeded (idempotent)
existing = {a.rule_name for a in db.query(CorrelatedAlert).all()}
count = 0
for a in ALERTS:
    if a["rule_name"] in existing:
        continue
    alert = CorrelatedAlert(
        timestamp_epoch=now,
        rule_name=a["rule_name"],
        user=a["user"],
        host=a["host"],
        severity=a["severity"],
        sequence=[{"event": "nikto_scan", "finding": a["details"]["finding"]}],
        details=a["details"],
        status="new",
    )
    db.add(alert)
    count += 1
    now -= 60

db.commit()
db.close()
print(f"Seeded {count} new correlated alerts from real Nikto findings on DVWA.")
