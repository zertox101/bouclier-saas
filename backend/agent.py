import time
import requests
import psutil
import platform
import socket
import json
import random
import threading
from datetime import datetime
from scapy.all import sniff, IP, TCP, UDP
import redis
import os

# Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
FLOW_STREAM_NAME = "flows"
AGENT_ID = f"agent-{platform.node()}"

# Connect to local Redis for direct injection
try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    print(f"[*] Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    print(f"[!] Redis connection failed: {e}")
    r = None

def packet_callback(pkt):
    """Analyze real network packets and push to the Threat Map."""
    if IP in pkt:
        src_ip = pkt[IP].src
        dst_ip = pkt[IP].dst
        protocol = "TCP" if TCP in pkt else ("UDP" if UDP in pkt else "OTHER")
        
        # We only care about external traffic for the map (not localhost loopback)
        if not src_ip.startswith("127.") and not dst_ip.startswith("127."):
            flow = {
                "timestamp_epoch": time.time(),
                "agent_id": AGENT_ID,
                "src_ip": src_ip,
                "dst_ip": dst_ip,
                "protocol": protocol,
                "length": len(pkt),
                "severity": "low", # Default, server will escalate if needed
                "rule_id": "REAL_TIME_TRAFFIC",
                "dst_lat": 31.7917, # Your SOC Location (Morocco)
                "dst_lon": -7.0926
            }
            
            # Push to Redis for immediate display on Map
            if r:
                r.xadd(FLOW_STREAM_NAME, {"payload": json.dumps(flow)}, maxlen=1000)

def start_sniffing():
    print("[*] Starting Packet Sniffer on default interface...")
    sniff(prn=packet_callback, store=0)

def run_heartbeat():
    print(f"[*] SHIELD Heartbeat {AGENT_ID} started...")
    while True:
        try:
            metrics = {
                "cpu": psutil.cpu_percent(),
                "memory": psutil.virtual_memory().percent,
                "agent_id": AGENT_ID,
                "status": "ONLINE"
            }
            # Report system health to Redis
            if r:
                r.hset(f"agent:health:{AGENT_ID}", mapping=metrics)
                r.expire(f"agent:health:{AGENT_ID}", 60) # TTL for health
            
            # Trigger backend processing
            requests.get("http://backend:8005/api/traffic/live")
        except:
            pass
        time.sleep(10)

if __name__ == "__main__":
    print("""
    🛡️ BOUCLIER - PRO SECURITY AGENT
    ===============================
    Agent ID: {0}
    Mode: Real-time Packet Inspection
    """.format(AGENT_ID))
    
    # Start Sniffer in a background thread
    sniff_thread = threading.Thread(target=start_sniffing, daemon=True)
    sniff_thread.start()
    
    # Run Heartbeat in main thread
    run_heartbeat()
