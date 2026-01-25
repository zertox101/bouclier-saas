
import os
import random
import time
import requests
import json
from datetime import datetime

# Target: API Gateway (which forwards to Log Ingestor)
TARGET_URL = "http://localhost:8002/ingest/syslog"

THREAT_TYPES = [
    "SQL Injection", "XSS Attack", "Brute Force (SSH)", "Port Scan",
    "Malware Download", "DDoS Flood", "Privilege Escalation"
]

IPS = ["192.168.1.50", "10.0.0.5", "172.16.0.22", "45.155.205.233", "103.20.14.7"]

def generate_log():
    timestamp = time.time()
    threat = random.choice(THREAT_TYPES)
    severity = "CRITICAL" if "DDoS" in threat or "Malware" in threat else "HIGH"
    
    payload = {
        "timestamp": timestamp,
        "source_ip": random.choice(IPS),
        "destination_ip": "10.0.0.1 (Server)",
        "event_type": threat,
        "severity": severity,
        "payload": {"method": "POST", "url": "/login"},
        "tenant_id": "T-DEMO"
    }
    return payload

def run_simulation():
    print("🚀 Starting Red Team Attack Simulation...")
    print(f"🎯 Target: {TARGET_URL}")
    print("------------------------------------------------")
    
    count = 0
    try:
        while True:
            log = generate_log()
            try:
                # Direct to Ingestor for now if Gateway is flaky (8002), 
                # but let's try Gateway (8000) first as designed.
                # Actually, local stack uses 8000.
                
                # NOTE: In local stack, we mapped /api/v1/logs/{path} -> Ingestor/{path}
                # So /api/v1/logs/ingest/syslog -> Ingestor/ingest/syslog
                res = requests.post(TARGET_URL, json=log, timeout=2)
                
                if res.status_code == 200:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ⚡ SENT: {log['event_type']} from {log['source_ip']}")
                    count += 1
                else:
                    print(f"❌ Failed: {res.status_code} - {res.text}")
            except Exception as e:
                print(f"⚠️ Connection Error: {e}")
            
            # Random delay for realism
            time.sleep(random.uniform(0.5, 2.0))
            
    except KeyboardInterrupt:
        print(f"\n🛑 Simulation Stopped. Total Attacks Sent: {count}")

if __name__ == "__main__":
    run_simulation()
