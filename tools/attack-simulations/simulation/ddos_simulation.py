import requests
import time
import threading
import random

TARGET_URL = "http://localhost:8005/api/health"
THREADS = 10
REQUESTS_PER_THREAD = 50

def attack():
    for _ in range(REQUESTS_PER_THREAD):
        try:
            # Random user agents to look "real"
            headers = {
                "User-Agent": random.choice([
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                    "curl/7.68.0"
                ]),
                "X-Forwarded-For": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
            }
            resp = requests.get(TARGET_URL, headers=headers, timeout=1)
            print(f"[DDoS Sim] Sent request to {TARGET_URL} - Status: {resp.status_code}")
        except Exception as e:
            print(f"[DDoS Sim] Error: {e}")
        time.sleep(random.uniform(0.01, 0.1))

def run_simulation():
    print(f"🚀 Starting DDoS Simulation on {TARGET_URL} with {THREADS} threads...")
    threads = []
    for i in range(THREADS):
        t = threading.Thread(target=attack)
        threads.append(t)
        t.start()
    
    for t in threads:
        t.join()
    print("✅ DDoS Simulation Complete.")

if __name__ == "__main__":
    run_simulation()
