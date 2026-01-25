import json
import os
from datetime import datetime

import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
import joblib
from sqlalchemy import create_engine, text

from app.ml.gru_model import GRUAutoencoder

DATABASE_URL = os.getenv("DATABASE_URL")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "shield_db")

MODEL_DIR = os.getenv("GRU_ARTIFACT_DIR", "/code/app/ml_artifacts")
SEQUENCE_LENGTH = int(os.getenv("GRU_SEQUENCE_LENGTH", "20"))
HIDDEN_SIZE = int(os.getenv("GRU_HIDDEN_SIZE", "32"))
LATENT_SIZE = int(os.getenv("GRU_LATENT_SIZE", "16"))
EPOCHS = int(os.getenv("GRU_EPOCHS", "10"))
BATCH_SIZE = int(os.getenv("GRU_BATCH_SIZE", "64"))


def get_engine():
    url = DATABASE_URL or f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return create_engine(url)


def fetch_events(engine) -> pd.DataFrame:
    query = text(
        """
        SELECT id, timestamp_epoch, user, host, event_type, status, severity
        FROM event_logs
        ORDER BY timestamp_epoch ASC
        """
    )
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def build_event_map(df: pd.DataFrame) -> dict:
    event_types = sorted(df["event_type"].dropna().unique().tolist())
    event_map = {name: idx + 1 for idx, name in enumerate(event_types)}
    event_map["unknown"] = 0
    return event_map


def event_to_vector(event, event_map):
    event_type = (event.get("event_type") or "").lower()
    status = (event.get("status") or "").lower()
    severity = (event.get("severity") or "low").lower()

    event_id = event_map.get(event_type, event_map["unknown"])
    status_id = 0
    if "success" in status:
        status_id = 1
    elif "fail" in status:
        status_id = -1

    severity_map = {"low": 0.0, "medium": 1.0, "high": 2.0, "critical": 3.0}
    severity_score = severity_map.get(severity, 0.0)
    hour = (int(event.get("timestamp_epoch", 0)) // 3600) % 24
    return np.array([event_id, status_id, severity_score, hour], dtype=np.float32)


def build_sequences(df: pd.DataFrame, event_map: dict) -> np.ndarray:
    sequences = []
    grouped = df.groupby(["user", "host"])
    for _, group in grouped:
        group = group.sort_values("timestamp_epoch")
        events = group.to_dict(orient="records")
        vectors = [event_to_vector(evt, event_map) for evt in events]

        for i in range(0, len(vectors), SEQUENCE_LENGTH):
            chunk = vectors[i : i + SEQUENCE_LENGTH]
            if len(chunk) < SEQUENCE_LENGTH:
                padding = [np.zeros_like(chunk[0]) for _ in range(SEQUENCE_LENGTH - len(chunk))]
                chunk.extend(padding)
            sequences.append(np.stack(chunk))

    return np.stack(sequences) if sequences else np.empty((0, SEQUENCE_LENGTH, 4))


def train():
    engine = get_engine()
    df = fetch_events(engine)
    if df.empty:
        print("No event_logs found. Ingest events before training.")
        return

    event_map = build_event_map(df)
    sequences = build_sequences(df, event_map)
    if sequences.shape[0] < 5:
        print("Not enough sequences to train.")
        return

    scaler = StandardScaler()
    flat = sequences.reshape(-1, sequences.shape[-1])
    scaler.fit(flat)
    scaled = scaler.transform(flat).reshape(sequences.shape)

    dataset = TensorDataset(torch.tensor(scaled, dtype=torch.float32))
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)

    model = GRUAutoencoder(input_size=scaled.shape[-1], hidden_size=HIDDEN_SIZE, latent_size=LATENT_SIZE)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.MSELoss()

    for epoch in range(EPOCHS):
        losses = []
        for (batch,) in loader:
            optimizer.zero_grad()
            recon = model(batch)
            loss = loss_fn(recon, batch)
            loss.backward()
            optimizer.step()
            losses.append(loss.item())
        print(f"Epoch {epoch + 1}/{EPOCHS} loss={np.mean(losses):.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    model_path = os.path.join(MODEL_DIR, "gru_model.pt")
    scaler_path = os.path.join(MODEL_DIR, "gru_scaler.joblib")
    meta_path = os.path.join(MODEL_DIR, "gru_meta.json")

    torch.save(model.state_dict(), model_path)
    joblib.dump(scaler, scaler_path)

    meta = {
        "model_version": datetime.utcnow().strftime("v%Y%m%d%H%M%S"),
        "input_size": scaled.shape[-1],
        "hidden_size": HIDDEN_SIZE,
        "latent_size": LATENT_SIZE,
        "sequence_length": SEQUENCE_LENGTH,
        "event_type_map": event_map,
        "threshold": float(np.percentile(np.mean((scaled - scaled.mean()) ** 2, axis=(1, 2)), 95)),
    }
    with open(meta_path, "w", encoding="utf-8") as file:
        json.dump(meta, file, indent=2)

    print(f"Saved artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    train()
