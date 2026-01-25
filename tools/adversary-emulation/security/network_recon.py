#!/usr/bin/env python3
"""
SHIELD Advanced Network Reconnaissance Suite
Uses nmap, scapy-style scanning, and custom packet crafting
For authorized security testing only!
"""

import socket
import struct
import subprocess
import json
import time
import sys
import os
import requests
import argparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Tuple

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

class NetworkRecon:
    """Advanced Network Reconnaissance Tool"""
    
    def __init__(self, target: str = "192.168.1.0/24"):
        self.target = target
        self.results = {
            "scan_time": None,
            "target": target,
            "hosts": [],
            "services": [],
            "os_fingerprints": [],
        }
        self.shield_endpoint = "http://localhost:8002/ingest/syslog"
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD NETWORK RECON SUITE v2.0                          |
|          Advanced Scanning & Reconnaissance                  |
|      For authorized security testing only!                  |
+==============================================================+
        """)
    
    # ==================== PORT SCANNING ====================
    
    def tcp_connect_scan(self, host: str, port: int, timeout: float = 1.0) -> Optional[Dict]:
        """Standard TCP connect scan"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                # Try to grab banner
                banner = self.grab_banner(host, port)
                return {
                    "port": port,
                    "state": "open",
                    "protocol": "tcp",
                    "banner": banner,
                    "service": self.identify_service(port, banner)
                }
        except Exception:
            pass
        return None
    
    def syn_scan_simulation(self, host: str, port: int) -> Optional[Dict]:
        """Simulated SYN scan (requires raw sockets/admin - falls back to connect)"""
        # In production, this would use raw sockets
        # For now, we simulate with connect scan
        return self.tcp_connect_scan(host, port, timeout=0.5)
    
    def udp_scan(self, host: str, port: int, timeout: float = 2.0) -> Optional[Dict]:
        """UDP port scan"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.settimeout(timeout)
            
            # Send empty packet
            sock.sendto(b'', (host, port))
            
            try:
                data, addr = sock.recvfrom(1024)
                sock.close()
                return {
                    "port": port,
                    "state": "open",
                    "protocol": "udp",
                    "response": data[:50].hex() if data else None
                }
            except socket.timeout:
                # No response could mean open|filtered
                sock.close()
                return {
                    "port": port,
                    "state": "open|filtered",
                    "protocol": "udp"
                }
        except Exception:
            pass
        return None
    
    def grab_banner(self, host: str, port: int, timeout: float = 2.0) -> Optional[str]:
        """Attempt to grab service banner"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            sock.connect((host, port))
            
            # Send probes based on port
            probes = {
                80: b"HEAD / HTTP/1.0\r\n\r\n",
                443: b"",
                21: b"",
                22: b"",
                25: b"EHLO test\r\n",
                110: b"",
                143: b"",
            }
            
            if port in probes and probes[port]:
                sock.send(probes[port])
            
            banner = sock.recv(1024).decode('utf-8', errors='ignore').strip()
            sock.close()
            return banner[:200] if banner else None
        except Exception:
            return None
    
    def identify_service(self, port: int, banner: Optional[str] = None) -> str:
        """Identify service from port and banner"""
        known_services = {
            21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp",
            53: "dns", 80: "http", 110: "pop3", 111: "rpcbind",
            135: "msrpc", 139: "netbios-ssn", 143: "imap",
            443: "https", 445: "microsoft-ds", 993: "imaps",
            995: "pop3s", 1433: "ms-sql", 1521: "oracle",
            3306: "mysql", 3389: "ms-wbt-server", 5432: "postgresql",
            5900: "vnc", 6379: "redis", 8080: "http-proxy",
            8443: "https-alt", 27017: "mongodb"
        }
        
        service = known_services.get(port, "unknown")
        
        # Refine based on banner
        if banner:
            banner_lower = banner.lower()
            if "ssh" in banner_lower:
                service = "ssh"
            elif "apache" in banner_lower or "nginx" in banner_lower:
                service = "http"
            elif "microsoft" in banner_lower and "ftp" in banner_lower:
                service = "ftp"
            elif "mysql" in banner_lower:
                service = "mysql"
            elif "postgresql" in banner_lower:
                service = "postgresql"
        
        return service
    
    # ==================== HOST DISCOVERY ====================
    
    def icmp_ping(self, host: str) -> bool:
        """ICMP ping check"""
        try:
            if sys.platform == 'win32':
                result = subprocess.run(
                    ['ping', '-n', '1', '-w', '1000', host],
                    capture_output=True, timeout=2
                )
            else:
                result = subprocess.run(
                    ['ping', '-c', '1', '-W', '1', host],
                    capture_output=True, timeout=2
                )
            return result.returncode == 0
        except Exception:
            return False
    
    def tcp_ping(self, host: str, ports: List[int] = [80, 443, 22]) -> bool:
        """TCP ping - check common ports"""
        for port in ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(0.5)
                result = sock.connect_ex((host, port))
                sock.close()
                if result == 0:
                    return True
            except Exception:
                pass
        return False
    
    def arp_scan(self, network: str) -> List[Dict]:
        """ARP scan for local network"""
        hosts = []
        try:
            result = subprocess.run(
                ['arp', '-a'],
                capture_output=True, text=True, timeout=10,
                encoding='utf-8', errors='replace'
            )
            
            for line in result.stdout.split('\n'):
                if 'dynamic' in line.lower() or 'dynamique' in line.lower():
                    parts = line.split()
                    if len(parts) >= 2:
                        ip = parts[0]
                        mac = parts[1] if len(parts) > 1 else None
                        hosts.append({"ip": ip, "mac": mac, "type": "dynamic"})
        except Exception as e:
            print(f"  [!] ARP scan error: {e}")
        
        return hosts
    
    # ==================== OS FINGERPRINTING ====================
    
    def os_fingerprint(self, host: str) -> Dict:
        """Passive OS fingerprinting based on open ports and banners"""
        os_hints = {
            "windows": 0,
            "linux": 0,
            "macos": 0,
            "network_device": 0,
        }
        
        # Check for Windows-specific ports
        if self.tcp_connect_scan(host, 135):  # MSRPC
            os_hints["windows"] += 3
        if self.tcp_connect_scan(host, 445):  # SMB
            os_hints["windows"] += 2
        if self.tcp_connect_scan(host, 3389):  # RDP
            os_hints["windows"] += 3
        
        # Check for Linux-specific
        if self.tcp_connect_scan(host, 22):  # SSH
            ssh_banner = self.grab_banner(host, 22)
            if ssh_banner:
                if "ubuntu" in ssh_banner.lower() or "debian" in ssh_banner.lower():
                    os_hints["linux"] += 4
                elif "openssh" in ssh_banner.lower():
                    os_hints["linux"] += 2
        
        # Network devices often have web interface
        http_banner = self.grab_banner(host, 80)
        if http_banner:
            if any(x in http_banner.lower() for x in ["cisco", "juniper", "mikrotik", "ubiquiti"]):
                os_hints["network_device"] += 5
        
        # Determine most likely OS
        max_os = max(os_hints, key=os_hints.get)
        confidence = os_hints[max_os] / (sum(os_hints.values()) + 1) * 100
        
        return {
            "host": host,
            "likely_os": max_os if os_hints[max_os] > 0 else "unknown",
            "confidence": round(confidence, 1),
            "hints": os_hints
        }
    
    # ==================== SERVICE ENUMERATION ====================
    
    def enumerate_smb(self, host: str) -> Dict:
        """Enumerate SMB shares and info"""
        smb_info = {"host": host, "shares": [], "smb_version": None}
        
        try:
            # Use net view on Windows
            result = subprocess.run(
                ['net', 'view', f'\\\\{host}'],
                capture_output=True, text=True, timeout=10,
                encoding='utf-8', errors='replace'
            )
            
            if "shared resources" in result.stdout.lower() or "ressources partages" in result.stdout.lower():
                for line in result.stdout.split('\n')[4:]:
                    if line.strip() and not line.startswith('-'):
                        parts = line.split()
                        if parts:
                            smb_info["shares"].append(parts[0])
        except Exception as e:
            smb_info["error"] = str(e)
        
        return smb_info
    
    def enumerate_http(self, host: str, port: int = 80) -> Dict:
        """Enumerate HTTP service"""
        http_info = {"host": host, "port": port}
        
        try:
            protocol = "https" if port in [443, 8443] else "http"
            url = f"{protocol}://{host}:{port}"
            
            response = requests.get(url, timeout=5, verify=False, allow_redirects=False)
            
            http_info["status_code"] = response.status_code
            http_info["server"] = response.headers.get("Server", "Unknown")
            http_info["powered_by"] = response.headers.get("X-Powered-By")
            http_info["content_type"] = response.headers.get("Content-Type")
            
            # Check for interesting headers
            security_headers = ["X-Frame-Options", "X-XSS-Protection", 
                              "Content-Security-Policy", "Strict-Transport-Security"]
            http_info["security_headers"] = {
                h: response.headers.get(h) for h in security_headers if response.headers.get(h)
            }
            
        except Exception as e:
            http_info["error"] = str(e)
        
        return http_info
    
    # ==================== VULNERABILITY CHECKS ====================
    
    def check_eternal_blue(self, host: str) -> Dict:
        """Check for MS17-010 (EternalBlue) vulnerability indicator"""
        result = {"host": host, "vulnerable": False, "check": "MS17-010"}
        
        # Check if SMB is open
        smb_open = self.tcp_connect_scan(host, 445)
        if not smb_open:
            result["status"] = "SMB not accessible"
            return result
        
        # In production, would send actual SMB negotiation
        # For safety, we just check port and note the risk
        result["status"] = "SMB accessible - manual verification recommended"
        result["vulnerable"] = None  # Unknown without deep check
        
        return result
    
    def check_bluekeep(self, host: str) -> Dict:
        """Check for CVE-2019-0708 (BlueKeep) vulnerability indicator"""
        result = {"host": host, "vulnerable": False, "check": "CVE-2019-0708"}
        
        rdp_open = self.tcp_connect_scan(host, 3389)
        if not rdp_open:
            result["status"] = "RDP not accessible"
            return result
        
        result["status"] = "RDP accessible - verify NLA and patches"
        result["vulnerable"] = None
        
        return result
    
    # ==================== MAIN SCAN FUNCTIONS ====================
    
    def quick_scan(self, host: str) -> Dict:
        """Quick scan of top 100 ports"""
        top_ports = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 
                    445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 
                    6379, 8000, 8080, 8443, 27017]
        
        host_result = {
            "ip": host,
            "hostname": None,
            "status": "unknown",
            "open_ports": [],
            "os": None
        }
        
        # Resolve hostname
        try:
            host_result["hostname"] = socket.gethostbyaddr(host)[0]
        except Exception:
            pass
        
        # Ping check
        if self.icmp_ping(host) or self.tcp_ping(host):
            host_result["status"] = "up"
        else:
            host_result["status"] = "down"
            return host_result
        
        # Port scan
        print(f"\n  [*] Scanning {host}...")
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {executor.submit(self.tcp_connect_scan, host, port): port for port in top_ports}
            
            for future in as_completed(futures):
                result = future.result()
                if result:
                    host_result["open_ports"].append(result)
                    print(f"      [+] {result['port']}/tcp open - {result['service']}")
        
        # OS fingerprint
        if host_result["open_ports"]:
            os_result = self.os_fingerprint(host)
            host_result["os"] = os_result
        
        return host_result
    
    def full_scan(self, host: str) -> Dict:
        """Comprehensive scan with service enumeration"""
        print(f"\n  [*] Full scan of {host}...")
        
        result = self.quick_scan(host)
        
        if result["status"] != "up":
            return result
        
        # Service enumeration
        result["services"] = {}
        
        for port_info in result["open_ports"]:
            port = port_info["port"]
            
            if port == 445:
                result["services"]["smb"] = self.enumerate_smb(host)
            elif port in [80, 443, 8080, 8443]:
                result["services"][f"http_{port}"] = self.enumerate_http(host, port)
        
        # Vulnerability checks
        result["vulns"] = []
        result["vulns"].append(self.check_eternal_blue(host))
        result["vulns"].append(self.check_bluekeep(host))
        
        return result
    
    def network_sweep(self, network_base: str, start: int = 1, end: int = 254) -> List[Dict]:
        """Sweep entire network range"""
        print(f"\n  [*] Network sweep: {network_base}.{start}-{end}")
        
        live_hosts = []
        
        with ThreadPoolExecutor(max_workers=50) as executor:
            ips = [f"{network_base}.{i}" for i in range(start, end + 1)]
            futures = {executor.submit(self.quick_scan, ip): ip for ip in ips}
            
            completed = 0
            for future in as_completed(futures):
                completed += 1
                if completed % 50 == 0:
                    print(f"      Progress: {completed}/{len(ips)}")
                
                result = future.result()
                if result["status"] == "up":
                    live_hosts.append(result)
        
        return live_hosts
    
    def send_to_shield(self, data: Dict):
        """Send results to SHIELD dashboard"""
        try:
            payload = {
                "timestamp": time.time(),
                "source_ip": "recon_scanner",
                "destination_ip": data.get("ip", "unknown"),
                "event_type": f"RECON: {data.get('status', 'scan')}",
                "severity": "INFO",
                "payload": data,
                "tenant_id": "T-RECON"
            }
            requests.post(self.shield_endpoint, json=payload, timeout=2)
        except Exception:
            pass
    
    def generate_report(self, results: List[Dict], filename: str = None) -> str:
        """Generate scan report"""
        if filename is None:
            filename = f"recon_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            "scan_time": datetime.now().isoformat(),
            "target": self.target,
            "hosts_found": len(results),
            "results": results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Report saved: {filename}")
        return filename


