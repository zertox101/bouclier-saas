from fastapi import APIRouter

router = APIRouter(prefix="/api/detection", tags=["detection"])

SIGMA_RULES = [
    {"id": "SIG-001", "title": "Suspicious PowerShell Execution", "severity": "high", "rule": "selection:\n  EventID: 4104\n  Provider: PowerShell\n  Level: 5"},
    {"id": "SIG-002", "title": "Mimikatz Detection", "severity": "critical", "rule": "selection:\n  EventID: 10\n  Source: Microsoft-Windows-Sysmon\n  TargetImage: '*mimikatz*'"},
    {"id": "SIG-003", "title": "Cobalt Strike Beacon", "severity": "critical", "rule": "selection:\n  EventID: 3\n  Source: Microsoft-Windows-Sysmon\n  DestinationPort: 443\n  Image: '*beacon*'"},
    {"id": "SIG-004", "title": "RDP Lateral Movement", "severity": "medium", "rule": "selection:\n  EventID: 4624\n  LogonType: 10\n  AccountName: '*ADMIN*'"},
    {"id": "SIG-005", "title": "Data Exfiltration via DNS", "severity": "high", "rule": "selection:\n  EventID: 22\n  Source: Microsoft-Windows-Sysmon\n  QueryName: '*.tunnel.*'"},
    {"id": "SIG-006", "title": "Malicious Office Macro", "severity": "high", "rule": "selection:\n  EventID: 4688\n  CommandLine: '*winword* /q*'"},
    {"id": "SIG-007", "title": "LSASS Access Attempt", "severity": "critical", "rule": "selection:\n  EventID: 4656\n  ObjectName: '*lsass.exe*'"},
    {"id": "SIG-008", "title": "Persistence via Registry", "severity": "medium", "rule": "selection:\n  EventID: 13\n  TargetObject: '*CurrentVersion\\Run*'"},
]

YARA_RULES = [
    {"id": "YAR-001", "title": "Ransomware String Pattern", "severity": "critical", "rule": "rule ransomware { strings: $s1 = \"encrypt\" $s2 = \"ransom\" condition: any of them }"},
    {"id": "YAR-002", "title": "Shellcode Detection", "severity": "high", "rule": "rule shellcode { strings: $nop = {90 90 90 90} $int3 = {CC} condition: #nop > 10 or #int3 > 5 }"},
    {"id": "YAR-003", "title": "C2 Communication Pattern", "severity": "high", "rule": "rule c2_beacon { strings: $ua = \"Mozilla/5.0 (Windows NT\" $sleep = {FF 15 ? ? ? ? 83 C4 04 FF 15 ? ? ? ? 68 ? ? ? ? FF 15 ? ? ? ? 83 C4 08} condition: all of them }"},
    {"id": "YAR-004", "title": "Meterpreter Payload", "severity": "critical", "rule": "rule meterpreter { strings: $metsrv = \"metsrv\" $stage = \"stage.bin\" condition: any of them }"},
]

DETECTION_ENGINES = [
    {"name": "Sigma", "status": "active", "rules_count": len(SIGMA_RULES), "last_updated": "2026-06-30"},
    {"name": "YARA", "status": "active", "rules_count": len(YARA_RULES), "last_updated": "2026-06-30"},
    {"name": "Suricata", "status": "active", "rules_count": 127, "last_updated": "2026-06-29"},
    {"name": "Wazuh (Rootcheck)", "status": "active", "rules_count": 89, "last_updated": "2026-06-28"},
    {"name": "Falco", "status": "active", "rules_count": 42, "last_updated": "2026-06-27"},
]

@router.get("/status")
def get_detection_status():
    return {"status": "active", "engines": DETECTION_ENGINES}

@router.get("/rules/sigma")
def get_sigma_rules():
    return {"rules": SIGMA_RULES, "total": len(SIGMA_RULES)}

@router.get("/rules/yara")
def get_yara_rules():
    return {"rules": YARA_RULES, "total": len(YARA_RULES)}

@router.get("/recent-alerts")
def get_recent_alerts():
    return {"alerts": [
        {"id": 1, "rule": "Suspicious PowerShell Execution", "severity": "high", "timestamp": "2026-06-30T12:34:56", "source": "WIN-SRV-01", "status": "new"},
        {"id": 2, "rule": "LSASS Access Attempt", "severity": "critical", "timestamp": "2026-06-30T12:30:00", "source": "DC-01", "status": "investigating"},
        {"id": 3, "rule": "RDP Lateral Movement", "severity": "medium", "timestamp": "2026-06-30T11:15:23", "source": "WORKSTN-42", "status": "resolved"},
        {"id": 4, "rule": "Data Exfiltration via DNS", "severity": "high", "timestamp": "2026-06-30T10:05:00", "source": "SRV-WEB-03", "status": "new"},
        {"id": 5, "rule": "Mimikatz Detection", "severity": "critical", "timestamp": "2026-06-29T23:59:59", "source": "DC-02", "status": "contained"},
    ]}
