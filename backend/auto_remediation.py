import time
import subprocess
import json
import redis
import os
import sys

# Windows requires admin privileges to change firewall rules.
# This script will attempt to use PowerShell to create block rules.

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
STREAM_KEY = "event_stream"

BLOCKED_IPS = set()

def block_ip_windows(ip):
    if ip in BLOCKED_IPS or ip.startswith("127.") or ip.startswith("10.") or ip.startswith("192.168."):
        return
        
    print(f"[!] Auto-Remediation: Attempting to block {ip} at Windows Firewall...")
    
    # Create a unique rule name
    rule_name = f"BOUCLIER_BLOCK_{ip}"
    
    ps_command = f'New-NetFirewallRule -DisplayName "{rule_name}" -Direction Inbound -Action Block -RemoteAddress {ip}'
    
    try:
        # We use powershell to execute the command
        result = subprocess.run(
            ["powershell", "-Command", ps_command],
            capture_output=True,
            text=True,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        if result.returncode == 0:
            print(f"[+] SUCCESS: {ip} has been blocked at the OS level.")
            BLOCKED_IPS.add(ip)
        else:
            print(f"[-] FAILED to block {ip}. Reason: {result.stderr.strip()}")
            # It usually fails if not running as Administrator
            if "Access is denied" in result.stderr:
                print("    > Note: This script must be run as Administrator to modify the firewall.")
                
    except Exception as e:
        print(f"[-] Execution error: {e}")

def main():
    print("""
    [BOUCLIER] - AUTO REMEDIATION MODULE
    ======================================
    Status: ONLINE
    Mode: Windows Defender Firewall Integration
    Listening for Critical Alerts...
    """)
    
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
        r.ping()
    except Exception as e:
        print(f"[-] Redis connection failed: {e}")
        sys.exit(1)

    # Listen to the event stream
    last_id = '$' # Only listen to new events
    
    while True:
        try:
            # Block for 5 seconds waiting for new events
            events = r.xread({STREAM_KEY: last_id}, count=10, block=5000)
            
            if not events:
                continue
                
            for stream, messages in events:
                for message_id, message_data in messages:
                    last_id = message_id
                    
                    if 'payload' in message_data:
                        try:
                            payload = json.loads(message_data['payload'])
                            severity = str(payload.get('severity', '')).upper()
                            src_ip = payload.get('src_ip')
                            
                            if severity in ['CRITICAL', 'CRITIQUE'] and src_ip:
                                print(f"\n[*] Critical Threat Detected from {src_ip}: {payload.get('attackType', 'Unknown')}")
                                block_ip_windows(src_ip)
                        except json.JSONDecodeError:
                            pass
        except Exception as e:
            print(f"[-] Stream read error: {e}")
            time.sleep(2)

if __name__ == "__main__":
    main()
