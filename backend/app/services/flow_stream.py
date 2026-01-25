import json
import os
from typing import Any, Dict

from app.core.database import redis_client

FLOW_STREAM_NAME = os.getenv("REDIS_FLOW_STREAM_NAME", "flows")
FLOW_STREAM_MAXLEN = int(os.getenv("REDIS_FLOW_STREAM_MAXLEN", "50000"))


def publish_flow(flow: Dict[str, Any]) -> None:
    if not redis_client:
        return
    payload = json.dumps(flow)
    redis_client.xadd(
        FLOW_STREAM_NAME,
        {"payload": payload},
        maxlen=FLOW_STREAM_MAXLEN,
        approximate=True,
    )