def main():
    parser = argparse.ArgumentParser(description="SHIELD Network Recon Suite")
    parser.add_argument("--target", required=True, help="Target IP or CIDR (e.g. 192.168.1.10 or 192.168.1.0/24)")
    parser.add_argument("--mode", choices=["quick", "full"], default="quick", help="Scan mode")
    parser.add_argument("--sweep-start", type=int, default=1, help="Sweep start host (for /24)")
    parser.add_argument("--sweep-end", type=int, default=254, help="Sweep end host (for /24)")
    parser.add_argument("--no-banner", action="store_true", help="Disable banner output")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    recon = NetworkRecon(target=args.target)
    if not args.no_banner:
        recon.print_banner()

    results = []

    if "/" in args.target:
        network_base = args.target.split("/")[0].rsplit(".", 1)[0]
        sweep_results = recon.network_sweep(network_base, args.sweep_start, args.sweep_end)
        results.extend(sweep_results)
    else:
        if args.mode == "full":
            results.append(recon.full_scan(args.target))
        else:
            results.append(recon.quick_scan(args.target))

    if args.json:
        print(json.dumps({"target": args.target, "results": results}, indent=2))
    else:
        print("\n" + "=" * 60)
        print("                    SCAN SUMMARY")
        print("=" * 60)
        print(f"  Hosts scanned: {len(results)}")
        for host in results[:20]:
            ports = [f"{p['port']}/{p['service']}" for p in host.get('open_ports', [])[:5]]
            print(f"    {host.get('ip', 'unknown')}: {', '.join(ports) if ports else 'no open ports'}")
        print("\n  [+] Scan complete!")


if __name__ == "__main__":
    main()
