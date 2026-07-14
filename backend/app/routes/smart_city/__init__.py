from fastapi import APIRouter

router = APIRouter(prefix="/api/smart-city", tags=["smart-city"])

CITY_ZONES = [
    {"id": "zone-downtown", "name": "Downtown Core", "type": "commercial", "sensors": 45, "status": "active", "risk": "medium"},
    {"id": "zone-res-01", "name": "Riverside Residential", "type": "residential", "sensors": 28, "status": "active", "risk": "low"},
    {"id": "zone-ind-01", "name": "Industrial Park Alpha", "type": "industrial", "sensors": 62, "status": "active", "risk": "high"},
    {"id": "zone-ind-02", "name": "Industrial Park Beta", "type": "industrial", "sensors": 55, "status": "warning", "risk": "high"},
    {"id": "zone-water", "name": "Water Treatment Plant", "type": "critical_infrastructure", "sensors": 38, "status": "active", "risk": "critical"},
    {"id": "zone-power", "name": "Power Grid Substation", "type": "critical_infrastructure", "sensors": 42, "status": "active", "risk": "critical"},
    {"id": "zone-transport", "name": "Transportation Hub", "type": "transport", "sensors": 33, "status": "active", "risk": "medium"},
    {"id": "zone-airport", "name": "International Airport", "type": "transport", "sensors": 91, "status": "active", "risk": "high"},
]

SENSORS = [
    {"id": "SENS-TRAF-001", "type": "traffic", "zone": "zone-downtown", "status": "online", "reading": {"vehicles_per_min": 142, "avg_speed_kmh": 35, "congestion_level": 0.7}},
    {"id": "SENS-TRAF-002", "type": "traffic", "zone": "zone-transport", "status": "online", "reading": {"vehicles_per_min": 89, "avg_speed_kmh": 55, "congestion_level": 0.3}},
    {"id": "SENS-WATER-001", "type": "water", "zone": "zone-water", "status": "online", "reading": {"flow_rate_lps": 250, "pressure_bar": 4.2, "chlorine_ppm": 0.8, "ph": 7.2}},
    {"id": "SENS-WATER-002", "type": "water", "zone": "zone-water", "status": "alert", "reading": {"flow_rate_lps": 315, "pressure_bar": 2.1, "chlorine_ppm": 0.3, "ph": 7.8, "alert": "Pressure drop detected - possible leak"}},
    {"id": "SENS-POWER-001", "type": "power", "zone": "zone-power", "status": "online", "reading": {"voltage_kv": 110, "current_a": 450, "load_mw": 49.5, "frequency_hz": 50.02}},
    {"id": "SENS-POWER-002", "type": "power", "zone": "zone-power", "status": "online", "reading": {"voltage_kv": 110, "current_a": 520, "load_mw": 57.2, "frequency_hz": 49.98}},
    {"id": "SENS-ENV-001", "type": "environmental", "zone": "zone-downtown", "status": "online", "reading": {"aqi": 65, "temperature_c": 28, "humidity": 55, "noise_db": 72}},
    {"id": "SENS-ENV-002", "type": "environmental", "zone": "zone-res-01", "status": "online", "reading": {"aqi": 32, "temperature_c": 26, "humidity": 60, "noise_db": 45}},
    {"id": "SENS-CAM-001", "type": "surveillance", "zone": "zone-airport", "status": "online", "reading": {"people_count": 2340, "vehicles_count": 187, "anomalies": 0}},
    {"id": "SENS-CAM-002", "type": "surveillance", "zone": "zone-downtown", "status": "online", "reading": {"people_count": 890, "vehicles_count": 320, "anomalies": 1, "anomaly_type": "Suspicious package detected"}},
]

