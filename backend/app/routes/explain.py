from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sql import EventLog
from app.models.events import ExplainRequest, ExplainResponse
from app.services.prompt_guard import is_prompt_injection
from app.services.redaction import redact_text
from app.services.rag import rag_service

router = APIRouter()


def require_db(db: Session = Depends(get_db)) -> Session:
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return db


@router.post("/explain", response_model=ExplainResponse)
def explain_event(payload: ExplainRequest, db: Session = Depends(require_db)):
    event = db.query(EventLog).filter(EventLog.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    question = redact_text(payload.question)
    if is_prompt_injection(question):
        return ExplainResponse(
            event_id=event.id,
            question=question,
            blocked=True,
            analysis="Prompt injection detected. Explanation restricted to event metadata.",
            recommended_actions=["Review the event manually and validate access approval."],
            citations=[],
        )

    result = rag_service.explain(
        {
            "event_type": event.event_type,
            "user": event.user,
            "host": event.host,
            "status": event.status,
            "severity": event.severity,
        },
        question=question,
        top_k=payload.top_k or 3,
    )

    return ExplainResponse(
        event_id=event.id,
        question=question,
        blocked=False,
        analysis=redact_text(result["analysis"]),
        recommended_actions=result["recommended_actions"],
        citations=result["citations"],
    )
