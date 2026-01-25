import csv
import io
import json
import os
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from datetime import datetime
import asyncio
from typing import Any, Dict, List, Optional
from collections import defaultdict
import psutil

from pydantic import BaseModel, Field

from app.models.monitor import monitor, ChatMessage, ToolAnalysisRequest
from app.models.sql import EventLog, CorrelatedAlert, MlAlert
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.alerts import router as alerts_router, public_router as public_alerts_router
from app.routes.explain import router as explain_router
from app.routes.features import router as features_router
from app.services.scanner import scan_network_connections, analyze_packet, detect_ddos
from app.utils.helpers import get_country_name, get_country_from_ip, get_service, get_tone
from app.services.geoip import get_geoip_cached, is_public_ip
from app.services.analytics import analytics_engine
from app.services.llm import llm_engine
from app.core.database import get_db, redis_client
from sqlalchemy.orm import Session
from fastapi import Depends

router = APIRouter()
router.include_router(auth_router, prefix="/api/auth", tags=["auth"])
router.include_router(events_router, prefix="/api", tags=["events"])
router.include_router(alerts_router, prefix="/api", tags=["alerts"])
router.include_router(explain_router, prefix="/api", tags=["explain"])
router.include_router(features_router, prefix="/api", tags=["features"])
from app.routes.admin_connectors import router as admin_connectors_router
router.include_router(admin_connectors_router, prefix="/api/admin", tags=["admin"])
router.include_router(public_alerts_router, tags=["alerts"])

FLOW_STREAM_NAME = os.getenv("REDIS_FLOW_STREAM_NAME", "event_stream")
NET_IO_STATE = {
    "ts": None,
    "bytes_sent": 0,
    "bytes_recv": 0,
    "packets_sent": 0,
    "packets_recv": 0,
}


class DdosDetectRequest(BaseModel):
    packet_count: int = Field(..., ge=0)
    byte_count: int = Field(..., ge=0)
    time_window: int = Field(1, ge=1, le=60)
    protocol: Optional[str] = None
    tcp_flags: Optional[str] = None
    unique_dst_ports: int = Field(0, ge=0)


def _detect_ddos_from_metrics(payload: DdosDetectRequest) -> Dict:
    pps = payload.packet_count / max(payload.time_window, 1)
    bps = payload.byte_count / max(payload.time_window, 1)
    protocol = (payload.protocol or "").upper()
    flags = (payload.tcp_flags or "").upper()

    score = 0.0
    reasons = []

    if pps >= 8000:
        score += 0.4
        reasons.append("packet_rate_high")
    elif pps >= 4000:
        score += 0.2
        reasons.append("packet_rate_elevated")

    if bps >= 200000:
        score += 0.25
        reasons.append("byte_rate_high")
    elif bps >= 100000:
        score += 0.15
        reasons.append("byte_rate_elevated")

    if payload.unique_dst_ports >= 150:
        score += 0.2
        reasons.append("port_fanout_high")
    elif payload.unique_dst_ports >= 80:
        score += 0.1
        reasons.append("port_fanout_elevated")

    if protocol == "UDP" and pps >= 5000:
        score += 0.15
        reasons.append("udp_spike")

    if "SYN" in flags and pps >= 3000:
        score += 0.15
        reasons.append("syn_spike")

    score = min(score, 0.95)
    is_ddos = score >= 0.6
    confidence = 0.55 + (score * 0.45)

    return {
        "is_ddos": is_ddos,
        "verdict": "Likely DDoS" if is_ddos else "Normal Traffic",
        "confidence": round(confidence, 2),
        "signals": {
            "packet_rate": round(pps, 2),
            "byte_rate": round(bps, 2),
            "unique_dst_ports": payload.unique_dst_ports,
            "protocol": protocol or None,
            "tcp_flags": flags or None,
            "reasons": reasons,
        },
    }


