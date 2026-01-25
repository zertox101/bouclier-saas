#!/usr/bin/env python3
"""
SHIELD Honeypot System
Fake services to detect and monitor attackers
"""

import sys
import os
import json
import socket
import threading
import time
import argparse
from datetime import datetime
from typing import List, Dict, Optional
from collections import defaultdict
import hashlib

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class HoneypotEvent:
    """Honeypot event structure"""
    
    def __init__(self, service: str, src_ip: str, src_port: int, data: bytes = None):
        self.id = hashlib.md5(f"{time.time()}{src_ip}".encode()).hexdigest()[:12]
        self.timestamp = datetime.now().isoformat()
        self.service = service
        self.src_ip = src_ip
        self.src_port = src_port
        self.data = data.decode('utf-8', errors='ignore') if data else None
        self.threat_level = 'Unknown'
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'timestamp': self.timestamp,
            'service': self.service,
            'src_ip': self.src_ip,
            'src_port': self.src_port,
            'data': self.data[:500] if self.data else None,
            'threat_level': self.threat_level
        }


class BaseHoneypot:
    """Base honeypot service"""
    
    def __init__(self, port: int, service_name: str, bind_host: str = "127.0.0.1"):
        self.port = port
        self.service_name = service_name
        self.bind_host = bind_host
        self.running = False
        self.events: List[HoneypotEvent] = []
        self.sock = None
    
    def log_event(self, event: HoneypotEvent):
        """Log honeypot event"""
        self.events.append(event)
        print(f"  [HONEYPOT {self.service_name}] Connection from {event.src_ip}:{event.src_port}")
    
    def start(self):
        """Start honeypot"""
        raise NotImplementedError
    
    def stop(self):
        """Stop honeypot"""
        self.running = False
        if self.sock:
            try:
                self.sock.close()
            except:
                pass


class SSHHoneypot(BaseHoneypot):
    """Fake SSH server"""
    
    SSH_BANNER = b"SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.5\r\n"
    
    def __init__(self, port: int = 22, bind_host: str = "127.0.0.1"):
        super().__init__(port, "SSH", bind_host=bind_host)
    
    def start(self):
        """Start SSH honeypot"""
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.sock.bind((self.bind_host, self.port))
            self.sock.listen(5)
            self.sock.settimeout(1)
            
            while self.running:
                try:
                    client, addr = self.sock.accept()
                    threading.Thread(target=self._handle_client, 
                                   args=(client, addr), daemon=True).start()
                except socket.timeout:
                    continue
                except Exception as e:
                    if self.running:
                        print(f"  [!] SSH error: {e}")
        finally:
            self.sock.close()
    
    def _handle_client(self, client: socket.socket, addr: tuple):
        """Handle SSH connection"""
        event = HoneypotEvent("SSH", addr[0], addr[1])
        
        try:
            # Send banner
            client.send(self.SSH_BANNER)
            
            # Receive client banner
            data = client.recv(1024)
            event.data = data.decode('utf-8', errors='ignore')
            event.threat_level = 'High'
            
            # Simulate key exchange delay
            time.sleep(2)
            
            # Send fake key exchange (will fail but captures attempt)
            client.send(b'\x00' * 100)
            
        except Exception:
            pass
        finally:
            client.close()
            self.log_event(event)


