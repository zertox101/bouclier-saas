from enum import Enum
from typing import Dict, List, Set


class Permission(str, Enum):
    INCIDENTS_READ = "incidents:read"
    INCIDENTS_WRITE = "incidents:write"
    INCIDENTS_DELETE = "incidents:delete"

    REPORTS_READ = "reports:read"
    REPORTS_GENERATE = "reports:generate"

    ASSETS_READ = "assets:read"
    ASSETS_MANAGE = "assets:manage"

    USERS_READ = "users:read"
    USERS_MANAGE = "users:manage"

    PLAYBOOKS_READ = "playbooks:read"
    PLAYBOOKS_EXECUTE = "playbooks:execute"

    SETTINGS_MANAGE = "settings:manage"

    BILLING_READ = "billing:read"
    BILLING_MANAGE = "billing:manage"

    THREAT_INTEL_READ = "threat_intel:read"

    DASHBOARD_READ = "dashboard:read"
    AUDIT_READ = "audit:read"

    PLATFORM_ORGS_MANAGE = "platform:orgs:manage"
    PLATFORM_USERS_MANAGE = "platform:users:manage"
    PLATFORM_BILLING_MANAGE = "platform:billing:manage"
    PLATFORM_AUDIT_READ = "platform:audit:read"
    PLATFORM_SETTINGS_MANAGE = "platform:settings:manage"
    PLATFORM_HEALTH_VIEW = "platform:health:view"


PERMISSION_GROUPS: Dict[str, Set[str]] = {
    "incidents": {
        Permission.INCIDENTS_READ,
        Permission.INCIDENTS_WRITE,
        Permission.INCIDENTS_DELETE,
    },
    "reports": {
        Permission.REPORTS_READ,
        Permission.REPORTS_GENERATE,
    },
    "assets": {
        Permission.ASSETS_READ,
        Permission.ASSETS_MANAGE,
    },
    "users": {
        Permission.USERS_READ,
        Permission.USERS_MANAGE,
    },
    "playbooks": {
        Permission.PLAYBOOKS_READ,
        Permission.PLAYBOOKS_EXECUTE,
    },
    "settings": {
        Permission.SETTINGS_MANAGE,
    },
    "billing": {
        Permission.BILLING_READ,
        Permission.BILLING_MANAGE,
    },
    "threat_intel": {
        Permission.THREAT_INTEL_READ,
    },
    "dashboard": {
        Permission.DASHBOARD_READ,
    },
    "audit": {
        Permission.AUDIT_READ,
    },
    "platform": {
        Permission.PLATFORM_ORGS_MANAGE,
        Permission.PLATFORM_USERS_MANAGE,
        Permission.PLATFORM_BILLING_MANAGE,
        Permission.PLATFORM_AUDIT_READ,
        Permission.PLATFORM_SETTINGS_MANAGE,
        Permission.PLATFORM_HEALTH_VIEW,
    },
}


ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "SUPER_ADMIN": [p.value for p in Permission],
    "ORG_ADMIN": [
        Permission.INCIDENTS_READ,
        Permission.INCIDENTS_WRITE,
        Permission.INCIDENTS_DELETE,
        Permission.REPORTS_READ,
        Permission.REPORTS_GENERATE,
        Permission.ASSETS_READ,
        Permission.ASSETS_MANAGE,
        Permission.USERS_READ,
        Permission.USERS_MANAGE,
        Permission.PLAYBOOKS_READ,
        Permission.PLAYBOOKS_EXECUTE,
        Permission.SETTINGS_MANAGE,
        Permission.BILLING_READ,
        Permission.BILLING_MANAGE,
        Permission.THREAT_INTEL_READ,
        Permission.DASHBOARD_READ,
        Permission.AUDIT_READ,
    ],
    "ANALYST": [
        Permission.INCIDENTS_READ,
        Permission.INCIDENTS_WRITE,
        Permission.REPORTS_READ,
        Permission.REPORTS_GENERATE,
        Permission.ASSETS_READ,
        Permission.PLAYBOOKS_READ,
        Permission.PLAYBOOKS_EXECUTE,
        Permission.THREAT_INTEL_READ,
    ],
}


def get_permissions_for_role(role: str) -> List[str]:
    return ROLE_PERMISSIONS.get(role, [])


def role_has_permission(role: str, permission: str) -> bool:
    if role == "SUPER_ADMIN":
        return True
    return permission in ROLE_PERMISSIONS.get(role, [])


def get_all_permissions() -> List[dict]:
    result = []
    for perm in Permission:
        group = next((g for g, perms in PERMISSION_GROUPS.items() if perm.value in perms), "other")
        result.append({
            "permission": perm.value,
            "group": group,
            "description": perm.value.replace(":", " ").replace("_", " ").title(),
        })
    return result