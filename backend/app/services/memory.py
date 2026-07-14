import os
import hashlib
import numpy as np
from typing import Dict, Any, List
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

# Qdrant configuration
QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
COLLECTION_NAME = "events_memory"

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def init_memory():
    """Initialize the vector collection if it doesn't exist."""
    collections = client.get_collections().collections
    exists = any(c.name == COLLECTION_NAME for c in collections)
    
    if not exists:
        client.recreate_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        print(f"Vector collection '{COLLECTION_NAME}' initialized.")

def text_to_vector(text: str) -> List[float]:
    """
    Convert text to a vector. 
    Currently using random for simulation, should be replaced with a real embedding model (e.g. sentence-transformers).
    """
    # Seed by text hash for somewhat consistent pseudo-embeddings during dev
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
    np.random.seed(seed)
    return np.random.rand(384).tolist()

def store_event(event: Dict[str, Any]):
    """Store an event with its vector representation in Qdrant."""
    text = f"{event.get('event_type')} {event.get('sourceIp')} {event.get('message')}"
    vector = text_to_vector(text)
    
    # Generate unique point ID from content hash
    point_id = int(hashlib.md5(str(event).encode()).hexdigest(), 16) % (10**8)
    
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[{
            "id": point_id,
            "vector": vector,
            "payload": event
        }]
    )

def search_similar(event: Dict[str, Any], limit: int = 5):
    """Search for similar past events."""
    text = f"{event.get('event_type')} {event.get('sourceIp')} {event.get('message')}"
    vector = text_to_vector(text)
    
    return client.search(
        collection_name=COLLECTION_NAME,
        query_vector=vector,
        limit=limit
    )
