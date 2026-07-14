from fastapi import APIRouter

router = APIRouter(prefix="/api/iot-security", tags=["iot-security"])

IOT_DEVICES = [
    {"id": "CAM-001", "type": "ip_camera", "brand": "Hikvision", "model": "DS-2CD2042WD-I", "ip": "192.168.1.101", "mac": "AA:BB:CC:11:22:01", "firmware": "V5.5.0", "firmware_outdated": True, "port_open": [80, 554, 8000], "vulnerabilities": ["CVE-2021-36260", "CVE-2017-7921"], "risk": "critical", "last_seen": "2026-06-30T12:30:00Z"},
    {"id": "CAM-002", "type": "ip_camera", "brand": "Dahua", "model": "DH-IPC-HFW1230S", "ip": "192.168.1.102", "mac": "AA:BB:CC:11:22:02", "firmware": "V2.800.0000000.0", "firmware_outdated": True, "port_open": [80, 554, 37777], "vulnerabilities": ["CVE-2020-9498", "CVE-2022-30563"], "risk": "critical", "last_seen": "2026-06-30T12:28:00Z"},
    {"id": "PLUG-001", "type": "smart_plug", "brand": "TP-Link", "model": "HS110", "ip": "192.168.1.201", "mac": "AA:BB:CC:11:22:03", "firmware": "V1.0.1", "firmware_outdated": True, "port_open": [80, 9999], "vulnerabilities": ["CVE-2021-27102", "CVE-2021-27103"], "risk": "high", "last_seen": "2026-06-30T12:25:00Z"},
    {"id": "THERM-001", "type": "thermostat", "brand": "Nest", "model": "T3007ES", "ip": "192.168.1.202", "mac": "AA:BB:CC:11:22:04", "firmware": "V6.2.1", "firmware_outdated": False, "port_open": [443], "vulnerabilities": [], "risk": "low", "last_seen": "2026-06-30T12:29:00Z"},
    {"id": "DRONE-001", "type": "drone", "brand": "DJI", "model": "Mavic 3", "ip": "192.168.1.251", "mac": "AA:BB:CC:11:22:05", "firmware": "V01.00.0600", "firmware_outdated": False, "port_open": [21, 80], "vulnerabilities": ["CVE-2023-35774"], "risk": "medium", "last_seen": "2026-06-30T11:00:00Z"},
    {"id": "BELL-001", "type": "doorbell", "brand": "Ring", "model": "Video Doorbell Pro 2", "ip": "192.168.1.203", "mac": "AA:BB:CC:11:22:06", "firmware": "V1.2.3", "firmware_outdated": True, "port_open": [443, 8443], "vulnerabilities": ["CVE-2022-22947"], "risk": "medium", "last_seen": "2026-06-30T10:55:00Z"},
    {"id": "LIGHT-001", "type": "smart_light", "brand": "Philips", "model": "Hue White v2", "ip": "192.168.1.204", "mac": "AA:BB:CC:11:22:07", "firmware": "V1.65.2", "firmware_outdated": False, "port_open": [80], "vulnerabilities": ["CVE-2020-6007"], "risk": "low", "last_seen": "2026-06-30T12:20:00Z"},
    {"id": "GATE-001", "type": "iot_gateway", "brand": "Siemens", "model": "Scalance M-800", "ip": "192.168.1.1", "mac": "AA:BB:CC:11:22:00", "firmware": "V2.0", "firmware_outdated": True, "port_open": [22, 80, 443, 161, 502], "vulnerabilities": ["CVE-2022-37460", "CVE-2021-37221", "CVE-2020-15783"], "risk": "critical", "last_seen": "2026-06-30T12:30:00Z"},
]

SUSPICIOUS_TRAFFIC = [
    {"timestamp": "2026-06-30T12:29:00", "source": "CAM-001", "destination": "185.220.101.45", "protocol": "SSH", "port": 22, "alert": "Outbound SSH to known Tor exit node", "severity": "high"},
    {"timestamp": "2026-06-30T12:28:30", "source": "PLUG-001", "destination": "51.75.145.123", "protocol": "TCP", "port": 8888, "alert": "Connection to known C2 server", "severity": "critical"},
    {"timestamp": "2026-06-30T12:25:00", "source": "GATE-001", "destination": "10.0.0.50", "protocol": "Modbus", "port": 502, "alert": "Unauthorized Modbus query from IoT gateway to PLC", "severity": "high"},
    {"timestamp": "2026-06-30T12:20:00", "source": "CAM-002", "destination": "23.22.44.12", "protocol": "DNS", "port": 53, "alert": "DNS query to known DGA domain", "severity": "medium"},
]

IOT_VULNS = [
    {"id": "CVE-2021-36260", "device_type": "Hikvision Camera", "severity": "critical", "description": "Command injection via web server", "exploit_available": True, "metasploit": True},
    {"id": "CVE-2017-7921", "device_type": "Hikvision Camera", "severity": "critical", "description": "Improper authentication - direct RTSP stream access", "exploit_available": True, "metasploit": False},
    {"id": "CVE-2020-9498", "device_type": "Dahua Camera", "severity": "critical", "description": "Unauthenticated RCE via /Language/DownloadLanguage", "exploit_available": True, "metasploit": True},
    {"id": "CVE-2021-27102", "device_type": "TP-Link Smart Plug", "severity": "high", "description": "Unauthenticated command injection", "exploit_available": True, "metasploit": False},
    {"id": "CVE-2022-37460", "device_type": "Siemens Scalance", "severity": "critical", "description": "Stack buffer overflow in SNMP service", "exploit_available": False, "metasploit": False},
    {"id": "CVE-2020-15783", "device_type": "Siemens Scalance", "severity": "critical", "description": "Hardcoded credentials in firmware", "exploit_available": True, "metasploit": False},
    {"id": "CVE-2021-37221", "device_type": "Siemens Scalance", "severity": "high", "description": "Authentication bypass via path traversal", "exploit_available": True, "metasploit": False},
]

@router.get("/status")
def get_status():
    critical = sum(1 for d in IOT_DEVICES if d["risk"] == "critical")
    high = sum(1 for d in IOT_DEVICES if d["risk"] == "high")
    medium = sum(1 for d in IOT_DEVICES if d["risk"] == "medium")
    low = sum(1 for d in IOT_DEVICES if d["risk"] == "low")
    return {"status": "monitoring", "devices_monitored": len(IOT_DEVICES), "findings": {"critical": critical, "high": high, "medium": medium, "low": low}, "suspicious_connections": len(SUSPICIOUS_TRAFFIC)}

@router.get("/devices")
def get_devices():
    return {"devices": IOT_DEVICES, "total": len(IOT_DEVICES)}

@router.get("/device/{device_id}")
def get_device(device_id: str):
    for d in IOT_DEVICES:
        if d["id"] == device_id.upper():
            return d
    return {"error": "Device not found"}

@router.get("/vulnerabilities")
def get_vulnerabilities():
    return {"vulnerabilities": IOT_VULNS, "total": len(IOT_VULNS)}

@router.get("/traffic")
def get_traffic():
    return {"traffic": SUSPICIOUS_TRAFFIC, "total": len(SUSPICIOUS_TRAFFIC)}

@router.post("/scan")
def scan_network():
    import time
    return {"job_id": f"iot-scan-{int(time.time())}", "status": "started", "devices_discovered_so_far": len(IOT_DEVICES)}