INCIDENTS = [
    {"id": "INC-001", "zone": "zone-water", "type": "cyber_attack", "severity": "critical", "title": "SCADA Water System Intrusion Attempt", "timestamp": "2026-06-30T10:23:00Z", "status": "investigating", "description": "Unauthorized access attempt detected on water treatment PLC controllers via Modbus/TCP from external IP"},
    {"id": "INC-002", "zone": "zone-power", "type": "cyber_attack", "severity": "high", "title": "Smart Grid Meter Tampering", "timestamp": "2026-06-30T08:15:00Z", "status": "contained", "description": "Multiple smart meters reporting manipulated consumption data - possible firmware compromise"},
    {"id": "INC-003", "zone": "zone-ind-01", "type": "physical", "severity": "medium", "title": "Unauthorized Drone Overflight", "timestamp": "2026-06-30T07:00:00Z", "status": "resolved", "description": "Unauthorized drone detected near chemical storage facility"},
    {"id": "INC-004", "zone": "zone-airport", "type": "cyber_attack", "severity": "critical", "title": "Airport Departure Board Defacement", "timestamp": "2026-06-30T06:45:00Z", "status": "resolved", "description": "Flight information display systems compromised showing false departure times"},
    {"id": "INC-005", "zone": "zone-downtown", "type": "iot", "severity": "low", "title": "Traffic Light Timing Anomaly", "timestamp": "2026-06-30T05:30:00Z", "status": "resolved", "description": "Intersection traffic lights cycling abnormally - possible firmware glitch"},
]

THREATS = [
    {"id": "THR-001", "zone": "zone-water", "type": "APT", "likelihood": "high", "impact": "catastrophic", "description": "State-sponsored APT targeting water treatment facilities", "mitre_technique": "T0823 - Industrial Control System Scan"},
    {"id": "THR-002", "zone": "zone-power", "type": "ransomware", "likelihood": "medium", "impact": "critical", "description": "Ransomware targeting smart grid infrastructure", "mitre_technique": "T1486 - Data Encrypted for Impact"},
    {"id": "THR-003", "zone": "zone-transport", "type": "mitm", "likelihood": "high", "impact": "high", "description": "Man-in-the-middle attacks on traffic management system", "mitre_technique": "T1557 - Adversary-in-the-Middle"},
]

@router.get("/status")
def get_status():
    zones_active = sum(1 for z in CITY_ZONES if z["status"] == "active")
    return {"city": "Bouclier Smart City v1.0", "zones_total": len(CITY_ZONES), "zones_active": zones_active, "sensors_total": len(SENSORS), "active_incidents": sum(1 for i in INCIDENTS if i["status"] == "investigating")}

@router.get("/zones")
def get_zones():
    return {"zones": CITY_ZONES, "total": len(CITY_ZONES)}

@router.get("/zone/{zone_id}")
def get_zone(zone_id: str):
    for z in CITY_ZONES:
        if z["id"] == zone_id:
            zone_sensors = [s for s in SENSORS if s["zone"] == zone_id]
            zone_incidents = [i for i in INCIDENTS if i["zone"] == zone_id]
            return {"zone": z, "sensors": zone_sensors, "incidents": zone_incidents}
    return {"error": "Zone not found"}

@router.get("/sensors")
def get_sensors():
    online = sum(1 for s in SENSORS if s["status"] == "online")
    alert = sum(1 for s in SENSORS if s["status"] == "alert")
    return {"sensors": SENSORS, "total": len(SENSORS), "online": online, "alert": alert}

@router.get("/incidents")
def get_incidents():
    return {"incidents": INCIDENTS, "total": len(INCIDENTS)}

@router.post("/simulate/{scenario}")
def simulate_scenario(scenario: str):
    scenarios = {
        "water_contamination": {"name": "Water Contamination Attack", "status": "simulating", "steps": ["Compromise SCADA HMI", "Modify chemical dosing parameters", "Disable alarm thresholds", "Inject malicious PLC code"], "estimated_duration_seconds": 120},
        "grid_blackout": {"name": "Smart Grid Blackout", "status": "simulating", "steps": ["Exploit meter firmware", "Send disconnect commands", "Disable reclosers", "Trigger cascade failure"], "estimated_duration_seconds": 90},
        "traffic_gridlock": {"name": "Traffic Gridlock", "status": "simulating", "steps": ["Access traffic controller", "Override signal timing", "Set all intersections to green conflict", "Lock out legitimate operators"], "estimated_duration_seconds": 60},
        "ransomware_city": {"name": "City-Wide Ransomware", "status": "simulating", "steps": ["Phish city employee", "Deploy ransomware via SCADA VPN", "Encrypt critical databases", "Display ransom note on public displays"], "estimated_duration_seconds": 180},
    }
    if scenario in scenarios:
        return {"success": True, "scenario": scenarios[scenario]}
    return {"error": f"Unknown scenario: {scenario}. Available: {list(scenarios.keys())}"}

@router.get("/threats")
def get_threats():
    return {"threats": THREATS, "total": len(THREATS)}
