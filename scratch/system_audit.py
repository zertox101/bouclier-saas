import requests
import time

def check_service(name, url, expected_status=200):
    try:
        start = time.time()
        res = requests.get(url, timeout=5)
        duration = time.time() - start
        if res.status_code == expected_status:
            print(f"[OK] {name:15} | Status: {res.status_code} | Time: {duration:.2f}s")
            return True
        else:
            print(f"[FAIL] {name:15} | Status: {res.status_code} | Expected: {expected_status}")
            return False
    except Exception as e:
        print(f"[ERR] {name:15} | Error: {str(e)}")
        return False

def audit_system():
    print("\n--- BOUCLIER SYSTEM AUDIT ---")
    
    # 1. External Gateway (Public)
    check_service("Gateway Health", "http://localhost/health")
    
    # 2. Public API (Backend via Gateway)
    check_service("Backend API", "http://localhost/api/health")
    
    # 3. Frontend (UI via Gateway)
    check_service("Frontend UI", "http://localhost/")
    
    # 4. Protected API (Should be 401 without signature)
    check_service("Neural Shield", "http://localhost/api/saas/control/pulse", expected_status=401)
    
    # 5. AI Infrastructure (Internal)
    # We'll use the gateway's internal proxy if available or just check the services via Docker names if possible from a test container.
    # But from host, we can only check what's exposed.
    
    print("\n--- VERIFYING TELEMETRY ---")
    try:
        res = requests.get("http://localhost/api/traffic/stats", timeout=5)
        if res.status_code == 200:
            data = res.json()
            print(f"[DATA] Total Packets: {data.get('total_packets', 0)}")
            print(f"[DATA] Top Country: {data.get('by_country', [{}])[0].get('label', 'None')}")
        else:
            print(f"[FAIL] Telemetry Fetch Failed: {res.status_code}")
    except Exception as e:
        print(f"[ERR] Telemetry Error: {str(e)}")

if __name__ == "__main__":
    audit_system()