class HTTPHoneypot(BaseHoneypot):
    """Fake HTTP server with common vulnerabilities"""
    
    def __init__(self, port: int = 80, bind_host: str = "127.0.0.1"):
        super().__init__(port, "HTTP", bind_host=bind_host)
        self.fake_responses = {
            '/': self._index_page,
            '/admin': self._admin_page,
            '/login': self._login_page,
            '/phpmyadmin': self._phpmyadmin_page,
            '/wp-admin': self._wordpress_page,
        }
    
    def start(self):
        """Start HTTP honeypot"""
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.sock.bind((self.bind_host, self.port))
            self.sock.listen(5)
            self.sock.settimeout(1)
            
            while self.running:
                try:
                    client, addr = self.sock.accept()
                    threading.Thread(target=self._handle_client,
                                   args=(client, addr), daemon=True).start()
                except socket.timeout:
                    continue
        finally:
            self.sock.close()
    
    def _handle_client(self, client: socket.socket, addr: tuple):
        """Handle HTTP request"""
        try:
            data = client.recv(4096)
            event = HoneypotEvent("HTTP", addr[0], addr[1], data)
            
            # Parse request
            request = data.decode('utf-8', errors='ignore')
            lines = request.split('\r\n')
            
            if lines:
                parts = lines[0].split(' ')
                method = parts[0] if parts else 'GET'
                path = parts[1] if len(parts) > 1 else '/'
                
                # Detect attack patterns
                event.threat_level = self._classify_threat(request)
                
                # Send response
                response = self._get_response(path)
                client.send(response.encode())
            
            self.log_event(event)
            
        except Exception:
            pass
        finally:
            client.close()
    
    def _classify_threat(self, request: str) -> str:
        """Classify threat level"""
        request_lower = request.lower()
        
        if any(x in request_lower for x in ["' or ", "union select", "exec(", "../"]):
            return 'Critical'
        elif any(x in request_lower for x in ["/admin", "/phpmyadmin", "wp-admin"]):
            return 'High'
        elif any(x in request_lower for x in ["sqlmap", "nikto", "nmap"]):
            return 'High'
        elif any(x in request_lower for x in [".php", ".asp", "cgi-bin"]):
            return 'Medium'
        return 'Low'
    
    def _get_response(self, path: str) -> str:
        """Get fake HTTP response"""
        handler = self.fake_responses.get(path, self._not_found)
        body = handler()
        
        return f"""HTTP/1.1 200 OK\r
Server: Apache/2.4.41 (Ubuntu)\r
Content-Type: text/html\r
Content-Length: {len(body)}\r
Connection: close\r
\r
{body}"""
    
    def _index_page(self) -> str:
        return "<html><head><title>Welcome</title></head><body><h1>Welcome</h1></body></html>"
    
    def _admin_page(self) -> str:
        return """<html><head><title>Admin Login</title></head>
<body><h1>Admin Panel</h1>
<form method="POST"><input name="user"><input name="pass" type="password">
<button>Login</button></form></body></html>"""
    
    def _login_page(self) -> str:
        return self._admin_page()
    
    def _phpmyadmin_page(self) -> str:
        return """<html><head><title>phpMyAdmin</title></head>
<body><h1>phpMyAdmin 4.9.0</h1>
<form method="POST"><input name="pma_username"><input name="pma_password" type="password">
<button>Go</button></form></body></html>"""
    
    def _wordpress_page(self) -> str:
        return """<html><head><title>WordPress Admin</title></head>
<body><h1>WordPress</h1>
<form method="POST"><input name="log"><input name="pwd" type="password">
<button>Log In</button></form></body></html>"""
    
    def _not_found(self) -> str:
        return "<html><body><h1>404 Not Found</h1></body></html>"


class FTPHoneypot(BaseHoneypot):
    """Fake FTP server"""
    
    def __init__(self, port: int = 21, bind_host: str = "127.0.0.1"):
        super().__init__(port, "FTP", bind_host=bind_host)
    
    def start(self):
        """Start FTP honeypot"""
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.sock.bind((self.bind_host, self.port))
            self.sock.listen(5)
            self.sock.settimeout(1)
            
            while self.running:
                try:
                    client, addr = self.sock.accept()
                    threading.Thread(target=self._handle_client,
                                   args=(client, addr), daemon=True).start()
                except socket.timeout:
                    continue
        finally:
            self.sock.close()
    
    def _handle_client(self, client: socket.socket, addr: tuple):
        """Handle FTP connection"""
        event = HoneypotEvent("FTP", addr[0], addr[1])
        credentials = []
        
        try:
            client.send(b"220 FTP Server Ready\r\n")
            
            while True:
                data = client.recv(1024)
                if not data:
                    break
                
                cmd = data.decode('utf-8', errors='ignore').strip()
                
                if cmd.upper().startswith('USER'):
                    username = cmd[5:].strip()
                    credentials.append(f"USER:{username}")
                    client.send(b"331 Password required\r\n")
                    
                elif cmd.upper().startswith('PASS'):
                    password = cmd[5:].strip()
                    credentials.append(f"PASS:{password}")
                    client.send(b"530 Login incorrect\r\n")
                    event.threat_level = 'High'
                    break
                    
                elif cmd.upper() == 'QUIT':
                    client.send(b"221 Goodbye\r\n")
                    break
                else:
                    client.send(b"500 Unknown command\r\n")
            
            event.data = ' | '.join(credentials)
            
        except Exception:
            pass
        finally:
            client.close()
            if credentials:
                self.log_event(event)


