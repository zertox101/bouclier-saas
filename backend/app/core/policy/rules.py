import ipaddress
from typing import Optional
from abc import ABC, abstractmethod
from .models import ActionContext, RuleResult, Decision
from app.core.config import settings

class BaseRule(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @property
    @abstractmethod
    def priority(self) -> int:
        pass

    @abstractmethod
    def evaluate(self, context: ActionContext) -> RuleResult:
        pass

class ScopeRestrictionRule(BaseRule):
    name = "ScopeRestriction"
    priority = 100 # Highest priority

    def evaluate(self, context: ActionContext) -> RuleResult:
        try:
            target_ip = ipaddress.ip_address(context.target)
            allowed_network = ipaddress.ip_network(settings.MAX_SCAN_SCOPE)
            
            if target_ip not in allowed_network:
                return RuleResult(
                    rule_name=self.name,
                    priority=self.priority,
                    decision=Decision.DENY,
                    reason=f"Target {context.target} is outside of authorized scope {settings.MAX_SCAN_SCOPE}."
                )
        except ValueError:
            if not settings.ALLOW_EXTERNAL_TARGETS:
                return RuleResult(
                    rule_name=self.name,
                    priority=self.priority,
                    decision=Decision.DENY,
                    reason=f"External target '{context.target}' is forbidden in current security policy."
                )
        
        return RuleResult(
            rule_name=self.name,
            priority=self.priority,
            decision=Decision.ALLOW,
            reason="Target within authorized scope."
        )

class OffensiveModeRule(BaseRule):
    name = "OffensiveModeGate"
    priority = 90

    def evaluate(self, context: ActionContext) -> RuleResult:
        if context.mode == "offensive" and not settings.OFFENSIVE_MODE:
            return RuleResult(
                rule_name=self.name,
                priority=self.priority,
                decision=Decision.DENY,
                reason="Offensive operations are globally disabled."
            )
        return RuleResult(
            rule_name=self.name,
            priority=self.priority,
            decision=Decision.ALLOW,
            reason="Mode permitted."
        )

class SafeModeConstraintRule(BaseRule):
    name = "SafeModeEnforcer"
    priority = 10 # Lower priority, mainly provides constraints

    def evaluate(self, context: ActionContext) -> RuleResult:
        constraints = {}
        if settings.SAFE_MODE:
            constraints = {
                "timeout": 60,
                "max_parallel_tasks": 2,
                "stealth_mode": True
            }
        
        return RuleResult(
            rule_name=self.name,
            priority=self.priority,
            decision=Decision.ALLOW,
            reason="Applying safe mode constraints." if settings.SAFE_MODE else "Safe mode inactive.",
            constraints=constraints
        )
