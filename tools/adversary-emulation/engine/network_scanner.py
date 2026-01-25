#!/usr/bin/env python3
"""
SHIELD Network Scanner
Scans local network for active devices and their open ports
"""

import socket
import subprocess
import json
import time
import sys
import requests
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# SHIELD Dashboard endpoint
SHIELD_INGESTOR = "http://localhost:8002/ingest/syslog"

# Common device ports to check
DEVICE_PORTS = {
    22: "SSH",
    23: "Telnet",
    80: "HTTP",
    443: "HTTPS",
    445: "SMB",
    3389: "RDP",
    5900: "VNC",
    8080: "HTTP-Proxy",
    9100: "Printer",
}

def print_banner():
    print("""
+==============================================================+
|     SHIELD NETWORK SCANNER v1.0                              |
|          Discover Devices on Your Local Network              |
+==============================================================+
    """)

def get_local_ip():
    """Get local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "192.168.1.1"

def get_network_range(local_ip):
    """Get network range from local IP"""
    parts = local_ip.split('.')
    return f"{parts[0]}.{parts[1]}.{parts[2]}"

def ping_host(ip, timeout=1):
    """Ping a host to check if it's alive"""
    try:
        if sys.platform == 'win32':
            result = subprocess.run(
                ['ping', '-n', '1', '-w', str(timeout * 1000), ip],
                capture_output=True, timeout=timeout + 1
            )
        else:
            result = subprocess.run(
                ['ping', '-c', '1', '-W', str(timeout), ip],
                capture_output=True, timeout=timeout + 1
            )
        return result.returncode == 0
    except:
        return False

def scan_host_ports(ip, ports=None, timeout=0.3):
    """Scan ports on a specific host"""
    if ports is None:
        ports = list(DEVICE_PORTS.keys())
    
    open_ports = []
    for port in ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((ip, port))
            sock.close()
            if result == 0:
                open_ports.append({
                    "port": port,
                    "service": DEVICE_PORTS.get(port, "Unknown")
                })
        except:
            pass
    return open_ports

def get_hostname(ip):
    """Try to resolve hostname"""
    try:
        hostname = socket.gethostbyaddr(ip)[0]
        return hostname
    except:
        return None

def get_mac_address(ip):
    """Get MAC address from ARP table"""
    try:
        result = subprocess.run(
            ['arp', '-a', ip],
            capture_output=True, text=True, timeout=5, encoding='utf-8', errors='replace'
        )
        lines = result.stdout.split('\n')
        for line in lines:
            if ip in line:
                parts = line.split()
                for part in parts:
                    if '-' in part and len(part) == 17:
                        return part.upper()
                    if ':' in part and len(part) == 17:
                        return part.upper()
    except:
        pass
    return None

def identify_device_type(hostname, mac, open_ports):
    """Try to identify device type based on available info"""
    port_services = [p['service'] for p in open_ports]
    
    # Check hostname patterns
    if hostname:
        hostname_lower = hostname.lower()
        if any(x in hostname_lower for x in ['printer', 'hp', 'canon', 'epson', 'brother']):
            return "Printer"
        if any(x in hostname_lower for x in ['router', 'gateway', 'modem']):
            return "Router/Gateway"
        if any(x in hostname_lower for x in ['phone', 'iphone', 'android', 'samsung', 'huawei']):
            return "Mobile Device"
        if any(x in hostname_lower for x in ['tv', 'smart', 'roku', 'chromecast', 'firestick']):
            return "Smart TV/Streaming"
        if any(x in hostname_lower for x in ['cam', 'camera', 'nvr', 'dvr']):
            return "Camera/NVR"
    
    # Check by open ports
    if 9100 in [p['port'] for p in open_ports]:
        return "Printer"
    if 3389 in [p['port'] for p in open_ports]:
        return "Windows PC"
    if 22 in [p['port'] for p in open_ports] and 80 not in [p['port'] for p in open_ports]:
        return "Linux/Unix Device"
    if 5900 in [p['port'] for p in open_ports]:
        return "VNC-enabled Device"
    if 80 in [p['port'] for p in open_ports] or 443 in [p['port'] for p in open_ports]:
        return "Web Server/IoT"
    
    # Check MAC OUI for manufacturer hints
    if mac:
        oui = mac[:8].replace('-', ':').upper()
        # Common OUI prefixes
        oui_database = {
            'DC:A6:32': 'Raspberry Pi',
            'B8:27:EB': 'Raspberry Pi',
            '00:50:56': 'VMware',
            '00:0C:29': 'VMware',
            '08:00:27': 'VirtualBox',
            '00:1A:2B': 'Cisco',
            '00:1E:C2': 'Cisco',
            'F4:F2:6D': 'TP-Link',
            '50:C7:BF': 'TP-Link',
            '44:D9:E7': 'Ubiquiti',
            'AC:BC:32': 'Apple',
            '00:17:F2': 'Apple',
        }
        for key, device in oui_database.items():
            if oui.startswith(key.replace(':', '-')) or oui.startswith(key):
                return device
    
    return "Unknown Device"

