#!/usr/bin/env python3
"""
BOUCLIER — Multi-Org Database Seeder
Creates 3 organizations (FREE, PRO, ENTERPRISE), seeds users,
and distributes events/incidents/assets/alerts proportionally across orgs.

Usage: python backend/seed_orgs.py [--force]
"""
import sys, os, random, uuid
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.sql import Base, Organization, User, Asset, AlertEvent, AuditLog, Incident, TrafficStat, EventLog, CorrelatedAlert, MlAlert
from app.models.soc_expert_sql import SecurityEvent, SOCIncident, ThreatIntelligence, Playbook, CorrelationRule, InvestigationNote, ThreatHunt, AlertPriority
import app.models.telemetry_sql
import app.models.appsec_sql
import app.models.academy_sql
import app.models.connectors_sql
import app.models.scans_sql
import app.models.governance_sql

Base.metadata.create_all(bind=engine)

# ── Org IDs (stable UUIDs - match existing DB) ──────────────────────────────
FREE_ORG_ID     = "00000000-0000-0000-0000-000000000002"
PRO_ORG_ID      = "00000000-0000-0000-0000-000000000001"
ENTERPRISE_ORG_ID = "00000000-0000-0000-0000-000000000003"

ORGS = {
    "free": {"id": FREE_ORG_ID, "name": "Startup Shield", "slug": "startup-shield", "plan": "FREE"},
    "pro":  {"id": PRO_ORG_ID,  "name": "Bouclier Enterprise", "slug": "bouclier-enterprise", "plan": "PRO"},
    "enterprise": {"id": ENTERPRISE_ORG_ID, "name": "MegaCorp Defense", "slug": "megacorp-defense", "plan": "ENTERPRISE"},
}

ORG_WEIGHTS = {"free": 0.20, "pro": 0.30, "enterprise": 0.50}

# ── Constants ───────────────────────────────────────────────────────────────
ATTACK_TYPES = [
    "Brute Force", "SQL Injection", "XSS", "DDoS", "Malware",
    "Phishing", "Port Scan", "Ransomware", "Command & Control", "Lateral Movement",
    "Credential Stuffing", "Zero-Day Exploit", "DNS Tunneling", "Man-in-the-Middle",
]
SEVERITIES = ["critical", "high", "medium", "low"]
SEV_WEIGHTS = [0.10, 0.20, 0.40, 0.30]
STATUSES = ["new", "acknowledged", "investigating", "resolved", "closed"]
SOURCE_MODULES = ["gotham", "redhound", "osint360", "kali", "ids", "waf", "edr"]
THREAT_ACTORS = ["APT28", "Lazarus Group", "DarkSide", "Carbanak", "Unknown"]
GEO_CITIES = [
    {"country": "Russia",    "city": "Moscow",       "lat": 55.7558,  "lon": 37.6173},
    {"country": "China",     "city": "Beijing",      "lat": 39.9042,  "lon": 116.4074},
    {"country": "USA",       "city": "New York",     "lat": 40.7128,  "lon": -74.0060},
    {"country": "Brazil",    "city": "São Paulo",    "lat": -23.5505, "lon": -46.6333},
    {"country": "France",    "city": "Paris",        "lat": 48.8566,  "lon": 2.3522},
    {"country": "Germany",   "city": "Berlin",       "lat": 52.5200,  "lon": 13.4050},
    {"country": "Japan",     "city": "Tokyo",        "lat": 35.6762,  "lon": 139.6503},
    {"country": "UK",        "city": "London",       "lat": 51.5074,  "lon": -0.1278},
    {"country": "Iran",      "city": "Tehran",       "lat": 35.6892,  "lon": 51.3890},
    {"country": "N. Korea",  "city": "Pyongyang",    "lat": 39.0392,  "lon": 125.7625},
    {"country": "India",     "city": "Mumbai",       "lat": 19.0760,  "lon": 72.8777},
    {"country": "Australia", "city": "Sydney",       "lat": -33.8688, "lon": 151.2093},
]
INTERNAL_IPS = [f"192.168.{r}.{h}" for r in [1, 2, 10] for h in [10, 20, 50, 100, 200]]
MITRE_TACTICS = ["TA0001", "TA0002", "TA0003", "TA0004", "TA0005",
                 "TA0006", "TA0007", "TA0008", "TA0009", "TA0010", "TA0011"]
MITRE_TECHNIQUES = ["T1566", "T1190", "T1059", "T1078", "T1021",
                    "T1055", "T1082", "T1041", "T1486", "T1071"]