def _net_io_snapshot() -> Dict[str, float]:
    try:
        counters = psutil.net_io_counters()
    except Exception:
        return {
            "bytes_sent": 0,
            "bytes_recv": 0,
            "packets_sent": 0,
            "packets_recv": 0,
            "sent_rate_kbps": 0.0,
            "recv_rate_kbps": 0.0,
            "sent_pps": 0.0,
            "recv_pps": 0.0,
        }

    now = time.time()
    last_ts = NET_IO_STATE.get("ts")
    if last_ts is None:
        NET_IO_STATE.update(
            {
                "ts": now,
                "bytes_sent": counters.bytes_sent,
                "bytes_recv": counters.bytes_recv,
                "packets_sent": counters.packets_sent,
                "packets_recv": counters.packets_recv,
            }
        )
        return {
            "bytes_sent": counters.bytes_sent,
            "bytes_recv": counters.bytes_recv,
            "packets_sent": counters.packets_sent,
            "packets_recv": counters.packets_recv,
            "sent_rate_kbps": 0.0,
            "recv_rate_kbps": 0.0,
            "sent_pps": 0.0,
            "recv_pps": 0.0,
        }

    delta = max(now - last_ts, 1e-6)
    bytes_sent_delta = counters.bytes_sent - NET_IO_STATE.get("bytes_sent", 0)
    bytes_recv_delta = counters.bytes_recv - NET_IO_STATE.get("bytes_recv", 0)
    packets_sent_delta = counters.packets_sent - NET_IO_STATE.get("packets_sent", 0)
    packets_recv_delta = counters.packets_recv - NET_IO_STATE.get("packets_recv", 0)

    NET_IO_STATE.update(
        {
            "ts": now,
            "bytes_sent": counters.bytes_sent,
            "bytes_recv": counters.bytes_recv,
            "packets_sent": counters.packets_sent,
            "packets_recv": counters.packets_recv,
        }
    )

    return {
        "bytes_sent": counters.bytes_sent,
        "bytes_recv": counters.bytes_recv,
        "packets_sent": counters.packets_sent,
        "packets_recv": counters.packets_recv,
        "sent_rate_kbps": round(bytes_sent_delta / delta / 1024, 2),
        "recv_rate_kbps": round(bytes_recv_delta / delta / 1024, 2),
        "sent_pps": round(packets_sent_delta / delta, 2),
        "recv_pps": round(packets_recv_delta / delta, 2),
    }


def _parse_ddos_records(payload: str) -> List[Dict[str, Any]]:
    payload = payload.strip()
    if not payload:
        return []

    try:
        parsed = json.loads(payload)
        if isinstance(parsed, list):
            return [item for item in parsed if isinstance(item, dict)]
        if isinstance(parsed, dict):
            for key in ("packets", "events", "records", "data"):
                value = parsed.get(key)
                if isinstance(value, list):
                    return [item for item in value if isinstance(item, dict)]
            return [parsed]
    except json.JSONDecodeError:
        pass

    reader = csv.DictReader(io.StringIO(payload))
    records = []
    for row in reader:
        if row:
            records.append(row)
    if records:
        return records

    return [{"raw": line} for line in payload.splitlines() if line.strip()]


def _extract_ddos_metrics(payload: str) -> Dict[str, Any]:
    records = _parse_ddos_records(payload)
    packet_count = len(records)
    byte_count = 0
    unique_ports = set()
    protocols = defaultdict(int)
    flags = defaultdict(int)
    timestamps = []

    for record in records:
        if not isinstance(record, dict):
            continue
        size_val = record.get("bytes") or record.get("size") or record.get("packet_size")
        try:
            if size_val is not None:
                byte_count += int(float(size_val))
        except Exception:
            pass

        dst_port = record.get("dst_port") or record.get("port") or record.get("destination_port")
        try:
            if dst_port is not None:
                unique_ports.add(int(dst_port))
        except Exception:
            pass

        proto = record.get("protocol") or record.get("proto")
        if proto:
            protocols[str(proto).upper()] += 1

        flag = record.get("tcp_flags") or record.get("flags")
        if flag:
            flags[str(flag).upper()] += 1

        ts = record.get("timestamp") or record.get("ts") or record.get("time")
        if ts:
            try:
                timestamps.append(float(ts))
            except Exception:
                try:
                    timestamps.append(datetime.fromisoformat(str(ts)).timestamp())
                except Exception:
                    pass

    time_window = 60
    if len(timestamps) >= 2:
        time_window = int(max(max(timestamps) - min(timestamps), 1))

    top_proto = max(protocols, key=protocols.get) if protocols else None
    top_flag = max(flags, key=flags.get) if flags else None

    return {
        "packet_count": packet_count,
        "byte_count": byte_count,
        "time_window": time_window,
        "protocol": top_proto,
        "tcp_flags": top_flag,
        "unique_dst_ports": len(unique_ports),
    }

@router.get("/")
def root():
    return {"status": "SHIELD Security API Running", "version": "2.0"}

