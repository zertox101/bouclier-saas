import hmac
import hashlib
import time
import requests
import uuid

# Configuration (Matching the Control Plane PEP)
GATEWAY_URL = "http://localhost/api/saas/control/pulse"
SECRET = "BOUCLIER_ALPHA_SESSION_2026".encode()

def test_neural_shield():
    print("--- SHIELD NEURAL LOCKDOWN TEST ---")
    
    # 1. Test Unauthorized Access
    print("\n[1] Testing Unauthorized Access (No Headers)...")
    r1 = requests.get(GATEWAY_URL)
    print(f"Status: {r1.status_code}")
    print(f"Response: {r1.text[:100]}...")

    # 2. Test Authorized Access
    print("\n[2] Testing Authorized Access (Valid HMAC)...")
    timestamp = str(int(time.time()))
    nonce = uuid.uuid4().hex
    trace = uuid.uuid4().hex
    
    # Signature matches PEP logic: timestamp|nonce
    message = f"{timestamp}|{nonce}".encode()
    signature = hmac.new(SECRET, message, hashlib.sha256).hexdigest()
    
    headers = {
        "X-Shield-Signature": signature,
        "X-Shield-Timestamp": timestamp,
        "X-Shield-Nonce": nonce,
        "X-Shield-Trace": trace
    }
    
    r2 = requests.get(GATEWAY_URL, headers=headers)
    print(f"Status: {r2.status_code}")
    if r2.status_code == 200:
        print("OK: Control Plane allowed the request.")
        print(f"Payload: {r2.json()}")
    else:
        print(f"ERROR: {r2.text}")

if __name__ == "__main__":
    test_neural_shield()
