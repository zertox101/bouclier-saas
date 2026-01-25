import json
import os
from typing import Dict, Any

from app.core.database import redis_client

STREAM_NAME = os.getenv("REDIS_STREAM_NAME", "event_stream")
STREAM_MAXLEN = int(os.getenv("REDIS_STREAM_MAXLEN", "10000"))


def publish_event(event: Dict[str, Any]) -> None:
    if not redis_client:
        return
    payload = json.dumps(event)
    redis_client.xadd(
        STREAM_NAME,
        {"payload": payload},
        maxlen=STREAM_MAXLEN,
        approximate=True,
    )
