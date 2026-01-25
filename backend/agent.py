import time
import requests
import psutil
import platform
import socket
import json
import random
from datetime import datetime

# Configuration
API_URL = "http://localhost:8005/api/traffic/live"
AGENT_ID = f"agent-{platform.node()}"

def get_system_metrics():
    return {
        "cpu": psutil.cpu_percent(),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage('/').percent,
        "network_sent": psutil.net_io_counters().bytes_sent,
        "network_recv": psutil.net_io_counters().bytes_recv
    }

def collect_logs():
    """Simulate log collection (e.g. from /var/log/syslog or Event Viewer)"""
    # In a real agent, this would tail files. Here we simulate 'events'
    events = []
    
    # Randomly generate suspicious activity
    if random.random() < 0.1: # 10% chance
        events.append({
            "source": "SystemGuard",
            "type": "Unauthorized Access Attempt",
            "details": f"Failed login for root from {random.randint(1,255)}.{random.randint(1,255)}.0.1"
        })
    
    return events

def run_agent():
    print(f"[*] SHIELD Agent {AGENT_ID} started...")
    print(f"[*] Reporting to {API_URL}")
    
    while True:
        try:
            # 1. Collect Metrics
            metrics = get_system_metrics()
            
            # 2. Collect Logs
            logs = collect_logs()
            
            # 3. Network Scan (Local)
            # In a real agent, we might use scapy or generic netstat
            # For this demo, we rely on the server's existing scanner logic
            # but we could send local view up.
            
            payload = {
                "agent_id": AGENT_ID,
                "timestamp": datetime.now().isoformat(),
                "metrics": metrics,
                "logs": logs
            }
            
            # 4. Report to C2 (Server)
            # Currently our API expects 'live traffic' trigger, but we should add a dedicated agent endpoint.
            # For now, we will hit the existing traffic endpoint to trigger the 'scan_network_connections' 
            # on the server side + logic, effectively acting as a heartbeat.
            response = requests.get(API_URL) 
            
            if response.status_code == 200:
                print(f"[+] Heartbeat sent. Server: {response.json().get('total')} packets.")
            else:
                print(f"[-] Heartbeat failed: {response.status_code}")
                
        except Exception as e:
            print(f"[!] Agent Error: {e}")
            
        time.sleep(5)

if __name__ == "__main__":
    run_agent()
