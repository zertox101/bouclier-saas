import socket
from app.services.geoip import get_geoip_cached, is_public_ip

def get_country_from_ip(ip: str) -> str:
    if not ip:
        return "UNKNOWN"
    if not is_public_ip(ip):
        return "LOCAL"
    geo = get_geoip_cached(ip)
    if geo and isinstance(geo, dict):
        country = geo.get("country") or {}
        code = country.get("iso_code")
        if code:
            return code
    return "UNKNOWN"

# ==================== Port to Service Mapping ====================
SERVICE_MAP = {
    21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
    53: "DNS", 80: "HTTP", 110: "POP3", 143: "IMAP",
    443: "HTTPS", 445: "SMB", 3306: "MySQL", 3389: "RDP",
    5432: "PostgreSQL", 8080: "HTTP-Proxy", 8443: "HTTPS-Alt"
}

def get_service(port: int) -> str:
    return SERVICE_MAP.get(port, "Unknown")

def get_country_name(code: str) -> str:
    names = {
        "FR": "France", "US": "États-Unis", "DE": "Allemagne",
        "RU": "Russie", "CN": "Chine", "JP": "Japon",
        "UK": "Royaume-Uni", "LOCAL": "Local", "UNKNOWN": "Inconnu"
    }
    return names.get(code, code)

def get_tone(count: int) -> str:
    if count > 100:
        return "critical"
    elif count > 50:
        return "high"
    else:
        return "medium"
