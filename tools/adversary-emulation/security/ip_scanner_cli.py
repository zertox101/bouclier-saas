#!/usr/bin/env python3
"""
SHIELD IP Scanner CLI (safe wrapper)
"""

import argparse
import json
import ipaddress

from ip_scanner import IPLookup, PortScanner, NetworkAnalyzer


def is_private_ip(ip_str):
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip.is_private or ip.is_loopback
    except ValueError:
        return False


def summarize(result):
    lines = []
    lookup = result.get("lookup", {})
    geo = lookup.get("geolocation", {})
    threat = lookup.get("threat_intel", {})

    lines.append(f"Target: {result.get('target')}")
    if geo:
        city = geo.get("city") or ""
        country = geo.get("country") or ""
        isp = geo.get("isp") or ""
        lines.append(f"Location: {city} {country}".strip())
        if isp:
            lines.append(f"ISP: {isp}")

    if threat:
        lines.append(f"Threat: {threat.get('threat_type') or 'none'}")

    ports = result.get("ports", [])
    if ports:
        lines.append(f"Open ports: {len(ports)}")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="SHIELD IP Scanner (safe wrapper)")
    parser.add_argument("--target", help="Target IP address")
    parser.add_argument("--scan-ports", action="store_true", help="Run a common-ports scan (private targets only)")
    parser.add_argument("--force-public", action="store_true", help="Allow port scan on public targets")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    lookup = IPLookup()

    if not args.target:
        info = lookup.get_my_ip()
        if args.json:
            print(json.dumps({"local_info": info}, indent=2))
        else:
            print(f"Hostname: {info.get('hostname')}")
            print(f"Local IPs: {', '.join(info.get('local_ips', []))}")
            print(f"Public IP: {info.get('public_ip')}")
        return

    target = args.target.strip()
    result = {
        "target": target,
        "lookup": lookup.lookup(target),
    }

    if args.scan_ports:
        if is_private_ip(target) or args.force_public:
            scanner = PortScanner()
            result["ports"] = scanner.quick_scan(target)
        else:
            result["ports"] = []
            result["port_scan_skipped"] = True

    analyzer = NetworkAnalyzer()
    result["connectivity"] = analyzer.check_connectivity(target)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(summarize(result))


if __name__ == "__main__":
    main()