@router.get("/health")
def api_health():
    return {"status": "healthy", "version": "2.0"}

@router.get("/api/health")
def api_health_alias():
    return {"status": "healthy", "version": "2.0"}

@router.get("/api/status")
def get_status():
    return {
        "monitoring": monitor.is_monitoring,
        "total_packets": len(monitor.packets),
        "total_events": len(monitor.events),
        "ddos_detected": monitor.ddos_detected
    }

@router.get("/api/traffic/live")
def get_live_traffic(db: Session = Depends(get_db)):
    """Get current network connections"""
    connections = scan_network_connections()
    
    # Update monitor stats
    for conn in connections:
        country = conn.get("country", "UNKNOWN")
        if country != "LOCAL":
            monitor.traffic_by_country[country] += 1
        
        # Analyze for threats
        analysis = analyze_packet(conn)
        if analysis["is_suspicious"]:
            conn["alerts"] = analysis["alerts"]
            conn["severity"] = analysis["severity"]
            monitor.severity_counts[analysis["severity"]] += 1
            
            event_data = {
                **conn,
                "type": analysis["alerts"][0] if analysis["alerts"] else "Activité suspecte"
            }
            monitor.add_event(event_data, db)
    
    monitor.packets.extend(connections)
    
    # Limit stored packets
    if len(monitor.packets) > 5000:
        monitor.packets = monitor.packets[-5000:]

    # --- AI ANALYSIS LAYER ---
    # Train/Update model periodically (simplified: every call if enough data)
    if len(monitor.packets) > 20 and not analytics_engine.is_fitted:
        analytics_engine.train_model(monitor.packets)
    
    # Detect ML Anomalies (Behavioral)
    ml_anomalies = analytics_engine.detect_anomalies(connections)
    if ml_anomalies:
        for anomaly in ml_anomalies:
            anomaly["type"] = "Comportement Anormal (AI)"
            anomaly["severity"] = "Moyen"
            # Use add_event for persistence
            monitor.add_event(anomaly, db)
            
            # Mark the original connection as alert too to show in UI
            for conn in connections:
                if conn["src_ip"] == anomaly["src_ip"] and conn["dst_port"] == anomaly["dst_port"]:
                    conn["alerts"] = ["Anomalie ML"]
                    conn["severity"] = "Moyen"

    return {
        "connections": connections[:50],
        "total": len(connections),
        "ml_status": "Active" if analytics_engine.is_fitted else "Learning"
    }

@router.get("/api/traffic/stats")
def get_traffic_stats():
    """Get traffic statistics"""
    # Count by country
    country_stats = [
        {"label": f"{code} - {get_country_name(code)}", "count": count, "tone": get_tone(count)}
        for code, count in sorted(monitor.traffic_by_country.items(), key=lambda x: -x[1])[:5]
    ]

    io_stats = _net_io_snapshot()

    ip_counts: Dict[str, int] = defaultdict(int)
    for pkt in monitor.packets[-1000:]:
        src_ip = pkt.get("src_ip")
        if src_ip:
            ip_counts[src_ip] += 1
    top_ips = [
        {"ip": ip, "count": count, "country": get_country_name(get_country_from_ip(ip))}
        for ip, count in sorted(ip_counts.items(), key=lambda x: -x[1])[:10]
    ]

    return {
        "by_country": country_stats,
        "severity": monitor.severity_counts,
        "total_packets": len(monitor.packets),
        "inbound_bytes": io_stats["bytes_recv"],
        "outbound_bytes": io_stats["bytes_sent"],
        "inbound_rate": io_stats["recv_rate_kbps"],
        "outbound_rate": io_stats["sent_rate_kbps"],
        "inbound_packets": io_stats["packets_recv"],
        "outbound_packets": io_stats["packets_sent"],
        "inbound_packets_rate": io_stats["recv_pps"],
        "outbound_packets_rate": io_stats["sent_pps"],
        "top_ips": top_ips,
    }

@router.get("/api/system/stats")
def get_system_stats():
    """Get basic system health stats for the dashboard."""
    try:
        cpu_percent = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        disk_path = os.path.abspath(os.sep)
        disk = psutil.disk_usage(disk_path)
        io_stats = _net_io_snapshot()
    except Exception:
        return {
            "cpu_percent": 0,
            "memory_percent": 0,
            "disk_percent": 0,
            "net": {"in_kbps": 0, "out_kbps": 0},
        }

    return {
        "cpu_percent": round(cpu_percent, 2),
        "memory_percent": round(memory.percent, 2),
        "disk_percent": round(disk.percent, 2),
        "net": {
            "in_kbps": io_stats.get("recv_rate_kbps", 0.0),
            "out_kbps": io_stats.get("sent_rate_kbps", 0.0),
        },
    }

