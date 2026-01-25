#!/usr/bin/env python3
"""
SHIELD Network Vulnerability Scanner
Advanced real-time network and system security assessment
"""

import socket
import subprocess
import platform
import os
import json
import requests
import time
import sys
import argparse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Force UTF-8 output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Common ports and their known vulnerabilities
COMMON_PORTS = {
    21: {"service": "FTP", "risk": "HIGH", "cves": ["CVE-2010-4221", "CVE-2015-3306"]},
    22: {"service": "SSH", "risk": "MEDIUM", "cves": ["CVE-2016-0777", "CVE-2018-15473"]},
    23: {"service": "Telnet", "risk": "CRITICAL", "cves": ["CVE-2020-10188"]},
    25: {"service": "SMTP", "risk": "MEDIUM", "cves": ["CVE-2019-15846"]},
    53: {"service": "DNS", "risk": "MEDIUM", "cves": ["CVE-2020-1350"]},
    80: {"service": "HTTP", "risk": "LOW", "cves": []},
    110: {"service": "POP3", "risk": "HIGH", "cves": ["CVE-2018-0739"]},
    135: {"service": "RPC", "risk": "HIGH", "cves": ["CVE-2017-0144"]},
    139: {"service": "NetBIOS", "risk": "HIGH", "cves": ["CVE-2017-0143"]},
    143: {"service": "IMAP", "risk": "MEDIUM", "cves": []},
    443: {"service": "HTTPS", "risk": "LOW", "cves": []},
    445: {"service": "SMB", "risk": "CRITICAL", "cves": ["CVE-2017-0144", "CVE-2020-0796"]},
    1433: {"service": "MSSQL", "risk": "HIGH", "cves": ["CVE-2020-0618"]},
    1521: {"service": "Oracle", "risk": "HIGH", "cves": []},
    3000: {"service": "Node/React", "risk": "LOW", "cves": []},
    3306: {"service": "MySQL", "risk": "HIGH", "cves": ["CVE-2020-2574"]},
    3389: {"service": "RDP", "risk": "CRITICAL", "cves": ["CVE-2019-0708", "CVE-2019-1181"]},
    5432: {"service": "PostgreSQL", "risk": "HIGH", "cves": ["CVE-2019-10164"]},
    5900: {"service": "VNC", "risk": "HIGH", "cves": ["CVE-2019-8287"]},
    6379: {"service": "Redis", "risk": "HIGH", "cves": ["CVE-2022-0543"]},
    8000: {"service": "HTTP-Alt/API", "risk": "LOW", "cves": []},
    8001: {"service": "HTTP-Alt", "risk": "LOW", "cves": []},
    8002: {"service": "HTTP-Alt", "risk": "LOW", "cves": []},
    8003: {"service": "HTTP-Alt", "risk": "LOW", "cves": []},
    8080: {"service": "HTTP-Proxy", "risk": "MEDIUM", "cves": []},
    8443: {"service": "HTTPS-Alt", "risk": "LOW", "cves": []},
    27017: {"service": "MongoDB", "risk": "HIGH", "cves": ["CVE-2019-2386"]},
}

# SHIELD Dashboard endpoint
SHIELD_INGESTOR = "http://localhost:8002/ingest/syslog"

def print_banner():
    print("""
+==============================================================+
|     SHIELD LOCAL VULNERABILITY SCANNER v1.0                  |
|          Real-time Security Assessment Tool                  |
+==============================================================+
    """)

