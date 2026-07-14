from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid

class Decision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"
    REDUCE_SCOPE = "REDUCE_SCOPE"

class ActionContext(BaseModel):
    user_id: str
    role: str
    action: str
    target: str
    mode: str
    tools: List[str] = []
    metadata: Dict[str, Any] = {}

class RuleResult(BaseModel):
    rule_name: str
    decision: Decision
    reason: str
    priority: int
    constraints: Dict[str, Any] = {}

class PolicyDecision(BaseModel):
    final_decision: Decision
    audit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    decisions_chain: List[RuleResult] = []
    merged_constraints: Dict[str, Any] = {}
    summary: str
