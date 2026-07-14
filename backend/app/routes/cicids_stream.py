"""
CICIDS Live Stream Engine
Lit le dataset CICIDS2017 ligne par ligne et l'injecte en temps réel
dans la DB (TelemetryEvent) + Redis Stream pour visualisation live.
"""

import os
import csv
import json
import time
import asyncio
import logging
import hashlib
import random
from datetime import datetime
from typing import Optional, AsyncGenerator

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db, redis_client
from app.models.telemetry_sql import TelemetryEvent, TelemetrySensor

logger = logging.getLogger("SHIELD.CICIDS")

router = APIRouter(prefix="/api/datasets", tags=["CICIDS Live Stream"])

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "ml", "data")

DATASET_FILES = {
    "cicids2017":  os.path.join(DATA_DIR, "cicids2017_sample.csv"),
    "cicids_full": os.path.join(DATA_DIR, "cicids2017_full.csv"),
    "iotmal2026":  os.path.join(DATA_DIR, "iotmal2026_sample.csv"),
    "malmem2022":  os.path.join(DATA_DIR, "malmem2022_sample.csv"),
    "unsw_nb15":   os.path.join(DATA_DIR, "unsw_nb15_sample.csv"),
}

# ── Streaming state (in-memory per process) ───────────────────────────────────
_stream_state: dict = {
    "running": False,
    "dataset": "cicids2017",
    "rows_sent": 0,
    "rows_total": 0,
    "speed_ms": 200,       # délai entre chaque ligne (ms)
    "current_row": 0,
    "started_at": None,
    "last_event": None,
}

# ── Label → Severity mapping ───────────────────────────────────────────────────
LABEL_SEVERITY = {
    "BENIGN":                  "low",
    "DoS Hulk":                "critical",
    "PortScan":                "high",
    "DDoS":                    "critical",
    "DoS GoldenEye":           "critical",
    "FTP-Patator":             "high",
    "SSH-Patator":             "high",
    "DoS slowloris":           "high",
    "DoS Slowhttptest":        "high",
    "Bot":                     "critical",
    "Web Attack – Brute Force":"high",
    "Web Attack – XSS":        "medium",
    "Web Attack – Sql Injection":"critical",
    "Infiltration":            "critical",
    "Heartbleed":              "critical",
}

# ── GeoIP simulation (basé sur IP décimale) ────────────────────────────────────
GEO_POOL = [
    {"lat": 48.8566, "lon": 2.3522,   "country": "France"},
    {"lat": 40.7128, "lon": -74.0060, "country": "USA"},
    {"lat": 35.6762, "lon": 139.6503, "country": "Japan"},
    {"lat": 51.5074, "lon": -0.1278,  "country": "UK"},
    {"lat": 55.7558, "lon": 37.6173,  "country": "Russia"},
    {"lat": 39.9042, "lon": 116.4074, "country": "China"},
    {"lat": -33.8688,"lon": 151.2093, "country": "Australia"},
    {"lat": 30.0444, "lon": 31.2357,  "country": "Egypt"},
    {"lat": 45.4215, "lon": -75.6972, "country": "Canada"},
    {"lat": 1.3521,  "lon": 103.8198, "country": "Singapore"},
    {"lat": 19.4326, "lon": -99.1332, "country": "Mexico"},
    {"lat": 52.5200, "lon": 13.4050,  "country": "Germany"},
    {"lat": 41.9028, "lon": 12.4964,  "country": "Italy"},
    {"lat": 37.5665, "lon": 126.9780, "country": "South Korea"},
    {"lat": 28.6139, "lon": 77.2090,  "country": "India"},
    {"lat": 34.0522, "lon": -118.2437,"country": "USA-LA"},
    {"lat": 59.3293, "lon": 18.0686,  "country": "Sweden"},
    {"lat": 25.2048, "lon": 55.2708,  "country": "UAE"},
    {"lat": -23.5505,"lon": -46.6333, "country": "Brazil"},
    {"lat": 33.5731, "lon": -7.5898,  "country": "Morocco"},
]

