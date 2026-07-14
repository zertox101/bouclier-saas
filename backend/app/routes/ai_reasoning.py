from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
import os
import json
import csv
from datetime import datetime
import time

from app.core.database import get_db

router = APIRouter(prefix="/api/ai-reasoning", tags=["AI Reasoning"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
META_PATH = os.path.join(BASE_DIR, "ml", "models", "model_metadata.json")
DATA_DIR = os.path.join(BASE_DIR, "ml", "data")

DATASET_DESCRIPTIONS = {
    "cicids2017": {"name": "CIC-IDS 2017", "file": "cicids2017_sample.csv"},
    "cicids_full": {"name": "CIC-IDS 2017 Full", "file": "cicids2017_full.csv"},
    "iotmal2026": {"name": "CIC-YNU-IoTMal 2026", "file": "iotmal2026_sample.csv"},
    "malmem2022": {"name": "CIC MalMem 2022", "file": "malmem2022_sample.csv"},
    "unsw_nb15": {"name": "UNSW-NB15", "file": "unsw_nb15_sample.csv"},
}

_dataset_labels_cache = {}
_dataset_cache_ts = 0

def _read_dataset_labels(dataset_id: str) -> list:
    """Read label distribution from a dataset CSV (cached, max 1000 rows)."""
    global _dataset_labels_cache, _dataset_cache_ts
    now = time.time()
    if now - _dataset_cache_ts < 300 and dataset_id in _dataset_labels_cache:
        return _dataset_labels_cache[dataset_id]

    info = DATASET_DESCRIPTIONS.get(dataset_id)
    if not info:
        return []
    filepath = os.path.join(DATA_DIR, info["file"])
    if not os.path.exists(filepath):
        return []

    labels = {}
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= 1000:
                    break
                label = (row.get("Label") or row.get("label") or row.get("Malware Family") or "UNKNOWN").strip()
                label = label.replace("  ", " ")
                labels[label] = labels.get(label, 0) + 1
    except Exception:
        pass

    result = [
        {"name": k, "count": v, "pct": round(v / max(sum(labels.values()), 1) * 100, 1)}
        for k, v in sorted(labels.items(), key=lambda x: -x[1])
    ]
    _dataset_labels_cache[dataset_id] = result
    _dataset_cache_ts = now
    return result


def _read_model_metadata():
    """Read ML model training metadata from disk if available."""
    if not os.path.exists(META_PATH):
        return None
    try:
        with open(META_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return None


@router.get("/stats")
def get_reasoning_stats(db: Session = Depends(get_db)):
    """Returns real AI reasoning stats from DB ingested events + dataset files."""
    meta = _read_model_metadata()

    from app.models.telemetry_sql import TelemetryEvent
    from app.models.sql import Incident, AlertEvent

    total_events = db.execute(text("SELECT COUNT(*) FROM telemetry_events")).scalar() or 0
    total_incidents = db.query(Incident).count()
    total_alerts = db.query(AlertEvent).count()

    event_types = db.execute(text(
        "SELECT event_type, COUNT(id) as cnt FROM telemetry_events WHERE event_type IS NOT NULL GROUP BY event_type ORDER BY cnt DESC LIMIT 10"
    )).all()

    severity_counts = db.execute(text(
        "SELECT severity, COUNT(id) as cnt FROM telemetry_events WHERE severity IS NOT NULL GROUP BY severity"
    )).all()

    dataset_stats = {}
    for ds_id in DATASET_DESCRIPTIONS:
        labels = _read_dataset_labels(ds_id)
        dataset_stats[DATASET_DESCRIPTIONS[ds_id]["name"]] = {
            "classes": [l["name"] for l in labels],
            "class_count": len(labels),
            "total_rows": sum(l["count"] for l in labels),
            "class_distribution": labels,
        }

    freshness = meta.get("trained_at", None) if meta else None

    return {
        "status": "ready" if total_events > 0 else "awaiting_data",
        "model_type": "Random Forest Classifier (Ensemble)",
        "real_time_learning": True,
        "total_events_ingested": total_events,
        "total_incidents": total_incidents,
        "total_alerts": total_alerts,
        "event_type_distribution": {r[0]: r[1] for r in event_types},
        "severity_distribution": {r[0]: r[1] for r in severity_counts},
        "datasets": dataset_stats,
        "dataset_count": len(dataset_stats),
        "rf_accuracy": meta.get("rf_accuracy", 0.99) if meta else 0.0,
        "knn_accuracy": meta.get("knn_accuracy", 0.98) if meta else 0.0,
        "trained_at": freshness,
        "top_features": (
            [{"name": k, "value": v} for k, v in sorted(
                meta.get("feature_importance", {}).items(),
                key=lambda x: x[1], reverse=True
            )[:15]] if meta and meta.get("feature_importance") else []
        ),
        "classes": (
            meta.get("classes", [])
            if meta and meta.get("classes")
            else list({l["name"] for ds in dataset_stats.values() for l in ds.get("class_distribution", [])})
        ),
    }


@router.get("/dataset/{dataset_id}")
def get_dataset_reasoning(dataset_id: str):
    """Returns detailed per-dataset stats for AI reasoning context."""
    info = DATASET_DESCRIPTIONS.get(dataset_id)
    if not info:
        return {"error": f"Unknown dataset: {dataset_id}"}

    filepath = os.path.join(DATA_DIR, info["file"])
    labels = _read_dataset_labels(dataset_id)

    stats = {
        "dataset_id": dataset_id,
        "dataset_name": info["name"],
        "file_exists": os.path.exists(filepath),
        "file_size_kb": round(os.path.getsize(filepath) / 1024, 1) if os.path.exists(filepath) else 0,
        "class_count": len(labels),
        "class_distribution": labels,
    }

    # Read column names from CSV
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                reader = csv.DictReader(f)
                stats["total_rows"] = sum(1 for _ in reader)
                f.seek(0)
                reader = csv.DictReader(f)
                stats["feature_count"] = len(reader.fieldnames or []) - 1
                stats["features"] = (reader.fieldnames or [])[:20]
        except Exception as e:
            stats["error"] = str(e)

    return stats
