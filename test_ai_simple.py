#!/usr/bin/env python3
import requests
import json

# Test AI Gateway from within Docker network
url = "http://ai-gateway:8200/api/generate"
payload = {
    "prompt": "Say hello",
    "stream": False
}

print("🧠 Testing AI Gateway...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")
print("-" * 60)

try:
    response = requests.post(url, json=payload, timeout=120)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS!")
        print(f"Model: {data.get('model', 'N/A')}")
        print(f"Response: {data.get('response', 'N/A')[:200]}")
        print(f"Done: {data.get('done', False)}")
    else:
        print(f"\n❌ ERROR!")
        print(f"Response: {response.text}")
except Exception as e:
    print(f"\n❌ EXCEPTION: {e}")
