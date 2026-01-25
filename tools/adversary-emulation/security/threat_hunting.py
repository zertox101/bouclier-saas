#!/usr/bin/env python3
"""
SHIELD Threat Hunting Engine
SOC-focused threat hunting, IOC correlation, and SIEM queries
"""

import sys
import os
import json
import re
import hashlib
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Set
from collections import defaultdict
from dataclasses import dataclass, asdict

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


@dataclass
class IOC:
    """Indicator of Compromise"""
    type: str  # ip, domain, hash, url, email
    value: str
    threat_type: str
    confidence: float
    source: str
    first_seen: str
    tags: List[str]


@dataclass 
class ThreatHunt:
    """Threat hunting query"""
    id: str
    name: str
    description: str
    mitre_tactic: str
    mitre_technique: str
    query: str
    severity: str


class IOCDatabase:
    """Indicator of Compromise database"""
    
    def __init__(self):
        self.iocs: Dict[str, List[IOC]] = {
            'ip': [], 'domain': [], 'hash': [], 'url': [], 'email': []
        }
        self._load_default_iocs()
    
    def _load_default_iocs(self):
        """Load sample IOCs"""
        sample_iocs = [
            IOC('ip', '185.220.101.1', 'C2 Server', 0.95, 'ThreatFeed', '2024-01-01', ['apt', 'c2']),
            IOC('ip', '45.33.32.156', 'Malware Distribution', 0.85, 'OSINT', '2024-01-05', ['malware']),
            IOC('domain', 'evil-domain.com', 'Phishing', 0.90, 'PhishTank', '2024-01-02', ['phishing']),
            IOC('domain', 'malware-c2.net', 'C2 Server', 0.95, 'ThreatFeed', '2024-01-03', ['c2', 'apt28']),
            IOC('hash', 'd41d8cd98f00b204e9800998ecf8427e', 'Known Malware', 0.99, 'VirusTotal', '2024-01-01', ['ransomware']),
            IOC('hash', '5d41402abc4b2a76b9719d911017c592', 'Trojan', 0.88, 'MalwareBazaar', '2024-01-04', ['trojan']),
        ]
        for ioc in sample_iocs:
            self.iocs[ioc.type].append(ioc)
    
    def add_ioc(self, ioc: IOC):
        """Add IOC to database"""
        if ioc.type in self.iocs:
            self.iocs[ioc.type].append(ioc)
    
    def search(self, value: str) -> List[IOC]:
        """Search for IOC"""
        results = []
        value_lower = value.lower()
        for ioc_type, iocs in self.iocs.items():
            for ioc in iocs:
                if value_lower in ioc.value.lower():
                    results.append(ioc)
        return results
    
    def check_ip(self, ip: str) -> Optional[IOC]:
        """Check if IP is malicious"""
        for ioc in self.iocs['ip']:
            if ioc.value == ip:
                return ioc
        return None
    
    def check_domain(self, domain: str) -> Optional[IOC]:
        """Check if domain is malicious"""
        for ioc in self.iocs['domain']:
            if domain.endswith(ioc.value) or ioc.value in domain:
                return ioc
        return None
    
    def check_hash(self, file_hash: str) -> Optional[IOC]:
        """Check if hash is malicious"""
        for ioc in self.iocs['hash']:
            if ioc.value.lower() == file_hash.lower():
                return ioc
        return None


