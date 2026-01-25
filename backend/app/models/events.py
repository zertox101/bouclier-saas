from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class EventIngestRequest(BaseModel):
    timestamp_epoch: Optional[int] = Field(None, description="Epoch seconds")
    timestamp_iso: Optional[str] = Field(None, description="ISO-8601 timestamp")
    user: str = Field(..., min_length=1, max_length=128)
    host: str = Field(..., min_length=1, max_length=128)
    src_ip: Optional[str] = Field(None, max_length=64)
    dst_ip: Optional[str] = Field(None, max_length=64)
    event_type: str = Field(..., min_length=1, max_length=128)
    status: Optional[str] = Field(None, max_length=64)
    severity: Optional[str] = Field("low", max_length=32)
    details: Optional[Dict[str, Any]] = None


class EventLogResponse(BaseModel):
    id: int
    timestamp_epoch: int
    user: str
    host: str
    src_ip: Optional[str]
    event_type: str
    status: Optional[str]
    severity: str
    details: Optional[Dict[str, Any]]


class ExplainRequest(BaseModel):
    event_id: int
    question: str = Field(..., min_length=3, max_length=4000)
    top_k: Optional[int] = Field(3, ge=1, le=10)


class ExplainResponse(BaseModel):
    event_id: int
    question: str
    blocked: bool
    analysis: str
    recommended_actions: list[str]
    citations: list[Dict[str, Any]]
