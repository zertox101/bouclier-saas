"""
Script to populate database with sample security events and incidents
For demo purposes - creates realistic threat data
"""
import sys
import os
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.soc_expert_sql import SecurityEvent, SOCIncident, Base

# Sample data
ATTACK_TYPES = [
    "DDoS", "Brute Force", "SQL Injection", "XSS", "Port Scan",
    "Malware", "Phishing", "Ransomware", "Data Exfiltration", "Botnet"
]

COUNTRIES = [
    "Russia", "China", "United States", "Iran", "North Korea",
    "Brazil", "India", "Germany", "France", "United Kingdom"
]

KILL_CHAIN_STAGES = [
    "Reconnaissance", "Weaponization", "Delivery", "Exploitation",
    "Installation", "Command & Control", "Actions on Objectives"
]

MITRE_IDS = [
    "T1595", "T1592", "T1589",  # Reconnaissance
    "T1588", "T1587", "T1608",  # Weaponization
    "T1566", "T1190", "T1133",  # Delivery
    "T1059", "T1203", "T1068",  # Exploitation
    "T1078", "T1053", "T1136",  # Installation
    "T1071", "T1095", "T1102",  # C2
    "T1041", "T1048", "T1020",  # Exfiltration
]

SEVERITIES = ["critical", "high", "medium", "low"]
SEVERITY_WEIGHTS = [0.1, 0.2, 0.4, 0.3]  # Distribution

def generate_ip():
    """Generate random IP address"""
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"

def generate_events(db: Session, count: int = 500):
    """Generate sample security events"""
    print(f"🔄 Generating {count} security events...")
    
    events = []
    now = datetime.utcnow()
    
    for i in range(count):
        # Random time in last 24 hours
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        
        # Random severity (weighted)
        severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]
        
        # Random attack type
        attack_type = random.choice(ATTACK_TYPES)
        
        # Random country
        country = random.choice(COUNTRIES)
        
        # Random kill chain stage
        kill_chain = random.choice(KILL_CHAIN_STAGES)
        
        # Random MITRE ID
        mitre_id = random.choice(MITRE_IDS)
        
        # Generate IPs
        src_ip = generate_ip()
        dst_ip = generate_ip()
        
        event = SecurityEvent(
            timestamp=timestamp,
            event_type=attack_type,
            severity=severity,
            source_ip=src_ip,
            destination_ip=dst_ip,
            source_country=country,
            kill_chain_stage=kill_chain,
            mitre_technique=mitre_id,
            description=f"{attack_type} detected from {country} ({src_ip})",
            raw_data={
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "country": country,
                "attack_type": attack_type,
                "severity": severity,
                "mitre_id": mitre_id,
                "kill_chain": kill_chain,
                "protocol": random.choice(["TCP", "UDP", "ICMP", "HTTP", "HTTPS"]),
                "port": random.randint(1, 65535),
                "bytes": random.randint(100, 100000),
            }
        )
        events.append(event)
        
        if (i + 1) % 100 == 0:
            print(f"  ✓ Generated {i + 1}/{count} events")
    
    db.bulk_save_objects(events)
    db.commit()
    print(f"✅ Successfully created {count} security events")

def generate_incidents(db: Session, count: int = 50):
    """Generate sample SOC incidents"""
    print(f"🔄 Generating {count} SOC incidents...")
    
    incidents = []
    now = datetime.utcnow()
    
    statuses = ["open", "investigating", "contained", "resolved"]
    
    for i in range(count):
        # Random time in last 7 days
        days_ago = random.uniform(0, 7)
        created_at = now - timedelta(days=days_ago)
        
        # Random severity (weighted)
        severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]
        
        # Random attack type
        attack_type = random.choice(ATTACK_TYPES)
        
        # Random status
        status = random.choice(statuses)
        
        # Random country
        country = random.choice(COUNTRIES)
        
        # Random MITRE ID
        mitre_id = random.choice(MITRE_IDS)
        
        # Generate IP
        src_ip = generate_ip()
        
        incident = SOCIncident(
            title=f"{attack_type} Incident - {country}",
            description=f"Multiple {attack_type} attempts detected from {country} ({src_ip})",
            severity=severity,
            status=status,
            source_ip=src_ip,
            source_country=country,
            mitre_technique=mitre_id,
            created_at=created_at,
            updated_at=created_at + timedelta(hours=random.uniform(0, 24)),
            assigned_to=f"analyst_{random.randint(1, 5)}",
            metadata={
                "attack_type": attack_type,
                "country": country,
                "src_ip": src_ip,
                "mitre_id": mitre_id,
                "event_count": random.randint(5, 100),
                "affected_systems": random.randint(1, 10),
            }
        )
        incidents.append(incident)
        
        if (i + 1) % 10 == 0:
            print(f"  ✓ Generated {i + 1}/{count} incidents")
    
    db.bulk_save_objects(incidents)
    db.commit()
    print(f"✅ Successfully created {count} SOC incidents")

def clear_data(db: Session):
    """Clear existing data"""
    print("🗑️  Clearing existing data...")
    db.query(SecurityEvent).delete()
    db.query(SOCIncident).delete()
    db.commit()
    print("✅ Data cleared")

def main():
    """Main function"""
    print("=" * 60)
    print("🚀 Bouclier SaaS - Database Population Script")
    print("=" * 60)
    print()
    
    # Create tables if they don't exist
    print("📋 Creating tables if needed...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables ready")
    print()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Ask user
        print("⚠️  This will clear existing data and populate with sample data")
        response = input("Continue? (y/n): ").lower().strip()
        
        if response != 'y':
            print("❌ Cancelled")
            return
        
        print()
        
        # Clear existing data
        clear_data(db)
        print()
        
        # Generate events
        generate_events(db, count=500)
        print()
        
        # Generate incidents
        generate_incidents(db, count=50)
        print()
        
        # Summary
        event_count = db.query(SecurityEvent).count()
        incident_count = db.query(SOCIncident).count()
        
        print("=" * 60)
        print("✅ DATABASE POPULATED SUCCESSFULLY")
        print("=" * 60)
        print(f"📊 Security Events: {event_count}")
        print(f"📊 SOC Incidents: {incident_count}")
        print()
        print("🎯 You can now:")
        print("  1. Start the backend: uvicorn app.main:app --reload --port 8005")
        print("  2. Start the frontend: npm run dev")
        print("  3. View the dashboard with real data!")
        print()
        print("📝 Pages that will show data:")
        print("  ✅ Overview (/overview)")
        print("  ✅ SOC Expert (/operation-soc-expert)")
        print("  ✅ Threat Intelligence (/threat-monitor)")
        print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