@router.get("/api/geoip")
def geoip_lookup(ip: str):
    if not ip:
        raise HTTPException(status_code=400, detail="ip is required")
    data = get_geoip_cached(ip)
    return {
        "ip": ip,
        "public": is_public_ip(ip),
        "geoip": data,
    }

@router.get("/api/events")
def get_events():
    """Get security events"""
    return {
        "events": monitor.events[-50:],  # Last 50 events
        "total": len(monitor.events),
        "severity_counts": monitor.severity_counts
    }


@router.get("/api/search")
def search(query: str, limit: int = 8, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    if not query or len(query.strip()) < 2:
        return []

    term = f"%{query.strip()}%"
    results: List[Dict[str, Any]] = []
    seen = set()

    def add_result(result_type: str, label: str, sublabel: Optional[str], severity: Optional[str] = None):
        key = (result_type, label)
        if key in seen or len(results) >= limit:
            return
        seen.add(key)
        payload = {
            "id": f"{result_type}:{label}",
            "type": result_type,
            "label": label,
        }
        if sublabel:
            payload["sublabel"] = sublabel
        if severity:
            payload["severity"] = severity
        results.append(payload)

    events = (
        db.query(EventLog)
        .filter(
            (EventLog.src_ip.ilike(term))
            | (EventLog.user.ilike(term))
            | (EventLog.host.ilike(term))
            | (EventLog.event_type.ilike(term))
        )
        .order_by(EventLog.timestamp_epoch.desc())
        .limit(100)
        .all()
    )

    for event in events:
        if event.src_ip:
            add_result("ip", event.src_ip, f"event {event.event_type}", (event.severity or "low").lower())
        if event.host:
            add_result("host", event.host, event.src_ip or "host", (event.severity or "low").lower())
        if event.user:
            add_result("user", event.user, event.host or "user", (event.severity or "low").lower())
        if event.event_type:
            add_result("event", event.event_type, event.src_ip or "event", (event.severity or "low").lower())
        if len(results) >= limit:
            break

    if len(results) < limit:
        alerts = (
            db.query(CorrelatedAlert)
            .filter(CorrelatedAlert.rule_name.ilike(term))
            .order_by(CorrelatedAlert.timestamp_epoch.desc())
            .limit(50)
            .all()
        )
        for alert in alerts:
            add_result("event", alert.rule_name, alert.host or alert.user or "alert", (alert.severity or "medium").lower())
            if len(results) >= limit:
                break

    if len(results) < limit:
        alerts = (
            db.query(MlAlert)
            .order_by(MlAlert.timestamp_epoch.desc())
            .limit(50)
            .all()
        )
        for alert in alerts:
            label = "gru_anomaly"
            add_result("event", label, alert.host or alert.user or "ml alert", "high")
            if len(results) >= limit:
                break

    return results

@router.get("/api/ddos/status")
def get_ddos_status():
    """Check for DDoS attacks"""
    connections = scan_network_connections()
    if connections:
        monitor.packets.extend(connections)
        if len(monitor.packets) > 5000:
            monitor.packets = monitor.packets[-5000:]

    ddos_check = detect_ddos(monitor.packets)
    monitor.ddos_detected = ddos_check["detected"]
    monitor.attack_sources = ddos_check["attackers"]
    
    return ddos_check

@router.post("/api/ddos/detect")
def detect_ddos_metrics(payload: DdosDetectRequest):
    """Detect DDoS based on provided traffic metrics"""
    return _detect_ddos_from_metrics(payload)


@router.post("/api/ddos/analyze")
async def analyze_ddos(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file:
        return {"status": "error", "message": "file is required"}

    content = await file.read()
    if not content:
        return {"status": "error", "message": "file is empty"}

    text = content.decode(errors="ignore")
    metrics = _extract_ddos_metrics(text)
    payload = DdosDetectRequest(
        packet_count=max(metrics["packet_count"], 0),
        byte_count=max(metrics["byte_count"], 0),
        time_window=max(metrics["time_window"], 1),
        protocol=metrics.get("protocol"),
        tcp_flags=metrics.get("tcp_flags"),
        unique_dst_ports=max(metrics["unique_dst_ports"], 0),
    )

    result = _detect_ddos_from_metrics(payload)
    threats = []
    if result["is_ddos"]:
        threats.append(
            {
                "type": result["verdict"],
                "severity": "HIGH",
                "source": "traffic",
                "details": f"pps={result['signals']['packet_rate']}, bps={result['signals']['byte_rate']}",
            }
        )

    return {
        "status": "success",
        "total_scanned": payload.packet_count,
        "threats": threats,
        "signals": result["signals"],
    }

@router.get("/api/network/internal")
def get_internal_network():
    """Get internal network statistics"""
    # Count by HTTP method (simulated from connection types)
    method_counts = {
        "CONNECT": 0, "REST": 0, "GET": 0, "POST": 0
    }
    
    for pkt in monitor.packets[-1000:]:
        dst_port = pkt.get("dst_port", 0)
        if dst_port in [80, 8080]:
            method_counts["GET"] += 1
        elif dst_port == 443:
            method_counts["CONNECT"] += 1
        elif dst_port in [3000, 5000, 8000]:
            method_counts["REST"] += 1
        else:
            method_counts["POST"] += 1
    
    return {
        "methods": [
            {"label": method, "value": count}
            for method, count in method_counts.items()
        ]
    }

@router.post("/api/monitor/start")
def start_monitoring():
    monitor.is_monitoring = True
    monitor.reset_stats()
    return {"status": "Monitoring started"}

@router.post("/api/monitor/stop")
def stop_monitoring():
    monitor.is_monitoring = False
    return {"status": "Monitoring stopped", "stats": get_traffic_stats()}

@router.get("/map/stream")
async def map_stream(request: Request, last_id: str = "$"):
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")

    stream_id = last_id or "$"
    if stream_id in ("latest", "newest"):
        stream_id = "$"

    async def event_generator():
        nonlocal stream_id
        keepalive_at = time.monotonic()
        while True:
            if await request.is_disconnected():
                break

            entries = await asyncio.to_thread(
                redis_client.xread,
                {FLOW_STREAM_NAME: stream_id},
                100,
                5000,
            )

            if entries:
                for _, messages in entries:
                    for message_id, data in messages:
                        message_id = (
                            message_id.decode() if isinstance(message_id, bytes) else message_id
                        )
                        stream_id = message_id
                        payload = data.get(b"payload") if isinstance(data, dict) else None
                        if payload is None and isinstance(data, dict):
                            payload = data.get("payload")
                        if not payload:
                            continue
                        if isinstance(payload, bytes):
                            payload = payload.decode()
                        yield f"event: flow\ndata: {payload}\n\n"
                        keepalive_at = time.monotonic()
            else:
                if time.monotonic() - keepalive_at > 15:
                    yield ": keep-alive\n\n"
                    keepalive_at = time.monotonic()

            await asyncio.sleep(0.05)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/map/summary")
def map_summary(limit: int = 250) -> Dict[str, Any]:
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")

    entries = redis_client.xrevrange(FLOW_STREAM_NAME, count=limit)
    rule_counts: Dict[str, int] = defaultdict(int)
    src_countries: Dict[str, int] = defaultdict(int)
    dst_countries: Dict[str, int] = defaultdict(int)

    for _, data in entries:
        payload = data.get(b"payload") if isinstance(data, dict) else None
        if payload is None and isinstance(data, dict):
            payload = data.get("payload")
        if not payload:
            continue
        if isinstance(payload, bytes):
            payload = payload.decode()
        try:
            flow = json.loads(payload)
        except json.JSONDecodeError:
            continue
        rule_counts[str(flow.get("rule_id") or "unknown")] += 1
        src_countries[str(flow.get("src_country_iso") or "unknown")] += 1
        dst_countries[str(flow.get("dst_country_iso") or "unknown")] += 1

    return {
        "stream": FLOW_STREAM_NAME,
        "samples": len(entries),
        "top_rules": sorted(rule_counts.items(), key=lambda x: -x[1])[:10],
        "top_src_countries": sorted(src_countries.items(), key=lambda x: -x[1])[:10],
        "top_dst_countries": sorted(dst_countries.items(), key=lambda x: -x[1])[:10],
    }


@router.get("/map/points")
def map_points(limit: int = 500) -> Dict[str, Any]:
    if not redis_client:
        raise HTTPException(status_code=503, detail="Redis unavailable")

    entries = redis_client.xrevrange(FLOW_STREAM_NAME, count=limit)
    severity_rank = {"low": 1, "medium": 2, "high": 3, "critical": 4}
    points: Dict[str, Dict[str, Any]] = {}

    for _, data in entries:
        payload = data.get(b"payload") if isinstance(data, dict) else None
        if payload is None and isinstance(data, dict):
            payload = data.get("payload")
        if not payload:
            continue
        if isinstance(payload, bytes):
            payload = payload.decode()
        try:
            flow = json.loads(payload)
        except json.JSONDecodeError:
            continue

        lat = flow.get("src_lat")
        lon = flow.get("src_lon")
        if lat is None or lon is None:
            continue

        src_ip = flow.get("src_ip") or "unknown"
        key = str(src_ip)
        severity = str(flow.get("severity") or "low").lower()
        country = flow.get("src_country_iso") or flow.get("src_country") or "UNKNOWN"

        if key not in points:
            points[key] = {
                "id": key,
                "lat": lat,
                "lng": lon,
                "country": country,
                "ip": src_ip,
                "severity": severity,
                "count": 1,
            }
            continue

        points[key]["count"] += 1
        if severity_rank.get(severity, 0) > severity_rank.get(points[key]["severity"], 0):
            points[key]["severity"] = severity

    return {"points": list(points.values())}

@router.get("/api/sources")
def get_traffic_sources():
    """Get multi-source traffic data for Sankey chart"""
    service_counts: Dict[str, int] = defaultdict(int)
    dst_counts: Dict[str, int] = defaultdict(int)

    for pkt in monitor.packets[-500:]:
        port = pkt.get("dst_port", 0)
        service = pkt.get("service") or get_service(int(port)) if port else "Unknown"
        service_counts[service] += 1
        dst_ip = pkt.get("dst_ip") or "unknown"
        dst_counts[dst_ip] += 1

    left_nodes = [name for name, _ in sorted(service_counts.items(), key=lambda x: -x[1])[:5]]
    right_nodes = [name for name, _ in sorted(dst_counts.items(), key=lambda x: -x[1])[:5]]

    return {
        "sources": {"left": left_nodes, "right": right_nodes},
        "service_distribution": dict(service_counts),
        "destination_distribution": dict(dst_counts),
    }

@router.post("/api/sentinel/chat")
async def chat_sentinel(chat: ChatMessage, request: Request):
    """Sentinel AI Chat Endpoint with Security Guardrails"""
    msg = chat.message
    
    # 1. Prompt Injection Check
    from app.services.prompt_guard import is_prompt_injection
    if is_prompt_injection(msg):
        return {
            "role": "assistant",
            "timestamp": datetime.now().isoformat(),
            "content": "I'm sorry, but I cannot process this request as it violates security policies (Sentinel Guard triggered).",
            "actions": [{"type": "alert", "label": "Security Policy Violation", "severity": "high"}]
        }

    response = {
        "role": "assistant",
        "timestamp": datetime.now().isoformat(),
        "content": "",
        "actions": []
    }
    
    # 2. Tenant Context (Placeholder for SaaS multi-tenancy)
    # In a real SaaS, this would come from the JWT/Session
    tenant_id = "default_tenant" 
    
    # Context for LLM
    context = {
        "tenant_id": tenant_id,
        "active_threats": monitor.events[-5:] if monitor.events else [],
        "stats": monitor.traffic_by_country
    }
    
    response["content"] = llm_engine.chat_response(msg, context)
    
    if "status" in msg.lower() or "health" in msg.lower():
        response["actions"] = [{"type": "navigate", "label": "View Dashboard", "path": "/overview"}]
    
    return response

@router.post("/api/sentinel/analyze-tools")
async def analyze_tools(request: ToolAnalysisRequest):
    """Analyze tool outputs using Sentinel AI"""
    analysis = llm_engine.analyze_tool_output(request.tool_name, request.logs)
    
    return analysis

@router.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            connections = scan_network_connections()
            events = []
            for conn in connections:
                analysis = analyze_packet(conn)
                if analysis["is_suspicious"]:
                    events.append({**conn, "alerts": analysis["alerts"], "severity": analysis["severity"]})
            
            ddos_status = detect_ddos(monitor.packets)
            
            await websocket.send_json({
                "timestamp": datetime.now().isoformat(),
                "connections": connections[:20],
                "events": events[:10],
                "ddos": ddos_status,
                "stats": {"total_packets": len(monitor.packets), "total_events": len(monitor.events)}
            })
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