# ── Helpers ─────────────────────────────────────────────────────────────────
def rand_ip():
    geo = random.choice(GEO_CITIES)
    ip = f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    return ip, geo

def pick_org():
    """Weighted random org key."""
    keys = list(ORG_WEIGHTS.keys())
    weights = list(ORG_WEIGHTS.values())
    return random.choices(keys, weights)[0]

# ── Seed Functions ──────────────────────────────────────────────────────────
def seed_organizations(db):
    print("  → Creating organizations…")
    for key, info in ORGS.items():
        existing = db.query(Organization).filter(Organization.id == info["id"]).first()
        if not existing:
            org = Organization(
                id=info["id"],
                name=info["name"],
                slug=info["slug"],
                plan=info["plan"],
                subscription_status="ACTIVE",
            )
            db.add(org)
            print(f"    + Created {info['plan']}: {info['name']}")
        else:
            print(f"    ~ {info['name']} already exists")
    db.commit()

def seed_users(db):
    print("  → Creating users…")
    PWD = "Bouclier2026!"
    users_data = [
        ("super", "super@local", "SUPER_ADMIN", ENTERPRISE_ORG_ID),
        ("enterprise", "enterprise@local", "SUPER_ADMIN", ENTERPRISE_ORG_ID),
        ("admin", "admin@local", "ORG_ADMIN", PRO_ORG_ID),
        ("analyst1", "analyst1@local", "ANALYST", PRO_ORG_ID),
        ("free", "free@local", "ANALYST", FREE_ORG_ID),
    ]
    for username, email, role, org_id in users_data:
        existing = db.query(User).filter(User.email == email).first()
        if not existing:
            user = User(
                username=username,
                email=email,
                hashed_password=hash_password(PWD),
                role=role,
                org_id=org_id,
                is_active=True,
                plan=role,
            )
            db.add(user)
            print(f"    + Created {email} ({role})")
        else:
            print(f"    ~ {email} already exists")
    db.commit()

def seed_security_events(db, n=500):
    print(f"  → Seeding {n} SecurityEvents across orgs…")
    now = datetime.utcnow()
    events = []
    for i in range(n):
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        src_ip, geo = rand_ip()
        sev = random.choices(SEVERITIES, SEV_WEIGHTS)[0]
        etype = random.choice(ATTACK_TYPES)
        ts = now - timedelta(days=random.uniform(0, 7), hours=random.uniform(0, 23), minutes=random.uniform(0, 59))
        status_weights = [0.3, 0.15, 0.2, 0.2, 0.15]
        status = random.choices(STATUSES, status_weights)[0]
        conf = round(random.uniform(0.5, 1.0), 3)
        risk = round(random.uniform(20.0, 95.0), 1)
        ev = SecurityEvent(
            org_id=org_id,
            timestamp=ts,
            timestamp_epoch=int(ts.timestamp()),
            source_module=random.choice(SOURCE_MODULES),
            source_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            event_type=etype,
            severity=sev,
            status=status,
            src_ip=src_ip,
            dst_ip=random.choice(INTERNAL_IPS),
            src_port=random.choice([80, 443, 22, 3389, 8080, 21, random.randint(1024, 65535)]),
            dst_port=random.choice([80, 443, 22, 3389, 8080, 3306]),
            protocol=random.choice(["TCP", "UDP", "ICMP"]),
            hostname=f"host-{random.randint(1,50):03d}.internal",
            username=random.choice(["admin", "root", "service", "webapp", None]),
            mitre_attack_tactics=random.sample(MITRE_TACTICS, k=random.randint(1, 3)),
            mitre_attack_techniques=random.sample(MITRE_TECHNIQUES, k=random.randint(1, 3)),
            threat_actor=random.choice(THREAT_ACTORS + [None, None]),
            risk_score=risk,
            confidence_score=conf,
            ioc_type=random.choice(["ip", "domain", "hash", "url"]),
            ioc_value=src_ip,
            geo_location={"country": geo["country"], "city": geo["city"],
                          "lat": geo["lat"] + random.uniform(-2, 2),
                          "lon": geo["lon"] + random.uniform(-2, 2)},
            title=f"{etype} detected from {geo['country']}",
            description=f"{sev.upper()} severity {etype} event from {src_ip} targeting internal infrastructure.",
            raw_data={"bytes": random.randint(100, 50000), "packets": random.randint(1, 500)},
            tags=[sev, etype.lower().replace(" ", "_")],
            created_at=ts,
        )
        events.append(ev)
    db.bulk_save_objects(events)
    db.commit()
    counts = {}
    for ev in events:
        counts[ev.org_id] = counts.get(ev.org_id, 0) + 1
    for org_id, cnt in sorted(counts.items()):
        org_name = next((o["name"] for o in ORGS.values() if o["id"] == org_id), org_id)
        print(f"    {org_name}: {cnt} events")

