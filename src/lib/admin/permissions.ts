import { createAdminClient } from '@/lib/supabase/admin';

// ──────────────────────────────────────────────────────────────
// Permission Types
// ──────────────────────────────────────────────────────────────

export type Permission =
  | 'orders.view'
  | 'orders.manage'
  | 'orders.pdf_upload'
  | 'payments.verify'
  | 'users.manage'
  | 'settings.manage'
  | 'documents.generate'
  | 'documents.view'
  | 'registry.manage';

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
  'orders.pdf_upload': ['orders.view'],
  'payments.verify': ['orders.view'],
  'users.manage': [],
  // settings.manage implică registrul — cine administra setările înainte de
  // separarea permisiunii de registru nu pierde acces.
  'settings.manage': ['registry.manage'],
  'documents.generate': ['documents.view', 'orders.view'],
  'documents.view': ['orders.view'],
  'registry.manage': [],
};

// ──────────────────────────────────────────────────────────────
// All valid permissions (for validation)
// ──────────────────────────────────────────────────────────────

export const ALL_PERMISSIONS: Permission[] = [
  'orders.view',
  'orders.manage',
  'orders.pdf_upload',
  'payments.verify',
  'users.manage',
  'settings.manage',
  'documents.generate',
  'documents.view',
  'registry.manage',
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
  'manager': ['orders.view', 'orders.manage', 'orders.pdf_upload', 'payments.verify', 'users.manage', 'settings.manage', 'documents.generate', 'documents.view'],
  'operator': ['orders.view', 'orders.manage', 'documents.generate', 'documents.view'],
  'contabil': ['orders.view', 'payments.verify', 'documents.view'],
  // Avocatul gestionează registrul de numere Barou (contracte + delegații)
  // — își alocă manual numere pentru cazurile personale când are nevoie.
  'avocat': ['orders.view', 'documents.view', 'registry.manage'],
  // Collaborator (e.g. authorized topograph): scoped to assigned services only.
  // Service scoping is enforced separately via collaborator_service_assignments.
  // NOTE: collaborator is intentionally NOT in ADMIN_ROLES — no /admin access.
  'collaborator': ['orders.view', 'orders.pdf_upload'],
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

// ──────────────────────────────────────────────────────────────
// Collaborator scoping (topograph). Collaborators see/handle only the
// orders of the services explicitly assigned to them.
// ──────────────────────────────────────────────────────────────

/**
 * Returns the service_id UUIDs a collaborator is assigned to handle.
 */
export async function getCollaboratorServices(userId: string): Promise<string[]> {
  // collaborator_service_assignments is not in the generated types yet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from('collaborator_service_assignments')
    .select('service_id')
    .eq('collaborator_id', userId);
  return ((data as { service_id: string }[] | null) || []).map((r) => r.service_id);
}

/**
 * Require the user to be a collaborator allowed to handle the given order:
 * either the order's SERVICE is assigned to them (083), or the ORDER itself
 * was sent to them from admin (orders.assigned_collaborator_id, 108).
 * Throws a 403 Response otherwise. Use at the entry of every /api/collaborator route.
 *
 * Returns the order's service_id on success (handy for callers).
 */
export async function requireCollaboratorForOrder(
  userId: string,
  orderId: string
): Promise<string> {
  const { role } = await getUserPermissions(userId);
  if (role !== 'collaborator') {
    throw new Response(
      JSON.stringify({ error: 'Collaborator access required' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select('service_id, assigned_collaborator_id')
    .eq('id', orderId)
    .single();

  const serviceId: string | undefined = order?.service_id;
  if (!serviceId) {
    throw new Response(
      JSON.stringify({ error: 'Order not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (order?.assigned_collaborator_id === userId) {
    return serviceId; // sent to this collaborator explicitly from admin
  }

  const assigned = await getCollaboratorServices(userId);
  if (!assigned.includes(serviceId)) {
    throw new Response(
      JSON.stringify({ error: 'Order not in your assigned services' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return serviceId;
}
