#!/usr/bin/env python3
"""
SHIELD AI Threat Detection Engine
Machine Learning-based anomaly detection and threat classification
"""

import sys
import os
import json
import time
import random
import math
import hashlib
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from collections import deque, defaultdict
import statistics

# Force UTF-8
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


class FeatureExtractor:
    """Extract features from network/system events for ML"""
    
    def __init__(self):
        self.baseline = {}
        self.history = deque(maxlen=1000)
    
    def extract_network_features(self, event: Dict) -> List[float]:
        """Extract features from network event"""
        features = []
        
        # Packet size features
        packet_size = event.get('packet_size', 0)
        features.append(min(packet_size / 65535, 1.0))  # Normalized
        
        # Port features
        src_port = event.get('src_port', 0)
        dst_port = event.get('dst_port', 0)
        features.append(1.0 if src_port < 1024 else 0.0)  # Privileged port
        features.append(1.0 if dst_port < 1024 else 0.0)
        features.append(min(dst_port / 65535, 1.0))
        
        # Protocol features
        protocol = event.get('protocol', 'TCP')
        features.append(1.0 if protocol == 'TCP' else 0.0)
        features.append(1.0 if protocol == 'UDP' else 0.0)
        features.append(1.0 if protocol == 'ICMP' else 0.0)
        
        # Time features
        hour = datetime.now().hour
        features.append(hour / 24.0)
        features.append(1.0 if 9 <= hour <= 17 else 0.0)  # Business hours
        
        # Flags
        flags = event.get('flags', [])
        features.append(1.0 if 'SYN' in flags else 0.0)
        features.append(1.0 if 'FIN' in flags else 0.0)
        features.append(1.0 if 'RST' in flags else 0.0)
        features.append(1.0 if 'ACK' in flags else 0.0)
        
        return features
    
    def extract_behavior_features(self, events: List[Dict]) -> List[float]:
        """Extract behavioral features from event sequence"""
        if not events:
            return [0.0] * 10
        
        features = []
        
        # Event frequency
        event_count = len(events)
        features.append(min(event_count / 100, 1.0))
        
        # Unique IPs
        unique_ips = len(set(e.get('src_ip', '') for e in events))
        features.append(min(unique_ips / 50, 1.0))
        
        # Unique ports
        unique_ports = len(set(e.get('dst_port', 0) for e in events))
        features.append(min(unique_ports / 100, 1.0))
        
        # Port scan indicator (many ports, few IPs)
        port_scan_ratio = unique_ports / max(unique_ips, 1)
        features.append(min(port_scan_ratio / 10, 1.0))
        
        # IP scan indicator (many IPs, few ports)
        ip_scan_ratio = unique_ips / max(unique_ports, 1)
        features.append(min(ip_scan_ratio / 10, 1.0))
        
        # Failed connection ratio
        failed = sum(1 for e in events if e.get('status') == 'failed')
        features.append(failed / max(event_count, 1))
        
        # Packet size statistics
        sizes = [e.get('packet_size', 0) for e in events]
        if sizes:
            features.append(min(statistics.mean(sizes) / 1500, 1.0))
            features.append(min(statistics.stdev(sizes) / 500, 1.0) if len(sizes) > 1 else 0.0)
        else:
            features.extend([0.0, 0.0])
        
        # Time patterns
        intervals = []
        for i in range(1, len(events)):
            t1 = events[i-1].get('timestamp', 0)
            t2 = events[i].get('timestamp', 0)
            intervals.append(abs(t2 - t1))
        
        if intervals:
            features.append(1.0 if statistics.mean(intervals) < 0.1 else 0.0)  # Rapid fire
        else:
            features.append(0.0)
        
        features.append(1.0 if event_count > 50 else 0.0)  # High volume
        
        return features