def seed_soc_incidents(db, n=30):
    print(f"  → Seeding {n} SOCIncidents across orgs…")
    now = datetime.utcnow()
    cats = ["intrusion", "malware", "data_breach", "dos", "phishing", "insider_threat"]
    inc_statuses = ["open", "open", "in_progress", "in_progress", "resolved", "closed"]
    states = ["new", "acknowledged", "investigating", "contained", "resolved"]
    kc_phases = ["reconnaissance", "weaponization", "delivery", "exploitation", "installation", "c2", "exfiltration"]
    for i in range(n):
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        sev = random.choices(SEVERITIES, SEV_WEIGHTS)[0]
        ts = now - timedelta(days=random.uniform(0, 30), hours=random.randint(0, 23))
        inc = SOCIncident(
            org_id=org_id,
            incident_id=f"INC-{ts.year}-{(i+1):04d}",
            title=f"{random.choice(ATTACK_TYPES)} Campaign — {random.choice(THREAT_ACTORS)}",
            description="Automated incident generated from correlated security events.",
            severity=sev,
            priority=sev,
            category=random.choice(cats),
            state=random.choice(states),
            status=random.choice(inc_statuses),
            mitre_attack_tactics=random.sample(MITRE_TACTICS, k=random.randint(1, 3)),
            mitre_attack_techniques=random.sample(MITRE_TECHNIQUES, k=random.randint(1, 2)),
            kill_chain_phase=random.choice(kc_phases),
            assigned_to=random.choice(["analyst1", "analyst2", "analyst3"]),
            team=random.choice(["SOC Tier-1", "SOC Tier-2", "IR Team"]),
            business_impact=random.choice(["critical", "high", "medium", "low", "none"]),
            threat_actor=random.choice(THREAT_ACTORS),
            detection_time=ts,
            created_at=ts,
        )
        db.add(inc)
    db.commit()

def seed_assets(db):
    print("  → Seeding Assets across orgs…")
    asset_templates = [
        {"asset_tag": "AS-001", "name": "CORE-FW-01", "type": "Firewall", "ip_address": "192.168.1.1", "risk_level": "Low", "status": "Healthy", "performance_load": 12},
        {"asset_tag": "AS-002", "name": "SRV-DATACENTER-A", "type": "Database", "ip_address": "10.0.0.45", "risk_level": "Medium", "status": "Warning", "performance_load": 88},
        {"asset_tag": "AS-003", "name": "WKS-ADMIN-X", "type": "Workstation", "ip_address": "10.0.2.14", "risk_level": "High", "status": "Breached", "performance_load": 4},
        {"asset_tag": "AS-004", "name": "APP-AUTH-SECURE", "type": "Server", "ip_address": "172.16.0.5", "risk_level": "Low", "status": "Healthy", "performance_load": 34},
        {"asset_tag": "AS-005", "name": "WIFI-GUEST-AP", "type": "Access Point", "ip_address": "192.168.50.2", "risk_level": "Medium", "status": "Suspicious", "performance_load": 65},
        {"asset_tag": "AS-006", "name": "EXT-WEB-PORTAL", "type": "Web App", "ip_address": "203.0.113.4", "risk_level": "Low", "status": "Healthy", "performance_load": 21},
        {"asset_tag": "AS-007", "name": "SRV-WEB-PROD", "type": "Server", "ip_address": "10.0.1.10", "risk_level": "High", "status": "Warning", "performance_load": 45},
        {"asset_tag": "AS-008", "name": "DB-CLUSTER-MAIN", "type": "Database", "ip_address": "10.0.0.1", "risk_level": "Critical", "status": "Healthy", "performance_load": 72},
        {"asset_tag": "AS-009", "name": "SWITCH-CORE", "type": "Network", "ip_address": "10.0.0.254", "risk_level": "Low", "status": "Healthy", "performance_load": 30},
    ]
    for tpl in asset_templates:
        existing = db.query(Asset).filter(Asset.asset_tag == tpl["asset_tag"]).first()
        if existing:
            continue
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        db.add(Asset(**tpl, org_id=org_id))
    db.commit()

