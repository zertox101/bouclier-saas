"""
Generate sample threat map data for testing
Populates Redis stream with geo-located attack data
"""

import redis
import json
import random
import time
from datetime import datetime

# Redis connection
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=False)

FLOW_STREAM_NAME = "flows"

# Sample attack sources with real coordinates
ATTACK_SOURCES = [
    {"country": "Russia", "country_iso": "RU", "city": "Moscow", "lat": 55.7558, "lon": 37.6173},
    {"country": "China", "country_iso": "CN", "city": "Beijing", "lat": 39.9042, "lon": 116.4074},
    {"country": "USA", "country_iso": "US", "city": "New York", "lat": 40.7128, "lon": -74.0060},
    {"country": "Brazil", "country_iso": "BR", "city": "São Paulo", "lat": -23.5505, "lon": -46.6333},
    {"country": "India", "country_iso": "IN", "city": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    {"country": "Germany", "country_iso": "DE", "city": "Berlin", "lat": 52.5200, "lon": 13.4050},
    {"country": "UK", "country_iso": "GB", "city": "London", "lat": 51.5074, "lon": -0.1278},
    {"country": "France", "country_iso": "FR", "city": "Paris", "lat": 48.8566, "lon": 2.3522},
    {"country": "Japan", "country_iso": "JP", "city": "Tokyo", "lat": 35.6762, "lon": 139.6503},
    {"country": "South Korea", "country_iso": "KR", "city": "Seoul", "lat": 37.5665, "lon": 126.9780},
    {"country": "Iran", "country_iso": "IR", "city": "Tehran", "lat": 35.6892, "lon": 51.3890},
    {"country": "North Korea", "country_iso": "KP", "city": "Pyongyang", "lat": 39.0392, "lon": 125.7625},
    {"country": "Ukraine", "country_iso": "UA", "city": "Kyiv", "lat": 50.4501, "lon": 30.5234},
    {"country": "Turkey", "country_iso": "TR", "city": "Istanbul", "lat": 41.0082, "lon": 28.9784},
    {"country": "Netherlands", "country_iso": "NL", "city": "Amsterdam", "lat": 52.3676, "lon": 4.9041},
]

ATTACK_TYPES = [
    "Brute Force",
    "SQL Injection",
    "DDoS",
    "Malware",
    "Phishing",
    "Port Scan",
    "Exploit Attempt",
    "Credential Stuffing",
    "XSS Attack",
    "Command Injection"
]

SEVERITIES = ["low", "medium", "high", "critical"]
SEVERITY_WEIGHTS = [0.4, 0.3, 0.2, 0.1]  # More low/medium, fewer critical

def generate_ip():
    """Generate random IP address"""
    return f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}"

def generate_flow_event():
    """Generate a single flow event"""
    source = random.choice(ATTACK_SOURCES)
    
    event = {
        "src_ip": generate_ip(),
        "src_lat": source["lat"] + random.uniform(-2, 2),  # Add some variance
        "src_lon": source["lon"] + random.uniform(-2, 2),
        "src_country": source["country"],
        "src_country_iso": source["country_iso"],
        "src_city": source["city"],
        "dst_ip": "10.0.0.1",  # Your SOC HQ
        "dst_lat": 48.8566,
        "dst_lon": 2.3522,
        "dst_country": "France",
        "dst_city": "Paris",
        "attack_type": random.choice(ATTACK_TYPES),
        "severity": random.choices(SEVERITIES, weights=SEVERITY_WEIGHTS)[0],
        "timestamp": datetime.utcnow().isoformat(),
        "protocol": random.choice(["TCP", "UDP", "ICMP"]),
        "src_port": random.randint(1024, 65535),
        "dst_port": random.choice([22, 80, 443, 3389, 8080, 3306, 5432]),
        "bytes": random.randint(100, 100000),
        "packets": random.randint(1, 1000)
    }
    
    return event

def populate_stream(count=100):
    """Populate Redis stream with sample data"""
    print(f"Generating {count} threat map events...")
    
    try:
        # Test Redis connection
        redis_client.ping()
        print("✓ Redis connection successful")
    except Exception as e:
        print(f"✗ Redis connection failed: {e}")
        return
    
    success_count = 0
    for i in range(count):
        try:
            event = generate_flow_event()
            payload = json.dumps(event)
            
            # Add to Redis stream
            redis_client.xadd(
                FLOW_STREAM_NAME,
                {"payload": payload},
                maxlen=1000  # Keep last 1000 events
            )
            
            success_count += 1
            
            if (i + 1) % 10 == 0:
                print(f"  Generated {i + 1}/{count} events...")
            
            # Small delay to simulate real-time
            time.sleep(0.01)
            
        except Exception as e:
            print(f"✗ Error generating event {i + 1}: {e}")
    
    print(f"\n✓ Successfully generated {success_count}/{count} events")
    print(f"✓ Stream '{FLOW_STREAM_NAME}' populated")
    
    # Show stream info
    try:
        stream_len = redis_client.xlen(FLOW_STREAM_NAME)
        print(f"✓ Current stream length: {stream_len} events")
    except Exception as e:
        print(f"✗ Could not get stream length: {e}")

def clear_stream():
    """Clear the Redis stream"""
    try:
        redis_client.delete(FLOW_STREAM_NAME)
        print(f"✓ Stream '{FLOW_STREAM_NAME}' cleared")
    except Exception as e:
        print(f"✗ Error clearing stream: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        clear_stream()
    else:
        count = int(sys.argv[1]) if len(sys.argv) > 1 else 100
        populate_stream(count)
        
        print("\n" + "="*60)
        print("Threat Map Data Generator")
        print("="*60)
        print("\nUsage:")
        print("  python generate_map_data.py [count]  - Generate [count] events (default: 100)")
        print("  python generate_map_data.py clear    - Clear all events")
        print("\nAPI Endpoint:")
        print("  GET http://localhost:8005/map/points?limit=100")
        print("\nFrontend:")
        print("  Navigate to: http://localhost:3000/threat-map-pro")
        print("="*60)
