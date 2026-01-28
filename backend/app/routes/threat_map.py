"""
Threat Intelligence Map API
Provides real-time global threat data for visualization
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any
import random
from datetime import datetime, timedelta

router = APIRouter(prefix="/map", tags=["threat-map"])

# Top threat source countries with realistic coordinates
THREAT_SOURCES = [
    {"country": "China", "code": "CN", "lat": 39.9042, "lng": 116.4074, "weight": 0.25},
    {"country": "Russia", "code": "RU", "lat": 55.7558, "lng": 37.6173, "weight": 0.20},
    {"country": "United States", "code": "US", "lat": 38.9072, "lng": -77.0369, "weight": 0.15},
    {"country": "North Korea", "code": "KP", "lat": 39.0392, "lng": 125.7625, "weight": 0.10},
    {"country": "Iran", "code": "IR", "lat": 35.6892, "lng": 51.3890, "weight": 0.08},
    {"country": "Brazil", "code": "BR", "lat": -15.8267, "lng": -47.9218, "weight": 0.05},
    {"country": "India", "code": "IN", "lat": 28.6139, "lng": 77.2090, "weight": 0.05},
    {"country": "Vietnam", "code": "VN", "lat": 21.0285, "lng": 105.8542, "weight": 0.04},
    {"country": "Ukraine", "code": "UA", "lat": 50.4501, "lng": 30.5234, "weight": 0.03},
    {"country": "Turkey", "code": "TR", "lat": 39.9334, "lng": 32.8597, "weight": 0.03},
    {"country": "Germany", "code": "DE", "lat": 52.5200, "lng": 13.4050, "weight": 0.02},
]

ATTACK_TYPES = [
    "Brute Force",
    "Port Scan",
    "SQL Injection",
    "XSS Attack",
    "DDoS",
    "Phishing",
    "Ransomware",
    "Malware",
    "Credential Stuffing",
    "Zero-Day Exploit"
]

SEVERITIES = ["critical", "high", "medium", "low"]


def generate_attack_point() -> Dict[str, Any]:
    """Generate a realistic attack data point"""
    # Weighted random selection of source country
    source = random.choices(
        THREAT_SOURCES,
        weights=[s["weight"] for s in THREAT_SOURCES]
    )[0]
    
    # Add some randomness to coordinates (±2 degrees)
    lat = source["lat"] + random.uniform(-2, 2)
    lng = source["lng"] + random.uniform(-2, 2)
    
    # Severity distribution: 5% critical, 15% high, 40% medium, 40% low
    severity_weights = [0.05, 0.15, 0.40, 0.40]
    severity = random.choices(SEVERITIES, weights=severity_weights)[0]
    
    return {
        "lat": round(lat, 4),
        "lng": round(lng, 4),
        "country": source["country"],
        "country_code": source["code"],
        "count": random.randint(1, 50),
        "severity": severity,
        "attack_type": random.choice(ATTACK_TYPES),
        "timestamp": (datetime.utcnow() - timedelta(seconds=random.randint(0, 3600))).isoformat(),
        "source_ip": f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}",
    }


@router.get("/points")
async def get_attack_points(limit: int = Query(default=100, le=500)):
    """
    Get recent attack points for map visualization
    Returns realistic threat intelligence data
    """
    points = [generate_attack_point() for _ in range(limit)]
    
    # Calculate statistics
    total_attacks = sum(p["count"] for p in points)
    critical_count = sum(1 for p in points if p["severity"] == "critical")
    high_count = sum(1 for p in points if p["severity"] == "high")
    
    return {
        "points": points,
        "total": len(points),
        "total_attacks": total_attacks,
        "critical": critical_count,
        "high": high_count,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/stats")
async def get_threat_stats():
    """
    Get aggregated threat statistics
    """
    # Generate country-level statistics
    country_stats = []
    for source in THREAT_SOURCES[:10]:
        country_stats.append({
            "country": source["country"],
            "code": source["code"],
            "attacks": int(random.randint(100, 5000) * source["weight"]),
            "severity_breakdown": {
                "critical": random.randint(5, 50),
                "high": random.randint(50, 200),
                "medium": random.randint(100, 500),
                "low": random.randint(200, 1000)
            }
        })
    
    # Attack type distribution
    attack_distribution = [
        {"type": "Brute Force", "count": random.randint(800, 1200), "percentage": 33},
        {"type": "Port Scan", "count": random.randint(600, 900), "percentage": 27},
        {"type": "Phishing", "count": random.randint(400, 700), "percentage": 19},
        {"type": "DDoS", "count": random.randint(300, 600), "percentage": 15},
        {"type": "Ransomware", "count": random.randint(100, 300), "percentage": 6},
    ]
    
    return {
        "countries": country_stats,
        "attack_types": attack_distribution,
        "total_attacks_24h": sum(c["attacks"] for c in country_stats),
        "active_threats": random.randint(50, 150),
        "blocked_attacks": random.randint(5000, 15000),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live-feed")
async def get_live_feed(limit: int = Query(default=20, le=100)):
    """
    Get live threat feed for real-time updates
    """
    feed = []
    for _ in range(limit):
        point = generate_attack_point()
        feed.append({
            "id": f"threat-{random.randint(10000, 99999)}",
            "timestamp": point["timestamp"],
            "source_country": point["country"],
            "source_ip": point["source_ip"],
            "attack_type": point["attack_type"],
            "severity": point["severity"],
            "target": "MA",  # Morocco
            "status": random.choice(["blocked", "detected", "investigating"]),
            "confidence": random.randint(75, 99)
        })
    
    # Sort by timestamp (most recent first)
    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "feed": feed,
        "count": len(feed),
        "timestamp": datetime.utcnow().isoformat()
    }