def calculate_risk(open_ports):
    """Calculate risk level based on open ports"""
    high_risk_ports = [23, 445, 3389, 5900]  # Telnet, SMB, RDP, VNC
    medium_risk_ports = [22, 80, 8080]
    
    risk = "LOW"
    risk_score = 0
    
    for port_info in open_ports:
        port = port_info['port']
        if port in high_risk_ports:
            risk_score += 3
        elif port in medium_risk_ports:
            risk_score += 1
    
    if risk_score >= 5:
        risk = "CRITICAL"
    elif risk_score >= 3:
        risk = "HIGH"
    elif risk_score >= 1:
        risk = "MEDIUM"
    
    return risk

def scan_device(ip):
    """Complete scan of a single device"""
    if not ping_host(ip):
        return None
    
    device = {
        "ip": ip,
        "hostname": get_hostname(ip),
        "mac": get_mac_address(ip),
        "open_ports": scan_host_ports(ip),
        "discovered_at": datetime.now().isoformat()
    }
    
    device["device_type"] = identify_device_type(
        device["hostname"], 
        device["mac"], 
        device["open_ports"]
    )
    device["risk"] = calculate_risk(device["open_ports"])
    
    return device

def network_scan(network_base=None, start=1, end=254):
    """Scan network range for active devices"""
    if network_base is None:
        local_ip = get_local_ip()
        network_base = get_network_range(local_ip)
        print(f"\n[*] Local IP: {local_ip}")
    
    print(f"[*] Scanning network: {network_base}.{start}-{end}")
    print(f"[*] This may take a few minutes...\n")
    
    devices = []
    ips_to_scan = [f"{network_base}.{i}" for i in range(start, end + 1)]
    
    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(scan_device, ip): ip for ip in ips_to_scan}
        
        scanned = 0
        for future in as_completed(futures):
            scanned += 1
            if scanned % 50 == 0:
                print(f"  Progress: {scanned}/{len(ips_to_scan)} IPs scanned...")
            
            result = future.result()
            if result:
                devices.append(result)
                
                # Print discovery
                risk_indicator = "[!]" if result["risk"] in ["CRITICAL", "HIGH"] else "[+]"
                device_info = f"{result['ip']}"
                if result["hostname"]:
                    device_info += f" ({result['hostname']})"
                
                port_list = ", ".join([f"{p['port']}/{p['service']}" for p in result["open_ports"][:3]])
                if len(result["open_ports"]) > 3:
                    port_list += f" +{len(result['open_ports'])-3} more"
                
                print(f"  {risk_indicator} Device Found: {device_info}")
                print(f"      Type: {result['device_type']} | Risk: {result['risk']}")
                if result["open_ports"]:
                    print(f"      Ports: {port_list}")
                if result["mac"]:
                    print(f"      MAC: {result['mac']}")
                print()
    
    return devices

def send_to_shield(devices):
    """Send discovered devices to SHIELD Dashboard"""
    print(f"\n[*] Sending {len(devices)} devices to SHIELD Dashboard...")
    
    sent = 0
    for device in devices:
        payload = {
            "timestamp": time.time(),
            "source_ip": device["ip"],
            "destination_ip": "Network Scan",
            "event_type": f"NETWORK_DEVICE: {device['device_type']}",
            "severity": device["risk"],
            "payload": device,
            "tenant_id": "T-NETWORK"
        }
        
        try:
            res = requests.post(SHIELD_INGESTOR, json=payload, timeout=2)
            if res.status_code == 200:
                sent += 1
        except:
            pass
    
    print(f"  [OK] Sent {sent} device findings to dashboard")

def print_summary(devices):
    """Print scan summary"""
    print("\n" + "="*60)
    print("                 NETWORK SCAN SUMMARY")
    print("="*60)
    
    print(f"\n  Total Devices Found: {len(devices)}")
    
    # Count by type
    types = {}
    for d in devices:
        t = d["device_type"]
        types[t] = types.get(t, 0) + 1
    
    print(f"\n  Device Types:")
    for t, count in sorted(types.items(), key=lambda x: -x[1]):
        print(f"    - {t}: {count}")
    
    # Count by risk
    risks = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for d in devices:
        risks[d["risk"]] = risks.get(d["risk"], 0) + 1
    
    print(f"\n  Risk Distribution:")
    print(f"    CRITICAL: {risks['CRITICAL']}")
    print(f"    HIGH: {risks['HIGH']}")
    print(f"    MEDIUM: {risks['MEDIUM']}")
    print(f"    LOW: {risks['LOW']}")
    
    if risks['CRITICAL'] > 0 or risks['HIGH'] > 0:
        print(f"\n  [!!!] High-risk devices detected! Review open ports and services.")
    
    print("\n" + "="*60 + "\n")

def save_report(devices, filename=None):
    """Save scan results to JSON file"""
    if filename is None:
        filename = f"network_scan_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    report = {
        "scan_time": datetime.now().isoformat(),
        "total_devices": len(devices),
        "devices": devices
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"  [OK] Report saved to: {filename}")
    return filename

def run_network_scan():
    """Run complete network scan"""
    print_banner()
    
    devices = network_scan()
    
    # Send to SHIELD
    if devices:
        send_to_shield(devices)
        save_report(devices)
    
    # Print Summary
    print_summary(devices)
    
    return devices

if __name__ == "__main__":
    run_network_scan()
