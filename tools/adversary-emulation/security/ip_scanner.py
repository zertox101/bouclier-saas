#!/usr/bin/env python3
"""
SHIELD Advanced IP Lookup & Scanner v2.0
Comprehensive IP intelligence, Privacy Detection, and Network Analysis
Features:
 - IP Geolocation & Threat Intel
 - VPN/Proxy Detection
 - Local MAC Address Retrieval
 - Port Scanning
"""

import sys
import os
import socket
import struct
import json
import re
import time
import threading
import uuid
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False


class IPLookup:
    """IP Intelligence and Geolocation"""
    
    # Free IP geolocation APIs
    GEO_APIS = [
        'http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
        'https://ipapi.co/{ip}/json/',
    ]
    
    # Known malicious IP ranges (sample)
    THREAT_RANGES = [
        ('185.220.100.0', '185.220.103.255', 'Tor Exit Node'),
        ('45.33.32.0', '45.33.33.255', 'Scanners'),
        ('91.240.118.0', '91.240.118.255', 'Known Botnet'),
    ]

    # VPN/Hosting Keywords (ISP names)
    VPN_ISP_KEYWORDS = [
        'vpn', 'proxy', 'hosting', 'cloud', 'datacenter', 'digitalocean', 'aws', 'amazon', 
        'google', 'microsoft', 'azure', 'ovh', 'hetzner', 'linode', 'vultr', 'm247', 
        'mullvad', 'nordvpn', 'expressvpn', 'proton', 'windscribe', 'cyberghost'
    ]
    
    def __init__(self):
        self.cache = {}
    
    def get_my_ip(self) -> Dict:
        """Get your public IP address and Local Interface Info"""
        result = {
            'public_ip': None,
            'local_ips': [],
            'hostname': None,
            'mac_address': None,
            'vpn_detected': False,
            'vpn_interface': None
        }
        
        # 1. Get Public IP
        if HAS_REQUESTS:
            try:
                for url in ['https://api.ipify.org?format=json', 'http://ip-api.com/json/']:
                    try:
                        resp = requests.get(url, timeout=5)
                        if resp.ok:
                            data = resp.json()
                            result['public_ip'] = data.get('ip') or data.get('query')
                            break
                    except:
                        continue
            except:
                pass
        
        # 2. Get Hostname & Local IPs
        try:
            result['hostname'] = socket.gethostname()
            # Standard local IP method
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(('8.8.8.8', 80))
            local_ip = s.getsockname()[0]
            s.close()
            result['local_ips'].append(local_ip)
        except:
            pass

        # 3. Get MAC Address (Advanced Method)
        result['mac_address'] = self._get_mac_address()

        # 4. VPN Detection via Network Interfaces (requires psutil)
        if HAS_PSUTIL:
            result['vpn_detected'], result['vpn_interface'] = self._detect_vpn_interface()

        return result
    
    def _get_mac_address(self) -> str:
        """Get the real MAC address of the active interface"""
        try:
            # Method 1: uuid (Generic)
            mac_num = uuid.getnode()
            mac = ':'.join(['{:02x}'.format((mac_num >> elements) & 0xff) for elements in range(0,2*6,2)][::-1])
            
            # Method 2: psutil (More accurate for specific interface)
            if HAS_PSUTIL:
                for interface, addrs in psutil.net_if_addrs().items():
                    for addr in addrs:
                        if addr.family == psutil.AF_LINK:
                            # Heuristic: usually Ethernet or Wi-Fi
                            if 'eth' in interface.lower() or 'wi-fi' in interface.lower() or 'wlan' in interface.lower():
                                return addr.address
            return mac
        except:
            return "00:00:00:00:00:00"

    def _detect_vpn_interface(self) -> Tuple[bool, Optional[str]]:
        """Detect if a user is likely using a VPN based on local interfaces"""
        if not HAS_PSUTIL:
            return False, None
            
        vpn_keywords = ['tun', 'tap', 'vpn', 'wireguard', 'wg', 'openvpn', 'forti', 'cisco', 'tailscale']
        
        try:
            stats = psutil.net_if_stats()
            for interface, stat in stats.items():
                if stat.isup:
                    lower_name = interface.lower()
                    if any(kw in lower_name for kw in vpn_keywords):
                        return True, interface
            return False, None
        except:
            return False, None

    def lookup(self, ip: str) -> Dict:
        """Full IP lookup with geolocation and threat intel"""
        if ip in self.cache:
            return self.cache[ip]
        
        result = {
            'ip': ip,
            'valid': self._validate_ip(ip),
            'type': self._get_ip_type(ip),
            'geolocation': {},
            'dns': {},
            'threat_intel': {},
            'timestamp': datetime.now().isoformat(),
        }
        
        if not result['valid']:
            return result
        
        # Geolocation lookup
        result['geolocation'] = self._geolocate(ip)
        
        # DNS lookup
        result['dns'] = self._dns_lookup(ip)
        
        # Threat intelligence (including VPN detection via ISP)
        result['threat_intel'] = self._threat_check(ip, result['geolocation'].get('isp', ''), result['geolocation'].get('org', ''))
        
        self.cache[ip] = result
        return result
    
    def _validate_ip(self, ip: str) -> bool:
        try:
            socket.inet_aton(ip)
            return True
        except:
            return False
    
    def _get_ip_type(self, ip: str) -> str:
        if not self._validate_ip(ip): return 'invalid'
        parts = [int(p) for p in ip.split('.')]
        if parts[0] == 10: return 'Private (Class A)'
        if parts[0] == 172 and 16 <= parts[1] <= 31: return 'Private (Class B)'
        if parts[0] == 192 and parts[1] == 168: return 'Private (Class C)'
        if parts[0] == 127: return 'Loopback'
        return 'Public'
    
    def _geolocate(self, ip: str) -> Dict:
        geo = {'country': 'Unknown', 'country_code': '', 'region': '', 'city': '', 'lat': 0, 'lng': 0, 'isp': '', 'org': '', 'timezone': ''}
        if not HAS_REQUESTS: return geo
        
        for api_url in self.GEO_APIS:
            try:
                url = api_url.format(ip=ip)
                resp = requests.get(url, timeout=5)
                if resp.ok:
                    data = resp.json()
                    geo['country'] = data.get('country') or geo['country']
                    geo['country_code'] = data.get('countryCode') or ''
                    geo['region'] = data.get('regionName') or ''
                    geo['city'] = data.get('city') or ''
                    geo['lat'] = data.get('lat') or 0
                    geo['lng'] = data.get('lon') or 0
                    geo['isp'] = data.get('isp') or ''
                    geo['org'] = data.get('org') or ''
                    geo['timezone'] = data.get('timezone') or ''
                    break
            except: continue
        return geo
    
    def _dns_lookup(self, ip: str) -> Dict:
        try:
            hostname, aliases, _ = socket.gethostbyaddr(ip)
            return {'ptr_record': hostname, 'reverse_dns': [hostname] + list(aliases)}
        except:
            return {'ptr_record': '', 'reverse_dns': []}
    
    def _threat_check(self, ip: str, isp: str, org: str) -> Dict:
        threat = {
            'is_malicious': False, 
            'threat_type': '', 
            'confidence': 0, 
            'tor_exit': False, 
            'vpn_proxy': False, 
            'hosting_detected': False
        }
        
        # 1. Check Keywords in ISP/Org (VPN Detection)
        full_org = (isp + " " + org).lower()
        if any(kw in full_org for kw in self.VPN_ISP_KEYWORDS):
            threat['vpn_proxy'] = True
            threat['hosting_detected'] = True
            threat['threat_type'] = 'VPN/Desinfe/Hosting Provider'
            threat['confidence'] = 60
            
        # 2. Check Tor
        if '185.220' in ip:
            threat['tor_exit'] = True
            threat['is_malicious'] = True
            threat['threat_type'] = 'Tor Exit Node'
            threat['confidence'] = 90
            
        return threat


