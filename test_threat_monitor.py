"""
Test script for Threat Monitor endpoints
Verifies all endpoints are working correctly
"""

import requests
import json
import time
from datetime import datetime

API_BASE = "http://localhost:8005"

def test_telemetry_stats():
    """Test /api/telemetry/stats endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Telemetry Stats")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/api/telemetry/stats")
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Response Time: {response.elapsed.total_seconds():.2f}s")
        
        # Check required fields
        required_fields = ['counters', 'severity', 'alerts', 'health']
        for field in required_fields:
            if field in data:
                print(f"✅ Field '{field}': Present")
            else:
                print(f"❌ Field '{field}': Missing")
        
        # Check alerts structure
        if 'alerts' in data and len(data['alerts']) > 0:
            alert = data['alerts'][0]
            print(f"\n📊 Sample Alert:")
            print(f"   - ID: {alert.get('id')}")
            print(f"   - Type: {alert.get('type')}")
            print(f"   - Severity: {alert.get('severity')}")
            print(f"   - Source IP: {alert.get('src_ip')}")
            print(f"   - Country: {alert.get('country')}")
            print(f"✅ Alerts Count: {len(data['alerts'])}")
        
        # Check health structure
        if 'health' in data:
            health = data['health']
            print(f"\n🏥 Health Status:")
            print(f"   - Active Nodes: {health.get('active_nodes')}")
            print(f"   - Online: {health.get('online')}")
            print(f"   - Offline: {health.get('offline')}")
            print(f"   - Status: {health.get('status')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_telemetry_alerts():
    """Test /api/telemetry/alerts endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Telemetry Alerts")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/api/telemetry/alerts?limit=10")
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Response Time: {response.elapsed.total_seconds():.2f}s")
        print(f"✅ Alerts Returned: {len(data.get('alerts', []))}")
        
        if 'alerts' in data and len(data['alerts']) > 0:
            print(f"\n📋 First 3 Alerts:")
            for i, alert in enumerate(data['alerts'][:3], 1):
                print(f"   {i}. [{alert['severity'].upper()}] {alert['type']} from {alert['src_ip']} ({alert['country']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_telemetry_stream():
    """Test /api/telemetry/stream SSE endpoint"""
    print("\n" + "="*60)
    print("TEST 3: Telemetry Stream (SSE)")
    print("="*60)
    print("⏳ Listening for 10 seconds...")
    
    try:
        response = requests.get(
            f"{API_BASE}/api/telemetry/stream?channels=events",
            stream=True,
            timeout=15
        )
        
        print(f"✅ Connection Established")
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Content-Type: {response.headers.get('content-type')}")
        
        events_received = 0
        start_time = time.time()
        
        print(f"\n📡 Receiving Events:")
        
        for line in response.iter_lines():
            if time.time() - start_time > 10:  # Stop after 10 seconds
                break
                
            if line:
                line_str = line.decode('utf-8')
                
                if line_str.startswith('data:'):
                    events_received += 1
                    try:
                        event_data = json.loads(line_str[5:].strip())
                        print(f"   {events_received}. [{event_data['severity'].upper()}] {event_data['type']} from {event_data['src_ip']} ({event_data['country']})")
                    except:
                        pass
        
        print(f"\n✅ Events Received: {events_received}")
        
        if events_received > 0:
            print(f"✅ SSE Stream Working!")
            return True
        else:
            print(f"⚠️  No events received in 10 seconds")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_all_routers():
    """Test all new routers"""
    print("\n" + "="*60)
    print("TEST 4: All New Routers")
    print("="*60)
    
    endpoints = [
        ("Threat Analysis", "/api/threat-analysis/threats"),
        ("Kali Tools Status", "/api/kali/tools/status"),
        ("Sentinel AI Health", "/api/sentinel/health"),
        ("Investigation List", "/api/investigation/list"),
        ("SOC Expert Dashboard", "/api/soc-expert/dashboard"),
    ]
    
    results = []
    
    for name, endpoint in endpoints:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: OK ({response.elapsed.total_seconds():.2f}s)")
                results.append(True)
            else:
                print(f"⚠️  {name}: Status {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {name}: {str(e)[:50]}")
            results.append(False)
    
    success_rate = (sum(results) / len(results)) * 100
    print(f"\n📊 Success Rate: {success_rate:.0f}% ({sum(results)}/{len(results)})")
    
    return all(results)


def main():
    """Run all tests"""
    print("\n" + "🔴"*30)
    print("THREAT MONITOR - ENDPOINT TESTS")
    print("🔴"*30)
    print(f"\n🕐 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API Base: {API_BASE}")
    
    # Check if backend is running
    try:
        response = requests.get(f"{API_BASE}/health", timeout=2)
        print(f"✅ Backend is running")
    except:
        print(f"❌ Backend is not running on {API_BASE}")
        print(f"\n💡 Start backend with:")
        print(f"   cd backend")
        print(f"   python -m uvicorn app.main:app --reload --port 8005")
        return
    
    # Run tests
    results = []
    results.append(("Telemetry Stats", test_telemetry_stats()))
    results.append(("Telemetry Alerts", test_telemetry_alerts()))
    results.append(("Telemetry Stream", test_telemetry_stream()))
    results.append(("All Routers", test_all_routers()))
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    total_pass = sum(1 for _, result in results if result)
    total_tests = len(results)
    
    print(f"\n📊 Total: {total_pass}/{total_tests} tests passed ({(total_pass/total_tests)*100:.0f}%)")
    
    if total_pass == total_tests:
        print("\n🎉 ALL TESTS PASSED! Threat Monitor is ready!")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
    
    print(f"\n🕐 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
