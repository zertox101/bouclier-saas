from typing import List, Dict, Any
from .models import ActionContext, PolicyDecision, Decision, RuleResult
from .rules import ScopeRestrictionRule, OffensiveModeRule, SafeModeConstraintRule
import logging
import json

logger = logging.getLogger("shield.policy-v2")

class PolicyEngine:
    def __init__(self):
        # Register all rules
        self.rules = [
            ScopeRestrictionRule(),
            OffensiveModeRule(),
            SafeModeConstraintRule()
        ]

    def evaluate(self, context: ActionContext) -> PolicyDecision:
        """
        CrowdStrike-style Deterministic Policy Evaluation.
        1. Evaluate all rules.
        2. Aggregation: Any DENY overrides everything.
        3. Merging: Combine constraints from all ALLOW results.
        """
        results: List[RuleResult] = []
        for rule in self.rules:
            results.append(rule.evaluate(context))
        
        # Sort results by priority for audit chain clarity
        results.sort(key=lambda x: x.priority, reverse=True)

        # Decision Aggregation Logic
        final_decision = Decision.ALLOW
        summary = "All policies passed."
        merged_constraints: Dict[str, Any] = {}

        # Scan for any DENY (highest priority first)
        for res in results:
            # Merge constraints regardless of decision (though usually from ALLOW)
            if res.constraints:
                merged_constraints.update(res.constraints)

            if res.decision == Decision.DENY:
                final_decision = Decision.DENY
                summary = f"REJECTED by {res.rule_name}: {res.reason}"
                # In a strict Deny-First system, we could break here, 
                # but we continue to collect all results for the audit chain.

        policy_output = PolicyDecision(
            final_decision=final_decision,
            decisions_chain=results,
            merged_constraints=merged_constraints,
            summary=summary
        )

        # 🛡️ Audit Logging (Tamper-proof style)
        self._log_audit(context, policy_output)

        return policy_output

    def _log_audit(self, context: ActionContext, output: PolicyDecision):
        audit_entry = {
            "audit_id": output.audit_id,
            "user": context.user_id,
            "action": context.action,
            "target": context.target,
            "verdict": output.final_decision,
            "summary": output.summary,
            "constraints": output.merged_constraints,
            "chain": [
                {"rule": r.rule_name, "decision": r.decision, "reason": r.reason} 
                for r in output.decisions_chain
            ]
        }
        # In production, this would go to an append-only log or a secure DB
        logger.warning(f"POLICY_AUDIT | {json.dumps(audit_entry)}")

policy_engine = PolicyEngine()
