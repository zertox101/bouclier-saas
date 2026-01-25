import os
from typing import Dict, Any, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.redaction import redact_text


class RagIndex:
    def __init__(self, source_dir: str):
        self.source_dir = source_dir
        self.documents: List[Dict[str, Any]] = []
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = None

    def load(self) -> None:
        self.documents = []
        for root, _, files in os.walk(self.source_dir):
            for name in files:
                if not name.endswith(".md") and not name.endswith(".txt"):
                    continue
                path = os.path.join(root, name)
                with open(path, "r", encoding="utf-8") as file:
                    text = file.read()
                for idx, chunk in enumerate(self._split_chunks(text)):
                    self.documents.append(
                        {"id": f"{name}:{idx}", "source": name, "content": chunk}
                    )
        if self.documents:
            self.matrix = self.vectorizer.fit_transform(
                [doc["content"] for doc in self.documents]
            )

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.documents or self.matrix is None:
            return []
        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.matrix)[0]
        ranked = sorted(
            zip(self.documents, scores), key=lambda x: x[1], reverse=True
        )[:top_k]
        return [
            {
                "source": doc["source"],
                "snippet": doc["content"][:300],
                "score": round(float(score), 4),
            }
            for doc, score in ranked
        ]

    def _split_chunks(self, text: str) -> List[str]:
        chunks = [chunk.strip() for chunk in text.split("\n\n") if chunk.strip()]
        return chunks if chunks else [text]


class RagService:
    def __init__(self, source_dir: str):
        self.index = RagIndex(source_dir)
        self.index.load()

    def explain(self, event: Dict[str, Any], question: str, top_k: int) -> Dict[str, Any]:
        safe_question = redact_text(question)
        summary = self._build_summary(event)
        query = f"{safe_question}\n{summary}"
        citations = self.index.search(query, top_k=top_k)
        return {
            "analysis": summary,
            "citations": citations,
            "recommended_actions": self._recommendations(event),
        }

    def _build_summary(self, event: Dict[str, Any]) -> str:
        event_type = event.get("event_type", "unknown")
        user = event.get("user", "unknown")
        host = event.get("host", "unknown")
        severity = event.get("severity", "low")
        status = event.get("status", "n/a")
        return (
            f"Event type '{event_type}' for user '{user}' on host '{host}'. "
            f"Status: {status}. Severity: {severity}."
        )

    def _recommendations(self, event: Dict[str, Any]) -> List[str]:
        event_type = (event.get("event_type") or "").lower()
        status = (event.get("status") or "").lower()
        recommendations = []
        if "auth" in event_type and "fail" in status:
            recommendations.append("Review authentication logs and enforce MFA.")
        if "priv" in event_type:
            recommendations.append("Verify privilege change approval and audit roles.")
        if not recommendations:
            recommendations.append("Continue monitoring and validate related telemetry.")
        return recommendations


rag_service = RagService(os.getenv("RAG_SOURCE_DIR", "/code/app/rag_sources"))
