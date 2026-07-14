from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/threat-intel", tags=["threat-intel"])

IOC_TYPES = ["IP", "Domain", "URL", "Hash", "Email"]
SEVERITIES = ["critical", "high", "medium", "low"]
TTP_TAGS = [
    "TA0001_Initial Access", "TA0002_Execution", "TA0003_Persistence",
    "TA0004_PrivilegeEscalation", "TA0008_LateralMovement",
    "TA0011_Command&Control", "TA0040_Impact", "T1566_Phishing",
    "T1059_CommandScripting", "T1071_AppLayerProtocol",
    "T1485_DataDestruction", "T1027_Obfuscation",
]

THREAT_ACTORS = [
    "APT28_FancyBear", "APT29_CozyBear", "APT32_OceanLotus",
    "APT33_Elfin", "APT38_SilentChollima", "LockBit_group",
    "BlackCat_ALPHV", "Kimsuky", "LazarusGroup", "UNC1878",
]

SOURCES = [
    "MITRE ATTACK", "VirusTotal", "AlienVault OTX", "Recorded Future",
    "CrowdStrike Falcon", "Mandiant", "Intel471", "Anomali",
    "Team Cymru", "ShadowServer", "AbuseIPDB", "URLHaus",
]


def _generate_iocs(count: int = 20):
    iocs = []
    for i in range(count):
        severity = random.choice(SEVERITIES)
        ioc_type = random.choice(IOC_TYPES)
        ttp = random.choice(TTP_TAGS)
        if ioc_type == "IP":
            value = f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"
        elif ioc_type == "Domain":
            value = f"{random.choice(['evil','malware','phish','bad','suspicious'])}{random.randint(1,999)}{random.choice(['.com','.net','.xyz','.top','.info'])}"
        elif ioc_type == "URL":
            value = f"https://{random.choice(['evil','malware','phish'])}.{random.choice(['com','net'])}/{random.randint(100,999)}"
        elif ioc_type == "Hash":
            value = "".join(random.choices("0123456789abcdef", k=64))
        else:
            value = f"{random.choice(['user','admin','info'])}@{random.choice(['evil','phish'])}.{random.choice(['com','net'])}"
        iocs.append({
            "id": f"IOC-{datetime.now().strftime('%Y%m')}-{i+1:04d}",
            "type": ioc_type,
            "value": value,
            "severity": severity,
            "ttp": ttp,
            "source": random.choice(SOURCES),
            "first_seen": (datetime.now() - timedelta(hours=random.randint(1, 720))).isoformat(),
            "last_seen": datetime.now().isoformat(),
            "confidence": random.randint(20, 100),
            "tags": random.sample(TTP_TAGS, min(3, len(TTP_TAGS))),
        })
    return iocs


_FEEDS = [
    {"id": "feed-001", "name": "MITRE ATT&CK v14", "provider": "MITRE Corp", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 12450, "confidence": 95},
    {"id": "feed-002", "name": "AlienVault OTX Pulse", "provider": "AT&T Cybersecurity", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 89200, "confidence": 82},
    {"id": "feed-003", "name": "CrowdStrike Intel", "provider": "CrowdStrike", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 34100, "confidence": 91},
    {"id": "feed-004", "name": "Recorded Future", "provider": "Recorded Future", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 56700, "confidence": 88},
    {"id": "feed-005", "name": "AbuseIPDB", "provider": "Community", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 23400, "confidence": 72},
    {"id": "feed-006", "name": "URLHaus", "provider": "abuse.ch", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 12800, "confidence": 76},
    {"id": "feed-007", "name": "VirusTotal Live", "provider": "Google", "status": "active", "last_update": datetime.now().isoformat(), "total_iocs": 245000, "confidence": 85},
]


@router.get("/feeds")
async def get_threat_feeds():
    return {"feeds": _FEEDS, "total": len(_FEEDS), "timestamp": datetime.now().isoformat()}


@router.get("/iocs")
async def get_iocs():
    return {"iocs": _generate_iocs(30), "total": 30, "timestamp": datetime.now().isoformat()}


@router.get("/summary")
async def get_threat_intel_summary():
    by_severity = {s: random.randint(5, 200) for s in SEVERITIES}
    by_type = {t: random.randint(10, 150) for t in IOC_TYPES}
    return {
        "total_iocs": sum(by_severity.values()),
        "active_feeds": len(_FEEDS),
        "new_today": random.randint(50, 500),
        "by_severity": by_severity,
        "by_type": by_type,
        "top_actors": random.sample(THREAT_ACTORS, 5),
        "timestamp": datetime.now().isoformat(),
    }
