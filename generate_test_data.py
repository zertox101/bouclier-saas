#!/usr/bin/env python3
"""Generate test data for BOUCLIER dashboard"""
import requests
import random
import time
from datetime import datetime, timedelta

API_BASE = "http://localhost:8005"

# Sample data
COUNTRIES = ["US", "CN", "RU", "FR", "DE", "UK", "BR", "IN", "JP", "KR"]
SEVERITIES = ["Critical", "High", "Medium", "Low"]
ATTACK_TYPES = ["DDoS", "SQL Injection", "XSS", "Brute Force", "Port Scan", "Malware", "Phishing"]
IPS = [
    "192.168.1.100", "10.0.0.50", "172.16.0.10", 
    "203.0.113.45", "198.51.100.23", "192.0.2.100"
]

def generate_events(count=50):
    """Generate test security events"""
    print(f"🔄 Generating {count} test events...")
    
    events = []
    for i in range(count):
        event = {
            "timestamp": (datetime.now() - timedelta(hours=random.randint(0, 24))).isoformat(),
            "event_type": random.choice(ATTACK_TYPES),
            "severity": random.choice(SEVERITIES),
            "source_ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
            "destination_ip": random.choice(IPS),
            "country": random.choice(COUNTRIES),
            "blocked": random.choice([True, False]),
            "description": f"Test security event {i+1}"
        }
        events.append(event)
    
    # Send events to API
    try:
        response = requests.post(f"{API_BASE}/api/telemetry/events", json=events, timeout=10)
        if response.status_code == 200:
            print(f"✅ Successfully sent {count} events")
            return True
        else:
            print(f"⚠️  API returned status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error sending events: {e}")
        return False

def generate_alerts(count=20):
    """Generate test alerts"""
    print(f"🔄 Generating {count} test alerts...")
    
    for i in range(count):
        alert = {
            "title": f"Security Alert {i+1}",
            "severity": random.choice(SEVERITIES),
            "description": f"Test alert: {random.choice(ATTACK_TYPES)} detected from {random.choice(COUNTRIES)}",
            "timestamp": datetime.now().isoformat(),
            "source": random.choice(["IDS", "Firewall", "WAF", "SIEM", "AI Engine"])
        }
        
        try:
            response = requests.post(f"{API_BASE}/api/alerts", json=alert, timeout=5)
            if response.status_code in [200, 201]:
                print(f"  ✅ Alert {i+1} created")
            else:
                print(f"  ⚠️  Alert {i+1} failed: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        time.sleep(0.1)  # Small delay

def generate_traffic_data():
    """Generate network traffic data"""
    print("🔄 Generating traffic data...")
    
    traffic = {
        "total_packets": random.randint(10000, 50000),
        "inbound_bytes": random.randint(1000000, 5000000),
        "outbound_bytes": random.randint(800000, 4000000),
        "inbound_packets": random.randint(5000, 25000),
        "outbound_packets": random.randint(4000, 20000),
        "by_country": [
            {"country": country, "count": random.randint(100, 5000)}
            for country in random.sample(COUNTRIES, 5)
        ],
        "top_ips": [
            {"ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}", 
             "count": random.randint(50, 500)}
            for _ in range(5)
        ]
    }
    
    try:
        response = requests.post(f"{API_BASE}/api/traffic/update", json=traffic, timeout=5)
        if response.status_code == 200:
            print("✅ Traffic data updated")
            return True
        else:
            print(f"⚠️  Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("🛡️  BOUCLIER - Test Data Generator")
    print("="*60 + "\n")
    
    # Check API connectivity
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is reachable\n")
        else:
            print("⚠️  API returned unexpected status\n")
    except Exception as e:
        print(f"❌ Cannot reach API: {e}\n")
        print("Make sure the backend is running on http://localhost:8005\n")
        return
    
    # Generate data
    print("Starting data generation...\n")
    
    # 1. Generate events
    generate_events(50)
    print()
    
    # 2. Generate alerts
    generate_alerts(20)
    print()
    
    # 3. Generate traffic data
    generate_traffic_data()
    print()
    
    print("="*60)
    print("✅ Data generation complete!")
    print("="*60)
    print("\n📊 Refresh your dashboard at http://localhost:3001\n")

if __name__ == "__main__":
    main()
