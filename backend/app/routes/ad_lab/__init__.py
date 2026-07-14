from fastapi import APIRouter

router = APIRouter(prefix="/api/ad-lab", tags=["ad-lab"])

AD_USERS = [
    {"samaccountname": "Administrator", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1000", "enabled": True, "admin_count": 1, "last_logon": "2026-06-30T08:00:00Z", "spns": [], "kerberoastable": False, "description": "Built-in admin account", "risk": "critical"},
    {"samaccountname": "svc_sql", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1001", "enabled": True, "admin_count": 0, "last_logon": "2026-06-29T14:30:00Z", "spns": ["MSSQLSvc/sql01.contoso.local:1433"], "kerberoastable": True, "description": "SQL Server service account", "risk": "high"},
    {"samaccountname": "svc_web", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1002", "enabled": True, "admin_count": 0, "last_logon": "2026-06-30T06:00:00Z", "spns": ["HTTP/web01.contoso.local"], "kerberoastable": True, "description": "Web application pool account", "risk": "high"},
    {"samaccountname": "krbtgt", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1003", "enabled": True, "admin_count": 0, "last_logon": "N/A", "spns": ["kadmin/changepw"], "kerberoastable": False, "description": "Key Distribution Center Service Account", "risk": "critical"},
    {"samaccountname": "john.doe", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1004", "enabled": True, "admin_count": 1, "last_logon": "2026-06-28T10:00:00Z", "spns": [], "kerberoastable": False, "description": "Domain admin - VP Engineering", "risk": "high"},
    {"samaccountname": "jane.smith", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1005", "enabled": True, "admin_count": 0, "last_logon": "2026-06-30T09:15:00Z", "spns": [], "kerberoastable": False, "description": "Standard user - Marketing", "risk": "low"},
    {"samaccountname": "backup_svc", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1006", "enabled": True, "admin_count": 1, "last_logon": "2026-06-29T22:00:00Z", "spns": [], "kerberoastable": False, "description": "Backup operator service account with DC sync privileges", "risk": "critical"},
    {"samaccountname": "test_admin", "domain": "CONTOSO", "sid": "S-1-5-21-123456789-1007", "enabled": True, "admin_count": 1, "last_logon": "2026-06-25T16:45:00Z", "spns": [], "kerberoastable": False, "description": "Test account with excessive privileges", "risk": "high"},
]

AD_COMPUTERS = [
    {"name": "DC-01", "domain": "contoso.local", "os": "Windows Server 2022", "ip": "10.0.1.10", "enabled": True, "has_patches": True, "pwd_last_set": "2026-06-15", "risk": "low"},
    {"name": "DC-02", "domain": "contoso.local", "os": "Windows Server 2022", "ip": "10.0.1.11", "enabled": True, "has_patches": True, "pwd_last_set": "2026-06-10", "risk": "low"},
    {"name": "SQL-01", "domain": "contoso.local", "os": "Windows Server 2019", "ip": "10.0.2.50", "enabled": True, "has_patches": False, "pwd_last_set": "2025-12-01", "risk": "high", "missing_patches": ["KB5037768", "KB5036896"]},
    {"name": "WEB-01", "domain": "contoso.local", "os": "Windows Server 2019", "ip": "10.0.2.51", "enabled": True, "has_patches": True, "pwd_last_set": "2026-06-20", "risk": "low"},
    {"name": "FILE-01", "domain": "contoso.local", "os": "Windows Server 2016", "ip": "10.0.3.100", "enabled": True, "has_patches": False, "pwd_last_set": "2024-11-15", "risk": "high", "missing_patches": ["KB5035857", "KB5037017", "KB5035845"]},
    {"name": "WS-01", "domain": "contoso.local", "os": "Windows 11 Enterprise", "ip": "10.0.10.50", "enabled": True, "has_patches": True, "pwd_last_set": "2026-06-28", "risk": "low"},
    {"name": "WS-02", "domain": "contoso.local", "os": "Windows 10 Pro", "ip": "10.0.10.51", "enabled": True, "has_patches": False, "pwd_last_set": "2025-06-01", "risk": "medium"},
]

BLOODHOUND_DATA = {
    "nodes": [
        {"id": "user-administrator", "type": "user", "name": "ADMINISTRATOR@CONTOSO.LOCAL", "admin_count": 1, "sessions": 0, "hasspn": False},
        {"id": "user-john.doe", "type": "user", "name": "john.doe@CONTOSO.LOCAL", "admin_count": 1, "sessions": 2, "hasspn": False},
        {"id": "user-svc_sql", "type": "user", "name": "svc_sql@CONTOSO.LOCAL", "admin_count": 0, "sessions": 1, "hasspn": True},
        {"id": "user-backup_svc", "type": "user", "name": "backup_svc@CONTOSO.LOCAL", "admin_count": 1, "sessions": 0, "hasspn": False},
        {"id": "group-domain-admins", "type": "group", "name": "DOMAIN ADMINS@CONTOSO.LOCAL"},
        {"id": "computer-dc-01", "type": "computer", "name": "DC-01.CONTOSO.LOCAL", "unconstrained_delegation": False},
        {"id": "computer-sql-01", "type": "computer", "name": "SQL-01.CONTOSO.LOCAL", "unconstrained_delegation": True},
        {"id": "computer-web-01", "type": "computer", "name": "WEB-01.CONTOSO.LOCAL", "unconstrained_delegation": False},
    ],
    "edges": [
        {"source": "user-john.doe", "target": "group-domain-admins", "label": "MemberOf"},
        {"source": "user-administrator", "target": "group-domain-admins", "label": "MemberOf"},
        {"source": "user-svc_sql", "target": "computer-sql-01", "label": "AdminTo"},
        {"source": "user-backup_svc", "target": "computer-dc-01", "label": "AdminTo"},
        {"source": "group-domain-admins", "target": "computer-dc-01", "label": "AdminTo"},
        {"source": "group-domain-admins", "target": "computer-sql-01", "label": "AdminTo"},
        {"source": "group-domain-admins", "target": "computer-web-01", "label": "AdminTo"},
    ],
    "attack_paths": [
        {"name": "Kerberoast → SQL Admin → Unconstrained Delegation → DC Sync", "steps": 4, "risk": "critical"},
        {"name": "Backup Operator → DC Sync → Full Domain Compromise", "steps": 2, "risk": "critical"},
    ],
}

@router.get("/status")
def get_status():
    return {"status": "running", "domain": "contoso.local", "dc_count": 2, "user_count": len(AD_USERS), "computer_count": len(AD_COMPUTERS), "forest": "contoso.local", "functional_level": "Windows Server 2016"}

@router.get("/users")
def get_users():
    return {"users": AD_USERS, "total": len(AD_USERS), "kerberoastable": sum(1 for u in AD_USERS if u["kerberoastable"]), "domain_admins": sum(1 for u in AD_USERS if u["admin_count"] > 0)}

@router.get("/computers")
def get_computers():
    return {"computers": AD_COMPUTERS, "total": len(AD_COMPUTERS), "unpatched": sum(1 for c in AD_COMPUTERS if not c["has_patches"])}

@router.get("/bloodhound")
def get_bloodhound():
    return BLOODHOUND_DATA

@router.post("/attack/{technique}")
def simulate_attack(technique: str):
    attacks = {
        "kerberoast": {"technique": "T1558.003", "name": "Kerberoasting", "status": "completed", "hashes_cracked": 2, "accounts_compromised": ["svc_sql", "svc_web"]},
        "asreproast": {"technique": "T1558.004", "name": "AS-REP Roasting", "status": "completed", "hashes_cracked": 1, "accounts_compromised": ["test_admin"]},
        "dcsync": {"technique": "T1003.006", "name": "DCSync", "status": "completed", "hashes_extracted": 3, "krbtgt_hash": "aad3b435b51404eeaad3b435b51404ee"},
        "golden_ticket": {"technique": "T1558.001", "name": "Golden Ticket", "status": "completed", "domain_sid": "S-1-5-21-123456789", "forged_for": "Administrator"},
        "silver_ticket": {"technique": "T1558.002", "name": "Silver Ticket", "status": "completed", "service_spn": "MSSQLSvc/sql01.contoso.local:1433"},
        "dacl_abuse": {"technique": "T1222.001", "name": "DACL Abuse", "status": "completed", "modified_ace": "GenericAll on Domain Admins group"},
    }
    if technique in attacks:
        return {"success": True, "attack": attacks[technique]}
    return {"error": f"Unknown technique: {technique}. Available: {list(attacks.keys())}"}

@router.post("/reset")
def reset_lab():
    return {"status": "reset", "message": "AD lab environment has been reset to default state"}
