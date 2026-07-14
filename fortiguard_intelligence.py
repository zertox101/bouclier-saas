import requests
import time
import json
import os
import sys

# Real Threat Intelligence Module
# Downloads real IoC (Indicators of Compromise) from open-source feeds
# and cross-references them with events flowing through the telemetry pipeline.

API_URL = "http://localhost:8005/api/telemetry/events"

# Open-source Threat Intelligence Feeds (no API key required)
IOC_FEEDS = {
    "abuse_ch_feodo": {
        "url": "https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.txt",
        "type": "BOTNET_C2",
        "severity": "critical",
        "source": "abuse.ch Feodo Tracker"
    },
    "abuse_ch_sslbl": {
        "url": "https://sslbl.abuse.ch/blacklist/sslipblacklist.txt",
        "type": "MALWARE_C2",
        "severity": "critical",
        "source": "abuse.ch SSL Blacklist"
    },
    "blocklist_de": {
        "url": "https://lists.blocklist.de/lists/all.txt",
        "type": "BRUTE_FORCE",
        "severity": "high",
        "source": "blocklist.de"
    }
}

class ThreatIntelEngine:
    def __init__(self):
        self.known_bad_ips = {}  # ip -> {source, type, severity}
        self.total_iocs = 0

    def fetch_feeds(self):
        """Download real threat intelligence feeds."""
        print("[*] Downloading live Threat Intelligence feeds...")
        
        for feed_name, feed_info in IOC_FEEDS.items():
            try:
                resp = requests.get(feed_info["url"], timeout=15)
                if resp.status_code == 200:
                    count = 0
                    for line in resp.text.splitlines():
                        line = line.strip()
                        # Skip comments and empty lines
                        if not line or line.startswith("#") or line.startswith(";"):
                            continue
                        # Some feeds have IP:port format
                        ip = line.split(":")[0].split(",")[0].strip()
                        # Basic IPv4 validation
                        parts = ip.split(".")
                        if len(parts) == 4:
                            try:
                                if all(0 <= int(p) <= 255 for p in parts):
                                    self.known_bad_ips[ip] = {
                                        "source": feed_info["source"],
                                        "type": feed_info["type"],
                                        "severity": feed_info["severity"]
                                    }
                                    count += 1
                            except ValueError:
                                pass
                    print(f"  [+] {feed_name}: {count} malicious IPs loaded from {feed_info['source']}")
                else:
                    print(f"  [-] {feed_name}: HTTP {resp.status_code}")
            except Exception as e:
                print(f"  [-] {feed_name}: Failed to fetch - {e}")
        
        self.total_iocs = len(self.known_bad_ips)
        print(f"[+] Total unique IoCs loaded: {self.total_iocs}")

    def check_ip(self, ip):
        """Check if an IP is in our threat intel database."""
        return self.known_bad_ips.get(ip)

    def report_match(self, ip, intel):
        """Send a real threat alert to the telemetry API."""
        payload = {
            "sensor_name": "THREAT-INTEL-ENGINE",
            "sensor_type": "external_intel",
            "event_type": intel["type"],
            "severity": intel["severity"],
            "message": f"[REAL IoC MATCH] {ip} found in {intel['source']} ({intel['type']})",
            "payload": {
                "src_ip": ip,
                "dst_ip": "10.0.0.1",
                "ioc_source": intel["source"],
                "threat_type": intel["type"],
                "dataset_source": "Live Threat Intelligence Feed"
            }
        }
        try:
            requests.post(API_URL, json=payload, timeout=2)
            print(f"  [ALERT] {ip} -> {intel['source']} ({intel['type']})")
        except:
            pass

def main():
    print("")
    print("  [BOUCLIER] THREAT INTELLIGENCE ENGINE")
    print("  ======================================")
    print("  Mode: Live Open-Source IoC Feeds")
    print("  Sources: abuse.ch, blocklist.de")
    print("")

    engine = ThreatIntelEngine()
    engine.fetch_feeds()

    if engine.total_iocs == 0:
        print("[-] No IoCs loaded. Check your internet connection.")
        sys.exit(1)

    print(f"\n[*] Monitoring telemetry stream for IoC matches...")
    print(f"    Database: {engine.total_iocs} known malicious IPs")

    # Poll the telemetry API for recent events and cross-reference
    checked_ids = set()
    
    while True:
        try:
            resp = requests.get("http://localhost:8005/api/telemetry/stats", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                alerts = data.get("alerts", [])
                
                matches = 0
                for alert in alerts:
                    alert_id = alert.get("id")
                    if alert_id in checked_ids:
                        continue
                    checked_ids.add(alert_id)
                    
                    src_ip = alert.get("src_ip", "")
                    intel = engine.check_ip(src_ip)
                    if intel:
                        engine.report_match(src_ip, intel)
                        matches += 1
                
                if matches > 0:
                    print(f"[!] {matches} IoC matches found in latest batch.")
                    
        except Exception as e:
            pass
        
        # Refresh feeds every 30 minutes
        time.sleep(15)

if __name__ == "__main__":
    main()

