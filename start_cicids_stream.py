#!/usr/bin/env python3
"""
Start CICIDS2017 Live Data Stream
Injects real cybersecurity data into the dashboard
"""
import requests
import time
import sys

API_BASE = "http://localhost:8005"

def check_api():
    """Check if API is available"""
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_stream_status():
    """Get current stream status"""
    try:
        response = requests.get(f"{API_BASE}/api/datasets/stream/status", timeout=5)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"❌ Error getting status: {e}")
        return None

def start_stream(dataset="cicids2017", speed_ms=100):
    """Start CICIDS data stream"""
    print(f"🚀 Starting {dataset} stream (speed: {speed_ms}ms per row)...")
    
    try:
        response = requests.post(
            f"{API_BASE}/api/datasets/stream/start",
            params={
                "dataset": dataset,
                "speed_ms": speed_ms
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stream started successfully!")
            print(f"   Dataset: {data.get('dataset', 'N/A')}")
            print(f"   Total rows: {data.get('rows_total', 0):,}")
            print(f"   Speed: {data.get('speed_ms', 0)}ms/row")
            return True
        else:
            print(f"⚠️  Failed to start stream: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error starting stream: {e}")
        return False

def stop_stream():
    """Stop CICIDS data stream"""
    print("🛑 Stopping stream...")
    
    try:
        response = requests.post(f"{API_BASE}/api/datasets/stream/stop", timeout=5)
        if response.status_code == 200:
            print("✅ Stream stopped")
            return True
        else:
            print(f"⚠️  Failed to stop: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def monitor_stream(duration=30):
    """Monitor stream progress"""
    print(f"\n📊 Monitoring stream for {duration} seconds...")
    print("-" * 60)
    
    start_time = time.time()
    last_rows = 0
    
    while time.time() - start_time < duration:
        status = get_stream_status()
        if status:
            running = status.get("running", False)
            rows_sent = status.get("rows_sent", 0)
            rows_total = status.get("rows_total", 0)
            
            if rows_total > 0:
                progress = (rows_sent / rows_total) * 100
            else:
                progress = 0
            
            rows_per_sec = (rows_sent - last_rows) / 5 if rows_sent > last_rows else 0
            last_rows = rows_sent
            
            status_icon = "🟢" if running else "🔴"
            print(f"{status_icon} Rows: {rows_sent:,}/{rows_total:,} ({progress:.1f}%) | Speed: {rows_per_sec:.1f} rows/sec", end="\r")
            
            if not running and rows_sent > 0:
                print("\n✅ Stream completed!")
                break
        
        time.sleep(5)
    
    print("\n" + "-" * 60)

def main():
    print("\n" + "="*60)
    print("🛡️  BOUCLIER - CICIDS2017 Data Stream")
    print("="*60 + "\n")
    
    # Check API
    print("🔍 Checking API connectivity...")
    if not check_api():
        print("❌ Cannot reach API at http://localhost:8005")
        print("   Make sure the backend is running!")
        sys.exit(1)
    print("✅ API is reachable\n")
    
    # Check current status
    print("📊 Checking stream status...")
    status = get_stream_status()
    if status:
        if status.get("running"):
            print("⚠️  Stream is already running!")
            print(f"   Dataset: {status.get('dataset')}")
            print(f"   Progress: {status.get('rows_sent'):,}/{status.get('rows_total'):,}")
            
            choice = input("\n   Stop current stream? (y/n): ").lower()
            if choice == 'y':
                stop_stream()
                time.sleep(2)
            else:
                print("\n   Monitoring existing stream...")
                monitor_stream(60)
                return
    print()
    
    # Start new stream
    print("🎯 Starting CICIDS2017 data stream...")
    print("   This will inject real cybersecurity events into your dashboard\n")
    
    # Choose dataset
    print("Available datasets:")
    print("  1. cicids2017 (sample - 188 MB, ~1M rows)")
    print("  2. cicids_full (full - 700 MB, ~2.8M rows)")
    print("  3. iotmal2026 (IoT malware)")
    print("  4. malmem2022 (Memory malware)")
    print("  5. unsw_nb15 (Network intrusion)")
    
    choice = input("\nSelect dataset (1-5) [default: 1]: ").strip() or "1"
    
    dataset_map = {
        "1": "cicids2017",
        "2": "cicids_full",
        "3": "iotmal2026",
        "4": "malmem2022",
        "5": "unsw_nb15"
    }
    
    dataset = dataset_map.get(choice, "cicids2017")
    
    # Choose speed
    print("\nStream speed:")
    print("  1. Fast (50ms/row - ~20 rows/sec)")
    print("  2. Medium (100ms/row - ~10 rows/sec)")
    print("  3. Slow (200ms/row - ~5 rows/sec)")
    print("  4. Very Slow (500ms/row - ~2 rows/sec)")
    
    speed_choice = input("\nSelect speed (1-4) [default: 2]: ").strip() or "2"
    
    speed_map = {
        "1": 50,
        "2": 100,
        "3": 200,
        "4": 500
    }
    
    speed_ms = speed_map.get(speed_choice, 100)
    
    print()
    
    # Start stream
    if start_stream(dataset, speed_ms):
        print()
        monitor_stream(60)
        
        print("\n" + "="*60)
        print("✅ CICIDS stream is running!")
        print("="*60)
        print("\n📊 Open your dashboard at http://localhost:3001")
        print("   You should now see:")
        print("   - Real-time events appearing")
        print("   - Traffic statistics updating")
        print("   - Alerts being generated")
        print("   - Geographic data on the map")
        print("\n💡 To stop the stream, run:")
        print("   python stop_cicids_stream.py")
        print()
    else:
        print("\n❌ Failed to start stream")
        sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        stop_stream()
        sys.exit(0)
