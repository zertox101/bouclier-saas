import os
from typing import Dict, Any, Optional
import json

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
