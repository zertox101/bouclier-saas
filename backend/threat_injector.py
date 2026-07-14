import time
import json
import random
import redis
import os
from datetime import datetime

# REDIS CONFIG
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
FLOW_STREAM_NAME = "flows" # The stream the map reads from

try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    print(f"[*] Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    print(f"[!] Redis connection failed: {e}")
    exit(1)

# REAL-WORLD THREAT SOURCES (SAMPLES)
THREAT_ACTORS = [
    {"name": "APT29 (Cozy Bear)", "org": "SVR Russian Intelligence", "country": "Russia", "lat": 55.7558, "lon": 37.6173},
    {"name": "Lazarus Group", "org": "Bureau 121", "country": "North Korea", "lat": 39.0333, "lon": 125.75},
    {"name": "Equation Group", "org": "NSA Linked", "country": "USA", "lat": 39.0194, "lon": -76.7789},
    {"name": "Sandworm", "org": "GRU Unit 74455", "country": "Russia", "lat": 55.7512, "lon": 37.6184},
    {"name": "Volt Typhoon", "org": "PRC State-Sponsored", "country": "China", "lat": 39.9042, "lon": 116.4074},
    {"name": "Fancy Bear", "org": "GRU Unit 26165", "country": "Russia", "lat": 59.9343, "lon": 30.3351},
    {"name": "Mustang Panda", "org": "China-based Cyberespionage", "country": "China", "lat": 31.2304, "lon": 121.4737},
    {"name": "Kimsuky", "org": "DPRK Espionage", "country": "South Korea", "lat": 37.5665, "lon": 126.978},
    {"name": "MuddyWater", "org": "Iranian MOIS", "country": "Iran", "lat": 35.6892, "lon": 51.389},
]

PROTOCOLS = ["TCP", "UDP", "HTTP/2", "QUIC", "SSH", "TLS 1.3"]
ATTACK_TYPES = [
    "SQL Injection Pattern Detected",
    "Log4Shell JNDI Lookup",
    "Brute Force Attempt: SSH",
    "Lateral Movement: SMB Session",
    "Data Exfiltration: DNS Tunneling",
    "Unauthorized API Access Attempt",
    "Metasploit Reverse Shell Beacon",
    "Ransomware Encryption Activity"
]

def generate_threat():
    actor = random.choice(THREAT_ACTORS)
    severity = random.choice(["low", "medium", "high", "critical"])
    
    # Randomize coordinates slightly around the city for visual variety
    lat = actor["lat"] + random.uniform(-2, 2)
    lon = actor["lon"] + random.uniform(-2, 2)
    
    ip = f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"
    
    flow = {
        "timestamp_epoch": time.time(),
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "severity": severity,
        "rule_id": random.choice(ATTACK_TYPES),
        "protocol": random.choice(PROTOCOLS),
        "src_ip": ip,
        "src_lat": lat,
        "src_lon": lon,
        "src_country": actor["country"],
        "src_city": actor["name"],
        "ai_label": f"Attributed to {actor['name']}",
        "ml_anomaly_score": random.uniform(0.4, 0.99) if severity in ["high", "critical"] else random.uniform(0.1, 0.4),
        "dst_ip": "10.0.0.1",
        "dst_lat": 31.7917, # Morocco SOC
        "dst_lon": -7.0926
    }
    return flow

def main():
    print("[*] Starting REAL-TIME THREAT INJECTOR...")
    print("[*] Feeding data to the Live Threat Sphere...")
    
    try:
        while True:
            # Generate 1-3 threats at a time
            for _ in range(random.randint(1, 3)):
                threat = generate_threat()
                payload = json.dumps(threat)
                
                # Push to Redis Stream 'flows' (consumed by api.py or threat_map.py)
                r.xadd("flows", {"payload": payload}, maxlen=1000)
                
                # Also publish to PubSub for any active listeners
                r.publish("flows", payload)
                
                print(f"[+] Injected Threat: {threat['rule_id']} from {threat['src_country']} ({threat['severity']})")
            
            # Wait between pulses
            time.sleep(random.uniform(2, 5))
    except KeyboardInterrupt:
        print("\n[*] Stopping Injector.")

if __name__ == "__main__":
    main()