def _decimal_to_ip(dec: float) -> str:
    """Convertit une IP décimale en notation dotted."""
    try:
        n = int(float(dec))
        return f"{(n >> 24) & 0xFF}.{(n >> 16) & 0xFF}.{(n >> 8) & 0xFF}.{n & 0xFF}"
    except Exception:
        return "0.0.0.0"

def _get_geo(ip_dec: float) -> dict:
    """Retourne des coordonnées géo simulées basées sur l'IP."""
    try:
        idx = int(abs(float(ip_dec))) % len(GEO_POOL)
        return GEO_POOL[idx]
    except Exception:
        return GEO_POOL[0]

def _row_to_event(row: dict, dataset: str) -> dict:
    """Transforme une ligne CSV en événement de sécurité structuré."""
    label = (
        row.get("Label") or
        row.get("label") or
        row.get("Attempted Category") or
        "UNKNOWN"
    ).strip()

    # Normalize label: handle different dash/space encodings
    label_normalized = label.replace("  ", " ").replace(" \u2013 ", " - ").replace("\u2013", "-").strip()
    for canonical, sev in LABEL_SEVERITY.items():
        if label == canonical or label_normalized.replace(" - ", " ") == canonical.replace(" ", ""):
            severity = sev
            break
    else:
        severity = LABEL_SEVERITY.get(label, LABEL_SEVERITY.get(label_normalized, "medium" if label != "BENIGN" else "low"))
    # Use canonical label from severity map if matched
    for canonical in LABEL_SEVERITY:
        if label.replace("  ", " ") == canonical or label_normalized.replace(" - ", " ") == canonical.replace(" ", ""):
            label = canonical
            break

    # Extraction IP
    src_ip_dec = row.get("Src IP dec") or row.get("Src IP") or "0"
    dst_ip_dec = row.get("Dst IP dec") or row.get("Dst IP") or "0"

    # Si c'est déjà une IP dotted
    if "." in str(src_ip_dec):
        src_ip = str(src_ip_dec)
    else:
        src_ip = _decimal_to_ip(src_ip_dec)

    if "." in str(dst_ip_dec):
        dst_ip = str(dst_ip_dec)
    else:
        dst_ip = _decimal_to_ip(dst_ip_dec)

    src_port = int(float(row.get("Src Port", 0) or 0))
    dst_port = int(float(row.get("Dst Port", 80) or 80))
    protocol = int(float(row.get("Protocol", 6) or 6))
    proto_name = {6: "TCP", 17: "UDP", 1: "ICMP"}.get(protocol, "TCP")

    # Métriques réseau
    flow_duration = float(row.get("Flow Duration", 0) or 0)
    flow_bytes_s  = float(row.get("Flow Bytes/s", 0) or 0)
    flow_pkts_s   = float(row.get("Flow Packets/s", 0) or 0)
    fwd_pkts      = int(float(row.get("Total Fwd Packet", 0) or 0))
    bwd_pkts      = int(float(row.get("Total Bwd packets", 0) or 0))

    geo = _get_geo(src_ip_dec)

    # MITRE ATT&CK mapping
    mitre_map = {
        "DoS Hulk":                    "T1498.001",
        "DDoS":                        "T1498",
        "PortScan":                    "T1046",
        "FTP-Patator":                 "T1110.001",
        "SSH-Patator":                 "T1110.001",
        "Bot":                         "T1071",
        "Web Attack – Brute Force":    "T1110",
        "Web Attack – XSS":            "T1059.007",
        "Web Attack – Sql Injection":  "T1190",
        "Infiltration":                "T1078",
        "Heartbleed":                  "T1203",
        "DoS GoldenEye":               "T1498.001",
        "DoS slowloris":               "T1498.001",
        "DoS Slowhttptest":            "T1498.001",
    }
    mitre_id = mitre_map.get(label, "T1059")

    return {
        "event_type": label if label != "BENIGN" else "Normal Traffic",
        "severity": severity,
        "message": f"[{dataset.upper()}] {label} detected from {src_ip}:{src_port} → {dst_ip}:{dst_port}",
        "payload": {
            "src_ip":       src_ip,
            "dst_ip":       dst_ip,
            "src_port":     src_port,
            "dst_port":     dst_port,
            "protocol":     proto_name,
            "label":        label,
            "dataset":      dataset,
            "flow_duration": flow_duration,
            "flow_bytes_s": flow_bytes_s,
            "flow_pkts_s":  flow_pkts_s,
            "fwd_pkts":     fwd_pkts,
            "bwd_pkts":     bwd_pkts,
            "lat":          geo["lat"],
            "lng":          geo["lon"],
            "country":      geo["country"],
            "mitre_id":     mitre_id,
            "risk_score":   {"critical": 95, "high": 75, "medium": 45, "low": 10}.get(severity, 30),
        }
    }