class SMBHoneypot(BaseHoneypot):
    """Fake SMB server (simplified)"""
    
    def __init__(self, port: int = 445, bind_host: str = "127.0.0.1"):
        super().__init__(port, "SMB", bind_host=bind_host)
    
    def start(self):
        """Start SMB honeypot"""
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        try:
            self.sock.bind((self.bind_host, self.port))
            self.sock.listen(5)
            self.sock.settimeout(1)
            
            while self.running:
                try:
                    client, addr = self.sock.accept()
                    event = HoneypotEvent("SMB", addr[0], addr[1])
                    event.threat_level = 'Critical'  # SMB probes are serious
                    
                    # Receive initial data
                    try:
                        data = client.recv(1024)
                        event.data = f"SMB probe: {len(data)} bytes"
                    except:
                        pass
                    
                    client.close()
                    self.log_event(event)
                    
                except socket.timeout:
                    continue
        finally:
            self.sock.close()


class HoneypotManager:
    """Manage multiple honeypots"""
    
    def __init__(self):
        self.honeypots: Dict[str, BaseHoneypot] = {}
        self.threads: Dict[str, threading.Thread] = {}
        self.all_events: List[HoneypotEvent] = []
        self.attacker_stats: Dict[str, Dict] = defaultdict(lambda: {
            'connections': 0,
            'services': set(),
            'first_seen': None,
            'last_seen': None,
            'threat_level': 'Low'
        })
    
    def add_honeypot(self, name: str, honeypot: BaseHoneypot):
        """Add honeypot"""
        self.honeypots[name] = honeypot
    
    def start_all(self):
        """Start all honeypots"""
        for name, hp in self.honeypots.items():
            thread = threading.Thread(target=hp.start, daemon=True)
            thread.start()
            self.threads[name] = thread
            print(f"  [] Started {hp.service_name} honeypot on port {hp.port}")
    
    def stop_all(self):
        """Stop all honeypots"""
        for name, hp in self.honeypots.items():
            hp.stop()
            print(f"  [*] Stopped {hp.service_name} honeypot")
    
    def get_events(self) -> List[Dict]:
        """Get all events from all honeypots"""
        events = []
        for hp in self.honeypots.values():
            events.extend([e.to_dict() for e in hp.events])
        return sorted(events, key=lambda x: x['timestamp'], reverse=True)
    
    def get_attacker_stats(self) -> Dict:
        """Get attacker statistics"""
        for hp in self.honeypots.values():
            for event in hp.events:
                ip = event.src_ip
                self.attacker_stats[ip]['connections'] += 1
                self.attacker_stats[ip]['services'].add(event.service)
                
                if not self.attacker_stats[ip]['first_seen']:
                    self.attacker_stats[ip]['first_seen'] = event.timestamp
                self.attacker_stats[ip]['last_seen'] = event.timestamp
                
                # Escalate threat level
                if event.threat_level == 'Critical':
                    self.attacker_stats[ip]['threat_level'] = 'Critical'
                elif event.threat_level == 'High' and \
                     self.attacker_stats[ip]['threat_level'] not in ['Critical']:
                    self.attacker_stats[ip]['threat_level'] = 'High'
        
        # Convert sets to lists for JSON
        return {ip: {**stats, 'services': list(stats['services'])} 
                for ip, stats in self.attacker_stats.items()}


