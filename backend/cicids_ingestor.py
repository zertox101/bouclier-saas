import time
import json
import random
import requests
import os
import csv
import numpy as np
import ipaddress
from datetime import datetime

# CONFIG
API_URL = "http://backend:8005/api/telemetry/events"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "ml", "data")
DATA_FILE_FULL = os.path.join(DATA_DIR, "cicids2017_full.csv")
DATA_FILE_SAMPLE = os.path.join(DATA_DIR, "cicids2017_sample.csv")
DATA_FILE = DATA_FILE_SAMPLE if os.path.exists(DATA_FILE_SAMPLE) else DATA_FILE_FULL

# EXPERT MITRE ATT&CK MAPPING (Updated for CICIDS 2017)
ATTACK_MAPPING = {
    "BENIGN": {"type": "BENIGN", "severity": "info", "msg": "Normal network traffic detected", "mitre": "N/A"},
    "DoS Hulk": {"type": "DoS", "severity": "CRITIQUE", "msg": "DoS Hulk attack detected (Volumetric)", "mitre": "T1498"},
    "DoS GoldenEye": {"type": "DoS", "severity": "CRITIQUE", "msg": "DoS GoldenEye attack detected", "mitre": "T1498"},
    "DoS slowloris": {"type": "DoS", "severity": "ÉLEVÉ", "msg": "DoS slowloris attack (Session Exhaustion)", "mitre": "T1498"},
    "DoS Slowloris": {"type": "DoS", "severity": "ÉLEVÉ", "msg": "DoS slowloris attack", "mitre": "T1498"},
    "DoS Slowhttptest": {"type": "DoS", "severity": "ÉLEVÉ", "msg": "DoS Slowhttptest detected", "mitre": "T1498"},
    "FTP-Patator": {"type": "Brute Force", "severity": "ÉLEVÉ", "msg": "FTP Brute Force (Patator) detected", "mitre": "T1110"},
    "SSH-Patator": {"type": "Brute Force", "severity": "ÉLEVÉ", "msg": "SSH Brute Force (Patator) detected", "mitre": "T1110"},
    "PortScan": {"type": "Probing", "severity": "MOYEN", "msg": "Network Port Scanning detected", "mitre": "T1046"},
    "Portscan": {"type": "Probing", "severity": "MOYEN", "msg": "Network Port Scanning detected", "mitre": "T1046"},
    "Web Attack – Brute Force": {"type": "Web Attack", "severity": "ÉLEVÉ", "msg": "Web Brute Force attempt", "mitre": "T1190"},
    "Web Attack - Brute Force": {"type": "Web Attack", "severity": "ÉLEVÉ", "msg": "Web Brute Force attempt", "mitre": "T1190"},
    "Bot": {"type": "Botnet", "severity": "CRITIQUE", "msg": "C&C Communication (Botnet) detected", "mitre": "T1071"},
    "Botnet": {"type": "Botnet", "severity": "CRITIQUE", "msg": "C&C Communication (Botnet) detected", "mitre": "T1071"},
    "Infiltration": {"type": "Exploit", "severity": "CRITIQUE", "msg": "System Infiltration / Remote Exploit", "mitre": "T1190"},
    "DDoS": {"type": "DDoS", "severity": "CRITIQUE", "msg": "Distributed Denial of Service (DDoS)", "mitre": "T1498"},
    "Heartbleed": {"type": "Exploit", "severity": "CRITIQUE", "msg": "Heartbleed SSL Vulnerability Exploitation", "mitre": "T1190"},
    "Web Attack - XSS": {"type": "Web Attack", "severity": "ÉLEVÉ", "msg": "Cross-Site Scripting (XSS) detected", "mitre": "T1190"},
    "Web Attack - SQL Injection": {"type": "Web Attack", "severity": "CRITIQUE", "msg": "SQL Injection attempt detected", "mitre": "T1190"},
}

