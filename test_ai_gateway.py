#!/usr/bin/env python3
"""Test AI Gateway connectivity and functionality"""
import requests
import json

AI_GATEWAY_URL = "http://localhost:8200"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing AI Gateway Health...")
    try:
        response = requests.get(f"{AI_GATEWAY_URL}/health", timeout=5)
        print(f"✅ Health Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_generate():
    """Test AI generation"""
    print("\n🧠 Testing AI Generation...")
    try:
        payload = {
            "prompt": "What is cybersecurity in one sentence?",
            "stream": False
        }
        response = requests.post(
            f"{AI_GATEWAY_URL}/api/generate",
            json=payload,
            timeout=30
        )
        print(f"✅ Generation Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Model: {data.get('model', 'N/A')}")
            print(f"   Response: {data.get('response', 'N/A')[:200]}...")
        else:
            print(f"   Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Generation test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🛡️  SHIELD AI GATEWAY TEST")
    print("=" * 60)
    
    health_ok = test_health()
    if health_ok:
        test_generate()
    
    print("\n" + "=" * 60)
