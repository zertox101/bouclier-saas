"""
Complete Demo Data Setup Script
Populates both Database (PostgreSQL) and Redis for full demo
"""
import sys
import os
import json
import time
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.soc_expert_sql import SecurityEvent, SOCIncident, Base

# Try to import Redis
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("⚠️  Redis library not installed. Run: pip install redis")

# Sample data
ATTACK_TYPES = [
    "DDoS", "Brute Force", "SQL Injection", "XSS", "Port Scan",
    "Malware", "Phishing", "Ransomware", "Data Exfiltration", "Botnet"
]

THREAT_LOCATIONS = [
    {"name": "Moscow, Russia", "lat": 55.7558, "lon": 37.6173, "country": "Russia"},
    {"name": "Beijing, China", "lat": 39.9042, "lon": 116.4074, "country": "China"},
    {"name": "Tehran, Iran", "lat": 35.6892, "lon": 51.3890, "country": "Iran"},
    {"name": "Pyongyang, North Korea", "lat": 39.0392, "lon": 125.7625, "country": "North Korea"},
    {"name": "São Paulo, Brazil", "lat": -23.5505, "lon": -46.6333, "country": "Brazil"},
    {"name": "Mumbai, India", "lat": 19.0760, "lon": 72.8777, "country": "India"},
    {"name": "Lagos, Nigeria", "lat": 6.5244, "lon": 3.3792, "country": "Nigeria"},
    {"name": "Istanbul, Turkey", "lat": 41.0082, "lon": 28.9784, "country": "Turkey"},
    {"name": "Jakarta, Indonesia", "lat": -6.2088, "lon": 106.8456, "country": "Indonesia"},
    {"name": "Bucharest, Romania", "lat": 44.4268, "lon": 26.1025, "country": "Romania"},
]

TARGET_LOCATIONS = [
    {"name": "New York, USA", "lat": 40.7128, "lon": -74.0060, "country": "United States"},
    {"name": "London, UK", "lat": 51.5074, "lon": -0.1278, "country": "United Kingdom"},
    {"name": "Paris, France", "lat": 48.8566, "lon": 2.3522, "country": "France"},
    {"name": "Berlin, Germany", "lat": 52.5200, "lon": 13.4050, "country": "Germany"},
    {"name": "Tokyo, Japan", "lat": 35.6762, "lon": 139.6503, "country": "Japan"},
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
SEVERITY_WEIGHTS = [0.1, 0.2, 0.4, 0.3]

def generate_ip():
    """Generate random IP address"""
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"

def populate_database(db: Session, event_count: int = 500, incident_count: int = 50):
    """Populate database with sample data"""
    print("\n" + "=" * 60)
    print("📊 DATABASE POPULATION")
    print("=" * 60)
    
    # Clear existing data
    print("🗑️  Clearing existing data...")
    db.query(SecurityEvent).delete()
    db.query(SOCIncident).delete()
    db.commit()
    print("✅ Data cleared")
    
    # Generate events
    print(f"\n🔄 Generating {event_count} security events...")
    events = []
    now = datetime.utcnow()
    
    for i in range(event_count):
        hours_ago = random.uniform(0, 24)
        timestamp = now - timedelta(hours=hours_ago)
        severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]
        attack_type = random.choice(ATTACK_TYPES)
        source_loc = random.choice(THREAT_LOCATIONS)
        target_loc = random.choice(TARGET_LOCATIONS)
        kill_chain = random.choice(KILL_CHAIN_STAGES)
        mitre_id = random.choice(MITRE_IDS)
        src_ip = generate_ip()
        dst_ip = generate_ip()
        
        event = SecurityEvent(
            timestamp=timestamp,
            event_type=attack_type,
            severity=severity,
            source_ip=src_ip,
            destination_ip=dst_ip,
            source_country=source_loc["country"],
            kill_chain_stage=kill_chain,
            mitre_technique=mitre_id,
            description=f"{attack_type} detected from {source_loc['country']} ({src_ip})",
            raw_data={
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "src_country": source_loc["country"],
                "dst_country": target_loc["country"],
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
            print(f"  ✓ Generated {i + 1}/{event_count} events")
    
    db.bulk_save_objects(events)
    db.commit()
    print(f"✅ Successfully created {event_count} security events")
    
    # Generate incidents
    print(f"\n🔄 Generating {incident_count} SOC incidents...")
    incidents = []
    statuses = ["open", "investigating", "contained", "resolved"]
    
    for i in range(incident_count):
        days_ago = random.uniform(0, 7)
        created_at = now - timedelta(days=days_ago)
        severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]
        attack_type = random.choice(ATTACK_TYPES)
        status = random.choice(statuses)
        source_loc = random.choice(THREAT_LOCATIONS)
        mitre_id = random.choice(MITRE_IDS)
        src_ip = generate_ip()
        
        incident = SOCIncident(
            title=f"{attack_type} Incident - {source_loc['country']}",
            description=f"Multiple {attack_type} attempts detected from {source_loc['country']} ({src_ip})",
            severity=severity,
            status=status,
            source_ip=src_ip,
            source_country=source_loc["country"],
            mitre_technique=mitre_id,
            created_at=created_at,
            updated_at=created_at + timedelta(hours=random.uniform(0, 24)),
            assigned_to=f"analyst_{random.randint(1, 5)}",
            metadata={
                "attack_type": attack_type,
                "country": source_loc["country"],
                "src_ip": src_ip,
                "mitre_id": mitre_id,
                "event_count": random.randint(5, 100),
                "affected_systems": random.randint(1, 10),
            }
        )
        incidents.append(incident)
        
        if (i + 1) % 10 == 0:
            print(f"  ✓ Generated {i + 1}/{incident_count} incidents")
    
    db.bulk_save_objects(incidents)
    db.commit()
    print(f"✅ Successfully created {incident_count} SOC incidents")
    
    # Summary
    event_count_db = db.query(SecurityEvent).count()
    incident_count_db = db.query(SOCIncident).count()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE POPULATED")
    print("=" * 60)
    print(f"📊 Security Events: {event_count_db}")
    print(f"📊 SOC Incidents: {incident_count_db}")

def populate_redis(redis_client, event_count: int = 100):
    """Populate Redis with threat map data"""
    print("\n" + "=" * 60)
    print("🗺️  REDIS THREAT MAP POPULATION")
    print("=" * 60)
    
    if not REDIS_AVAILABLE:
        print("❌ Redis library not available")
        return
    
    try:
        # Test connection
        redis_client.ping()
        print("✅ Redis connection successful")
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("   Make sure Redis is running: redis-server")
        return
    
    # Clear existing stream
    try:
        redis_client.delete("flows")
        print("🗑️  Cleared existing 'flows' stream")
    except:
        pass
    
    print(f"\n🔄 Generating {event_count} threat map events...")
    
    for i in range(event_count):
        source = random.choice(THREAT_LOCATIONS)
        target = random.choice(TARGET_LOCATIONS)
        attack_type = random.choice(ATTACK_TYPES)
        severity = random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0]
        
        event = {
            "src_lat": source["lat"],
            "src_lon": source["lon"],
            "src_country": source["country"],
            "src_city": source["name"],
            "dst_lat": target["lat"],
            "dst_lon": target["lon"],
            "dst_country": target["country"],
            "dst_city": target["name"],
            "attack_type": attack_type,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat(),
            "src_ip": generate_ip(),
            "dst_ip": generate_ip(),
        }
        
        redis_client.xadd("flows", event)
        
        if (i + 1) % 20 == 0:
            print(f"  ✓ Generated {i + 1}/{event_count} events")
    
    # Check stream length
    stream_len = redis_client.xlen("flows")
    print(f"\n✅ Successfully created {stream_len} threat map events in Redis")
    
    print("\n" + "=" * 60)
    print("✅ REDIS POPULATED")
    print("=" * 60)
    print(f"📊 Stream 'flows': {stream_len} events")

