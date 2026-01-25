import json
import os
from typing import Dict, Any, Optional, List

import numpy as np
import torch
import joblib

from app.core.database import redis_client
from app.ml.gru_model import GRUAutoencoder

MODEL_PATH = os.getenv("GRU_MODEL_PATH", "/code/app/ml_artifacts/gru_model.pt")
SCALER_PATH = os.getenv("GRU_SCALER_PATH", "/code/app/ml_artifacts/gru_scaler.joblib")
META_PATH = os.getenv("GRU_META_PATH", "/code/app/ml_artifacts/gru_meta.json")
SEQUENCE_KEY_PREFIX = "mlseq"


class GrUInferenceEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.meta = None
        self.loaded = False

    def load(self) -> None:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH) or not os.path.exists(META_PATH):
            self.loaded = False
            return

        with open(META_PATH, "r", encoding="utf-8") as file:
            self.meta = json.load(file)

        input_size = int(self.meta["input_size"])
        hidden_size = int(self.meta["hidden_size"])
        latent_size = int(self.meta["latent_size"])

        self.model = GRUAutoencoder(input_size, hidden_size, latent_size)
        state = torch.load(MODEL_PATH, map_location="cpu")
        self.model.load_state_dict(state)
        self.model.eval()
        self.scaler = joblib.load(SCALER_PATH)
        self.loaded = True

    def update_sequence(self, entity: str, event: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.loaded or not redis_client:
            return []

        payload = {
            "event_type": event.get("event_type"),
            "status": event.get("status"),
            "severity": event.get("severity"),
            "timestamp_epoch": event.get("timestamp_epoch"),
        }
        key = f"{SEQUENCE_KEY_PREFIX}:{entity}"
        redis_client.lpush(key, json.dumps(payload))
        redis_client.ltrim(key, 0, int(self.meta.get("sequence_length", 20)) - 1)

        raw = redis_client.lrange(key, 0, int(self.meta.get("sequence_length", 20)) - 1)
        sequence = []
        for item in raw:
            try:
                sequence.append(json.loads(item.decode()))
            except Exception:
                continue
        return list(reversed(sequence))

    def _event_to_vector(self, event: Dict[str, Any]) -> np.ndarray:
        event_type = (event.get("event_type") or "").lower()
        status = (event.get("status") or "").lower()
        severity = (event.get("severity") or "low").lower()

        event_map = self.meta.get("event_type_map", {})
        event_id = event_map.get(event_type, event_map.get("unknown", 0))

        status_id = 0
        if "success" in status:
            status_id = 1
        elif "fail" in status:
            status_id = -1

        severity_map = {"low": 0.0, "medium": 1.0, "high": 2.0, "critical": 3.0}
        severity_score = severity_map.get(severity, 0.0)

        hour = 0.0
        epoch = event.get("timestamp_epoch")
        if epoch:
            hour = (int(epoch) // 3600) % 24

        return np.array([event_id, status_id, severity_score, hour], dtype=np.float32)

    def score_sequence(self, sequence: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not self.loaded or not sequence:
            return None

        vectors = np.stack([self._event_to_vector(evt) for evt in sequence])
        scaled = self.scaler.transform(vectors)
        tensor = torch.tensor(scaled, dtype=torch.float32).unsqueeze(0)
        with torch.no_grad():
            recon = self.model(tensor).squeeze(0).numpy()

        mse = np.mean((scaled - recon) ** 2)
        threshold = float(self.meta.get("threshold", 0.15))
        return {
            "anomaly_score": float(mse),
            "threshold": threshold,
            "is_anomaly": mse >= threshold,
            "model_version": self.meta.get("model_version", "v1")
        }


gru_inference_engine = GrUInferenceEngine()
