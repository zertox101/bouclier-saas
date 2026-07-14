"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { Role, Permission, roleHasPermission, getPermissionsForRole } from "./permissions";

export function usePermissions() {
  const { data: session } = useSession();
  
  const role = session?.user?.role as Role | undefined;
  const permissions = session?.user?.permissions ?? [];
  const orgId = session?.user?.orgId;
  
  const hasPermission = (permission: Permission | Permission[]): boolean => {
    const perms = Array.isArray(permission) ? permission : [permission];
    if (role === "SUPER_ADMIN") return true;
    return perms.every(p => permissions.includes(p));
  };
  
  const hasAnyPermission = (permission: Permission[]): boolean => {
    if (role === "SUPER_ADMIN") return true;
    return permission.some(p => permissions.includes(p));
  };
  
  const hasRole = (allowedRoles: Role | Role[]): boolean => {
    if (!role) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(role);
  };
  
  const isSuperAdmin = () => role === "SUPER_ADMIN";
  const isOrgAdmin = () => role === "ORG_ADMIN";
  const isAnalyst = () => role === "ANALYST";
  
  return {
    role,
    permissions,
    orgId,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isSuperAdmin,
    isOrgAdmin,
    isAnalyst,
  };
}

export function PermissionGate({
  permission,
  permissions,
  children,
  fallback = null,
}: {
  permission?: Permission;
  permissions?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  const allowed = permission
    ? hasPermission(permission)
    : permissions
      ? hasAnyPermission(permissions)
      : true;
  
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function RoleGate({
  role,
  roles,
  children,
  fallback = null,
}: {
  role?: Role;
  roles?: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasRole } = usePermissions();
  
  const allowed = role
    ? hasRole(role)
    : roles
      ? hasRole(roles)
      : true;
  
  return allowed ? <>{children}</> : <>{fallback}</>;
}

export function SuperAdminGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isSuperAdmin } = usePermissions();
  return isSuperAdmin() ? <>{children}</> : <>{fallback}</>;
}

export function OrgAdminGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isOrgAdmin, isSuperAdmin } = usePermissions();
  return (isOrgAdmin() || isSuperAdmin()) ? <>{children}</> : <>{fallback}</>;
}

export function AnalystGate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAnalyst, isOrgAdmin, isSuperAdmin } = usePermissions();
  return (isAnalyst() || isOrgAdmin() || isSuperAdmin()) ? <>{children}</> : <>{fallback}</>;
}