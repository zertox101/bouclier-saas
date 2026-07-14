import os
from typing import Dict, Any, Optional, List
import json
from collections import Counter
from datetime import datetime, timedelta

from app.core.database import redis_client

SEQUENCE_WINDOW_SECONDS = int(os.getenv("SEQUENCE_WINDOW_SECONDS", "900"))
SEQUENCE_MAX_LEN = int(os.getenv("SEQUENCE_MAX_LEN", "20"))


def _list_key(entity: str) -> str:
    return f"sequence:{entity}"


def update_sequence(entity: str, event: Dict[str, Any]) -> list[Dict[str, Any]]:
    if not redis_client:
        return []

    payload = {
        "event_type": event.get("event_type"),
        "status": event.get("status"),
        "timestamp_epoch": event.get("timestamp_epoch"),
    }

    redis_client.lpush(_list_key(entity), json.dumps(payload))
    redis_client.ltrim(_list_key(entity), 0, SEQUENCE_MAX_LEN - 1)

    raw = redis_client.lrange(_list_key(entity), 0, SEQUENCE_MAX_LEN - 1)
    sequence = []
    for item in raw:
        try:
            sequence.append(json.loads(item.decode()))
        except Exception:
            continue
    return sequence


def detect_sequence(sequence: list[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Detect fail -> success -> privilege change within the time window.
    """
    if len(sequence) < 3:
        return None

    window_start = int(sequence[0]["timestamp_epoch"]) - SEQUENCE_WINDOW_SECONDS
    filtered = [s for s in sequence if int(s.get("timestamp_epoch", 0)) >= window_start]
    events = list(reversed(filtered))  # chronological

    state = []
    for event in events:
        event_type = (event.get("event_type") or "").lower()
        status = (event.get("status") or "").lower()

        if "fail" in status and not state:
            state.append("fail")
        elif "success" in status and state == ["fail"]:
            state.append("success")
        elif ("priv" in event_type or "role" in event_type) and state == ["fail", "success"]:
            state.append("priv_change")
            break

    if state == ["fail", "success", "priv_change"]:
        return {
            "rule_name": "fail_success_privilege_change",
            "severity": "high",
            "sequence": events[-5:]
        }
    return None


def correlate_events(current_event: Dict[str, Any], past_events: List[Any]) -> List[Dict[str, Any]]:
    """
    Correlate the new event with similar points in memory.
    """
    insights = []
    
    # Analyze Source IPs in context
    ips = [e.payload.get("sourceIp") for e in past_events if e.payload.get("sourceIp")]
    ip_count = Counter(ips)
    
    # 1. Detect Repeated Attack from same source
    for ip, count in ip_count.items():
        if count >= 3:
            insights.append({
                "type": "REPEATED_SOURCE_IP",
                "ip": ip,
                "count": count,
                "severity": "high",
                "message": f"Source {ip} has contextually similar history in 3+ instances."
            })
            
    # 2. Campaign Synthesis (Multi-type attack from same source)
    if current_event.get("sourceIp"):
        src_ip = current_event["sourceIp"]
        attack_types = set([e.payload.get("event_type") for e in past_events if e.payload.get("sourceIp") == src_ip])
        if len(attack_types) > 2:
            insights.append({
                "type": "ATTACK_CAMPAIGN",
                "ip": src_ip,
                "attack_types": list(attack_types),
                "severity": "critical",
                "message": f"Identified active campaign from {src_ip} using multiple vectors: {', '.join(attack_types)}"
            })

    return insights