class PortScanner:
    """Fast multi-threaded port scanner"""
    COMMON_PORTS = {
        21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTP',
        110: 'POP3', 443: 'HTTPS', 445: 'SMB', 3306: 'MySQL', 3389: 'RDP', 
        5432: 'PostgreSQL', 8080: 'HTTP-Proxy', 27017: 'MongoDB'
    }
    
    def __init__(self, timeout: float = 1.0, threads: int = 50):
        self.timeout = timeout
        self.threads = threads
    
    def scan_port(self, ip: str, port: int) -> Tuple[int, bool, str]:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            result = sock.connect_ex((ip, port))
            sock.close()
            if result == 0:
                service = self.COMMON_PORTS.get(port, 'unknown')
                return (port, True, service)
        except: pass
        return (port, False, '')
    
    def quick_scan(self, ip: str) -> List[Dict]:
        return self.scan_ports(ip, list(self.COMMON_PORTS.keys()))
    
    def scan_ports(self, ip: str, ports: List[int]) -> List[Dict]:
        results = []
        with ThreadPoolExecutor(max_workers=self.threads) as executor:
            futures = {executor.submit(self.scan_port, ip, port): port for port in ports}
            for future in as_completed(futures):
                port, is_open, service = future.result()
                if is_open: results.append({'port': port, 'state': 'open', 'service': service})
        return sorted(results, key=lambda x: x['port'])
    
    def full_scan(self, ip: str, port_range: Tuple[int, int] = (1, 1024)) -> List[Dict]:
        ports = list(range(port_range[0], port_range[1] + 1))
        return self.scan_ports(ip, ports)