class HuntingQueries:
    """Pre-built threat hunting queries"""
    
    QUERIES = [
        ThreatHunt(
            id='HUNT-001',
            name='PowerShell Encoded Commands',
            description='Detect encoded PowerShell commands often used by attackers',
            mitre_tactic='Execution',
            mitre_technique='T1059.001',
            query='process_name:powershell.exe AND (cmdline:*-enc* OR cmdline:*-e * OR cmdline:*encodedcommand*)',
            severity='High'
        ),
        ThreatHunt(
            id='HUNT-002', 
            name='Suspicious LSASS Access',
            description='Detect potential credential dumping via LSASS access',
            mitre_tactic='Credential Access',
            mitre_technique='T1003.001',
            query='process_name:* AND target_process:lsass.exe AND access_mask:(0x1010 OR 0x1410)',
            severity='Critical'
        ),
        ThreatHunt(
            id='HUNT-003',
            name='Lateral Movement via PsExec',
            description='Detect PsExec-style lateral movement',
            mitre_tactic='Lateral Movement', 
            mitre_technique='T1021.002',
            query='(service_name:PSEXESVC OR pipe_name:*psexec*) OR (process_name:psexec.exe)',
            severity='High'
        ),
        ThreatHunt(
            id='HUNT-004',
            name='Scheduled Task Creation',
            description='Detect persistence via scheduled tasks',
            mitre_tactic='Persistence',
            mitre_technique='T1053.005',
            query='process_name:schtasks.exe AND cmdline:*/create*',
            severity='Medium'
        ),
        ThreatHunt(
            id='HUNT-005',
            name='Registry Run Key Modification',
            description='Detect persistence via registry run keys',
            mitre_tactic='Persistence',
            mitre_technique='T1547.001',
            query='registry_path:*\\CurrentVersion\\Run* AND event_type:SetValue',
            severity='Medium'
        ),
        ThreatHunt(
            id='HUNT-006',
            name='Suspicious Network Connections',
            description='Detect connections to known bad ports',
            mitre_tactic='Command and Control',
            mitre_technique='T1571',
            query='dst_port:(4444 OR 5555 OR 6666 OR 31337 OR 1337) AND direction:outbound',
            severity='High'
        ),
        ThreatHunt(
            id='HUNT-007',
            name='DNS Tunneling Detection',
            description='Detect potential DNS tunneling/exfiltration',
            mitre_tactic='Exfiltration',
            mitre_technique='T1048.001',
            query='dns_query_length:>50 OR dns_query:*=* OR subdomain_count:>5',
            severity='High'
        ),
        ThreatHunt(
            id='HUNT-008',
            name='Mimikatz Indicators',
            description='Detect Mimikatz execution patterns',
            mitre_tactic='Credential Access',
            mitre_technique='T1003',
            query='(cmdline:*sekurlsa* OR cmdline:*kerberos::* OR cmdline:*crypto::*) OR process_name:mimikatz.exe',
            severity='Critical'
        ),
        ThreatHunt(
            id='HUNT-009',
            name='WMI Execution',
            description='Detect WMI-based execution',
            mitre_tactic='Execution',
            mitre_technique='T1047',
            query='process_name:wmic.exe AND (cmdline:*process* OR cmdline:*call* OR cmdline:*create*)',
            severity='Medium'
        ),
        ThreatHunt(
            id='HUNT-010',
            name='Data Staging',
            description='Detect data collection before exfiltration',
            mitre_tactic='Collection',
            mitre_technique='T1074',
            query='process_name:(rar.exe OR 7z.exe OR zip.exe) AND cmdline:*password*',
            severity='High'
        ),
    ]
    
    @classmethod
    def get_all(cls) -> List[ThreatHunt]:
        return cls.QUERIES
    
    @classmethod
    def get_by_tactic(cls, tactic: str) -> List[ThreatHunt]:
        return [q for q in cls.QUERIES if q.mitre_tactic.lower() == tactic.lower()]
    
    @classmethod
    def get_by_severity(cls, severity: str) -> List[ThreatHunt]:
        return [q for q in cls.QUERIES if q.severity.lower() == severity.lower()]


class LogAnalyzer:
    """Analyze logs for threats"""
    
    def __init__(self):
        self.patterns = {
            'brute_force': r'failed.*login|authentication.*fail|invalid.*password',
            'sql_injection': r"('|\"|\-\-|;|\/\*|\*\/|xp_|exec\(|union\s+select)",
            'xss': r'<script|javascript:|onerror=|onload=',
            'path_traversal': r'\.\./|\.\.\%2f|\.\.\\',
            'command_injection': r'\||;|`|\$\(|&&',
            'suspicious_ua': r'sqlmap|nikto|nmap|masscan|dirbuster|gobuster',
        }
    
    def analyze_log_line(self, line: str) -> List[Dict]:
        """Analyze single log line for threats"""
        threats = []
        line_lower = line.lower()
        
        for threat_type, pattern in self.patterns.items():
            if re.search(pattern, line_lower, re.IGNORECASE):
                threats.append({
                    'type': threat_type,
                    'pattern': pattern,
                    'line': line[:200],
                    'timestamp': datetime.now().isoformat()
                })
        
        return threats
    
    def analyze_file(self, filepath: str) -> Dict:
        """Analyze log file"""
        results = {
            'file': filepath,
            'total_lines': 0,
            'threats_found': 0,
            'threats': []
        }
        
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                for line in f:
                    results['total_lines'] += 1
                    threats = self.analyze_log_line(line)
                    if threats:
                        results['threats'].extend(threats)
                        results['threats_found'] += len(threats)
        except Exception as e:
            results['error'] = str(e)
        
        return results


class ThreatCorrelator:
    """Correlate events to detect complex attacks"""
    
    def __init__(self):
        self.events = []
        self.correlation_rules = [
            {
                'name': 'Brute Force Attack',
                'conditions': {'event_type': 'login_failed', 'count': 5, 'window': 300},
                'severity': 'High'
            },
            {
                'name': 'Credential Stuffing',
                'conditions': {'event_type': 'login_failed', 'unique_users': 10, 'window': 600},
                'severity': 'High'
            },
            {
                'name': 'Port Scan',
                'conditions': {'event_type': 'connection', 'unique_ports': 20, 'window': 60},
                'severity': 'Medium'
            },
            {
                'name': 'Data Exfiltration',
                'conditions': {'event_type': 'transfer', 'bytes': 100000000, 'window': 3600},
                'severity': 'Critical'
            },
        ]
    
    def add_event(self, event: Dict):
        """Add event for correlation"""
        event['timestamp'] = time.time()
        self.events.append(event)
        # Keep only last hour of events
        cutoff = time.time() - 3600
        self.events = [e for e in self.events if e['timestamp'] > cutoff]
    
    def correlate(self) -> List[Dict]:
        """Run correlation rules"""
        alerts = []
        
        for rule in self.correlation_rules:
            conditions = rule['conditions']
            event_type = conditions.get('event_type')
            window = conditions.get('window', 300)
            
            cutoff = time.time() - window
            relevant = [e for e in self.events 
                       if e.get('event_type') == event_type and e['timestamp'] > cutoff]
            
            triggered = False
            
            if 'count' in conditions and len(relevant) >= conditions['count']:
                triggered = True
            
            if 'unique_users' in conditions:
                unique = len(set(e.get('user', '') for e in relevant))
                if unique >= conditions['unique_users']:
                    triggered = True
            
            if 'unique_ports' in conditions:
                unique = len(set(e.get('port', 0) for e in relevant))
                if unique >= conditions['unique_ports']:
                    triggered = True
            
            if triggered:
                alerts.append({
                    'rule': rule['name'],
                    'severity': rule['severity'],
                    'event_count': len(relevant),
                    'timestamp': datetime.now().isoformat()
                })
        
        return alerts


