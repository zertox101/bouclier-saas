import json
import csv
import random
import uuid
from datetime import datetime, timedelta
import ipaddress
import os

# Configuration
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../../docs/datasets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

START_TIME = datetime.now() - timedelta(days=1)
EVENTS_COUNT = 1000

# Constants
PROTOCOLS = ['TCP', 'UDP', 'ICMP']
HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD']
STATUS_CODES = [200, 201, 301, 302, 400, 401, 403, 404, 500, 503]
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/89.0",
    "python-requests/2.25.1",
    "curl/7.68.0"
]

# Attack Signatures (Payload-less descriptions)
ATTACKS = {
    'brute_force': ['Failed login attempt', 'Multiple failed logins', 'Invalid password'],
    'port_scan': ['Connection attempt to closed port', 'SYN scan detected', 'XMAS scan detected'],
    'sql_injection': ['UNION SELECT heuristics', 'SQL syntax error pattern', 'Quote imbalance detected'],
    'xss': ['Script tag heuristics', 'Event handler injection', 'Javascript protocol detected'],
    'malware_c2': ['Unusual DNS query', 'Beaconing behavior', 'Known C2 IP connection'],
}

def random_ip():
    return str(ipaddress.IPv4Address(random.randint(0, 2**32 - 1)))

def random_private_ip():
    return str(ipaddress.IPv4Address(random.randint(3232235520, 3232236031))) # 192.168.0.0/22 approx

def generate_apache_log(timestamp):
    ip = random_ip()
    method = random.choice(HTTP_METHODS)
    endpoint = random.choice(['/login', '/dashboard', '/api/data', '/index.html', '/about', '/contact'])
    status = random.choice(STATUS_CODES)
    size = random.randint(100, 5000)
    ua = random.choice(USER_AGENTS)
    
    # Simulate Anomaly
    label = "benign"
    if random.random() < 0.05:
        label = "suspicious"
        status = 403
        if random.random() < 0.5:
            endpoint = "/admin/config.php"
            label = "attack-recon"
    
    return {
        "log_type": "apache_access",
        "timestamp": timestamp.isoformat(),
        "source_ip": ip,
        "method": method,
        "url": endpoint,
        "status_code": status,
        "bytes": size,
        "user_agent": ua,
        "label": label
    }

def generate_sysmon_log(timestamp):
    # Event ID 1: Process Create
    return {
        "log_type": "windows_sysmon",
        "event_id": 1,
        "timestamp": timestamp.isoformat(),
        "computer_name": "WORKSTATION-" + str(random.randint(1, 50)),
        "user": "DOMAIN\\" + random.choice(["Admin", "User", "System"]),
        "image": random.choice(["C:\\Windows\\System32\\cmd.exe", "C:\\Windows\\System32\\svchost.exe", "C:\\Program Files\\Chrome\\chrome.exe"]),
        "command_line": random.choice(["cmd.exe /c whoami", "svchost.exe -k netsvcs", "chrome.exe google.com"]),
        "parent_image": "C:\\Windows\\System32\\explorer.exe",
        "label": "benign"
    }

def generate_suricata_alert(timestamp):
    attack_type = random.choice(list(ATTACKS.keys()))
    msg = random.choice(ATTACKS[attack_type])
    
    return {
        "log_type": "suricata_alert",
        "timestamp": timestamp.isoformat(),
        "alert_message": msg,
        "category": attack_type,
        "severity": random.choice(["low", "medium", "high", "critical"]),
        "source_ip": random_ip(),
        "destination_ip": random_private_ip(),
        "protocol": random.choice(PROTOCOLS),
        "label": "attack-" + attack_type
    }

# Main Generation
data = []
current_time = START_TIME

print(f"Generating {EVENTS_COUNT} synthetic security events...")

for _ in range(EVENTS_COUNT):
    current_time += timedelta(seconds=random.randint(1, 60))
    
    rand = random.random()
    if rand < 0.4:
        log = generate_apache_log(current_time)
    elif rand < 0.7:
        log = generate_sysmon_log(current_time)
    else:
        log = generate_suricata_alert(current_time)
        
    data.append(log)

# Save JSON
json_path = os.path.join(OUTPUT_DIR, "synthetic_dataset.json")
with open(json_path, 'w') as f:
    json.dump(data, f, indent=2)

# Save CSV
csv_path = os.path.join(OUTPUT_DIR, "synthetic_dataset.csv")
if data:
    keys = set().union(*(d.keys() for d in data))
    with open(csv_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)

print(f"Dataset generated at:\n - {json_path}\n - {csv_path}")
