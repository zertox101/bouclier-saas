#!/usr/bin/env python3
"""
SHIELD Packet Sniffer & Traffic Analyzer
Network traffic capture and analysis
For authorized security testing only!
"""

import socket
import struct
import sys
import os
import json
import time
import threading
import argparse
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class PacketSniffer:
    """Network Packet Sniffer and Analyzer"""
    
    def __init__(self, interface: str = None):
        self.interface = interface
        self.packets = []
        self.stats = defaultdict(int)
        self.running = False
        self.capture_file = None
        self.shield_endpoint = "http://localhost:8002/ingest/syslog"
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD PACKET SNIFFER v1.0                               |
|          Network Traffic Capture & Analysis                  |
|     For authorized security testing only!                    |
|     Note: Requires Administrator/root privileges             |
+==============================================================+
        """)
    
    # ==================== PACKET PARSING ====================
    
    def parse_ethernet_header(self, data: bytes) -> Tuple[str, str, int, bytes]:
        """Parse Ethernet header"""
        eth_length = 14
        eth_header = data[:eth_length]
        
        eth = struct.unpack('!6s6sH', eth_header)
        
        dst_mac = ':'.join(format(b, '02x') for b in eth[0])
        src_mac = ':'.join(format(b, '02x') for b in eth[1])
        eth_protocol = socket.ntohs(eth[2])
        
        return src_mac, dst_mac, eth_protocol, data[eth_length:]
    
    def parse_ip_header(self, data: bytes) -> Dict:
        """Parse IP header"""
        ip_header = struct.unpack('!BBHHHBBH4s4s', data[:20])
        
        version_ihl = ip_header[0]
        version = version_ihl >> 4
        ihl = (version_ihl & 0xF) * 4
        
        ttl = ip_header[5]
        protocol = ip_header[6]
        src_ip = socket.inet_ntoa(ip_header[8])
        dst_ip = socket.inet_ntoa(ip_header[9])
        
        protocol_map = {
            1: 'ICMP',
            6: 'TCP',
            17: 'UDP',
        }
        
        return {
            'version': version,
            'ihl': ihl,
            'ttl': ttl,
            'protocol': protocol_map.get(protocol, str(protocol)),
            'protocol_num': protocol,
            'src_ip': src_ip,
            'dst_ip': dst_ip,
            'payload': data[ihl:]
        }
    
    def parse_tcp_header(self, data: bytes) -> Dict:
        """Parse TCP header"""
        tcp_header = struct.unpack('!HHLLBBHHH', data[:20])
        
        src_port = tcp_header[0]
        dst_port = tcp_header[1]
        seq_num = tcp_header[2]
        ack_num = tcp_header[3]
        offset_reserved = tcp_header[4]
        offset = (offset_reserved >> 4) * 4
        flags = tcp_header[5]
        
        flag_names = []
        if flags & 0x01: flag_names.append('FIN')
        if flags & 0x02: flag_names.append('SYN')
        if flags & 0x04: flag_names.append('RST')
        if flags & 0x08: flag_names.append('PSH')
        if flags & 0x10: flag_names.append('ACK')
        if flags & 0x20: flag_names.append('URG')
        
        return {
            'src_port': src_port,
            'dst_port': dst_port,
            'seq': seq_num,
            'ack': ack_num,
            'flags': flag_names,
            'payload': data[offset:]
        }
    
    def parse_udp_header(self, data: bytes) -> Dict:
        """Parse UDP header"""
        udp_header = struct.unpack('!HHHH', data[:8])
        
        return {
            'src_port': udp_header[0],
            'dst_port': udp_header[1],
            'length': udp_header[2],
            'checksum': udp_header[3],
            'payload': data[8:]
        }
    
    def parse_icmp_header(self, data: bytes) -> Dict:
        """Parse ICMP header"""
        icmp_header = struct.unpack('!BBH', data[:4])
        
        icmp_types = {
            0: 'Echo Reply',
            3: 'Destination Unreachable',
            5: 'Redirect',
            8: 'Echo Request',
            11: 'Time Exceeded',
        }
        
        return {
            'type': icmp_header[0],
            'type_name': icmp_types.get(icmp_header[0], 'Unknown'),
            'code': icmp_header[1],
            'checksum': icmp_header[2],
            'payload': data[4:]
        }
    
    def identify_service(self, port: int) -> str:
        """Identify service by port"""
        services = {
            20: 'FTP-DATA', 21: 'FTP', 22: 'SSH', 23: 'Telnet',
            25: 'SMTP', 53: 'DNS', 67: 'DHCP', 68: 'DHCP',
            80: 'HTTP', 110: 'POP3', 123: 'NTP', 143: 'IMAP',
            443: 'HTTPS', 445: 'SMB', 465: 'SMTPS', 587: 'SMTP',
            993: 'IMAPS', 995: 'POP3S', 1433: 'MSSQL', 1521: 'Oracle',
            3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
            5900: 'VNC', 6379: 'Redis', 8080: 'HTTP-Proxy',
            27017: 'MongoDB'
        }
        return services.get(port, 'Unknown')
    
    # ==================== TRAFFIC ANALYSIS ====================
    
    def analyze_packet(self, packet: Dict) -> Dict:
        """Analyze packet for security concerns"""
        analysis = {
            'suspicious': False,
            'alerts': []
        }
        
        # Check for plaintext protocols
        plaintext_ports = [21, 23, 25, 80, 110, 143]
        if packet.get('dst_port') in plaintext_ports or packet.get('src_port') in plaintext_ports:
            analysis['alerts'].append('Plaintext protocol detected')
        
        # Check for potential port scan (SYN without ACK)
        if packet.get('protocol') == 'TCP':
            flags = packet.get('flags', [])
            if 'SYN' in flags and 'ACK' not in flags:
                analysis['alerts'].append('Possible port scan (SYN packet)')
        
        # Check for common attack ports
        suspicious_ports = [4444, 5555, 6666, 31337, 12345, 65535]
        if packet.get('dst_port') in suspicious_ports or packet.get('src_port') in suspicious_ports:
            analysis['suspicious'] = True
            analysis['alerts'].append(f'Suspicious port detected')
        
        # Check payload for sensitive data patterns
        payload = packet.get('payload', b'')
        if isinstance(payload, bytes):
            try:
                payload_str = payload.decode('utf-8', errors='ignore').lower()
                
                # Check for credentials in cleartext
                if 'password' in payload_str or 'passwd' in payload_str:
                    analysis['suspicious'] = True
                    analysis['alerts'].append('Password in cleartext detected')
                
                if 'user' in payload_str and ('@' in payload_str or 'login' in payload_str):
                    analysis['alerts'].append('Possible credential transmission')
                
            except Exception:
                pass
        
        return analysis
    
    def detect_anomalies(self) -> List[Dict]:
        """Detect traffic anomalies"""
        anomalies = []
        
        # Count packets per IP
        ip_count = defaultdict(int)
        port_count = defaultdict(int)
        
        for pkt in self.packets:
            ip_count[pkt.get('src_ip', 'unknown')] += 1
            if pkt.get('dst_port'):
                port_count[pkt['dst_port']] += 1
        
        # Detect potential port scan (many different ports)
        if len(port_count) > 50:
            anomalies.append({
                'type': 'Possible Port Scan',
                'description': f'High port diversity detected: {len(port_count)} unique ports',
                'severity': 'MEDIUM'
            })
        
        # Detect potential DDoS (high packet count from single IP)
        for ip, count in ip_count.items():
            if count > 100:
                anomalies.append({
                    'type': 'High Traffic Volume',
                    'description': f'{ip} sent {count} packets',
                    'severity': 'MEDIUM'
                })
        
        return anomalies
    
    # ==================== CAPTURE FUNCTIONS ====================
    
    def start_capture(self, count: int = 100, timeout: int = 30):
        """Start packet capture (simplified - works on Windows with limited features)"""
        self.print_banner()
        
        print(f"\n  [*] Starting packet capture...")
        print(f"  [*] Target: {count} packets or {timeout} seconds")
        print(f"  [*] Note: Full raw socket capture requires admin privileges")
        print(f"  [*] Using simplified TCP/UDP capture mode\n")
        
        self.running = True
        self.packets = []
        start_time = time.time()
        
        # Simulate packet capture by monitoring network connections
        # Real implementation would use raw sockets (requires admin)
        self._simulate_capture(count, timeout, start_time)
        
        print(f"\n  [+] Capture complete: {len(self.packets)} packets")
    
    def _simulate_capture(self, count: int, timeout: int, start_time: float):
        """Simulate packet capture using netstat"""
        import subprocess
        
        captured = 0
        last_connections = set()
        
        while captured < count and (time.time() - start_time) < timeout and self.running:
            try:
                # Get current connections
                result = subprocess.run(
                    ['netstat', '-n'],
                    capture_output=True, text=True, timeout=5,
                    encoding='utf-8', errors='replace'
                )
                
                for line in result.stdout.split('\n'):
                    if 'ESTABLISHED' in line or 'TIME_WAIT' in line:
                        parts = line.split()
                        if len(parts) >= 4:
                            local = parts[1]
                            remote = parts[2]
                            state = parts[3]
                            
                            conn_id = f"{local}-{remote}"
                            
                            if conn_id not in last_connections:
                                last_connections.add(conn_id)
                                
                                # Parse addresses
                                try:
                                    local_ip, local_port = local.rsplit(':', 1)
                                    remote_ip, remote_port = remote.rsplit(':', 1)
                                    
                                    packet = {
                                        'timestamp': datetime.now().isoformat(),
                                        'protocol': 'TCP',
                                        'src_ip': local_ip,
                                        'src_port': int(local_port),
                                        'dst_ip': remote_ip,
                                        'dst_port': int(remote_port),
                                        'state': state,
                                        'service': self.identify_service(int(remote_port))
                                    }
                                    
                                    self.packets.append(packet)
                                    self.stats['TCP'] += 1
                                    captured += 1
                                    
                                    # Analyze packet
                                    analysis = self.analyze_packet(packet)
                                    if analysis['alerts']:
                                        packet['alerts'] = analysis['alerts']
                                    
                                    # Print packet info
                                    alert_str = f" [{', '.join(analysis['alerts'])}]" if analysis['alerts'] else ""
                                    print(f"    [{captured}] {packet['src_ip']}:{packet['src_port']} -> "
                                          f"{packet['dst_ip']}:{packet['dst_port']} ({packet['service']}){alert_str}")
                                    
                                except Exception:
                                    pass
                
                time.sleep(0.5)
                
            except Exception as e:
                print(f"  [!] Error: {e}")
                break
    
    def stop_capture(self):
        """Stop packet capture"""
        self.running = False
        print("\n  [*] Stopping capture...")
    
    # ==================== REPORTING ====================
    
    def get_statistics(self) -> Dict:
        """Get capture statistics"""
        stats = {
            'total_packets': len(self.packets),
            'by_protocol': dict(self.stats),
            'unique_ips': len(set(p.get('src_ip') for p in self.packets)),
            'unique_ports': len(set(p.get('dst_port') for p in self.packets if p.get('dst_port'))),
            'top_talkers': {},
            'top_ports': {}
        }
        
        # Top source IPs
        ip_count = defaultdict(int)
        for pkt in self.packets:
            ip_count[pkt.get('src_ip', 'unknown')] += 1
        stats['top_talkers'] = dict(sorted(ip_count.items(), key=lambda x: -x[1])[:10])
        
        # Top destination ports
        port_count = defaultdict(int)
        for pkt in self.packets:
            if pkt.get('dst_port'):
                port_count[pkt['dst_port']] += 1
        stats['top_ports'] = dict(sorted(port_count.items(), key=lambda x: -x[1])[:10])
        
        return stats
    
    def print_summary(self):
        """Print capture summary"""
        stats = self.get_statistics()
        
        print("\n" + "="*60)
        print("                 CAPTURE SUMMARY")
        print("="*60)
        
        print(f"\n  Total Packets: {stats['total_packets']}")
        print(f"  Unique IPs: {stats['unique_ips']}")
        print(f"  Unique Ports: {stats['unique_ports']}")
        
        print(f"\n  By Protocol:")
        for proto, count in stats['by_protocol'].items():
            print(f"    - {proto}: {count}")
        
        print(f"\n  Top Talkers:")
        for ip, count in list(stats['top_talkers'].items())[:5]:
            print(f"    - {ip}: {count} packets")
        
        print(f"\n  Top Destination Ports:")
        for port, count in list(stats['top_ports'].items())[:5]:
            service = self.identify_service(port)
            print(f"    - {port} ({service}): {count}")
        
        # Anomalies
        anomalies = self.detect_anomalies()
        if anomalies:
            print(f"\n  Anomalies Detected:")
            for a in anomalies:
                print(f"    [!] {a['type']}: {a['description']}")
        
        print("\n" + "="*60)
    
    def save_capture(self, filename: str = None) -> str:
        """Save captured packets to file"""
        if filename is None:
            filename = f"capture_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        data = {
            'capture_time': datetime.now().isoformat(),
            'statistics': self.get_statistics(),
            'anomalies': self.detect_anomalies(),
            'packets': self.packets
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Capture saved: {filename}")
        return filename


class TrafficAnalyzer:
    """Analyze saved traffic captures"""
    
    def __init__(self, capture_file: str = None):
        self.capture_file = capture_file
        self.packets = []
    
    def load_capture(self, filename: str):
        """Load capture from file"""
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.packets = data.get('packets', [])
        return data
    
    def find_credentials(self) -> List[Dict]:
        """Search for potential credentials in traffic"""
        credentials = []
        
        for pkt in self.packets:
            payload = pkt.get('payload', '')
            if isinstance(payload, str):
                payload_lower = payload.lower()
                
                if 'password' in payload_lower or 'passwd' in payload_lower:
                    credentials.append({
                        'packet': pkt,
                        'type': 'password_field'
                    })
                
                if 'authorization' in payload_lower:
                    credentials.append({
                        'packet': pkt,
                        'type': 'auth_header'
                    })
        
        return credentials
    
    def extract_http_requests(self) -> List[Dict]:
        """Extract HTTP requests from capture"""
        requests = []
        
        for pkt in self.packets:
            if pkt.get('dst_port') in [80, 8080] or pkt.get('src_port') in [80, 8080]:
                requests.append(pkt)
        
        return requests
    
    def extract_dns_queries(self) -> List[Dict]:
        """Extract DNS queries from capture"""
        queries = []
        
        for pkt in self.packets:
            if pkt.get('dst_port') == 53 or pkt.get('src_port') == 53:
                queries.append(pkt)
        
        return queries


def main():
    parser = argparse.ArgumentParser(description="SHIELD Packet Sniffer")
    parser.add_argument("--count", type=int, default=50, help="Number of packets to capture")
    parser.add_argument("--timeout", type=int, default=20, help="Capture timeout in seconds")
    parser.add_argument("--json", action="store_true", help="Output summary as JSON")
    parser.add_argument("--no-save", action="store_true", help="Skip saving capture file")
    args = parser.parse_args()

    sniffer = PacketSniffer()

    print("\n  [*] SHIELD Packet Sniffer")
    print("  [*] Note: Full functionality requires Administrator privileges")

    sniffer.start_capture(count=args.count, timeout=args.timeout)

    if args.json:
        payload = {
            "statistics": sniffer.get_statistics(),
            "anomalies": sniffer.detect_anomalies(),
        }
        print(json.dumps(payload, indent=2))
    else:
        sniffer.print_summary()

    if not args.no_save:
        sniffer.save_capture()

    print("\n  [+] Packet capture complete!")


if __name__ == "__main__":
    main()
