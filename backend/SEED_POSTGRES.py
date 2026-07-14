import os
import sys
import json
import time
from datetime import datetime

# Add app to path
sys.path.append("/app")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:shield_pass@db:5432/bouclier")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def seed():
    print(f"Seeding PostgreSQL at {DATABASE_URL}")
    now_epoch = int(time.time())
    
    try:
        # 1. Correlated Alerts
        db.execute(text("""
            INSERT INTO correlated_alerts (timestamp_epoch, rule_name, "user", host, severity, sequence, details)
            VALUES (:t, :r, :u, :h, :s, :seq, :d)
        """), {
            "t": now_epoch - 3600, "r": "Brute Force Success", "u": "admin", "h": "web-server-01", 
            "s": "critical", "seq": json.dumps([{"event_type": "ssh_login", "status": "failed"}]),
            "d": json.dumps({"src_ip": "185.23.45.12"})
        })

        # 2. ML Alerts
        db.execute(text("""
            INSERT INTO ml_alerts (timestamp_epoch, "user", host, anomaly_score, threshold, model_version, details)
            VALUES (:t, :u, :h, :ascore, :th, :mv, :d)
        """), {
            "t": now_epoch - 1800, "u": "system", "h": "db-cluster-01", "ascore": 0.98, "th": 0.85, 
            "mv": "v2.1-gru", "d": json.dumps({"anomaly_type": "traffic_spike"})
        })

        # 3. Telemetry Events
        db.execute(text("""
            INSERT INTO telemetry_events (org_id, event_type, severity, message, payload_json, created_at)
            VALUES (:org, :et, :sev, :msg, :p, :ca)
        """), {
            "org": "default", "et": "DDoS Attempt Detected", "sev": "high", "msg": "Volumetric attack",
            "p": json.dumps({"src_ip": "45.12.33.1"}), "ca": datetime.utcnow()
        })

        db.commit()
        print("Seeding complete.")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
