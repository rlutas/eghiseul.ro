import { createAdminClient } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────────
// Permission Types
// ──────────────────────────────────────────────────────────────

export type Permission =
  | 'orders.view'
  | 'orders.manage'
  | 'payments.verify'
  | 'users.manage'
  | 'settings.manage'
  | 'documents.generate'
  | 'documents.view';

/**
 * Implied permissions: if a user has a permission on the left,
 * they automatically gain all permissions on the right.
 *
 * - orders.manage  -> orders.view  (managing orders requires viewing them)
 * - payments.verify -> orders.view (verifying payments requires viewing orders)
 */
const IMPLIED_PERMISSIONS: Record<Permission, Permission[]> = {
  'orders.view': [],
  'orders.manage': ['orders.view'],
  'payments.verify': ['orders.view'],
  'users.manage': [],
  'settings.manage': [],
  'documents.generate': ['documents.view', 'orders.view'],
  'documents.view': ['orders.view'],
};

// ──────────────────────────────────────────────────────────────
// All valid permissions (for validation)
// ──────────────────────────────────────────────────────────────

export const ALL_PERMISSIONS: Permission[] = [
  'orders.view',
  'orders.manage',
  'payments.verify',
  'users.manage',
  'settings.manage',
  'documents.generate',
  'documents.view',
];

// ──────────────────────────────────────────────────────────────
// Result types
// ──────────────────────────────────────────────────────────────

export interface UserPermissions {
  role: string;
  permissions: Permission[];
  isSuperAdmin: boolean;
}

// ──────────────────────────────────────────────────────────────
// Core functions
// ──────────────────────────────────────────────────────────────

/**
 * Default permissions for each admin role (when JSONB permissions column is empty/default).
 * These are merged with any explicit JSONB permissions for the role.
 */
const ROLE_DEFAULTS: Record<string, Permission[]> = {
  'manager': ['orders.view', 'orders.manage', 'payments.verify', 'users.manage', 'settings.manage', 'documents.generate', 'documents.view'],
  'operator': ['orders.view', 'orders.manage', 'documents.generate', 'documents.view'],
  'contabil': ['orders.view', 'payments.verify', 'documents.view'],
  'avocat': ['orders.view', 'documents.view'],
};

/**
 * All roles considered "admin" (i.e. allowed to access the admin panel).
 */
const ADMIN_ROLES = ['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee'];

/**
 * Fetch a user's role and effective permissions from the database.
 *
 * - super_admin: has ALL permissions (JSONB column is ignored)
 * - manager/operator/contabil/avocat: gets ROLE_DEFAULTS merged with any explicit JSONB permissions
 * - employee: has permissions from JSONB column + implied permissions only
 * - customer/partner/any other role: has NO admin permissions
 */
export async function getUserPermissions(
  userId: string
): Promise<UserPermissions> {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, permissions')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { role: 'customer', permissions: [], isSuperAdmin: false };
  }

  const role = profile.role || 'customer';

  // super_admin gets everything
  if (role === 'super_admin') {
    return {
      role,
      permissions: [...ALL_PERMISSIONS],
      isSuperAdmin: true,
    };
  }

  // Roles with defaults (manager, operator, contabil, avocat):
  // Start with ROLE_DEFAULTS and merge any explicit JSONB permissions
  if (ROLE_DEFAULTS[role]) {
    const expanded = new Set<Permission>(ROLE_DEFAULTS[role]);

    // Merge explicit JSONB permissions (if any)
    const rawPermissions = profile.permissions as Record<string, boolean> | null;
    if (rawPermissions && typeof rawPermissions === 'object') {
      for (const [key, value] of Object.entries(rawPermissions)) {
        if (value === true && ALL_PERMISSIONS.includes(key as Permission)) {
          expanded.add(key as Permission);
        }
      }
    }

    // Expand implied permissions
    for (const perm of Array.from(expanded)) {
      for (const implied of IMPLIED_PERMISSIONS[perm]) {
        expanded.add(implied);
      }
    }

    return {
      role,
      permissions: Array.from(expanded),
      isSuperAdmin: false,
    };
  }

  // employee gets explicit permissions + implied ones (no defaults)
  if (role === 'employee') {
    const rawPermissions = profile.permissions as Record<string, boolean> | null;
    const explicit: Permission[] = [];

    if (rawPermissions && typeof rawPermissions === 'object') {
      for (const [key, value] of Object.entries(rawPermissions)) {
        if (value === true && ALL_PERMISSIONS.includes(key as Permission)) {
          explicit.push(key as Permission);
        }
      }
    }

    // Expand implied permissions
    const expanded = new Set<Permission>(explicit);
    for (const perm of explicit) {
      for (const implied of IMPLIED_PERMISSIONS[perm]) {
        expanded.add(implied);
      }
    }

    return {
      role,
      permissions: Array.from(expanded),
      isSuperAdmin: false,
    };
  }

  // Any other role: no admin permissions
  return { role, permissions: [], isSuperAdmin: false };
}

/**
 * Check whether a user has the required permission(s).
 *
 * If `required` is an array, the user must have ALL of them.
 */
export async function checkPermission(
  userId: string,
  required: Permission | Permission[]
): Promise<boolean> {
  const { permissions } = await getUserPermissions(userId);
  const requiredArray = Array.isArray(required) ? required : [required];
  return requiredArray.every((p) => permissions.includes(p));
}

/**
 * Require a user to have the given permission(s), or throw a 403 Response.
 *
 * Usage in API routes:
 * ```ts
 * await requirePermission(userId, 'orders.manage');
 * ```
 */
export async function requirePermission(
  userId: string,
  required: Permission | Permission[]
): Promise<void> {
  const allowed = await checkPermission(userId, required);
  if (!allowed) {
    throw new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Require the user to be at least an admin role.
 * Throws a 403 Response if the user is a customer or partner.
 *
 * Admin roles: super_admin, manager, operator, contabil, avocat, employee
 *
 * Usage in API routes:
 * ```ts
 * await requireAdmin(userId);
 * ```
 */
export async function requireAdmin(userId: string): Promise<void> {
  const { role } = await getUserPermissions(userId);
  if (!ADMIN_ROLES.includes(role)) {
    throw new Response(
      JSON.stringify({ error: 'Admin access required' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
