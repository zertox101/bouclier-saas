import asyncio
import json
from typing import Set, Dict, Any

class MemoryBroadcaster:
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()

    async def subscribe(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        return queue

    async def unsubscribe(self, queue: asyncio.Queue):
        self.subscribers.discard(queue)

    async def broadcast(self, channel: str, data: Dict[str, Any]):
        message = {
            "channel": channel,
            "data": data
        }
        for queue in self.subscribers:
            await queue.put(message)

# Global instances for different channels
event_broadcaster = MemoryBroadcaster()
health_broadcaster = MemoryBroadcaster()
