from typing import Dict, Any

PLAN_LIMITS = {
    "free": {
        "max_sensors": 1,
        "retention_days": 1,
        "ai_analysis": "basic",
        "ai_quota": 1000,
        "allowed_models": ["gpt-4o-mini"],
        "custom_rules": False,
        "export_reports": False,
        "threat_map_depth": "limited",
        "label": "Free Tier"
    },
    "pro": {
        "max_sensors": 10,
        "retention_days": 30,
        "ai_analysis": "advanced",
        "ai_quota": 50000,
        "allowed_models": ["gpt-4o-mini", "gpt-4o", "antigraphity"],
        "custom_rules": True,
        "export_reports": True,
        "threat_map_depth": "full",
        "label": "Pro Dashboard"
    },
    "enterprise": {
        "max_sensors": 1000,
        "retention_days": 365,
        "ai_analysis": "custom",
        "ai_quota": 1000000,
        "allowed_models": ["gpt-4o-mini", "gpt-4o", "antigraphity", "claude-3-opus"],
        "custom_rules": True,
        "export_reports": True,
        "threat_map_depth": "real-time-plus",
        "label": "Enterprise SOC"
    }
}

def get_plan_limits(plan_name: str) -> Dict[str, Any]:
    return PLAN_LIMITS.get(plan_name.lower(), PLAN_LIMITS["free"])

def check_feature_access(user_plan: str, feature: str) -> bool:
    limits = get_plan_limits(user_plan)
    return limits.get(feature, False)
