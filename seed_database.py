#!/usr/bin/env python3
"""
BOUCLIER — Direct Database Seeder
Seeds SecurityEvent and SOCIncident tables with realistic threat data.
Run from the project root: python seed_database.py
"""
import sys, os, random, uuid
from datetime import datetime, timedelta

# ── resolve backend path ────────────────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
os.chdir(os.path.join(os.path.dirname(__file__), "backend"))

from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

from app.core.database import SessionLocal, engine
from app.models.sql import Base
import app.models.telemetry_sql
import app.models.appsec_sql
import app.models.academy_sql
import app.models.connectors_sql
import app.models.scans_sql
import app.models.governance_sql
import app.models.soc_expert_sql
from app.models.soc_expert_sql import SecurityEvent, SOCIncident

Base.metadata.create_all(bind=engine)

# ── org UUIDs (match seed_orgs.py) ──────────────────────────────────────────
FREE_ORG_ID     = "00000000-0000-0000-0000-000000000002"
PRO_ORG_ID      = "00000000-0000-0000-0000-000000000001"
ENTERPRISE_ORG_ID = "00000000-0000-0000-0000-000000000003"
DEFAULT_ORG_ID   = PRO_ORG_ID  # default org for backward compat

# ── constants ───────────────────────────────────────────────────────────────
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
    {"country": "N. Korea",  "city": "Pyongyang",   "lat": 39.0392,  "lon": 125.7625},
    {"country": "India",     "city": "Mumbai",       "lat": 19.0760,  "lon": 72.8777},
    {"country": "Australia", "city": "Sydney",       "lat": -33.8688, "lon": 151.2093},
]
INTERNAL_IPS = [f"192.168.{r}.{h}" for r in [1,2,10] for h in [10,20,50,100,200]]
EXTERNAL_IPS = [
    f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    for _ in range(40)
]
MITRE_TACTICS = ["TA0001", "TA0002", "TA0003", "TA0004", "TA0005",
                  "TA0006", "TA0007", "TA0008", "TA0009", "TA0010", "TA0011"]
MITRE_TECHNIQUES = ["T1566", "T1190", "T1059", "T1078", "T1021",
                    "T1055", "T1082", "T1041", "T1486", "T1071"]

def rand_ip():
    geo = random.choice(GEO_CITIES)
    ip = f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
    return ip, geo

def seed_events(db, n=500):
    """Seed n SecurityEvent records spanning the last 7 days."""
    print(f"  → Seeding {n} SecurityEvent records…")
    now = datetime.utcnow()
    events = []
    for i in range(n):
        src_ip, geo = rand_ip()
        sev = random.choices(SEVERITIES, SEV_WEIGHTS)[0]
        etype = random.choice(ATTACK_TYPES)
        ts = now - timedelta(
            days=random.uniform(0, 7),
            hours=random.uniform(0, 23),
            minutes=random.uniform(0, 59)
        )
        status_weights = [0.3, 0.15, 0.2, 0.2, 0.15]
        status = random.choices(STATUSES, status_weights)[0]
        conf = round(random.uniform(0.5, 1.0), 3)
        risk = round(random.uniform(20.0, 95.0), 1)

        ev = SecurityEvent(
            org_id=DEFAULT_ORG_ID,
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
    print(f"  ✅ {n} security events inserted.")

def seed_incidents(db, n=25):
    """Seed n SOCIncident records."""
    print(f"  → Seeding {n} SOCIncident records…")
    now = datetime.utcnow()
    cats = ["intrusion", "malware", "data_breach", "dos", "phishing", "insider_threat"]
    inc_statuses = ["open", "open", "in_progress", "in_progress", "resolved", "closed"]
    states = ["new", "acknowledged", "investigating", "contained", "resolved"]
    kc_phases = ["reconnaissance", "weaponization", "delivery", "exploitation", "installation", "c2", "exfiltration"]

    for i in range(n):
        sev = random.choices(SEVERITIES, SEV_WEIGHTS)[0]
        ts = now - timedelta(days=random.uniform(0, 30), hours=random.randint(0, 23))
        inc = SOCIncident(
            org_id=DEFAULT_ORG_ID,
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
    print(f"  ✅ {n} SOC incidents inserted.")


def main():
    print("\n" + "="*55)
    print("  🛡️  BOUCLIER — Database Seeder")
    print("="*55)
    db = SessionLocal()
    try:
        existing = db.query(SecurityEvent).count()
        if existing > 0:
            print(f"\n  ⚠️  Database already has {existing} security events.")
            ans = input("  Re-seed anyway? This will ADD more records. [y/N] ").strip().lower()
            if ans != "y":
                print("  Skipping. DB already seeded.\n")
                return

        seed_events(db, n=500)
        seed_incidents(db, n=30)

        total = db.query(SecurityEvent).count()
        inc_total = db.query(SOCIncident).count()
        print(f"\n  📊 Database totals:")
        print(f"     SecurityEvents : {total}")
        print(f"     SOCIncidents   : {inc_total}")
        print("\n  ✅ Seeding complete! Restart backend or wait for next poll.\n")
    finally:
        db.close()

if __name__ == "__main__":
    main()
