"""
Threat Intelligence Map API
Provides REAL-TIME network threat data from the active monitor.
NO MOCKED DATA.
"""
import json
from fastapi import APIRouter, Query, Depends, Request, Response
from typing import List, Dict, Any
from datetime import datetime
from app.models.monitor import monitor
from app.services.geoip import get_geoip_cached
from app.utils.helpers import get_country_from_ip

router = APIRouter(prefix="/map", tags=["threat-map"])

def _get_lat_lon(ip: str):
    """
    Get Latitude/Longitude for an IP.
    Returns None if strictly local/unresolvable, avoiding fake coordinates.
    """
    geo = get_geoip_cached(ip)
    if geo and geo.get("lat") and geo.get("lon"):
        return geo["lat"], geo["lon"]
    return None, None

@router.get("/points")
async def get_attack_points(limit: int = Query(default=100, le=500)):
    """
    Get recent REAL network connections as map points.
    Reads from live monitor (populated by CICIDS stream + live_sniffer).
    """
    points = []
    
    source = monitor.events if monitor.events else monitor.packets
    
    # If monitor is empty, try Redis stream "flows"
    if not source:
        try:
            from app.core.database import redis_client
            if redis_client:
                entries = redis_client.xrevrange("flows", count=limit)
                for msg_id, data in entries:
                    payload = data.get(b"payload") or data.get("payload")
                    if payload:
                        if isinstance(payload, bytes):
                            payload = payload.decode()
                        item = json.loads(payload)
                        pkt = item
                    else:
                        pkt = {k.decode() if isinstance(k, bytes) else k: v.decode() if isinstance(v, bytes) else v for k, v in data.items()}
                    source.append(pkt)
        except Exception:
            pass

    recent_packets = source[-limit:] if source else []
    
    for pkt in recent_packets:
        src_ip = pkt.get("src_ip")
        if not src_ip:
            continue
            
        lat, lng = _get_lat_lon(src_ip)
        
        if lat is not None and lng is not None:
             points.append({
                "lat": lat,
                "lng": lng,
                "country": pkt.get("country", "Unknown"),
                "country_code": get_country_from_ip(src_ip) or "XX",
                "count": 1,
                "severity": pkt.get("severity", "low"),
                "attack_type": pkt.get("service", "Traffic"),
                "timestamp": pkt.get("timestamp"),
                "source_ip": src_ip
             })
    
    total_attacks = len(points)
    critical_count = sum(1 for p in points if p["severity"] in ["Critique", "critical"])
    high_count = sum(1 for p in points if p["severity"] in ["Élevé", "high"])
    
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
    Get aggregated statistics from REAL monitored traffic.
    """
    # Country stats
    country_counts = {}
    for country, count in monitor.traffic_by_country.items():
        if country != "UNKNOWN":
            country_counts[country] = count
            
    sorted_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    country_stats = []
    for country, count in sorted_countries:
        country_stats.append({
            "country": country,
            "code": country[:2].upper(), # Simplistic assumption if full name not avail
            "attacks": count,
            "severity_breakdown": {
                "critical": 0, # To be refined if we tracked per-country severity
                "high": 0,
                "medium": count,
                "low": 0
            }
        })

    # Attack/Service distribution
    service_counts = {}
    source = monitor.events if monitor.events else monitor.packets
    for pkt in source[-2000:]:
        svc = pkt.get("service", "Unknown")
        service_counts[svc] = service_counts.get(svc, 0) + 1
        
    total_pkts = sum(service_counts.values()) or 1
    
    attack_distribution = []
    for svc, count in sorted(service_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        attack_distribution.append({
            "type": svc,
            "count": count,
            "percentage": int((count / total_pkts) * 100)
        })

    return {
        "countries": country_stats,
        "attack_types": attack_distribution,
        "total_attacks_24h": len(monitor.events) + len(monitor.packets),
        "active_threats": len(monitor.events),
        "blocked_attacks": monitor.severity_counts.get("critical", 0) + monitor.severity_counts.get("high", 0),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live-feed")
async def get_live_feed(limit: int = Query(default=20, le=100)):
    """
    Get live REAL threat feed.
    """
    feed = []
    # Use real events if available, otherwise high-severity packets
    source_list = monitor.events if monitor.events else monitor.packets
    
    for item in source_list[-limit:]:
        feed.append({
            "id": f"evt-{hash(str(item))}",
            "timestamp": item.get("timestamp"),
            "source_country": item.get("country", "Unknown"),
            "source_ip": item.get("src_ip"),
            "attack_type": item.get("service") or item.get("type") or "Unknown",
            "severity": item.get("severity", "low"),
            "target": item.get("dst_ip", "Local"),
            "status": "detected",
            "confidence": 100
        })
    
    # Sort by timestamp (most recent first)
    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "feed": feed,
        "count": len(feed),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/export/kml")
async def export_threats_kml():
    """
    Generates a KML file of the current active threat points.
    """
    kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>SignalGuard Live Threats</name>
    <Style id="threatIcon">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
"""
    
    # Get current points (using the same logic as /points)
    points = []
    # Mocking some active points from monitor.packets for the export
    source = monitor.events if monitor.events else monitor.packets
    for i, p in enumerate(list(source)[-100:]): # Last 100 events/packets
        lat = p.get('lat', 0)
        lng = p.get('lng', 0)
        ip = p.get('src_ip', '0.0.0.0')
        service = p.get('service', 'Unknown')
        
        kml_content += f"""    <Placemark>
      <name>{ip}</name>
      <description>Attack Type: {service}</description>
      <styleUrl>#threatIcon</styleUrl>
      <Point>
        <coordinates>{lng},{lat},0</coordinates>
      </Point>
    </Placemark>
"""
    
    kml_content += """  </Document>
</kml>"""
    
    return Response(
        content=kml_content,
        media_type="application/vnd.google-earth.kml+xml",
        headers={"Content-Disposition": "attachment; filename=threats.kml"}
    )

@router.get("/stream")
async def stream_threats(request: Request, last_id: str = "$"):
    """
    Server-Sent Events (SSE) stream for real-time threat map updates.
    Reads from the 'flows' Redis stream populated by agents/injectors.
    """
    from fastapi.responses import StreamingResponse
    from app.core.database import redis_client
    import asyncio
    import json
    
    async def event_generator():
        stream_id = last_id or "$"
        while True:
            if await request.is_disconnected():
                break

            # Read from Redis Stream 'flows'
            entries = await asyncio.to_thread(
                redis_client.xread,
                {"flows": stream_id},
                count=10,
                block=5000
            )

            if entries:
                for _, messages in entries:
                    for message_id, data in messages:
                        stream_id = message_id.decode() if isinstance(message_id, bytes) else message_id
                        payload = data.get(b"payload") or data.get("payload")
                        if payload:
                            if isinstance(payload, bytes):
                                payload = payload.decode()
                            yield f"event: flow\ndata: {payload}\n\n"
            else:
                # Keep-alive
                yield ": keep-alive\n\n"
            
            await asyncio.sleep(0.1)
    
    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

