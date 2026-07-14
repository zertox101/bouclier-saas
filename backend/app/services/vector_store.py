"""
Vector Store — Qdrant + Ollama embeddings for CVEs, MITRE ATT&CK, ExploitDB, history
"""
import json
import os
import hashlib
from typing import List, Dict, Any, Optional
import httpx
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.core.database import redis_client

QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
OLLAMA_URL = os.getenv("LLM_BASE_URL", "http://ollama:11434")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")

VECTOR_SIZE = 768
COLLECTIONS = {
    "cve": "CVE knowledge base",
    "mitre_attack": "MITRE ATT&CK techniques",
    "exploitdb": "ExploitDB entries",
    "incidents": "Historical security incidents",
    "reports": "Previous pentest reports",
}

client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)


async def get_embedding(text: str) -> List[float]:
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                f"{OLLAMA_URL}/api/embeddings",
                json={"model": EMBED_MODEL, "prompt": text[:512]},
            )
            if resp.status_code == 200:
                return resp.json().get("embedding", _fallback_embed(text))
    except Exception:
        pass
    return _fallback_embed(text)


def _fallback_embed(text: str) -> List[float]:
    h = hashlib.md5(text.encode()).hexdigest()
    import numpy as np
    np.random.seed(int(h[:8], 16))
    return np.random.uniform(-0.1, 0.1, VECTOR_SIZE).tolist()


def _ensure_collection(name: str):
    collections = client.get_collections().collections
    existing = {c.name: c for c in collections}
    if name in existing:
        info = client.get_collection(collection_name=name)
        if info.config.params.vectors.size != VECTOR_SIZE:
            client.delete_collection(collection_name=name)
            client.create_collection(
                collection_name=name,
                vectors_config=models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE),
            )
    else:
        client.create_collection(
            collection_name=name,
            vectors_config=models.VectorParams(size=VECTOR_SIZE, distance=models.Distance.COSINE),
        )


async def store_document(collection: str, doc_id: str, text: str, metadata: Dict[str, Any] = None):
    _ensure_collection(collection)
    vec = await get_embedding(text)
    client.upsert(
        collection_name=collection,
        points=[models.PointStruct(id=hash(doc_id) % (2**63), vector=vec, payload={
            "doc_id": doc_id, "text": text[:2000], **(metadata or {}),
        })],
    )
    return doc_id


async def search_similar(collection: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
    _ensure_collection(collection)
    vec = await get_embedding(query)
    from qdrant_client.http import models
    hits = client.query_points(
        collection_name=collection,
        query=vec,
        limit=limit,
    )
    return [
        {"id": h.payload.get("doc_id"), "text": h.payload.get("text", ""), "score": round(h.score, 4), **(h.payload or {})}
        for h in (hits.points if hasattr(hits, 'points') else hits)
    ]


async def ingest_cve(cve_id: str, description: str, cvss: str = "", affected: str = ""):
    return await store_document("cve", cve_id, f"{cve_id}: {description}. CVSS: {cvss}. Affected: {affected}", {
        "cve_id": cve_id, "cvss": cvss, "affected": affected, "type": "cve",
    })


async def ingest_mitre_technique(tech_id: str, name: str, description: str, tactics: List[str] = None):
    return await store_document("mitre_attack", tech_id, f"{tech_id}: {name} — {description}", {
        "technique_id": tech_id, "name": name, "tactics": tactics or [], "type": "mitre",
    })


async def get_all_techniques(collection: str = "mitre_attack") -> List[Dict[str, Any]]:
    _ensure_collection(collection)
    results = client.scroll(collection_name=collection, limit=500)
    return [
        {k: v for k, v in (p.payload or {}).items() if k != "text"}
        for p in (results[0] if results else [])
    ]


async def rebuild_cve_cache():
    if not redis_client:
        return
    cache_key = "vector_store:cve_cache"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    results = client.scroll(collection_name="cve", limit=100) if client.get_collections() else ([], None)
    entries = [p.payload for p in results[0]] if results else []
    redis_client.setex(cache_key, 300, json.dumps(entries))
    return entries
