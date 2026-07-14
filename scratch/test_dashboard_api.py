import requests
import json

BASE_URL = "http://localhost:8005"

def test_dashboard_data():
    # 1. Login to get token
    login_payload = {
        "email": "admin",
        "password": "admin"
    }
    print(f"[*] Attempting login for admin...")
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
        if resp.status_code != 200:
            print(f"[!] Login failed: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()["access_token"]
        print(f"[+] Login success. Token acquired.")
        
        # 2. Fetch stats
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[*] Fetching telemetry stats...")
        resp = requests.get(f"{BASE_URL}/api/telemetry/stats", headers=headers)
        
        if resp.status_code != 200:
            print(f"[!] Stats fetch failed: {resp.status_code} {resp.text}")
            return
            
        data = resp.json()
        print(f"[+] Stats acquired successfully.")
        print(f"    - Total Alerts (24h): {data.get('counters', {}).get('events')}")
        print(f"    - Severity Map: {data.get('severity')}")
        print(f"    - Alerts Count: {len(data.get('alerts', []))}")
        print(f"    - Health: {data.get('health')}")
        
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    test_dashboard_data()
