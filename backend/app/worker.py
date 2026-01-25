import json
import os
import time
from datetime import datetime, timezone
from typing import Optional

from app.core.database import redis_client, SessionLocal
from app.models.sql import CorrelatedAlert, MlAlert, EventLog
from app.services.online_features import update_online_features
from app.services.correlation import update_sequence, detect_sequence
from app.services.gru_inference import gru_inference_engine
from app.services.geoip import get_geoip_cached
from app.services.flow_stream import publish_flow

STREAM_NAME = os.getenv("REDIS_STREAM_NAME", "event_stream")
GROUP_NAME = os.getenv("REDIS_CONSUMER_GROUP", "event_workers")
CONSUMER_NAME = os.getenv("REDIS_CONSUMER_NAME", "worker-1")


def ensure_group():
    try:
        redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception:
        pass


def get_db():
    if SessionLocal:
        return SessionLocal()
    return None

def _parse_timestamp(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        if value.isdigit():
            return int(value)
        try:
            text = value.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(text)
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return int(parsed.timestamp())
        except Exception:
            return None
    return None


def normalize_event(event: dict) -> dict:
    if event.get("timestamp_epoch"):
        event["timestamp_epoch"] = (
            _parse_timestamp(event.get("timestamp_epoch"))
            or int(datetime.utcnow().timestamp())
        )
    else:
        epoch = _parse_timestamp(event.get("timestamp") or event.get("ts"))
        event["timestamp_epoch"] = epoch or int(datetime.utcnow().timestamp())
    details = event.get("details")
    if not isinstance(details, dict):
        details = {"raw": details} if details else {}
    event["details"] = details
    return event


def _extract_dst_ip(event: dict) -> Optional[str]:
    details = event.get("details") if isinstance(event.get("details"), dict) else {}
    for key in ("dst_ip", "dest_ip", "destination_ip", "dst", "dst_addr"):
        value = event.get(key) or details.get(key)
        if value:
            return value
    return None


def _geo_fields(prefix: str, geo: Optional[dict]) -> dict:
    if not geo:
        return {}
    country = geo.get("country") or {}
    city = geo.get("city") or {}
    postal = geo.get("postal") or {}
    location = geo.get("location") or {}
    asn = geo.get("asn") or {}
    return {
        f"{prefix}_city": city.get("name"),
        f"{prefix}_postal": postal.get("code"),
        f"{prefix}_country": country.get("name"),
        f"{prefix}_country_iso": country.get("iso_code"),
        f"{prefix}_asn_number": asn.get("number"),
        f"{prefix}_asn_org": asn.get("org"),
        f"{prefix}_lat": location.get("lat"),
        f"{prefix}_lon": location.get("lon"),
        f"{prefix}_time_zone": location.get("time_zone"),
        f"{prefix}_accuracy_radius_km": (
            location.get("accuracy_radius_km") or location.get("accuracy_radius")
        ),
    }


def persist_event_details(event_id: int, details_update: dict) -> None:
    db = get_db()
    if not db:
        return
    try:
        record = db.query(EventLog).filter(EventLog.id == event_id).first()
        if record:
            if isinstance(record.details, dict):
                details = record.details
            elif record.details:
                details = {"raw": record.details}
            else:
                details = {}
            details.update(details_update)
            record.details = details
            db.commit()
    finally:
        db.close()


def process_event(event: dict) -> None:
    event = normalize_event(event)
    src_ip = event.get("src_ip") or event.get("ip")
    dst_ip = _extract_dst_ip(event)
    geoip = get_geoip_cached(src_ip) if src_ip else None
    dst_geoip = get_geoip_cached(dst_ip) if dst_ip else None
    if geoip:
        event["details"]["geoip"] = geoip
        if event.get("id"):
            persist_event_details(int(event["id"]), {"geoip": geoip})
    if dst_geoip:
        event["details"]["geoip_dst"] = dst_geoip
        if event.get("id"):
            persist_event_details(int(event["id"]), {"geoip_dst": dst_geoip})

    entity = f"{event.get('user')}:{event.get('host')}"
    features = update_online_features(entity, event)

    sequence = update_sequence(entity, event)
    correlated = detect_sequence(sequence)
    if correlated:
        db = get_db()
        if db:
            alert = CorrelatedAlert(
                timestamp_epoch=int(event["timestamp_epoch"]),
                rule_name=correlated["rule_name"],
                user=event.get("user"),
                host=event.get("host"),
                severity=correlated["severity"],
                sequence=correlated["sequence"],
                details={"features": features, "geoip": geoip, "src_ip": src_ip},
            )
            db.add(alert)
            db.commit()
            db.close()

    if gru_inference_engine.loaded:
        ml_sequence = gru_inference_engine.update_sequence(entity, event)
        score = gru_inference_engine.score_sequence(ml_sequence)
        if score and score["is_anomaly"]:
            db = get_db()
            if db:
                alert = MlAlert(
                    timestamp_epoch=int(event["timestamp_epoch"]),
                    user=event.get("user"),
                    host=event.get("host"),
                    anomaly_score=score["anomaly_score"],
                    threshold=score["threshold"],
                    model_version=score["model_version"],
                    details={
                        "features": features,
                        "sequence": ml_sequence[-5:],
                        "geoip": geoip,
                        "src_ip": src_ip,
                    },
                )
                db.add(alert)
            db.commit()
            db.close()

    if src_ip and dst_ip:
        rule_id = (
            event.get("rule_id")
            or event.get("event_type")
            or event.get("type")
            or (event.get("details") or {}).get("rule_id")
            or (event.get("details") or {}).get("type")
            or "event"
        )
        flow = {
            "event_id": event.get("id"),
            "timestamp_epoch": event.get("timestamp_epoch"),
            "rule_id": rule_id,
            "severity": event.get("severity"),
            "user": event.get("user"),
            "host": event.get("host"),
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_geo": geoip,
            "dst_geo": dst_geoip,
        }
        flow.update(_geo_fields("src", geoip))
        flow.update(_geo_fields("dst", dst_geoip))
        publish_flow(flow)


def run():
    if not redis_client:
        print("Redis unavailable; worker exiting.")
        return

    gru_inference_engine.load()
    ensure_group()

    print(f"[worker] consuming {STREAM_NAME} as {CONSUMER_NAME}")
    while True:
        entries = redis_client.xreadgroup(
            GROUP_NAME,
            CONSUMER_NAME,
            streams={STREAM_NAME: ">"},
            count=10,
            block=5000,
        )

        if not entries:
            continue

        for _, messages in entries:
            for message_id, data in messages:
                try:
                    payload = json.loads(data[b"payload"].decode())
                    process_event(payload)
                    redis_client.xack(STREAM_NAME, GROUP_NAME, message_id)
                except Exception as exc:
                    print(f"[worker] error {exc} on {message_id}")


if __name__ == "__main__":
    run()
