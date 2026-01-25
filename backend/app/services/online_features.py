import os
from typing import Dict, Any
from datetime import datetime

from app.core.database import redis_client

FEATURE_WINDOW_SECONDS = int(os.getenv("FEATURE_WINDOW_SECONDS", "3600"))
FEATURE_UNIQUE_TTL_SECONDS = int(
    os.getenv("FEATURE_UNIQUE_TTL_SECONDS", str(FEATURE_WINDOW_SECONDS))
)


def _zkey(entity: str, suffix: str) -> str:
    return f"features:{entity}:{suffix}"

def _set_key(entity: str, suffix: str) -> str:
    return f"features:{entity}:{suffix}"


def _member(epoch: int, event_id: int, event_type: str) -> str:
    return f"{epoch}:{event_id}:{event_type}"


def _prune(zset_key: str, now_epoch: int) -> None:
    cutoff = now_epoch - FEATURE_WINDOW_SECONDS
    redis_client.zremrangebyscore(zset_key, 0, cutoff)


def update_online_features(entity: str, event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Track rolling counts using Redis ZSETs with epoch pruning.
    Returns the latest windowed counts for the entity.
    """
    if not redis_client:
        return {}

    epoch = int(event["timestamp_epoch"])
    event_id = int(event["id"])
    event_type = event.get("event_type", "unknown")
    status = (event.get("status") or "").lower()
    src_ip = event.get("src_ip")

    all_key = _zkey(entity, "all")
    redis_client.zadd(all_key, {_member(epoch, event_id, event_type): epoch})
    _prune(all_key, epoch)

    if "fail" in status or "failed" in status:
        fail_key = _zkey(entity, "fail")
        redis_client.zadd(fail_key, {_member(epoch, event_id, event_type): epoch})
        _prune(fail_key, epoch)

    if "success" in status:
        success_key = _zkey(entity, "success")
        redis_client.zadd(success_key, {_member(epoch, event_id, event_type): epoch})
        _prune(success_key, epoch)

    if "priv" in event_type or "role" in event_type:
        priv_key = _zkey(entity, "priv")
        redis_client.zadd(priv_key, {_member(epoch, event_id, event_type): epoch})
        _prune(priv_key, epoch)

    if src_ip:
        unique_key = _set_key(entity, "unique_ips")
        redis_client.sadd(unique_key, src_ip)
        redis_client.expire(unique_key, FEATURE_UNIQUE_TTL_SECONDS)

    features = {
        "window_seconds": FEATURE_WINDOW_SECONDS,
        "total_events": int(redis_client.zcard(all_key)),
        "fail_events": int(redis_client.zcard(_zkey(entity, "fail"))),
        "success_events": int(redis_client.zcard(_zkey(entity, "success"))),
        "priv_events": int(redis_client.zcard(_zkey(entity, "priv"))),
        "unique_src_ips": int(redis_client.scard(_set_key(entity, "unique_ips"))),
        "updated_at_epoch": epoch,
        "updated_at": datetime.utcfromtimestamp(epoch).isoformat()
    }

    redis_client.hset(f"features:{entity}:latest", mapping=features)
    return features


def get_latest_features(entity: str) -> Dict[str, Any]:
    if not redis_client:
        return {}
    data = redis_client.hgetall(f"features:{entity}:latest")
    return {k.decode(): _coerce(v.decode()) for k, v in data.items()}


def _coerce(value: str):
    for cast in (int, float):
        try:
            return cast(value)
        except ValueError:
            continue
    return value