def _count_csv_rows(filepath: str) -> int:
    """Compte les lignes d'un CSV sans tout charger en mémoire."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            return sum(1 for _ in f) - 1  # -1 pour le header
    except Exception:
        return 0

async def _stream_csv_to_db(dataset: str, speed_ms: int, db: Session, org_id: str = "default"):
    """Coroutine principale : lit le CSV et injecte chaque ligne en DB + Redis."""

    filepath = DATASET_FILES.get(dataset)
    if not filepath or not os.path.exists(filepath):
        logger.error(f"[CICIDS] Dataset file not found: {filepath}")
        _stream_state["running"] = False
        return

    _stream_state["running"] = True
    _stream_state["rows_sent"] = 0
    _stream_state["started_at"] = datetime.utcnow().isoformat()
    _stream_state["rows_total"] = _count_csv_rows(filepath)

    from app.models.monitor import monitor
    from app.services.flow_stream import publish_flow
    from app.services.stream import publish_event

    # Ensure sensor exists
    sensor = db.query(TelemetrySensor).filter(
        TelemetrySensor.name == f"CICIDS-{dataset.upper()}"
    ).first()
    if not sensor:
        sensor = TelemetrySensor(
            org_id=org_id,
            name=f"CICIDS-{dataset.upper()}",
            type="dataset",
            status="online",
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)

    logger.info(f"[CICIDS] Starting live stream: {dataset} ({_stream_state['rows_total']} rows, {speed_ms}ms/row)")

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if not _stream_state["running"]:
                    logger.info("[CICIDS] Stream stopped by user.")
                    break

                _stream_state["current_row"] = i

                try:
                    evt = _row_to_event(row, dataset)

                    # 1. Persist to DB
                    telemetry = TelemetryEvent(
                        org_id=org_id,
                        sensor_id=sensor.id,
                        event_type=evt["event_type"],
                        severity=evt["severity"],
                        message=evt["message"],
                        payload_json=evt["payload"],
                    )
                    db.add(telemetry)
                    db.commit()
                    db.refresh(telemetry)

                    # 2. Populate monitor for real-time map
                    try:
                        pkt = {
                            "id": telemetry.id,
                            "timestamp": datetime.utcnow().isoformat(),
                            "timestamp_epoch": int(datetime.utcnow().timestamp()),
                            "src_ip": evt["payload"]["src_ip"],
                            "dst_ip": evt["payload"]["dst_ip"],
                            "service": evt["event_type"],
                            "type": evt["event_type"],
                            "severity": evt["severity"],
                            "status": "detected",
                            "country": evt["payload"].get("country", "Unknown"),
                            "lat": evt["payload"].get("lat", 0),
                            "lng": evt["payload"].get("lng", 0),
                            "country_code": evt["payload"].get("country_code", "XX"),
                            "src_lat": evt["payload"].get("lat", 0),
                            "src_lon": evt["payload"].get("lng", 0),
                            "src_country": evt["payload"].get("country", "Unknown"),
                            "src_country_iso": evt["payload"].get("country_code", "XX"),
                        }
                        monitor.packets.append(pkt)
                        if len(monitor.packets) > 2000:
                            monitor.packets = monitor.packets[-2000:]
                        sev_key = evt["severity"].capitalize()
                        if sev_key == "Critical": sev_key = "Critique"
                        elif sev_key == "High": sev_key = "Élevé"
                        elif sev_key == "Medium": sev_key = "Moyen"
                        if sev_key in monitor.severity_counts:
                            monitor.severity_counts[sev_key] += 1
                        country_code = evt["payload"].get("country_code") or evt["payload"].get("country", "Unknown")
                        if country_code != "Unknown":
                            monitor.traffic_by_country[country_code] += 1
                    except Exception as monitor_err:
                        logger.warning(f"[CICIDS] Monitor update error: {monitor_err}")

                    # 3. Push to Redis streams (threat map SSE + dashboard live feed)
                    try:
                        flow_payload = {
                            "id":           telemetry.id,
                            "type":         evt["event_type"],
                            "severity":     evt["severity"],
                            "message":      evt["message"],
                            "src_ip":       evt["payload"]["src_ip"],
                            "dst_ip":       evt["payload"]["dst_ip"],
                            "src_lat":      evt["payload"]["lat"],
                            "src_lon":      evt["payload"]["lng"],
                            "src_country":  evt["payload"]["country"],
                            "attackType":   evt["event_type"],
                            "dataset":      dataset,
                            "mitre_id":     evt["payload"]["mitre_id"],
                            "timestamp":    datetime.utcnow().isoformat(),
                            "country":      evt["payload"].get("country", "Unknown"),
                            "lat":          evt["payload"].get("lat", 0),
                            "lng":          evt["payload"].get("lng", 0),
                            "service":      evt["event_type"],
                        }
                        publish_event(flow_payload)
                        publish_flow(flow_payload)
                    except Exception as redis_err:
                        logger.warning(f"[CICIDS] Redis publish error: {redis_err}")

                    _stream_state["rows_sent"] += 1
                    _stream_state["last_event"] = {
                        "label":    evt["event_type"],
                        "severity": evt["severity"],
                        "src_ip":   evt["payload"]["src_ip"],
                        "country":  evt["payload"]["country"],
                        "ts":       datetime.utcnow().isoformat(),
                    }

                    # Log every 100 rows
                    if i % 100 == 0:
                        logger.info(f"[CICIDS] Streamed {_stream_state['rows_sent']} rows...")

                except Exception as row_err:
                    logger.warning(f"[CICIDS] Row {i} error: {row_err}")
                    continue

                # Respect speed setting
                await asyncio.sleep(speed_ms / 1000.0)

    except Exception as e:
        logger.error(f"[CICIDS] Stream error: {e}")
    finally:
        _stream_state["running"] = False
        logger.info(f"[CICIDS] Stream finished. Total rows sent: {_stream_state['rows_sent']}")


# ── API Endpoints ──────────────────────────────────────────────────────────────

@router.post("/stream/start")
async def start_stream(
    background_tasks: BackgroundTasks,
    request: Request,
    dataset: str = "cicids2017",
    speed_ms: int = 200,
    org_id: str = "default",
    db: Session = Depends(get_db),
):
    """
    Démarre le streaming live du dataset CICIDS vers la DB et Redis.
    - dataset: cicids2017 | cicids_full | iotmal2026 | malmem2022 | unsw_nb15
    - speed_ms: délai entre chaque ligne en millisecondes (50-5000)
    - org_id: override org id (from X-Organization-ID header)
    """
    org_id = request.headers.get("X-Organization-ID") or org_id
    if _stream_state["running"]:
        return {
            "status": "already_running",
            "dataset": _stream_state["dataset"],
            "rows_sent": _stream_state["rows_sent"],
        }

    if dataset not in DATASET_FILES:
        raise HTTPException(status_code=400, detail=f"Unknown dataset: {dataset}")

    filepath = DATASET_FILES[dataset]
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset file not found: {dataset}")

    speed_ms = max(50, min(speed_ms, 5000))
    _stream_state["dataset"] = dataset
    _stream_state["speed_ms"] = speed_ms
    _stream_state["rows_sent"] = 0

    background_tasks.add_task(_stream_csv_to_db, dataset, speed_ms, db, org_id)

    return {
        "status": "started",
        "dataset": dataset,
        "speed_ms": speed_ms,
        "rows_total": _count_csv_rows(filepath),
        "org_id": org_id,
        "message": f"Streaming {dataset} at {speed_ms}ms/row into live DB + Redis",
    }


@router.post("/stream/stop")
async def stop_stream():
    """Arrête le streaming en cours."""
    if not _stream_state["running"]:
        return {"status": "not_running"}

    _stream_state["running"] = False
    return {
        "status": "stopped",
        "rows_sent": _stream_state["rows_sent"],
        "dataset": _stream_state["dataset"],
    }


@router.get("/stream/status")
async def stream_status():
    """Retourne l'état actuel du streamer CICIDS."""
    filepath = DATASET_FILES.get(_stream_state["dataset"], "")
    rows_total = _stream_state["rows_total"] or _count_csv_rows(filepath)
    progress = (
        round((_stream_state["rows_sent"] / rows_total) * 100, 1)
        if rows_total > 0 else 0
    )

    return {
        "running":    _stream_state["running"],
        "dataset":    _stream_state["dataset"],
        "rows_sent":  _stream_state["rows_sent"],
        "rows_total": rows_total,
        "progress":   progress,
        "speed_ms":   _stream_state["speed_ms"],
        "started_at": _stream_state["started_at"],
        "last_event": _stream_state["last_event"],
        "events_per_sec": round(1000 / max(_stream_state["speed_ms"], 1), 2),
    }