def seed_alert_events(db, n=9):
    print(f"  → Seeding {n} AlertEvents across orgs…")
    now = datetime.utcnow()
    alert_types = ["SSH_BruteForce", "DDoS", "ML_Anomaly", "Port_Scan", "Malware_Detected"]
    for i in range(n):
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        ts = now - timedelta(minutes=random.randint(1, 1440))
        alert = AlertEvent(
            timestamp=ts,
            src_ip=f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
            dst_ip=random.choice(INTERNAL_IPS),
            dst_port=random.choice([22, 443, 8080, 3306, 3389]),
            type=random.choice(alert_types),
            severity=random.choices(SEVERITIES, SEV_WEIGHTS)[0],
            details={"attempts": random.randint(10, 500), "rate": f"{random.randint(100, 5000)} req/s"},
            status=random.choice(["new", "investigating", "resolved"]),
            org_id=org_id,
        )
        db.add(alert)
    db.commit()

def seed_incidents(db, n=10):
    print(f"  → Seeding {n} Incidents across orgs…")
    now = datetime.utcnow()
    statuses = ["Open", "Open", "In Progress", "Resolved", "Closed"]
    severities = ["Critical", "High", "Medium", "Low"]
    for i in range(n):
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        ts = now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        inc = Incident(
            title=f"{random.choice(ATTACK_TYPES)} — {random.choice(THREAT_ACTORS)}",
            description="Security incident requiring investigation.",
            severity=random.choice(severities),
            status=random.choice(statuses),
            owner=random.choice(["analyst", "admin", "enterprise"]),
            org_id=org_id,
            created_at=ts,
        )
        db.add(inc)
    db.commit()

def seed_audit_logs(db, n=10):
    print(f"  → Seeding {n} AuditLogs across orgs…")
    now = datetime.utcnow()
    actions = ["LOGIN", "INCIDENT_UPDATE", "REPORT_EXPORT", "CONFIG_CHANGE", "USER_CREATED"]
    users_by_org = {
        FREE_ORG_ID: ["free"],
        PRO_ORG_ID: ["admin", "analyst1"],
        ENTERPRISE_ORG_ID: ["super", "enterprise"],
    }
    for i in range(n):
        org_key = pick_org()
        org_id = ORGS[org_key]["id"]
        user = random.choice(users_by_org.get(org_id, ["unknown"]))
        log = AuditLog(
            org_id=org_id,
            user_id=user,
            action=random.choice(actions),
            entity_type=random.choice(["session", "incident", "report", "user", "config"]),
            entity_id=f"ent-{uuid.uuid4().hex[:6]}",
            ip_address=f"10.0.{random.randint(0,255)}.{random.randint(1,254)}",
            created_at=now - timedelta(hours=random.randint(0, 72)),
        )
        db.add(log)
    db.commit()

def seed_telemetry_counters(db):
    print("  → Seeding TelemetryCounters for each org…")
    for key, info in ORGS.items():
        org_id = info["id"]
        ev_count = db.query(SecurityEvent).filter(SecurityEvent.org_id == org_id).count()
        inc_count = db.query(SOCIncident).filter(SOCIncident.org_id == org_id).count()
        alert_count = db.query(AlertEvent).filter(AlertEvent.org_id == org_id).count()
        existing = db.query(app.models.telemetry_sql.TelemetryCounter).filter(
            app.models.telemetry_sql.TelemetryCounter.org_id == org_id
        ).first()
        if not existing:
            db.add(app.models.telemetry_sql.TelemetryCounter(
                org_id=org_id,
                events_count=ev_count,
                incidents_count=inc_count,
                alerts_count=alert_count,
            ))
        else:
            existing.events_count = ev_count
            existing.incidents_count = inc_count
            existing.alerts_count = alert_count
    db.commit()

