import subprocess
from datetime import datetime
from typing import List, Dict
from collections import defaultdict
from app.utils.helpers import get_country_from_ip, get_service

# ==================== Threat Detection ====================
def analyze_packet(packet: Dict) -> Dict:
    """Analyze packet for security threats"""
    alerts = []
    severity = "Moyen"
    
    dst_port = packet.get("dst_port", 0)
    src_port = packet.get("src_port", 0)
    
    # Check for suspicious ports
    suspicious_ports = [4444, 5555, 6666, 31337, 12345, 65535]
    if dst_port in suspicious_ports or src_port in suspicious_ports:
        alerts.append("Port suspect détecté")
        severity = "Critique"
    
    # Check for common attack patterns
    if dst_port == 22:
        alerts.append("Tentative SSH détectée")
        severity = "Élevé"
    elif dst_port in [3389]:
        alerts.append("Accès RDP détecté")
        severity = "Élevé"
    elif dst_port in [445, 139]:
        alerts.append("Trafic SMB détecté")
        severity = "Élevé"
    
    # Check for plaintext protocols
    if dst_port in [21, 23, 25, 80, 110]:
        alerts.append("Protocole non-chiffré")
        severity = "Moyen"
    
    return {
        "alerts": alerts,
        "severity": severity,
        "is_suspicious": len(alerts) > 0
    }

def detect_ddos(packets: List[Dict], threshold: int = 50) -> Dict:
    """Detect potential DDoS attacks"""
    ip_counts = defaultdict(int)
    
    for pkt in packets[-1000:]:  # Check last 1000 packets
        ip_counts[pkt.get("src_ip", "")] += 1
    
    attackers = []
    for ip, count in ip_counts.items():
        if count > threshold:
            attackers.append({
                "ip": ip,
                "count": count,
                "country": get_country_from_ip(ip)
            })
    
    return {
        "detected": len(attackers) > 0,
        "attackers": attackers,
        "severity": "Critique" if len(attackers) > 0 else "Normal"
    }

# ==================== Network Scanner ====================
def scan_network_connections():
    """Scan current network connections using psutil (cross-platform, reliable)"""
    import psutil
    try:
        connections = []
        conns = psutil.net_connections(kind='inet')
        for conn in conns:
            if conn.status in ['ESTABLISHED', 'TIME_WAIT', 'SYN_SENT', 'SYN_RECV']:
                try:
                    local_ip, local_port = conn.laddr
                    remote_ip = None
                    remote_port = 0
                    if conn.raddr:
                        remote_ip, remote_port = conn.raddr
                    
                    if not remote_ip:
                        continue
                        
                    connections.append({
                        "timestamp": datetime.now().isoformat(),
                        "src_ip": local_ip,
                        "src_port": int(local_port),
                        "dst_ip": remote_ip,
                        "dst_port": int(remote_port),
                        "state": conn.status,
                        "service": get_service(int(remote_port)),
                        "country": get_country_from_ip(remote_ip)
                    })
                except Exception:
                    pass
        return connections
    except Exception as e:
        print(f"Error scanning with psutil: {e}")
        return []

