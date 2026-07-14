export type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST";

export type Permission =
  | "incidents:read"
  | "incidents:write"
  | "incidents:delete"
  | "reports:read"
  | "reports:generate"
  | "assets:read"
  | "assets:manage"
  | "users:read"
  | "users:manage"
  | "playbooks:read"
  | "playbooks:execute"
  | "settings:manage"
  | "billing:read"
  | "billing:manage"
  | "threat_intel:read"
  | "platform:orgs:manage"
  | "platform:users:manage"
  | "platform:billing:manage"
  | "platform:audit:read"
  | "platform:settings:manage";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "incidents:read", "incidents:write", "incidents:delete",
    "reports:read", "reports:generate",
    "assets:read", "assets:manage",
    "users:read", "users:manage",
    "playbooks:read", "playbooks:execute",
    "settings:manage",
    "billing:read", "billing:manage",
    "threat_intel:read",
    "platform:orgs:manage", "platform:users:manage",
    "platform:billing:manage", "platform:audit:read", "platform:settings:manage",
  ],
  ORG_ADMIN: [
    "incidents:read", "incidents:write", "incidents:delete",
    "reports:read", "reports:generate",
    "assets:read", "assets:manage",
    "users:read", "users:manage",
    "playbooks:read", "playbooks:execute",
    "settings:manage",
    "billing:read", "billing:manage",
    "threat_intel:read",
  ],
  ANALYST: [
    "incidents:read", "incidents:write",
    "reports:read", "reports:generate",
    "assets:read",
    "playbooks:read", "playbooks:execute",
    "threat_intel:read",
  ],
};

export const PERMISSION_GROUPS: Record<string, Permission[]> = {
  incidents: ["incidents:read", "incidents:write", "incidents:delete"],
  reports: ["reports:read", "reports:generate"],
  assets: ["assets:read", "assets:manage"],
  users: ["users:read", "users:manage"],
  playbooks: ["playbooks:read", "playbooks:execute"],
  settings: ["settings:manage"],
  billing: ["billing:read", "billing:manage"],
  threat_intel: ["threat_intel:read"],
  platform: [
    "platform:orgs:manage",
    "platform:users:manage",
    "platform:billing:manage",
    "platform:audit:read",
    "platform:settings:manage",
  ],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  if (role === "SUPER_ADMIN") return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getAllPermissions(): { permission: Permission; group: string; description: string }[] {
  const result: { permission: Permission; group: string; description: string }[] = [];
  for (const [group, permissions] of Object.entries(PERMISSION_GROUPS)) {
    for (const permission of permissions) {
      result.push({
        permission,
        group,
        description: permission.replace(":", " ").replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
      });
    }
  }
  return result;
}