class HoneypotSystem:
    """Main Honeypot System"""
    
    def __init__(self):
        self.manager = HoneypotManager()
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD HONEYPOT SYSTEM v1.0                              |
|          Deception Technology for Threat Detection           |
+==============================================================+
        """)

    def setup_default_honeypots(self, use_high_ports: bool = True, bind_host: str = "127.0.0.1"):
        """Setup default honeypots"""
        offset = 8000 if use_high_ports else 0

        self.manager.add_honeypot('ssh', SSHHoneypot(22 + offset, bind_host=bind_host))
        self.manager.add_honeypot('http', HTTPHoneypot(80 + offset, bind_host=bind_host))
        self.manager.add_honeypot('ftp', FTPHoneypot(21 + offset, bind_host=bind_host))
        self.manager.add_honeypot('smb', SMBHoneypot(445 + offset, bind_host=bind_host))

    def demo(self):
        """Run demonstration"""
        self.print_banner()
        
        print("\n  === HONEYPOT CAPABILITIES ===")
        print("  [*] SSH Honeypot - Captures authentication attempts")
        print("  [*] HTTP Honeypot - Fake admin panels, detects scanners")
        print("  [*] FTP Honeypot - Captures credentials")
        print("  [*] SMB Honeypot - Detects network probes")
        
        print("\n  === SIMULATED ATTACK EVENTS ===")
        
        # Create simulated events
        events = [
            HoneypotEvent("SSH", "192.168.1.50", 54321, b"SSH-2.0-Client"),
            HoneypotEvent("HTTP", "10.0.0.99", 45678, b"GET /admin HTTP/1.1\r\nUser-Agent: sqlmap"),
            HoneypotEvent("FTP", "172.16.0.100", 34567, b"USER test | PASS test"),
            HoneypotEvent("SMB", "192.168.1.50", 12345, b"SMB request"),
        ]
        
        events[0].threat_level = 'High'
        events[1].threat_level = 'Critical'
        events[2].threat_level = 'High'
        events[3].threat_level = 'Critical'
        
        for event in events:
            print(f"  [{event.threat_level:8}] {event.service:5} from {event.src_ip}")
            if event.data:
                print(f"             Data: {event.data[:60]}...")
        
        print("\n  === ATTACKER PROFILING ===")
        attackers = {
            '192.168.1.50': {'services': ['SSH', 'SMB'], 'attempts': 15, 'threat': 'Critical'},
            '10.0.0.99': {'services': ['HTTP'], 'attempts': 5, 'threat': 'Critical'},
            '172.16.0.100': {'services': ['FTP'], 'attempts': 3, 'threat': 'High'},
        }
        
        for ip, info in attackers.items():
            print(f"  [{info['threat']:8}] {ip}")
            print(f"             Services: {', '.join(info['services'])}")
            print(f"             Attempts: {info['attempts']}")
        
        print("\n  === STARTING HONEYPOTS ===")
        print("  To start honeypots (requires appropriate ports):")
        print("    system = HoneypotSystem()")
        print("    system.setup_default_honeypots(use_high_ports=True)")
        print("    system.manager.start_all()")
        print("\n  Honeypot ports (high port mode):")
        print("    SSH:  8022    HTTP: 8080")
        print("    FTP:  8021    SMB:  8445")
        
        print("\n" + "="*60)


def main():
    parser = argparse.ArgumentParser(description="SHIELD Honeypot System")
    parser.add_argument("--start", action="store_true", help="Start honeypots")
    parser.add_argument("--duration", type=int, default=30, help="Run duration in seconds")
    parser.add_argument("--bind", default="127.0.0.1", help="Bind host for honeypots")
    parser.add_argument("--high-ports", action="store_true", help="Use high ports (non-admin)")
    parser.add_argument("--json", action="store_true", help="Output events as JSON")
    parser.add_argument("--demo", action="store_true", help="Run demo output")
    parser.add_argument("--no-banner", action="store_true", help="Disable banner output")
    args = parser.parse_args()

    system = HoneypotSystem()
    if not args.no_banner:
        system.print_banner()

    if args.demo:
        system.demo()
        return

    if not args.start:
        raise SystemExit("Use --start or --demo")

    system.setup_default_honeypots(use_high_ports=args.high_ports, bind_host=args.bind)
    system.manager.start_all()

    try:
        time.sleep(args.duration)
    finally:
        system.manager.stop_all()

    events = system.manager.get_events()
    stats = system.manager.get_attacker_stats()

    if args.json:
        print(json.dumps({"events": events, "stats": stats}, indent=2))
    else:
        print(f"Captured events: {len(events)}")
        for event in events[:5]:
            print(f"- {event.get('service')} from {event.get('src_ip')}")


if __name__ == "__main__":
    main()
