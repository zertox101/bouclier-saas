"use client";

import { ReactNode } from "react";
import { PermissionGate as PermissionGateHook, RoleGate as RoleGateHook, SuperAdminGate, OrgAdminGate, AnalystGate } from "@/lib/rbac/guards";
import { Permission, Role } from "@/lib/rbac/permissions";

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
  return (
    <PermissionGateHook permission={permission} permissions={permissions} fallback={fallback}>
      {children}
    </PermissionGateHook>
  );
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
  return (
    <RoleGateHook role={role} roles={roles} fallback={fallback}>
      {children}
    </RoleGateHook>
  );
}

export { SuperAdminGate, OrgAdminGate, AnalystGate } from "@/lib/rbac/guards";