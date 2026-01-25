import argparse
import os
import random
import time
from datetime import datetime

import requests


def build_payload(src_ip: str, dst_ip: str, rule_id: str, user: str, host: str) -> dict:
    now = int(time.time())
    return {
        "timestamp_epoch": now,
        "user": user,
        "host": host,
        "src_ip": src_ip,
        "dst_ip": dst_ip,
        "event_type": "network_flow",
        "status": "observed",
        "severity": "medium",
        "details": {
            "dst_ip": dst_ip,
            "dst_port": 443,
            "rule_id": rule_id,
            "bytes_out": random.randint(500, 50000),
            "flow_id": f"flow-{now}-{random.randint(1000, 9999)}",
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate flow events for map streaming.")
    parser.add_argument("--api-url", default=os.getenv("API_URL", "http://localhost:8005"))
    parser.add_argument("--target-ip", default=os.getenv("TARGET_IP", "8.8.8.8"))
    parser.add_argument("--count", type=int, default=50)
    parser.add_argument("--interval", type=float, default=0.5)
    parser.add_argument("--user", default=os.getenv("SIM_USER", "attacker"))
    parser.add_argument("--host", default=os.getenv("SIM_HOST", "sensor-1"))
    args = parser.parse_args()

    ingest_url = args.api_url.rstrip("/") + "/api/events/ingest"

    sources = [
        "1.1.1.1",         # Cloudflare - AU/US
        "8.8.8.8",         # Google - US
        "208.67.222.222",  # OpenDNS - US
        "9.9.9.9",         # Quad9 - CH
        "185.199.108.153", # GitHub - US
        "31.13.71.36",     # Meta - US
        "104.16.132.229",  # Cloudflare - US
    ]

    rules = [
        "flow_anomaly",
        "bruteforce_suspected",
        "c2_beacon",
        "data_exfil",
    ]

    print(f"[{datetime.utcnow().isoformat()}] Sending {args.count} flows to {ingest_url}")
    for _ in range(args.count):
        src_ip = random.choice(sources)
        rule_id = random.choice(rules)
        payload = build_payload(src_ip, args.target_ip, rule_id, args.user, args.host)
        try:
            resp = requests.post(ingest_url, json=payload, timeout=10)
            resp.raise_for_status()
        except Exception as exc:
            print(f"[!] Failed to send event: {exc}")
            time.sleep(args.interval)
            continue
        print(f"[+] {payload['src_ip']} -> {payload['dst_ip']} ({rule_id})")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