def seed_playbooks(db):
    print("  → Seeding Playbooks for each org…")
    playbook_templates = [
        {"name": "ransomware_response", "display_name": "Ransomware Response", "category": "incident_response", "severity": "critical", "auto_execute": True, "requires_approval": True,
         "workflow_steps": [{"step_id": "1", "name": "Isolate Host", "type": "action", "action": "isolate_endpoint"}, {"step_id": "2", "name": "Collect Forensics", "type": "action", "action": "collect_forensics"}]},
        {"name": "phishing_investigation", "display_name": "Phishing Investigation", "category": "incident_response", "severity": "high", "auto_execute": False, "requires_approval": True,
         "workflow_steps": [{"step_id": "1", "name": "Analyze Email", "type": "action", "action": "analyze_email"}, {"step_id": "2", "name": "Block Sender", "type": "action", "action": "block_sender"}]},
        {"name": "threat_hunt_daily", "display_name": "Daily Threat Hunt", "category": "threat_hunting", "severity": "medium", "auto_execute": True, "requires_approval": False,
         "workflow_steps": [{"step_id": "1", "name": "Query SIEM", "type": "action", "action": "query_siem"}, {"step_id": "2", "name": "Correlate Alerts", "type": "action", "action": "correlate_alerts"}]},
    ]
    for key, info in ORGS.items():
        org_id = info["id"]
        for tpl in playbook_templates:
            existing = db.query(Playbook).filter(Playbook.org_id == org_id, Playbook.name == tpl["name"]).first()
            if existing:
                continue
            db.add(Playbook(
                org_id=org_id,
                name=tpl["name"],
                display_name=tpl["display_name"],
                description=f"Automated {tpl['display_name']} playbook",
                version="1.0",
                category=tpl["category"],
                severity=tpl["severity"],
                mitre_attack_tactics=random.sample(MITRE_TACTICS, k=2),
                mitre_attack_techniques=random.sample(MITRE_TECHNIQUES, k=2),
                auto_execute=tpl["auto_execute"],
                requires_approval=tpl["requires_approval"],
                workflow_steps=tpl["workflow_steps"],
                is_active=True,
                is_template=True,
            ))
    db.commit()

def seed_correlation_rules(db):
    print("  → Seeding CorrelationRules for each org…")
    rule_templates = [
        {"name": "brute_force_detect", "display_name": "Brute Force Detection", "rule_type": "threshold", "time_window_seconds": 300, "threshold_count": 10,
         "event_types": ["Brute Force", "SSH_BruteForce"], "correlation_fields": ["src_ip"]},
        {"name": "lateral_movement", "display_name": "Lateral Movement", "rule_type": "sequence", "time_window_seconds": 3600, "threshold_count": 3,
         "event_types": ["Lateral Movement"], "correlation_fields": ["src_ip", "dst_ip"]},
        {"name": "data_exfil", "display_name": "Data Exfiltration", "rule_type": "statistical", "time_window_seconds": 1800, "threshold_count": 5,
         "event_types": ["DDoS", "Command & Control"], "correlation_fields": ["src_ip"]},
    ]
    for key, info in ORGS.items():
        org_id = info["id"]
        for tpl in rule_templates:
            existing = db.query(CorrelationRule).filter(CorrelationRule.org_id == org_id, CorrelationRule.name == tpl["name"]).first()
            if existing:
                continue
            db.add(CorrelationRule(
                org_id=org_id,
                name=tpl["name"],
                display_name=tpl["display_name"],
                description=f"Automated {tpl['display_name']} rule",
                rule_type=tpl["rule_type"],
                rule_logic={"conditions": [], "actions": []},
                time_window_seconds=tpl["time_window_seconds"],
                event_types=tpl["event_types"],
                correlation_fields=tpl["correlation_fields"],
                threshold_count=tpl["threshold_count"],
                output_severity="medium",
                is_active=True,
            ))
    db.commit()

def main():
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    print("\n" + "="*55)
    print("  BOUCLIER - Multi-Org Seeder")
    print("="*55)
    db = SessionLocal()
    try:
        force = "--force" in sys.argv
        existing = db.query(SecurityEvent).count()
        if existing > 0 and not force:
            print(f"\n  ! Database already has {existing} security events.")
            ans = input("  Re-seed anyway? This will ADD more records. [y/N] ").strip().lower()
            if ans != "y":
                print("  Skipping.\n")
                return

        seed_organizations(db)
        seed_users(db)
        seed_security_events(db, n=500)
        seed_soc_incidents(db, n=30)
        seed_assets(db)
        seed_alert_events(db, n=9)
        seed_incidents(db, n=10)
        seed_audit_logs(db, n=10)
        seed_playbooks(db)
        seed_correlation_rules(db)
        seed_telemetry_counters(db)

        total_events = db.query(SecurityEvent).count()
        total_incidents = db.query(SOCIncident).count()
        total_assets = db.query(Asset).count()
        total_users = db.query(User).count()
        total_orgs = db.query(Organization).count()
        print(f"\n  Database totals:")
        print(f"     Organizations  : {total_orgs}")
        print(f"     Users          : {total_users}")
        print(f"     SecurityEvents : {total_events}")
        print(f"     SOCIncidents   : {total_incidents}")
        print(f"     Assets         : {total_assets}")
        print("\n  Multi-org seeding complete!\n")
    finally:
        db.close()

if __name__ == "__main__":
    main()
