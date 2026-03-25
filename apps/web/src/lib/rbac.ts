/**
 * Role-Based Access Control (RBAC) utilities for Haveloc Pro
 *
 * Roles (from Prisma schema):
 *   SUPER_ADMIN — full platform access
 *   ADMIN       — full org-level access
 *   MEMBER      — standard user, can manage own tasks/projects
 *   VIEWER      — read-only access
 */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MEMBER" | "VIEWER";

// Permissions that can be checked throughout the app
export type Permission =
    | "dashboard:view"
    | "tasks:view"
    | "tasks:create"
    | "tasks:edit"
    | "projects:view"
    | "projects:create"
    | "projects:edit"
    | "threads:view"
    | "threads:create"
    | "placements:view"
    | "placements:manage"
    | "analytics:view"
    | "templates:view"
    | "templates:manage"
    | "integrations:view"
    | "integrations:manage"
    | "settings:view"
    | "settings:manage"
    | "users:manage";

/** Permissions granted to each role (higher roles inherit lower ones) */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: [
        "dashboard:view",
        "tasks:view", "tasks:create", "tasks:edit",
        "projects:view", "projects:create", "projects:edit",
        "threads:view", "threads:create",
        "placements:view", "placements:manage",
        "analytics:view",
        "templates:view", "templates:manage",
        "integrations:view", "integrations:manage",
        "settings:view", "settings:manage",
        "users:manage",
    ],
    ADMIN: [
        "dashboard:view",
        "tasks:view", "tasks:create", "tasks:edit",
        "projects:view", "projects:create", "projects:edit",
        "threads:view", "threads:create",
        "placements:view", "placements:manage",
        "analytics:view",
        "templates:view", "templates:manage",
        "integrations:view", "integrations:manage",
        "settings:view", "settings:manage",
    ],
    MEMBER: [
        "dashboard:view",
        "tasks:view", "tasks:create", "tasks:edit",
        "projects:view", "projects:create",
        "threads:view", "threads:create",
        "placements:view",
        "analytics:view",
        "templates:view",
    ],
    VIEWER: [
        "dashboard:view",
        "tasks:view",
        "projects:view",
        "threads:view",
        "placements:view",
        "analytics:view",
    ],
};

/** Check whether a role has a specific permission */
export function hasPermission(role: string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const perms = ROLE_PERMISSIONS[role as UserRole];
    if (!perms) return false;
    return perms.includes(permission);
}

/** Map of sidebar route paths → required permission */
const ROUTE_PERMISSION_MAP: Record<string, Permission> = {
    "/dashboard": "dashboard:view",
    "/dashboard/tasks": "tasks:view",
    "/dashboard/projects": "projects:view",
    "/dashboard/threads": "threads:view",
    "/placements": "placements:view",
    "/placements/matcher": "placements:manage",
    "/placements/candidates": "placements:view",
    "/dashboard/analytics": "analytics:view",
    "/dashboard/templates": "templates:view",
    "/dashboard/integrations": "integrations:view",
    "/dashboard/settings": "settings:view",
    "/dashboard/notifications": "dashboard:view",
};

/** Check whether a role can access a specific route */
export function canAccessRoute(role: string | undefined, path: string): boolean {
    const permission = ROUTE_PERMISSION_MAP[path];
    if (!permission) return true; // If no mapping, allow by default
    return hasPermission(role, permission);
}

/** Get a human-readable label for a role */
export function getRoleLabel(role: string | undefined): string {
    switch (role) {
        case "SUPER_ADMIN": return "Super Admin";
        case "ADMIN": return "Admin";
        case "MEMBER": return "Member";
        case "VIEWER": return "Viewer";
        default: return "User";
    }
}
