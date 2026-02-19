'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { Permission } from '@/lib/admin/permissions';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface AdminUser {
  email: string;
  role: string;
  permissions: Record<string, boolean>;
}

interface AdminContextType {
  user: AdminUser;
  hasPermission: (permission: Permission) => boolean;
  isSuperAdmin: boolean;
}

// ──────────────────────────────────────────────────────────────
// Implied permissions (mirrors server-side logic)
// ──────────────────────────────────────────────────────────────

const IMPLIED_PERMISSIONS: Record<string, string[]> = {
  'orders.view': [],
  'orders.manage': ['orders.view'],
  'payments.verify': ['orders.view'],
  'users.manage': [],
  'settings.manage': [],
  'documents.generate': ['documents.view', 'orders.view'],
  'documents.view': ['orders.view'],
};

/**
 * Default permissions for each admin role (mirrors server-side ROLE_DEFAULTS).
 */
const ROLE_DEFAULTS: Record<string, string[]> = {
  'manager': ['orders.view', 'orders.manage', 'payments.verify', 'users.manage', 'settings.manage', 'documents.generate', 'documents.view'],
  'operator': ['orders.view', 'orders.manage', 'documents.generate', 'documents.view'],
  'contabil': ['orders.view', 'payments.verify', 'documents.view'],
  'avocat': ['orders.view', 'documents.view'],
};

// ──────────────────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────────────────

const AdminContext = createContext<AdminContextType | null>(null);

// ──────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────

interface AdminPermissionProviderProps {
  user: AdminUser;
  children: ReactNode;
}

export function AdminPermissionProvider({
  user,
  children,
}: AdminPermissionProviderProps) {
  const isSuperAdmin = user.role === 'super_admin';

  // Build the effective permissions set (role defaults + explicit + implied)
  const effectivePermissions = useMemo(() => {
    if (isSuperAdmin) return null; // super_admin skips checking

    const perms = new Set<string>();

    // Start with role defaults if applicable (manager, operator, contabil, avocat)
    const defaults = ROLE_DEFAULTS[user.role];
    if (defaults) {
      for (const perm of defaults) {
        perms.add(perm);
      }
    }

    // Merge explicit JSONB permissions
    if (user.permissions && typeof user.permissions === 'object') {
      for (const [key, value] of Object.entries(user.permissions)) {
        if (value === true) {
          perms.add(key);
        }
      }
    }

    // Expand implied permissions
    for (const perm of Array.from(perms)) {
      const implied = IMPLIED_PERMISSIONS[perm];
      if (implied) {
        for (const imp of implied) {
          perms.add(imp);
        }
      }
    }

    return perms;
  }, [user.permissions, user.role, isSuperAdmin]);

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      // super_admin has all permissions
      if (isSuperAdmin) return true;
      // employee checks effective set
      return effectivePermissions?.has(permission) ?? false;
    };
  }, [isSuperAdmin, effectivePermissions]);

  const value = useMemo<AdminContextType>(
    () => ({ user, hasPermission, isSuperAdmin }),
    [user, hasPermission, isSuperAdmin]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

// ──────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────

/**
 * Access the current admin user's permissions inside admin pages.
 *
 * Must be used within `<AdminPermissionProvider>` (provided by the admin layout).
 *
 * ```tsx
 * const { hasPermission, isSuperAdmin } = useAdminPermissions();
 * if (!hasPermission('orders.manage')) return <NoAccess />;
 * ```
 */
export function useAdminPermissions(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error(
      'useAdminPermissions must be used within <AdminPermissionProvider>'
    );
  }
  return ctx;
}
