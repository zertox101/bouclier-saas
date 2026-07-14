#!/usr/bin/env python3
"""
Auto-start CICIDS2017 Stream (No interaction)
"""
import requests
import time
import sys

API_BASE = "http://localhost:8005"

def start_stream():
    """Start CICIDS stream automatically"""
    print("🚀 Starting CICIDS2017 stream automatically...")
    
    try:
        # Start with default settings: cicids2017, medium speed (100ms)
        response = requests.post(
            f"{API_BASE}/api/datasets/stream/start",
            params={
                "dataset": "cicids2017",
                "speed_ms": 50  # Fast: 20 rows/sec
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stream started!")
            print(f"   Dataset: {data.get('dataset', 'N/A')}")
            print(f"   Total rows: {data.get('rows_total', 0):,}")
            print(f"   Speed: {data.get('speed_ms', 0)}ms/row (~20 rows/sec)")
            print(f"\n📊 Dashboard: http://localhost:3001")
            print(f"   Data will appear in real-time!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_status():
    """Check stream status"""
    try:
        response = requests.get(f"{API_BASE}/api/datasets/stream/status", timeout=5)
        if response.status_code == 200:
            status = response.json()
            print(f"\n📊 Stream Status:")
            print(f"   Running: {status.get('running', False)}")
            print(f"   Rows sent: {status.get('rows_sent', 0):,}")
            print(f"   Progress: {status.get('progress', 0)}%")
            return status
        return None
    except Exception as e:
        print(f"❌ Status check failed: {e}")
        return None

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🛡️  BOUCLIER - Auto Stream Starter")
    print("="*60 + "\n")
    
    # Check if already running
    status = check_status()
    if status and status.get("running"):
        print("✅ Stream is already running!")
        print(f"   Progress: {status.get('rows_sent', 0):,}/{status.get('rows_total', 0):,}")
        sys.exit(0)
    
    # Start stream
    if start_stream():
        print("\n✅ SUCCESS! Stream is now active.")
        print("   Open http://localhost:3001 to see live data!")
        
        # Monitor for 30 seconds
        print("\n📊 Monitoring for 30 seconds...")
        for i in range(6):
            time.sleep(5)
            status = check_status()
            if status and not status.get("running"):
                print("\n⚠️  Stream stopped.")
                break
    else:
        print("\n❌ Failed to start stream.")
        sys.exit(1)