class ThreatHuntingEngine:
    """Main Threat Hunting Engine"""
    
    def __init__(self):
        self.ioc_db = IOCDatabase()
        self.queries = HuntingQueries()
        self.log_analyzer = LogAnalyzer()
        self.correlator = ThreatCorrelator()
    
    def print_banner(self):
        print("""
╔═══════════════════════════════════════════════════════════════╗
║     🎯 SHIELD THREAT HUNTING ENGINE v1.0                      ║
║        SOC-focused Threat Detection & Correlation             ║
╚═══════════════════════════════════════════════════════════════╝
        """)
    
    def check_iocs(self, indicators: List[str]) -> List[Dict]:
        """Check list of indicators against IOC database"""
        results = []
        for indicator in indicators:
            # Determine type
            if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', indicator):
                ioc = self.ioc_db.check_ip(indicator)
            elif re.match(r'^[a-fA-F0-9]{32,64}$', indicator):
                ioc = self.ioc_db.check_hash(indicator)
            else:
                ioc = self.ioc_db.check_domain(indicator)
            
            if ioc:
                results.append({
                    'indicator': indicator,
                    'match': asdict(ioc),
                    'status': 'MALICIOUS'
                })
            else:
                results.append({
                    'indicator': indicator,
                    'match': None,
                    'status': 'CLEAN'
                })
        
        return results
    
    def run_hunt(self, hunt_id: str = None) -> List[Dict]:
        """Run threat hunting queries"""
        results = []
        
        hunts = self.queries.get_all() if not hunt_id else \
                [h for h in self.queries.get_all() if h.id == hunt_id]
        
        for hunt in hunts:
            results.append({
                'hunt': asdict(hunt),
                'status': 'SIMULATED',
                'matches': 0,
                'note': 'Connect to SIEM for real execution'
            })
        
        return results
    
    def demo(self):
        """Run demonstration"""
        self.print_banner()
        
        print("\n  === IOC DATABASE ===")
        print(f"  [*] Loaded IOCs:")
        for ioc_type, iocs in self.ioc_db.iocs.items():
            print(f"      {ioc_type}: {len(iocs)} indicators")
        
        print("\n  === IOC LOOKUP ===")
        test_indicators = ['185.220.101.1', 'evil-domain.com', 'google.com', 'd41d8cd98f00b204e9800998ecf8427e']
        results = self.check_iocs(test_indicators)
        for r in results:
            status = "🔴 MALICIOUS" if r['status'] == 'MALICIOUS' else "🟢 CLEAN"
            print(f"  [{status}] {r['indicator']}")
            if r['match']:
                print(f"           Threat: {r['match']['threat_type']} (Confidence: {r['match']['confidence']})")
        
        print("\n  === HUNTING QUERIES ===")
        for hunt in self.queries.get_all()[:5]:
            print(f"  [{hunt.severity:8}] {hunt.id}: {hunt.name}")
            print(f"             MITRE: {hunt.mitre_tactic} - {hunt.mitre_technique}")
        
        print("\n  === LOG ANALYSIS ===")
        sample_logs = [
            "192.168.1.1 - - [10/Dec/2024] 'GET /admin?id=1' OR '1'='1 HTTP/1.1' 200",
            "Failed login for user admin from 10.0.0.5",
            "Normal web request from 192.168.1.100",
            "GET /../../../etc/passwd HTTP/1.1",
        ]
        for log in sample_logs:
            threats = self.log_analyzer.analyze_log_line(log)
            if threats:
                print(f"  [⚠️  THREAT] {threats[0]['type']}: {log[:60]}...")
            else:
                print(f"  [✓  CLEAN ] {log[:60]}...")
        
        print("\n  === CORRELATION ENGINE ===")
        # Simulate brute force
        for i in range(6):
            self.correlator.add_event({'event_type': 'login_failed', 'user': 'admin'})
        
        alerts = self.correlator.correlate()
        for alert in alerts:
            print(f"  [🚨 ALERT] {alert['rule']} - Severity: {alert['severity']}")
        
        print("\n" + "="*60)


def main():
    engine = ThreatHuntingEngine()
    engine.demo()


if __name__ == "__main__":
    main()