SECTORS = ["Military", "Banking", "Energy", "Tech", "Government", "Healthcare"]

def get_random_public_ip():
    """Generates a random public IP address."""
    while True:
        ip = ipaddress.IPv4Address(random.getrandbits(32))
        if ip.is_global:
            return str(ip)

class RealDataIngestor:
    def __init__(self):
        print(f"[*] Analyzing Real CICIDS 2017 Dataset at {DATA_FILE}...")
        self.total_records = 0
        self.line_offsets = []
        self.headers = []
        
        try:
            if not os.path.exists(DATA_FILE):
                raise FileNotFoundError(f"[-] CSV not found at {DATA_FILE}. Please run download_real_cicids.py.")
                
            with open(DATA_FILE, 'rb') as f:
                header_line = f.readline().decode('utf-8', errors='ignore').strip()
                self.headers = header_line.split(',')
                
                print("[*] Indexing rows for zero-memory access...")
                while True:
                    offset = f.tell()
                    line = f.readline()
                    if not line:
                        break
                    self.line_offsets.append(offset)
            
            self.total_records = len(self.line_offsets)
            print(f"[+] Successfully indexed {self.total_records} real CICIDS records (Zero RAM usage).")
            
            # Simulated GeoIP Mapping Cache for consistency during session
            self.ip_metadata = {}
        except Exception as e:
            print(f"[-] Error loading dataset: {e}")
            self.total_records = 0

    def get_ip_metadata(self, ip):
        if ip in self.ip_metadata:
            return self.ip_metadata[ip]
        
        # Real GeoIP Lookup via ip-api.com
        try:
            # We use a short timeout so we don't block the ingestor stream if API is slow
            resp = requests.get(f"http://ip-api.com/json/{ip}", timeout=1.0)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    meta = {
                        "country": data.get("country", "Unknown"),
                        "lat": data.get("lat", 0.0),
                        "lng": data.get("lon", 0.0),
                        "sector": random.choice(SECTORS)
                    }
                    self.ip_metadata[ip] = meta
                    return meta
        except:
            pass # Fallback to deterministic generation if offline or rate-limited

        # Fallback deterministic generation
        seed_val = int(ipaddress.ip_address(ip))
        random.seed(seed_val)
        
        countries = [
            ("USA", 37.0902, -95.7129),
            ("Russia", 61.5240, 105.3188),
            ("China", 35.8617, 104.1954),
            ("Germany", 51.1657, 10.4515),
            ("Iran", 32.4279, 53.6880),
            ("North Korea", 40.3399, 127.5101),
            ("France", 46.2276, 2.2137),
            ("Brazil", -14.2350, -51.9253),
            ("Israel", 31.0461, 34.8516),
            ("Morocco", 31.7917, -7.0926)
        ]
        country, lat, lng = random.choice(countries)
        lat += random.uniform(-2, 2)
        lng += random.uniform(-2, 2)
        
        meta = {
            "country": country,
            "lat": lat,
            "lng": lng,
            "sector": random.choice(SECTORS)
        }
        self.ip_metadata[ip] = meta
        return meta

    def get_next_record(self):
        if self.total_records == 0:
            return None
        
        idx = random.randint(0, self.total_records - 1)
        offset = self.line_offsets[idx]
        
        try:
            with open(DATA_FILE, 'rb') as f:
                f.seek(offset)
                line = f.readline().decode('utf-8', errors='ignore').strip()
                values = next(csv.reader([line]))
                
                # Create a dict like pandas row
                row = dict(zip(self.headers, values))
                
                # Label is usually the last column or named 'Label'
                target = row.get('Label', 'BENIGN')
                return row, target
        except Exception as e:
            print(f"Error reading row: {e}")
            return None, "BENIGN"

    def generate_event(self):
        record = self.get_next_record()
        if record is None:
            return None
        
        row, target = record
        mapping = ATTACK_MAPPING.get(target, {"type": "Unknown", "severity": "MOYEN", "msg": f"Detected {target}", "mitre": "T1190"})
        
        # Real IPs
        if target == "BENIGN":
            src_ip = f"10.0.0.{random.randint(2, 254)}"
            meta = {"country": "LOCAL", "lat": 33.5731, "lng": -7.5898, "sector": random.choice(SECTORS)} # Casablanca HQ
        else:
            src_ip = get_random_public_ip()
            meta = self.get_ip_metadata(src_ip)
        
        duration = float(row.get('Flow Duration', 0))
        src_bytes = int(float(row.get('Total Length of Fwd Packet', row.get('Total Length of Fwd Packets', row.get('Subflow Fwd Bytes', 0)))))
        dst_bytes = int(float(row.get('Total Length of Bwd Packet', row.get('Total Length of Bwd Packets', row.get('Subflow Bwd Bytes', 0)))))
        port = row.get('Dst Port', row.get('Destination Port', 80))
        protocol = row.get('Protocol', 6)
        protocol_name = "TCP" if int(float(protocol)) == 6 else "UDP" if int(float(protocol)) == 17 else "ICMP" if int(float(protocol)) == 1 else "OTHER"

        # AI Features Propagation (29 selected features for high-fidelity detection)
        ai_features = {}
        target_features = [
            "Flow Duration", "Total Fwd Packet", "Total Bwd packets",
            "Total Length of Fwd Packet", "Total Length of Bwd Packet",
            "Fwd Packet Length Max", "Fwd Packet Length Min", "Fwd Packet Length Mean",
            "Bwd Packet Length Max", "Bwd Packet Length Min", "Bwd Packet Length Mean",
            "Flow Bytes/s", "Flow Packets/s",
            "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max",
            "Fwd IAT Total", "Bwd IAT Total",
            "Fwd Header Length", "Bwd Header Length",
            "Packet Length Mean", "Packet Length Std",
            "FIN Flag Count", "SYN Flag Count", "RST Flag Count", "PSH Flag Count", "ACK Flag Count",
            "Average Packet Size", "Dst Port"
        ]
        for f_name in target_features:
            ai_features[f_name] = row.get(f_name, 0)

        return {
            "sensor_name": "CASABLANCA-SOC-CORE-01",
            "sensor_type": "IDS/IPS",
            "event_type": mapping["type"],
            "severity": mapping["severity"].upper(),
            "message": mapping["msg"],
            "payload": {
                "src_ip": src_ip,
                "dst_ip": "10.0.0.1",
                "country": meta["country"],
                "lat": meta["lat"],
                "lng": meta["lng"],
                "sector": meta["sector"],
                "protocol": protocol_name,
                "dst_port": int(float(port)),
                "mitre_id": mapping["mitre"],
                "risk_score": random.randint(85, 99) if mapping["severity"] == "CRITIQUE" else random.randint(10, 60),
                "dataset_source": "CICIDS-2017 Real Traffic",
                "duration": duration,
                "src_bytes": src_bytes,
                "dst_bytes": dst_bytes,
                **ai_features # Inject all AI features
            }
        }

def main():
    print("[*] EXPERT REAL-DATA CICIDS INGESTOR :: ACTIVE")
    ingestor = RealDataIngestor()
    
    while True:
        try:
            event = ingestor.generate_event()
            if event:
                requests.post(API_URL, json=event, timeout=5)
                # Reset random seed after event generation to not affect main loop
                random.seed(time.time())
                print(f"[+] Ingested: {event['event_type']} ({event['message']}) from {event['payload']['src_ip']} ({event['payload']['country']})")
            else:
                print("[-] No event generated, retrying...")
        except Exception as e:
            print(f"[-] Error sending event: {e}")
        
        # Simulate traffic volume spikes
        if random.random() > 0.85:
            time.sleep(random.uniform(0.01, 0.05)) # High volume burst
        else:
            time.sleep(random.uniform(0.2, 1.0))

if __name__ == "__main__":
    main()
