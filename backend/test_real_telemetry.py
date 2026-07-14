import requests
import json
import time

BASE_URL = "http://localhost:8000/api/telemetry"

def send_test_event():
    payload = {
        "sensor_name": "AI-CLI-TESTER",
        "sensor_type": "endpoint",
        "event_type": "Brute Force Attempt",
        "severity": "high",
        "message": "Multiple failed SSH login attempts from 192.168.1.50",
        "payload": {
            "src_ip": "192.168.1.50",
            "user": "root",
            "country": "Morocco",
            "lat": 33.5731,
            "lng": -7.5898
        }
    }
    
    print(f"[*] Sending test event to {BASE_URL}/events...")
    try:
        response = requests.post(f"{BASE_URL}/events", json=payload)
        if response.status_code == 200:
            print(f"[+] Event ingested successfully: {response.json()}")
        else:
            print(f"[-] Failed to ingest event: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    send_test_event()