class AnomalyDetector:
    """Statistical anomaly detection using Isolation Forest concept"""
    
    def __init__(self, contamination: float = 0.1):
        self.contamination = contamination
        self.trees = []
        self.trained = False
        self.threshold = 0.5
    
    def _build_tree(self, data: List[List[float]], height: int = 0, max_height: int = 10):
        """Build isolation tree"""
        if height >= max_height or len(data) <= 1:
            return {'type': 'leaf', 'size': len(data)}
        
        # Random feature and split
        n_features = len(data[0]) if data else 0
        if n_features == 0:
            return {'type': 'leaf', 'size': len(data)}
        
        feature_idx = random.randint(0, n_features - 1)
        values = [d[feature_idx] for d in data]
        min_val, max_val = min(values), max(values)
        
        if min_val == max_val:
            return {'type': 'leaf', 'size': len(data)}
        
        split_val = random.uniform(min_val, max_val)
        
        left_data = [d for d in data if d[feature_idx] < split_val]
        right_data = [d for d in data if d[feature_idx] >= split_val]
        
        return {
            'type': 'node',
            'feature': feature_idx,
            'split': split_val,
            'left': self._build_tree(left_data, height + 1, max_height),
            'right': self._build_tree(right_data, height + 1, max_height)
        }
    
    def fit(self, data: List[List[float]], n_trees: int = 100):
        """Train the anomaly detector"""
        self.trees = []
        sample_size = min(256, len(data))
        
        for _ in range(n_trees):
            sample = random.sample(data, min(sample_size, len(data)))
            tree = self._build_tree(sample)
            self.trees.append(tree)
        
        # Calculate threshold based on contamination
        scores = [self.score(d) for d in data]
        scores.sort(reverse=True)
        threshold_idx = int(len(scores) * self.contamination)
        self.threshold = scores[threshold_idx] if threshold_idx < len(scores) else 0.5
        
        self.trained = True
    
    def _path_length(self, point: List[float], tree: Dict, depth: int = 0) -> float:
        """Calculate path length to isolate point"""
        if tree['type'] == 'leaf':
            # Adjustment for unbuilt subtree
            n = tree['size']
            if n <= 1:
                return depth
            c = 2 * (math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n
            return depth + c
        
        if point[tree['feature']] < tree['split']:
            return self._path_length(point, tree['left'], depth + 1)
        else:
            return self._path_length(point, tree['right'], depth + 1)
    
    def score(self, point: List[float]) -> float:
        """Calculate anomaly score (higher = more anomalous)"""
        if not self.trees:
            return 0.5
        
        avg_path = sum(self._path_length(point, tree) for tree in self.trees) / len(self.trees)
        
        # Normalize score
        n = 256  # Sample size
        c = 2 * (math.log(n - 1) + 0.5772156649) - 2 * (n - 1) / n
        score = 2 ** (-avg_path / c)
        
        return score
    
    def predict(self, point: List[float]) -> bool:
        """Predict if point is anomaly"""
        return self.score(point) > self.threshold


class ThreatClassifier:
    """Rule-based threat classification with ML enhancement"""
    
    THREAT_TYPES = {
        'PORT_SCAN': {'severity': 'MEDIUM', 'description': 'Port scanning detected'},
        'BRUTE_FORCE': {'severity': 'HIGH', 'description': 'Brute force attack detected'},
        'DOS_ATTACK': {'severity': 'CRITICAL', 'description': 'Denial of service attack'},
        'DATA_EXFIL': {'severity': 'CRITICAL', 'description': 'Data exfiltration attempt'},
        'MALWARE_C2': {'severity': 'CRITICAL', 'description': 'Malware C2 communication'},
        'SQL_INJECTION': {'severity': 'HIGH', 'description': 'SQL injection attempt'},
        'XSS_ATTACK': {'severity': 'MEDIUM', 'description': 'Cross-site scripting attack'},
        'LATERAL_MOVEMENT': {'severity': 'HIGH', 'description': 'Lateral movement detected'},
        'PRIVILEGE_ESCALATION': {'severity': 'CRITICAL', 'description': 'Privilege escalation attempt'},
        'ZERO_DAY': {'severity': 'CRITICAL', 'description': 'Potential zero-day exploit'},
    }
    
    def __init__(self):
        self.patterns = self._load_patterns()
        self.ip_reputation = {}
        self.domain_reputation = {}
    
    def _load_patterns(self) -> Dict:
        """Load threat detection patterns"""
        return {
            'port_scan': {
                'unique_ports_threshold': 20,
                'time_window': 60,
            },
            'brute_force': {
                'failed_logins_threshold': 5,
                'time_window': 300,
            },
            'dos': {
                'requests_threshold': 1000,
                'time_window': 60,
            },
            'c2_ports': [4444, 5555, 6666, 31337, 12345, 8080, 443],
            'suspicious_domains': ['evil.com', 'malware.net', 'c2server.io'],
        }
    
    def classify(self, features: List[float], events: List[Dict]) -> Optional[Dict]:
        """Classify threat based on features and events"""
        threats = []
        
        # Check for port scan
        if len(events) > 5:
            unique_ports = len(set(e.get('dst_port', 0) for e in events))
            if unique_ports > self.patterns['port_scan']['unique_ports_threshold']:
                threats.append({
                    'type': 'PORT_SCAN',
                    **self.THREAT_TYPES['PORT_SCAN'],
                    'confidence': min(unique_ports / 50, 1.0)
                })
        
        # Check for brute force
        failed_logins = sum(1 for e in events if e.get('event_type') == 'LOGIN_FAILED')
        if failed_logins >= self.patterns['brute_force']['failed_logins_threshold']:
            threats.append({
                'type': 'BRUTE_FORCE',
                **self.THREAT_TYPES['BRUTE_FORCE'],
                'confidence': min(failed_logins / 20, 1.0)
            })
        
        # Check for DoS
        if len(events) > self.patterns['dos']['requests_threshold']:
            threats.append({
                'type': 'DOS_ATTACK',
                **self.THREAT_TYPES['DOS_ATTACK'],
                'confidence': min(len(events) / 2000, 1.0)
            })
        
        # Check for C2 communication
        c2_connections = sum(1 for e in events if e.get('dst_port') in self.patterns['c2_ports'])
        if c2_connections > 0:
            threats.append({
                'type': 'MALWARE_C2',
                **self.THREAT_TYPES['MALWARE_C2'],
                'confidence': min(c2_connections / 5, 1.0)
            })
        
        # Check for data exfiltration (large outbound)
        large_outbound = sum(1 for e in events 
                           if e.get('direction') == 'outbound' 
                           and e.get('packet_size', 0) > 10000)
        if large_outbound > 10:
            threats.append({
                'type': 'DATA_EXFIL',
                **self.THREAT_TYPES['DATA_EXFIL'],
                'confidence': min(large_outbound / 50, 1.0)
            })
        
        # ML-based zero-day detection (high anomaly, no matching pattern)
        if features and len(threats) == 0:
            # If highly anomalous but no known pattern matched
            anomaly_score = sum(features) / len(features)
            if anomaly_score > 0.7:
                threats.append({
                    'type': 'ZERO_DAY',
                    **self.THREAT_TYPES['ZERO_DAY'],
                    'confidence': anomaly_score
                })
        
        return threats if threats else None


class BehaviorAnalyzer:
    """Analyze user and entity behavior for anomalies"""
    
    def __init__(self):
        self.user_profiles = defaultdict(lambda: {
            'login_times': [],
            'accessed_resources': set(),
            'ip_addresses': set(),
            'commands': [],
            'data_volume': [],
        })
        self.baseline_period = 7 * 24 * 3600  # 7 days
    
    def update_profile(self, user_id: str, event: Dict):
        """Update user behavior profile"""
        profile = self.user_profiles[user_id]
        
        event_type = event.get('event_type', '')
        timestamp = event.get('timestamp', time.time())
        
        if event_type == 'LOGIN':
            profile['login_times'].append(timestamp)
            profile['ip_addresses'].add(event.get('src_ip', ''))
        
        if event_type == 'RESOURCE_ACCESS':
            profile['accessed_resources'].add(event.get('resource', ''))
        
        if event_type == 'COMMAND':
            profile['commands'].append(event.get('command', ''))
        
        if 'data_size' in event:
            profile['data_volume'].append(event['data_size'])
    
    def detect_anomalies(self, user_id: str, event: Dict) -> List[Dict]:
        """Detect behavioral anomalies"""
        anomalies = []
        profile = self.user_profiles[user_id]
        
        # Check for unusual login time
        if event.get('event_type') == 'LOGIN':
            hour = datetime.now().hour
            if profile['login_times']:
                usual_hours = [datetime.fromtimestamp(t).hour for t in profile['login_times'][-30:]]
                if usual_hours and hour not in usual_hours:
                    anomalies.append({
                        'type': 'UNUSUAL_LOGIN_TIME',
                        'severity': 'MEDIUM',
                        'description': f'Login at unusual hour: {hour}:00'
                    })
        
        # Check for new IP address
        src_ip = event.get('src_ip', '')
        if src_ip and src_ip not in profile['ip_addresses'] and len(profile['ip_addresses']) > 0:
            anomalies.append({
                'type': 'NEW_IP_ADDRESS',
                'severity': 'LOW',
                'description': f'Login from new IP: {src_ip}'
            })
        
        # Check for unusual data volume
        if 'data_size' in event and profile['data_volume']:
            avg_volume = statistics.mean(profile['data_volume'])
            if event['data_size'] > avg_volume * 5:
                anomalies.append({
                    'type': 'UNUSUAL_DATA_VOLUME',
                    'severity': 'HIGH',
                    'description': f'Data transfer {event["data_size"]/1024:.1f}KB (avg: {avg_volume/1024:.1f}KB)'
                })
        
        # Check for sensitive command execution
        sensitive_commands = ['passwd', 'sudo', 'chmod 777', 'rm -rf', 'nc -e', 'wget', 'curl']
        if event.get('command'):
            for cmd in sensitive_commands:
                if cmd in event['command'].lower():
                    anomalies.append({
                        'type': 'SENSITIVE_COMMAND',
                        'severity': 'HIGH',
                        'description': f'Sensitive command executed: {event["command"][:50]}'
                    })
                    break
        
        return anomalies


class ThreatIntelligence:
    """Threat intelligence integration"""
    
    def __init__(self):
        # Simulated threat intelligence feeds
        self.malicious_ips = set([
            '192.168.1.100', '10.0.0.50', '172.16.0.99',
        ])
        self.malicious_domains = set([
            'evil.com', 'malware.net', 'badsite.org',
        ])
        self.malicious_hashes = set([
            'd41d8cd98f00b204e9800998ecf8427e',  # Example
        ])
        self.ioc_database = {}
    
    def check_ip(self, ip: str) -> Optional[Dict]:
        """Check IP against threat intelligence"""
        if ip in self.malicious_ips:
            return {
                'indicator': ip,
                'type': 'IP',
                'threat_type': 'Known Malicious IP',
                'confidence': 0.95,
                'source': 'SHIELD Threat Intel'
            }
        return None
    
    def check_domain(self, domain: str) -> Optional[Dict]:
        """Check domain against threat intelligence"""
        if domain in self.malicious_domains:
            return {
                'indicator': domain,
                'type': 'DOMAIN',
                'threat_type': 'Known Malicious Domain',
                'confidence': 0.95,
                'source': 'SHIELD Threat Intel'
            }
        return None
    
    def check_hash(self, file_hash: str) -> Optional[Dict]:
        """Check file hash against threat intelligence"""
        if file_hash.lower() in self.malicious_hashes:
            return {
                'indicator': file_hash,
                'type': 'HASH',
                'threat_type': 'Known Malware',
                'confidence': 0.99,
                'source': 'SHIELD Threat Intel'
            }
        return None
    
    def add_ioc(self, indicator: str, ioc_type: str, threat_info: Dict):
        """Add indicator of compromise"""
        self.ioc_database[indicator] = {
            'type': ioc_type,
            **threat_info,
            'added': datetime.now().isoformat()
        }


class AIThreatDetector:
    """Main AI Threat Detection Engine"""
    
    def __init__(self):
        self.feature_extractor = FeatureExtractor()
        self.anomaly_detector = AnomalyDetector(contamination=0.1)
        self.threat_classifier = ThreatClassifier()
        self.behavior_analyzer = BehaviorAnalyzer()
        self.threat_intel = ThreatIntelligence()
        
        self.event_buffer = deque(maxlen=10000)
        self.alerts = []
        self.is_trained = False
    
    def print_banner(self):
        print("""
+==============================================================+
|     SHIELD AI THREAT DETECTION ENGINE v1.0                   |
|          Machine Learning Powered Security                   |
|     Real-time Anomaly Detection & Threat Classification      |
+==============================================================+
        """)
    
    def train(self, training_data: List[Dict] = None):
        """Train the ML models"""
        print("\n  [*] Training AI models...")
        
        if training_data is None:
            # Generate synthetic training data
            training_data = self._generate_training_data()
        
        # Extract features
        features = []
        for event in training_data:
            f = self.feature_extractor.extract_network_features(event)
            features.append(f)
        
        # Train anomaly detector
        self.anomaly_detector.fit(features)
        self.is_trained = True
        
        print(f"  [+] Trained on {len(features)} samples")
        print(f"  [+] Anomaly threshold: {self.anomaly_detector.threshold:.4f}")
    
    def _generate_training_data(self, n_samples: int = 1000) -> List[Dict]:
        """Generate synthetic training data"""
        data = []
        
        for i in range(n_samples):
            is_malicious = random.random() < 0.1  # 10% malicious
            
            event = {
                'timestamp': time.time() - random.randint(0, 86400),
                'src_ip': f"192.168.1.{random.randint(1, 254)}",
                'dst_ip': f"10.0.0.{random.randint(1, 254)}" if not is_malicious else f"evil.{random.randint(1,100)}.com",
                'src_port': random.randint(1024, 65535),
                'dst_port': random.choice([80, 443, 22, 21]) if not is_malicious else random.choice([4444, 5555, 31337]),
                'protocol': 'TCP',
                'packet_size': random.randint(64, 1500) if not is_malicious else random.randint(1000, 65535),
                'flags': ['SYN', 'ACK'] if not is_malicious else ['SYN'],
                'is_malicious': is_malicious
            }
            data.append(event)
        
        return data
    
    def analyze_event(self, event: Dict) -> Dict:
        """Analyze a single event for threats"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'event': event,
            'is_anomaly': False,
            'anomaly_score': 0.0,
            'threats': [],
            'ioc_matches': [],
            'behavior_anomalies': []
        }
        
        # Add to buffer
        self.event_buffer.append(event)
        
        # Check threat intelligence
        if event.get('src_ip'):
            ioc = self.threat_intel.check_ip(event['src_ip'])
            if ioc:
                result['ioc_matches'].append(ioc)
        
        if event.get('domain'):
            ioc = self.threat_intel.check_domain(event['domain'])
            if ioc:
                result['ioc_matches'].append(ioc)
        
        # Extract features and detect anomaly
        features = self.feature_extractor.extract_network_features(event)
        
        if self.is_trained:
            result['anomaly_score'] = self.anomaly_detector.score(features)
            result['is_anomaly'] = self.anomaly_detector.predict(features)
        
        # Classify threats
        recent_events = list(self.event_buffer)[-100:]
        threats = self.threat_classifier.classify(features, recent_events)
        if threats:
            result['threats'] = threats
        
        # Behavior analysis
        if event.get('user_id'):
            self.behavior_analyzer.update_profile(event['user_id'], event)
            behavior_anomalies = self.behavior_analyzer.detect_anomalies(event['user_id'], event)
            result['behavior_anomalies'] = behavior_anomalies
        
        # Generate alert if needed
        if result['is_anomaly'] or result['threats'] or result['ioc_matches']:
            self._generate_alert(result)
        
        return result
    
    def _generate_alert(self, analysis: Dict):
        """Generate security alert"""
        severity = 'LOW'
        
        if analysis['ioc_matches']:
            severity = 'CRITICAL'
        elif analysis['threats']:
            max_sev = max(t.get('severity', 'LOW') for t in analysis['threats'])
            severity = max_sev
        elif analysis['is_anomaly']:
            severity = 'MEDIUM' if analysis['anomaly_score'] > 0.7 else 'LOW'
        
        alert = {
            'id': hashlib.md5(str(time.time()).encode()).hexdigest()[:8],
            'timestamp': datetime.now().isoformat(),
            'severity': severity,
            'analysis': analysis,
            'status': 'NEW'
        }
        
        self.alerts.append(alert)
        return alert
    
    def get_statistics(self) -> Dict:
        """Get detection statistics"""
        return {
            'total_events': len(self.event_buffer),
            'total_alerts': len(self.alerts),
            'alerts_by_severity': {
                'CRITICAL': sum(1 for a in self.alerts if a['severity'] == 'CRITICAL'),
                'HIGH': sum(1 for a in self.alerts if a['severity'] == 'HIGH'),
                'MEDIUM': sum(1 for a in self.alerts if a['severity'] == 'MEDIUM'),
                'LOW': sum(1 for a in self.alerts if a['severity'] == 'LOW'),
            },
            'is_trained': self.is_trained,
            'anomaly_threshold': self.anomaly_detector.threshold if self.is_trained else None
        }
    
    def run_demo(self):
        """Run demonstration"""
        self.print_banner()
        
        # Train models
        self.train()
        
        print("\n  === REAL-TIME THREAT DETECTION ===")
        
        # Simulate events
        test_events = [
            # Normal traffic
            {'src_ip': '192.168.1.10', 'dst_port': 80, 'protocol': 'TCP', 'packet_size': 500, 'flags': ['SYN', 'ACK']},
            {'src_ip': '192.168.1.11', 'dst_port': 443, 'protocol': 'TCP', 'packet_size': 1200, 'flags': ['ACK']},
            
            # Suspicious - C2 port
            {'src_ip': '192.168.1.50', 'dst_port': 4444, 'protocol': 'TCP', 'packet_size': 64, 'flags': ['SYN']},
            
            # Port scan
            *[{'src_ip': '10.0.0.99', 'dst_port': p, 'protocol': 'TCP', 'packet_size': 40, 'flags': ['SYN']} 
              for p in range(20, 100)],
            
            # Known malicious IP
            {'src_ip': '192.168.1.100', 'dst_port': 443, 'protocol': 'TCP', 'packet_size': 1000},
            
            # Large data exfiltration
            {'src_ip': '192.168.1.20', 'dst_port': 443, 'protocol': 'TCP', 'packet_size': 50000, 
             'direction': 'outbound'},
        ]
        
        for i, event in enumerate(test_events):
            event['timestamp'] = time.time()
            result = self.analyze_event(event)
            
            if result['is_anomaly'] or result['threats'] or result['ioc_matches']:
                print(f"\n    [ALERT] Event {i+1}:")
                print(f"      Anomaly Score: {result['anomaly_score']:.4f}")
                if result['threats']:
                    for t in result['threats']:
                        print(f"      Threat: {t['type']} ({t['severity']}) - Confidence: {t['confidence']:.2f}")
                if result['ioc_matches']:
                    for ioc in result['ioc_matches']:
                        print(f"      IOC Match: {ioc['indicator']} - {ioc['threat_type']}")
        
        # Print summary
        stats = self.get_statistics()
        print("\n" + "="*60)
        print("                 DETECTION SUMMARY")
        print("="*60)
        print(f"\n  Total Events Analyzed: {stats['total_events']}")
        print(f"  Total Alerts Generated: {stats['total_alerts']}")
        print(f"\n  Alerts by Severity:")
        for sev, count in stats['alerts_by_severity'].items():
            if count > 0:
                print(f"    - {sev}: {count}")
        print("\n" + "="*60)


def main():
    detector = AIThreatDetector()
    detector.run_demo()


if __name__ == "__main__":
    main()