def main():
    """Main function"""
    print("\n" + "=" * 70)
    print("🚀 BOUCLIER SAAS - COMPLETE DEMO DATA SETUP")
    print("=" * 70)
    print("\nThis script will populate:")
    print("  1. 📊 Database (PostgreSQL) - Security Events & Incidents")
    print("  2. 🗺️  Redis - Threat Map Data")
    print()
    
    # Ask user
    print("⚠️  This will clear existing data and populate with sample data")
    response = input("Continue? (y/n): ").lower().strip()
    
    if response != 'y':
        print("❌ Cancelled")
        return
    
    # Create tables
    print("\n📋 Creating database tables if needed...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables ready")
    
    # Database population
    db = SessionLocal()
    try:
        populate_database(db, event_count=500, incident_count=50)
    except Exception as e:
        print(f"❌ Database error: {e}")
        db.rollback()
    finally:
        db.close()
    
    # Redis population
    if REDIS_AVAILABLE:
        try:
            redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            populate_redis(redis_client, event_count=100)
        except Exception as e:
            print(f"⚠️  Redis population skipped: {e}")
            print("   To enable Threat Map, run: redis-server")
    else:
        print("\n⚠️  Redis population skipped (library not installed)")
        print("   To enable: pip install redis")
    
    # Final summary
    print("\n" + "=" * 70)
    print("✅ SETUP COMPLETE!")
    print("=" * 70)
    print("\n🎯 Next Steps:")
    print("  1. Start backend:  cd backend && uvicorn app.main:app --reload --port 8005")
    print("  2. Start frontend: cd frontend && npm run dev")
    print("  3. Open browser:   http://localhost:3000")
    print()
    print("📝 Pages with data:")
    print("  ✅ Overview (/overview)")
    print("  ✅ SOC Expert (/operation-soc-expert)")
    print("  ✅ Threat Intelligence (/threat-monitor)")
    print("  ✅ Threat Map Pro (/threat-map-pro) - if Redis running")
    print()
    print("🎬 Ready for demo! 🚀")
    print()

if __name__ == "__main__":
    main()
