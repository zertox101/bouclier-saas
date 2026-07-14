#!/usr/bin/env python3
"""Test LLM Engine via Backend API"""
import requests
import json
import sys

BACKEND_URL = "http://localhost:8005"

def test_llm_via_backend():
    """Test LLM through backend API"""
    print("🧠 Testing LLM Engine via Backend API...")
    print("=" * 60)
    
    # Test if backend has an AI endpoint
    endpoints_to_try = [
        "/api/ai-intel/analyze",
        "/api/soc-expert/analyze",
        "/api/strategic-briefing/",
    ]
    
    for endpoint in endpoints_to_try:
        try:
            print(f"\n📡 Trying endpoint: {endpoint}")
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:300]}...")
                return True
        except Exception as e:
            print(f"   Error: {e}")
    
    return False

def test_ollama_direct():
    """Test Ollama directly via docker exec"""
    print("\n🔧 Testing Ollama directly...")
    print("=" * 60)
    import subprocess
    
    try:
        cmd = [
            "docker", "exec", "shield-ollama-core",
            "curl", "-s", "-X", "POST",
            "http://localhost:11434/api/generate",
            "-d", '{"model":"llama3.2:3b","prompt":"Say hello in one word","stream":false}'
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print("✅ Ollama Response:")
            data = json.loads(result.stdout)
            print(f"   Model: {data.get('model', 'N/A')}")
            print(f"   Response: {data.get('response', 'N/A')}")
            return True
        else:
            print(f"❌ Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🛡️  SHIELD LLM ENGINE TEST")
    print("=" * 60 + "\n")
    
    # Test 1: Via Backend
    backend_ok = test_llm_via_backend()
    
    # Test 2: Direct Ollama
    ollama_ok = test_ollama_direct()
    
    print("\n" + "=" * 60)
    print("📊 RESULTS:")
    print(f"   Backend API: {'✅ OK' if backend_ok else '⚠️  Limited'}")
    print(f"   Ollama Direct: {'✅ OK' if ollama_ok else '❌ FAILED'}")
    print("=" * 60 + "\n")
    
    sys.exit(0 if ollama_ok else 1)