class NetworkAnalyzer:
    def check_connectivity(self, ip: str, port: int = 80) -> Dict:
        result = {'reachable': False, 'latency_ms': 0, 'error': None}
        try:
            start = time.time()
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)
            sock.connect((ip, port))
            sock.close()
            result['reachable'] = True
            result['latency_ms'] = round((time.time() - start) * 1000, 2)
        except Exception as e:
            result['error'] = str(e)
        return result


class AdvancedIPScanner:
    def __init__(self):
        self.lookup = IPLookup()
        self.scanner = PortScanner()
        self.analyzer = NetworkAnalyzer()
    
    def print_banner(self):
        print("""
\033[96m╔═══════════════════════════════════════════════════════════════╗
║     🔍 SHIELD ADVANCED IP SCANNER v2.0                        ║
║        MAC Detection • VPN Check • Port Scanning              ║
╚═══════════════════════════════════════════════════════════════╝\033[0m
        """)
        if not HAS_PSUTIL:
            print("\033[93m[!] 'psutil' library not found. Install it for better detection.\033[0m")
            print("    pip install psutil")

    def scan_my_ip(self):
        print("\n\033[96m  === LOCAL DEVICE ANALYSIS ===\033[0m\n")
        
        info = self.lookup.get_my_ip()
        
        print(f"  \033[93mHostname:\033[0m        {info['hostname']}")
        
        # MAC Address Display
        if info['mac_address']:
            print(f"  \033[93mMAC Address:\033[0m     \033[95m{info['mac_address'].upper()}\033[0m")
        else:
            print(f"  \033[93mMAC Address:\033[0m     Unknown")
            
        print(f"  \033[93mLocal IP:\033[0m        {info['local_ips'][0] if info['local_ips'] else 'Unknown'}")
        print(f"  \033[93mPublic IP:\033[0m       \033[92m{info['public_ip']}\033[0m")
        
        # VPN Detection Result
        if info['vpn_detected']:
             print(f"  \033[93mVPN Status:\033[0m      \033[91m[!] DETECTED (Interface: {info['vpn_interface']})\033[0m")
        else:
             print(f"  \033[93mVPN Status:\033[0m      \033[92m[✓] No local VPN interface active\033[0m")
        
        if info['public_ip']:
            print(f"\n  \033[96m--- External Analysis ---\033[0m")
            lookup = self.lookup.lookup(info['public_ip'])
            
            geo = lookup['geolocation']
            print(f"  \033[93mISP/Org:\033[0m         {geo['isp']} / {geo['org']}")
            print(f"  \033[93mLocation:\033[0m        {geo['city']}, {geo['country']}")
            
            # VPN/Proxy check via ISP
            threat = lookup['threat_intel']
            if threat['vpn_proxy']:
                 print(f"  \033[93mTraffic Analysis:\033[0m \033[91m⚠️  High Confidence VPN/Proxy Provider Detected\033[0m")
            else:
                 print(f"  \033[93mTraffic Analysis:\033[0m \033[92m✓ Residential/Business ISP (Normal)\033[0m")

    def full_scan(self, ip: str):
        print(f"\n\033[96m  === TARGET SCAN: {ip} ===\033[0m\n")
        
        print("  \033[93m[>] analyzing...\033[0m")
        lookup = self.lookup.lookup(ip)
        
        if not lookup['valid']:
            print("  \033[91m[!] Invalid IP address\033[0m")
            return

        geo = lookup['geolocation']
        threat = lookup['threat_intel']
        
        print(f"  \033[97mLocation:\033[0m     {geo['city']}, {geo['country']}")
        print(f"  \033[97mProvider:\033[0m     {geo['isp']}")
        print(f"  \033[97mThreat Status:\033[0m")
        
        if threat['is_malicious']:
            print(f"     \033[91m[!] {threat['threat_type']}\033[0m")
        elif threat['vpn_proxy']:
            print(f"     \033[93m[!] Likely VPN/Proxy (based on ISP)\033[0m")
        else:
            print(f"     \033[92m[✓] Safe\033[0m")

        print("\n  \033[93m[>] Scanning ports...\033[0m")
        ports = self.scanner.quick_scan(ip)
        if ports:
            for p in ports:
                print(f"     \033[92m{p['port']}\033[0m/tcp - {p['service']}")
        else:
            print("     No common open ports.")

    def interactive(self):
        self.print_banner()
        while True:
            try:
                choice = input("\n\033[96m  [1] Scan Local Device (MAC/VPN)\n  [2] Scan Target IP\n  [0] Exit\n  Choice: \033[0m").strip()
                if choice == '0': break
                if choice == '1': self.scan_my_ip()
                if choice == '2':
                    ip = input("  IP: ").strip()
                    if ip: self.full_scan(ip)
            except KeyboardInterrupt: break

def main():
    scanner = AdvancedIPScanner()
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-i', '--interactive']: scanner.interactive()
        else: scanner.full_scan(sys.argv[1])
    else:
        scanner.scan_my_ip()

if __name__ == "__main__":
    main()
