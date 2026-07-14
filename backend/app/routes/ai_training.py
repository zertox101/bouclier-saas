from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(prefix="/api/ai-training", tags=["ai-training"])


@router.get("/status")
async def get_training_status():
    return {
        "model": "Shield-Neural-v2",
        "status": random.choice(["training", "idle", "training", "training"]),
        "current_epoch": random.randint(1, 500),
        "total_epochs": 500,
        "learning_rate": round(random.uniform(0.0001, 0.01), 5),
        "batch_size": 32,
        "dataset_size": 1240000,
        "architecture": "Transformer-XL + Attention",
        "started_at": (datetime.now().isoformat()),
        "gpu_utilization": f"{random.randint(40, 99)}%",
        "memory_used": f"{random.randint(4, 48)} GB",
    }


@router.get("/metrics")
async def get_training_metrics():
    epoch = random.randint(1, 500)
    return {
        "epoch": epoch,
        "train_loss": round(max(0.01, 2.5 * (0.99 ** epoch) + random.uniform(-0.05, 0.05)), 4),
        "val_loss": round(max(0.01, 2.8 * (0.99 ** epoch) + random.uniform(-0.05, 0.05)), 4),
        "accuracy": round(min(1.0, 0.3 + 0.7 * (1 - 0.99 ** epoch) + random.uniform(-0.02, 0.02)), 4),
        "f1_score": round(min(1.0, 0.25 + 0.75 * (1 - 0.99 ** epoch) + random.uniform(-0.02, 0.02)), 4),
        "precision": round(min(1.0, 0.3 + 0.7 * (1 - 0.99 ** epoch) + random.uniform(-0.02, 0.02)), 4),
        "recall": round(min(1.0, 0.2 + 0.8 * (1 - 0.99 ** epoch) + random.uniform(-0.02, 0.02)), 4),
    }
