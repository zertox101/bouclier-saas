import requests
import time
import random
import json
from datetime import datetime

API_URL = "http://localhost:8005/api/telemetry/events"

SENSORS = [
    {"name": "EDGE-GW-01", "type": "gateway"},
    {"name": "SOC-ANALYST-WORKSTATION", "type": "endpoint"},
    {"name": "DB-SERVER-PROD", "type": "server"},
    {"name": "WEB-FRONTEND-01", "type": "server"},
    {"name": "CORP-WIFI-AP", "type": "network"}
]

THREAT_TYPES = [
    {
        "type": "PORT_SCAN",
        "severity": "medium",
        "message": "Intense Port Scan detected from {src_ip}",
        "category": "Reconnaissance"
    },
    {
        "type": "SQL_INJECTION",
        "severity": "critical",
        "message": "Blind SQL Injection attempt on /api/v1/users/login from {src_ip}",
        "category": "Exploitation"
    },
    {
        "type": "SSH_BRUTE_FORCE",
        "severity": "high",
        "message": "Multiple failed SSH login attempts (User: root) from {src_ip}",
        "category": "Initial Access"
    },
    {
        "type": "MALWARE_BEACON",
        "severity": "high",
        "message": "Suspicious C2 Beaconing pattern to {dst_ip} (Cobalt Strike Profile)",
        "category": "C2"
    },
    {
        "type": "DATA_EXFILTRATION",
        "severity": "critical",
        "message": "Large outbound DNS tunnel detected to {dst_ip}",
        "category": "Exfiltration"
    }
]

def generate_random_ip():
    return f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"

def send_event(event_type_obj, sensor):
    src_ip = generate_random_ip()
    dst_ip = generate_random_ip()
    country = random.choice(["US", "CN", "RU", "DE", "FR", "MA", "SA", "GB", "BR", "IN"])
    
    payload = {
        "sensor_name": sensor["name"],
        "sensor_type": sensor["type"],
        "event_type": event_type_obj["type"],
        "severity": event_type_obj["severity"],
        "message": event_type_obj["message"].format(src_ip=src_ip, dst_ip=dst_ip),
        "payload": {
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "country": country,
            "category": event_type_obj["category"],
            "lat": random.uniform(-60, 70),
            "lng": random.uniform(-180, 180),
            "protocol": random.choice(["TCP", "UDP", "HTTPS", "DNS"]),
            "bytes": random.randint(100, 1000000)
        }
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"[+] Sent {event_type_obj['type']} - {payload['message']}")
        else:
            print(f"[-] Failed to send: {response.text}")
    except Exception as e:
        print(f"[!] Error: {e}")

def run_simulation():
    print("🚀 Starting Purple Team Simulation...")
    print(f"Target API: {API_URL}")
    print("---------------------------------------")
    
    while True:
        # Randomly choose how many events to send in this burst
        burst_size = random.randint(1, 4)
        for _ in range(burst_size):
            threat = random.choice(THREAT_TYPES)
            sensor = random.choice(SENSORS)
            send_event(threat, sensor)
        
        # Jittered sleep
        time.sleep(random.uniform(1.0, 3.5))

if __name__ == "__main__":
    run_simulation()