@router.get("/stream/live")
async def stream_live_sse(request: Request):
    """
    SSE endpoint — pousse l'état du streamer toutes les secondes.
    Le frontend peut s'y connecter pour voir les stats en temps réel.
    """
    async def generator() -> AsyncGenerator[str, None]:
        while True:
            if await request.is_disconnected():
                break

            filepath = DATASET_FILES.get(_stream_state["dataset"], "")
            rows_total = _stream_state["rows_total"] or _count_csv_rows(filepath)
            progress = (
                round((_stream_state["rows_sent"] / rows_total) * 100, 1)
                if rows_total > 0 else 0
            )

            data = {
                "running":    _stream_state["running"],
                "dataset":    _stream_state["dataset"],
                "rows_sent":  _stream_state["rows_sent"],
                "rows_total": rows_total,
                "progress":   progress,
                "speed_ms":   _stream_state["speed_ms"],
                "last_event": _stream_state["last_event"],
                "events_per_sec": round(1000 / max(_stream_state["speed_ms"], 1), 2),
                "ts": datetime.utcnow().isoformat(),
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(1.0)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@router.get("/stream/preview")
async def stream_preview(dataset: str = "cicids2017", limit: int = 20):
    """
    Retourne un aperçu des N premières lignes du dataset transformées en événements.
    Utile pour prévisualiser avant de lancer le stream.
    """
    filepath = DATASET_FILES.get(dataset)
    if not filepath or not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Dataset not found: {dataset}")

    events = []
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= limit:
                    break
                try:
                    evt = _row_to_event(row, dataset)
                    events.append({
                        "row": i + 1,
                        "label": evt["event_type"],
                        "severity": evt["severity"],
                        "src_ip": evt["payload"]["src_ip"],
                        "dst_ip": evt["payload"]["dst_ip"],
                        "dst_port": evt["payload"]["dst_port"],
                        "protocol": evt["payload"]["protocol"],
                        "country": evt["payload"]["country"],
                        "mitre_id": evt["payload"]["mitre_id"],
                        "flow_bytes_s": evt["payload"]["flow_bytes_s"],
                    })
                except Exception:
                    continue
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "dataset": dataset,
        "preview_count": len(events),
        "rows_total": _count_csv_rows(filepath),
        "events": events,
    }


# ── Auto-start (called from main.py on startup) ──────────────────────────────
import asyncio

def auto_start_cicids():
    """Démarre le stream CICIDS en arrière-plan si le fichier dataset existe."""
    dataset = os.getenv("CICIDS_DATASET", "cicids2017")
    speed_ms = int(os.getenv("CICIDS_SPEED_MS", "500"))
    filepath = DATASET_FILES.get(dataset)
    if not filepath or not os.path.exists(filepath):
        logger.warning(f"[CICIDS] Dataset not found at {filepath} — auto-start skipped. Download: https://www.unb.ca/cic/datasets/ids-2017.html")
        return

    from app.core.database import SessionLocal
    db = SessionLocal()
    if not db:
        logger.error("[CICIDS] No DB session — auto-start failed")
        return

    async def _run():
        await _stream_csv_to_db(dataset, speed_ms, db, "default")

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(_run())
    except Exception as e:
        logger.error(f"[CICIDS] Auto-start error: {e}")
    finally:
        db.close()