def scan_port(host, port, timeout=0.5):
    """Scan a single port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            port_info = COMMON_PORTS.get(port, {"service": "Unknown", "risk": "UNKNOWN", "cves": []})
            return {
                "port": port,
                "status": "OPEN",
                "service": port_info["service"],
                "risk": port_info["risk"],
                "cves": port_info["cves"]
            }
    except socket.error:
        pass
    return None

def port_scan(host="127.0.0.1", ports=None):
    """Multi-threaded port scanner"""
    if ports is None:
        ports = list(COMMON_PORTS.keys())
    
    print(f"\n[*] Starting Port Scan on {host}...")
    print(f"[*] Scanning {len(ports)} common ports...\n")
    
    open_ports = []
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = {executor.submit(scan_port, host, port): port for port in ports}
        
        for future in as_completed(futures):
            result = future.result()
            if result:
                open_ports.append(result)
                
                risk_indicator = "[!]" if result["risk"] in ["CRITICAL", "HIGH"] else "[+]"
                print(f"  {risk_indicator} Port {result['port']}/tcp OPEN - {result['service']} (Risk: {result['risk']})")
                
                if result["cves"]:
                    print(f"      -> Known CVEs: {', '.join(result['cves'][:2])}")
    
    return open_ports

def check_windows_services():
    """Check running Windows services"""
    print(f"\n[*] Checking Running Services...\n")
    
    vulnerabilities = []
    
    try:
        result = subprocess.run(
            ['powershell', '-Command', 'Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name,DisplayName | ConvertTo-Json'],
            capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace'
        )
        
        services = json.loads(result.stdout) if result.stdout else []
        if isinstance(services, dict):
            services = [services]
        
        risky_services = {
            "RemoteRegistry": {"risk": "HIGH", "desc": "Remote Registry allows remote access to Windows Registry"},
            "TermService": {"risk": "MEDIUM", "desc": "Remote Desktop Service - check for BlueKeep"},
            "SNMP": {"risk": "HIGH", "desc": "SNMP can leak system information"},
            "Telnet": {"risk": "CRITICAL", "desc": "Telnet transmits data in cleartext"},
            "W3SVC": {"risk": "MEDIUM", "desc": "IIS Web Server - check for vulnerabilities"},
            "FTPSVC": {"risk": "HIGH", "desc": "FTP Service - cleartext authentication"},
            "LanmanServer": {"risk": "MEDIUM", "desc": "SMB Server - check SMBv1 status"},
        }
        
        for service in services:
            name = service.get("Name", "")
            if name in risky_services:
                vuln = {
                    "type": "SERVICE",
                    "name": name,
                    "display": service.get("DisplayName", name),
                    "risk": risky_services[name]["risk"],
                    "description": risky_services[name]["desc"]
                }
                vulnerabilities.append(vuln)
                print(f"  [!] {vuln['display']}: {vuln['description']} (Risk: {vuln['risk']})")
        
        if not vulnerabilities:
            print(f"  [OK] No critical service vulnerabilities found")
            
    except Exception as e:
        print(f"  [!] Error checking services: {e}")
    
    return vulnerabilities

def check_smb():
    """Check SMB configuration"""
    print(f"\n[*] Checking SMB Configuration...\n")
    
    result = {"smbv1": False, "vulnerable": False}
    
    try:
        smb_check = subprocess.run(
            ['powershell', '-Command', 'Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol | Select-Object -ExpandProperty State'],
            capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace'
        )
        
        if "Enabled" in smb_check.stdout:
            result["smbv1"] = True
            result["vulnerable"] = True
            print(f"  [CRITICAL] SMBv1 is ENABLED - Vulnerable to EternalBlue (CVE-2017-0144)!")
        else:
            print(f"  [OK] SMBv1 is disabled")
        
        smb_signing = subprocess.run(
            ['powershell', '-Command', 'Get-SmbServerConfiguration | Select-Object -ExpandProperty RequireSecuritySignature'],
            capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace'
        )
        
        if "False" in smb_signing.stdout:
            print(f"  [WARN] SMB Signing is not required - vulnerable to relay attacks")
        else:
            print(f"  [OK] SMB Signing is enabled")
            
    except Exception as e:
        print(f"  [!] Could not check SMB: {e}")
    
    return result

def check_rdp():
    """Check RDP security"""
    print(f"\n[*] Checking RDP Security...\n")
    
    result = {"enabled": False, "nla": False}
    
    try:
        rdp_check = subprocess.run(
            ['powershell', '-Command', 'Get-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server" -Name "fDenyTSConnections" | Select-Object -ExpandProperty fDenyTSConnections'],
            capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
        )
        
        if "0" in rdp_check.stdout:
            result["enabled"] = True
            print(f"  [!] RDP is ENABLED")
            
            nla_check = subprocess.run(
                ['powershell', '-Command', 'Get-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server\\WinStations\\RDP-Tcp" -Name "UserAuthentication" | Select-Object -ExpandProperty UserAuthentication'],
                capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
            )
            
            if "1" in nla_check.stdout:
                result["nla"] = True
                print(f"  [OK] Network Level Authentication (NLA) is enabled")
            else:
                print(f"  [CRITICAL] NLA is DISABLED - Vulnerable to BlueKeep (CVE-2019-0708)!")
        else:
            print(f"  [OK] RDP is disabled")
            
    except Exception as e:
        print(f"  [!] Could not check RDP: {e}")
    
    return result

def check_firewall():
    """Check Windows Firewall"""
    print(f"\n[*] Checking Windows Firewall...\n")
    
    result = {"domain": False, "private": False, "public": False}
    
    try:
        fw_check = subprocess.run(
            ['powershell', '-Command', 'Get-NetFirewallProfile | Select-Object Name,Enabled | ConvertTo-Json'],
            capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
        )
        
        profiles = json.loads(fw_check.stdout) if fw_check.stdout else []
        if isinstance(profiles, dict):
            profiles = [profiles]
        
        for profile in profiles:
            name = profile.get("Name", "").lower()
            enabled = profile.get("Enabled", False)
            result[name] = enabled
            
            if enabled:
                print(f"  [OK] {name.capitalize()} Firewall: ENABLED")
            else:
                print(f"  [!] {name.capitalize()} Firewall: DISABLED")
                
    except Exception as e:
        print(f"  [!] Could not check Firewall: {e}")
    
    return result

def check_antivirus():
    """Check antivirus status"""
    print(f"\n[*] Checking Antivirus Status...\n")
    
    result = {"enabled": False, "realtime": False}
    
    try:
        av_check = subprocess.run(
            ['powershell', '-Command', 'Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled | ConvertTo-Json'],
            capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
        )
        
        status = json.loads(av_check.stdout) if av_check.stdout else {}
        
        if status.get("AntivirusEnabled"):
            result["enabled"] = True
            print(f"  [OK] Windows Defender: ENABLED")
        else:
            print(f"  [!] Windows Defender: DISABLED")
        
        if status.get("RealTimeProtectionEnabled"):
            result["realtime"] = True
            print(f"  [OK] Real-time Protection: ENABLED")
        else:
            print(f"  [!] Real-time Protection: DISABLED")
            
    except Exception as e:
        print(f"  [!] Could not check Antivirus: {e}")
    
    return result

def check_open_shares():
    """Check for open network shares"""
    print(f"\n[*] Checking Network Shares...\n")
    
    shares = []
    
    try:
        share_check = subprocess.run(
            ['powershell', '-Command', 'Get-SmbShare | Select-Object Name,Path,Description | ConvertTo-Json'],
            capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
        )
        
        shares_data = json.loads(share_check.stdout) if share_check.stdout else []
        if isinstance(shares_data, dict):
            shares_data = [shares_data]
        
        for share in shares_data:
            name = share.get("Name", "")
            if not name.endswith("$"):  # Skip admin shares
                shares.append(share)
                print(f"  [!] Share Found: {name} -> {share.get('Path', 'N/A')}")
        
        if not shares:
            print(f"  [OK] No public shares found")
            
    except Exception as e:
        print(f"  [!] Could not check shares: {e}")
    
    return shares

def check_password_policy():
    """Check password policy"""
    print(f"\n[*] Checking Password Policy...\n")
    
    try:
        policy_check = subprocess.run(
            ['net', 'accounts'],
            capture_output=True, text=True, timeout=10, encoding='utf-8', errors='replace'
        )
        
        lines = policy_check.stdout.split('\n')
        for line in lines:
            if 'minimum password length' in line.lower():
                parts = line.split(':')
                if len(parts) > 1:
                    length = parts[1].strip()
                    if length.isdigit() and int(length) < 8:
                        print(f"  [WARN] Minimum password length is only {length} characters")
                    else:
                        print(f"  [OK] Minimum password length: {length}")
            elif 'lockout threshold' in line.lower():
                parts = line.split(':')
                if len(parts) > 1:
                    threshold = parts[1].strip()
                    if 'never' in threshold.lower() or threshold == '0':
                        print(f"  [WARN] Account lockout is DISABLED - vulnerable to brute force")
                    else:
                        print(f"  [OK] Account lockout threshold: {threshold}")
                        
    except Exception as e:
        print(f"  [!] Could not check password policy: {e}")

def send_to_shield(findings, enabled=True):
    """Send findings to SHIELD Dashboard"""
    if not enabled:
        return 0

    print(f"\n[*] Sending findings to SHIELD Dashboard...")
    
    sent = 0
    for finding in findings:
        payload = {
            "timestamp": time.time(),
            "source_ip": "127.0.0.1",
            "destination_ip": "Local System",
            "event_type": f"VULN_SCAN: {finding.get('type', 'Unknown')}",
            "severity": finding.get("risk", "MEDIUM"),
            "payload": finding,
            "tenant_id": "T-LOCAL"
        }
        
        try:
            res = requests.post(SHIELD_INGESTOR, json=payload, timeout=2)
            if res.status_code == 200:
                sent += 1
        except:
            pass
    
    print(f"  [OK] Sent {sent} findings to dashboard")
    return sent

def print_summary(scan_results, target):
    """Print scan summary"""
    print("\n" + "="*60)
    print("                    SCAN SUMMARY")
    print("="*60)
    
    print(f"\n  Host: {target}")
    print(f"  OS: {platform.platform()}")
    print(f"  Scan Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Count risks
    risk_count = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    
    for port in scan_results.get("ports", []):
        risk = port.get("risk", "LOW")
        if risk in risk_count:
            risk_count[risk] += 1
    
    for vuln in scan_results.get("services", []):
        risk = vuln.get("risk", "LOW")
        if risk in risk_count:
            risk_count[risk] += 1
    
    print(f"\n  Risk Distribution:")
    print(f"    CRITICAL: {risk_count['CRITICAL']}")
    print(f"    HIGH: {risk_count['HIGH']}")
    print(f"    MEDIUM: {risk_count['MEDIUM']}")
    print(f"    LOW: {risk_count['LOW']}")
    
    total = sum(risk_count.values())
    print(f"\n  Total Findings: {total}")
    
    if risk_count['CRITICAL'] > 0:
        print(f"\n  [!!!] CRITICAL vulnerabilities detected! Immediate action required.")
    elif risk_count['HIGH'] > 0:
        print(f"\n  [!!] HIGH risk vulnerabilities found. Review and remediate.")
    else:
        print(f"\n  [OK] No critical vulnerabilities found.")
    
    print("\n" + "="*60 + "\n")

def run_full_scan(target, include_windows_checks=True, send_ingest=True):
    """Run complete vulnerability scan"""
    print_banner()
    
    scan_results = {}
    all_findings = []
    
    # 1. Port Scan
    scan_results["ports"] = port_scan(target)
    for port in scan_results["ports"]:
        all_findings.append({"type": f"PORT_{port['port']}", "risk": port["risk"], **port})

    if include_windows_checks:
        # 2. Service Check
        scan_results["services"] = check_windows_services()
        all_findings.extend(scan_results["services"])
        
        # 3. SMB Check
        scan_results["smb"] = check_smb()
        
        # 4. RDP Check
        scan_results["rdp"] = check_rdp()
        
        # 5. Firewall Check
        scan_results["firewall"] = check_firewall()
        
        # 6. Antivirus Check
        scan_results["antivirus"] = check_antivirus()
        
        # 7. Network Shares
        scan_results["shares"] = check_open_shares()
        
        # 8. Password Policy
        check_password_policy()
    else:
        print("\n  [*] Skipping Windows-only checks on this platform.")
    
    # Send to SHIELD Dashboard
    send_to_shield(all_findings, enabled=send_ingest)
    
    # Print Summary
    print_summary(scan_results, target)
    
    return scan_results

def main():
    parser = argparse.ArgumentParser(description="SHIELD Local Vulnerability Scanner")
    parser.add_argument("--target", default="127.0.0.1", help="Target host or IP address")
    parser.add_argument("--no-ingest", action="store_true", help="Do not send findings to SHIELD ingestor")
    parser.add_argument("--skip-os-checks", action="store_true", help="Skip OS-specific checks")
    parser.add_argument("--json", action="store_true", help="Output results as JSON only")
    args = parser.parse_args()
    
    include_windows_checks = platform.system().lower().startswith("win") and not args.skip_os_checks
    results = run_full_scan(args.target, include_windows_checks=include_windows_checks, send_ingest=not args.no_ingest)
    
    if args.json:
        print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
