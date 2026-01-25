
import json
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.database import redis_client

class RedisStreamService:
    def __init__(self):
        self.redis = redis_client

    def publish(self, channel: str, data: Dict[str, Any]):
        if not self.redis:
            return
        
        # Ensure timestamp for sorting if missing
        if "created_at" not in data:
            data["created_at"] = datetime.utcnow().isoformat()
            
        payload = json.dumps(data, default=str)
        
        # Publish to Stream (persistent buffer)
        self.redis.xadd(
            channel,
            {"payload": payload},
            maxlen=1000,
            approximate=True
        )
        
        # Publish to PubSub (realtime push)
        self.redis.publish(channel, payload)

    def update_counter(self, org_id: str, metric: str, value: int = 1):
        if not self.redis:
            return
        key = f"stats:telemetry:{org_id}"
        self.redis.hincrby(key, metric, value)
        
    def get_kpi_snapshot(self, org_id: str) -> Dict[str, int]:
        if not self.redis:
            return {}
        key = f"stats:telemetry:{org_id}"
        return {k.decode(): int(v) for k, v in self.redis.hgetall(key).items()}

stream_service = RedisStreamService()
