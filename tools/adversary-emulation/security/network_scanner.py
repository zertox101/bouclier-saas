#!/usr/bin/env python3
"""
SHIELD Network Scanner
Discover connected devices using ARP requests (Scapy)
"""

import sys
import os
import argparse
import socket
import json

try:
    import scapy.all as scapy
    HAS_SCAPY = True
except ImportError:
    HAS_SCAPY = False


def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "192.168.1.1"


def _style(text, code, use_color):
    if not use_color:
        return text
    return f"\033[{code}m{text}\033[0m"


def scan(ip_range, use_color=True):
    """Scan network using ARP"""
    if not HAS_SCAPY:
        print(_style("[!] Error: Scapy not installed. Run 'pip install scapy'", "91", use_color))
        return []

    print(_style(f"\n[*] Scanning network: {ip_range} ...", "96", use_color))

    try:
        arp = scapy.ARP(pdst=ip_range)
        broadcast = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
        packet = broadcast / arp

        answered = scapy.srp(packet, timeout=2, verbose=0)[0]

        devices = []
        for sent, received in answered:
            devices.append({
                "ip": received.psrc,
                "mac": received.hwsrc.upper(),
            })

        return devices

    except Exception as e:
        print(_style(f"[!] Scan Failed: {e}", "91", use_color))
        if os.name == 'nt':
            print(_style("[!] Note: On Windows, you need Npcap installed.", "93", use_color))
        return []


def print_result(devices, use_color=True):
    """Print results in a nice table"""
    print("\n" + "=" * 50)
    print(" IP ADDRESS\t\tMAC ADDRESS")
    print("-" * 50)

    for device in devices:
        print(f" {device['ip']:16}\t{device['mac']}")

    print("=" * 50)
    print(_style(f"[+] Found {len(devices)} devices connected.\n", "92", use_color))


def main():
    parser = argparse.ArgumentParser(description="Scan ARP network")
    parser.add_argument("-t", "--target", help="Target IP range (e.g. 192.168.1.0/24)")
    parser.add_argument("--no-input", action="store_true", help="Do not prompt for input")
    parser.add_argument("--no-color", action="store_true", help="Disable ANSI colors")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    use_color = not args.no_color

    print("SHIELD NETWORK ARP SCANNER v1.0")
    print("Discover Connected Devices (MAC/IP)\n")

    target = args.target

    if not target:
        local_ip = get_local_ip()
        base_ip = ".".join(local_ip.split(".")[:3]) + ".0/24"
        print(_style(f"[*] Auto-detected Local IP: {local_ip}", "93", use_color))

        if args.no_input:
            target = base_ip
        else:
            target = input(f"Enter target IP range [{base_ip}]: ").strip() or base_ip

    devices = scan(target, use_color=use_color)

    if args.json:
        payload = {
            "target": target,
            "count": len(devices),
            "devices": devices,
            "scapy_available": HAS_SCAPY,
        }
        print(json.dumps(payload, indent=2))
    else:
        print_result(devices, use_color=use_color)


if __name__ == "__main__":
    main()
