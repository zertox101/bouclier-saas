import requests
import time

url = "http://localhost:8005/api/sentinel/chat"
payload = {"message": "Fine mrekba had l-AI Analyst?"}
headers = {"Content-Type": "application/json"}

print(f"[*] Sending real-time request to Sentinel (Ollama backend)...")
start = time.time()
try:
    r = requests.post(url, json=payload, headers=headers, timeout=120)
    print(f"[+] Response time: {time.time() - start:.2f}s")
    print(f"[+] Status Code: {r.status_code}")
    print(f"[+] Content: {r.text}")
except Exception as e:
    print(f"[-] Request failed: {e}")
