"""
Generate Sample Threat Map Data
Populates Redis stream with realistic threat data for the Threat Map visualization
"""

import redis
import json
import random
import time
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
FLOW_STREAM_NAME = os.getenv("REDIS_FLOW_STREAM_NAME", "flows")

# Connect to Redis
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=0,
        decode_responses=False
    )
    redis_client.ping()
    print(f"✓ Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    print(f"✗ Failed to connect to Redis: {e}")
    exit(1)

# Threat source locations (realistic attack origins)
THREAT_SOURCES = [
    {"city": "Moscow", "country": "Russia", "country_iso": "RU", "lat": 55.7558, "lng": 37.6173, "ip_prefix": "185.220"},
    {"city": "Beijing", "country": "China", "country_iso": "CN", "lat": 39.9042, "lng": 116.4074, "ip_prefix": "202.108"},
    {"city": "Pyongyang", "country": "North Korea", "country_iso": "KP", "lat": 39.0392, "lng": 125.7625, "ip_prefix": "175.45"},
    {"city": "Tehran", "country": "Iran", "country_iso": "IR", "lat": 35.6892, "lng": 51.3890, "ip_prefix": "5.160"},
    {"city": "St Petersburg", "country": "Russia", "country_iso": "RU", "lat": 59.9343, "lng": 30.3351, "ip_prefix": "178.248"},
    {"city": "Shanghai", "country": "China", "country_iso": "CN", "lat": 31.2304, "lng": 121.4737, "ip_prefix": "218.75"},
    {"city": "Bucharest", "country": "Romania", "country_iso": "RO", "lat": 44.4268, "lng": 26.1025, "ip_prefix": "89.136"},
    {"city": "Lagos", "country": "Nigeria", "country_iso": "NG", "lat": 6.5244, "lng": 3.3792, "ip_prefix": "197.210"},
    {"city": "São Paulo", "country": "Brazil", "country_iso": "BR", "lat": -23.5505, "lng": -46.6333, "ip_prefix": "200.147"},
    {"city": "Mumbai", "country": "India", "country_iso": "IN", "lat": 19.0760, "lng": 72.8777, "ip_prefix": "103.21"},
    {"city": "Jakarta", "country": "Indonesia", "country_iso": "ID", "lat": -6.2088, "lng": 106.8456, "ip_prefix": "103.10"},
    {"city": "Istanbul", "country": "Turkey", "country_iso": "TR", "lat": 41.0082, "lng": 28.9784, "ip_prefix": "88.247"},
    {"city": "Kiev", "country": "Ukraine", "country_iso": "UA", "lat": 50.4501, "lng": 30.5234, "ip_prefix": "91.200"},
    {"city": "Warsaw", "country": "Poland", "country_iso": "PL", "lat": 52.2297, "lng": 21.0122, "ip_prefix": "83.0"},
    {"city": "Bangkok", "country": "Thailand", "country_iso": "TH", "lat": 13.7563, "lng": 100.5018, "ip_prefix": "103.9"},
]

# Attack types and severities
ATTACK_TYPES = [
    {"type": "Brute Force", "severity": "high", "port": 22},
    {"type": "SQL Injection", "severity": "critical", "port": 3306},
    {"type": "DDoS", "severity": "critical", "port": 80},
    {"type": "Malware C2", "severity": "critical", "port": 443},
    {"type": "Port Scan", "severity": "medium", "port": 0},
    {"type": "Phishing", "severity": "high", "port": 25},
    {"type": "Ransomware", "severity": "critical", "port": 445},
    {"type": "Credential Stuffing", "severity": "high", "port": 443},
    {"type": "XSS Attack", "severity": "medium", "port": 80},
    {"type": "Zero-Day Exploit", "severity": "critical", "port": 8080},
]

# Target (your SOC HQ)
TARGET = {
    "city": "Paris",
    "country": "France",
    "country_iso": "FR",
    "lat": 48.8566,
    "lng": 2.3522,
    "ip": "10.0.0.1"
}

def generate_threat_event():
    """Generate a single realistic threat event"""
    source = random.choice(THREAT_SOURCES)
    attack = random.choice(ATTACK_TYPES)
    
    # Generate realistic IP
    src_ip = f"{source['ip_prefix']}.{random.randint(1, 255)}.{random.randint(1, 255)}"
    
    event = {
        "id": f"EVT-{int(time.time() * 1000)}-{random.randint(1000, 9999)}",
        "timestamp": datetime.utcnow().isoformat(),
        "src_ip": src_ip,
        "src_port": random.randint(1024, 65535),
        "src_city": source["city"],
        "src_country": source["country"],
        "src_country_iso": source["country_iso"],
        "src_lat": source["lat"],
        "src_lon": source["lng"],
        "dst_ip": TARGET["ip"],
        "dst_port": attack["port"],
        "dst_city": TARGET["city"],
        "dst_country": TARGET["country"],
        "dst_country_iso": TARGET["country_iso"],
        "dst_lat": TARGET["lat"],
        "dst_lon": TARGET["lng"],
        "attack_type": attack["type"],
        "severity": attack["severity"],
        "protocol": random.choice(["TCP", "UDP", "ICMP"]),
        "bytes_sent": random.randint(1000, 1000000),
        "packets": random.randint(10, 10000),
        "duration": random.randint(1, 300),
        "threat_score": random.randint(60, 100),
        "confidence": round(random.uniform(0.7, 0.99), 2),
        "mitre_tactic": random.choice([
            "Initial Access", "Execution", "Persistence", 
            "Privilege Escalation", "Defense Evasion", 
            "Credential Access", "Discovery", "Lateral Movement",
            "Collection", "Exfiltration", "Command and Control"
        ]),
        "status": "active"
    }
    
    return event

def populate_stream(count=100, continuous=False, interval=2):
    """
    Populate Redis stream with threat events
    
    Args:
        count: Number of events to generate
        continuous: If True, keep generating events indefinitely
        interval: Seconds between events in continuous mode
    """
    print(f"\n{'='*60}")
    print(f"  THREAT MAP DATA GENERATOR")
    print(f"{'='*60}\n")
    
    if continuous:
        print(f"🔄 Continuous mode: Generating events every {interval}s")
        print("   Press Ctrl+C to stop\n")
        
        try:
            generated = 0
            while True:
                event = generate_threat_event()
                payload = json.dumps(event)
                
                redis_client.xadd(
                    FLOW_STREAM_NAME,
                    {"payload": payload},
                    maxlen=1000  # Keep last 1000 events
                )
                
                generated += 1
                severity_color = {
                    "critical": "\033[91m",  # Red
                    "high": "\033[93m",      # Yellow
                    "medium": "\033[94m",    # Blue
                    "low": "\033[92m"        # Green
                }
                color = severity_color.get(event["severity"], "\033[0m")
                reset = "\033[0m"
                
                print(f"✓ [{generated:04d}] {color}{event['severity'].upper():8s}{reset} | "
                      f"{event['attack_type']:20s} | "
                      f"{event['src_country_iso']:3s} → {event['dst_country_iso']:3s} | "
                      f"{event['src_ip']:15s}")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print(f"\n\n✓ Generated {generated} events")
            print(f"✓ Stream: {FLOW_STREAM_NAME}")
            print(f"✓ View at: http://localhost:3000/threat-map-pro\n")
    
    else:
        print(f"📊 Batch mode: Generating {count} events\n")
        
        for i in range(count):
            event = generate_threat_event()
            payload = json.dumps(event)
            
            redis_client.xadd(
                FLOW_STREAM_NAME,
                {"payload": payload},
                maxlen=1000
            )
            
            if (i + 1) % 10 == 0:
                print(f"✓ Generated {i + 1}/{count} events...")
        
        print(f"\n✓ Successfully generated {count} events")
        print(f"✓ Stream: {FLOW_STREAM_NAME}")
        print(f"✓ View at: http://localhost:3000/threat-map-pro\n")

def clear_stream():
    """Clear all events from the stream"""
    try:
        redis_client.delete(FLOW_STREAM_NAME)
        print(f"✓ Cleared stream: {FLOW_STREAM_NAME}\n")
    except Exception as e:
        print(f"✗ Error clearing stream: {e}\n")

def show_stats():
    """Show current stream statistics"""
    try:
        length = redis_client.xlen(FLOW_STREAM_NAME)
        print(f"\n📊 Stream Statistics")
        print(f"{'='*40}")
        print(f"Stream Name: {FLOW_STREAM_NAME}")
        print(f"Total Events: {length}")
        print(f"Redis Host: {REDIS_HOST}:{REDIS_PORT}")
        print(f"{'='*40}\n")
    except Exception as e:
        print(f"✗ Error getting stats: {e}\n")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python generate_threat_map_data.py <command> [options]")
        print("\nCommands:")
        print("  batch <count>     - Generate <count> events (default: 100)")
        print("  continuous        - Generate events continuously (Ctrl+C to stop)")
        print("  clear             - Clear all events from stream")
        print("  stats             - Show stream statistics")
        print("\nExamples:")
        print("  python generate_threat_map_data.py batch 50")
        print("  python generate_threat_map_data.py continuous")
        print("  python generate_threat_map_data.py clear")
        print("  python generate_threat_map_data.py stats\n")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == "batch":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 100
        populate_stream(count=count, continuous=False)
    
    elif command == "continuous":
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 2
        populate_stream(continuous=True, interval=interval)
    
    elif command == "clear":
        clear_stream()
    
    elif command == "stats":
        show_stats()
    
    else:
        print(f"✗ Unknown command: {command}\n")
        sys.exit(1)
