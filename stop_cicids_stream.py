#!/usr/bin/env python3
"""Stop CICIDS data stream"""
import requests

API_BASE = "http://localhost:8005"

def stop_stream():
    try:
        response = requests.post(f"{API_BASE}/api/datasets/stream/stop", timeout=5)
        if response.status_code == 200:
            print("✅ CICIDS stream stopped successfully")
            return True
        else:
            print(f"⚠️  Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n🛑 Stopping CICIDS stream...\n")
    stop_stream()
