import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the admin client BEFORE importing the module under test.
vi.mock('@/lib/supabase/admin', () => {
  const single = vi.fn();
  const eq = vi.fn(() => ({ single }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));
  const createAdminClient = vi.fn(() => ({ from }));
  return { createAdminClient, __mocks: { from, select, eq, single } };
});

import { getUserPermissions, checkPermission, requirePermission, requireAdmin, ALL_PERMISSIONS } from '@/lib/admin/permissions';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mocks = (await import('@/lib/supabase/admin') as any).__mocks;

function mockProfile(role: string | null, permissions: Record<string, boolean> | null = null, dbError = false) {
  if (dbError) {
    mocks.single.mockResolvedValueOnce({ data: null, error: { message: 'db down' } });
    return;
  }
  if (role === null) {
    mocks.single.mockResolvedValueOnce({ data: null, error: null });
    return;
  }
  mocks.single.mockResolvedValueOnce({ data: { role, permissions }, error: null });
}

beforeEach(() => {
  mocks.single.mockReset();
});

describe('getUserPermissions — super_admin', () => {
  it('grants all 7 permissions and isSuperAdmin=true regardless of JSONB column', async () => {
    mockProfile('super_admin', null);
    const result = await getUserPermissions('user-1');

    expect(result.role).toBe('super_admin');
    expect(result.isSuperAdmin).toBe(true);
    expect(result.permissions.sort()).toEqual([...ALL_PERMISSIONS].sort());
  });

  it('still grants all even if JSONB column tries to revoke a permission', async () => {
    // Defensive: super_admin can never be downgraded by accidentally setting `orders.view: false` in JSONB
    mockProfile('super_admin', { 'orders.view': false });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toContain('orders.view');
    expect(result.permissions).toHaveLength(ALL_PERMISSIONS.length);
  });
});

describe('getUserPermissions — role defaults', () => {
  it('manager gets all 7 default permissions', async () => {
    mockProfile('manager', null);
    const result = await getUserPermissions('user-1');

    expect(result.isSuperAdmin).toBe(false);
    expect(result.permissions).toEqual(expect.arrayContaining([
      'orders.view', 'orders.manage', 'payments.verify',
      'users.manage', 'settings.manage', 'documents.generate', 'documents.view',
    ]));
  });

  it('operator gets ops permissions only (no users/settings/payments)', async () => {
    mockProfile('operator', null);
    const result = await getUserPermissions('user-1');

    expect(result.permissions.sort()).toEqual(
      ['orders.view', 'orders.manage', 'documents.generate', 'documents.view'].sort()
    );
    expect(result.permissions).not.toContain('users.manage');
    expect(result.permissions).not.toContain('settings.manage');
    expect(result.permissions).not.toContain('payments.verify');
  });

  it('contabil gets payment + view permissions only (no manage)', async () => {
    mockProfile('contabil', null);
    const result = await getUserPermissions('user-1');

    expect(result.permissions.sort()).toEqual(
      ['orders.view', 'payments.verify', 'documents.view'].sort()
    );
    expect(result.permissions).not.toContain('orders.manage');
    expect(result.permissions).not.toContain('users.manage');
  });

  it('avocat gets read-only on orders + documents', async () => {
    mockProfile('avocat', null);
    const result = await getUserPermissions('user-1');

    expect(result.permissions.sort()).toEqual(['orders.view', 'documents.view'].sort());
  });

  it('manager + extra JSONB permissions merges them', async () => {
    // edge case: granted an extra perm beyond defaults (no-op for manager since they have all,
    // but tests the merge path)
    mockProfile('manager', { 'orders.view': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions.length).toBe(ALL_PERMISSIONS.length);
  });

  it('contabil + JSONB grant of orders.manage adds it (and pulls in implied orders.view)', async () => {
    mockProfile('contabil', { 'orders.manage': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toContain('orders.manage');
    expect(result.permissions).toContain('orders.view'); // implied
  });

  it('ignores invalid permission keys in JSONB', async () => {
    mockProfile('contabil', { 'fake.permission': true, 'orders.manage': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).not.toContain('fake.permission');
    expect(result.permissions).toContain('orders.manage');
  });

  it('ignores JSONB entries set to false', async () => {
    mockProfile('contabil', { 'orders.manage': false });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).not.toContain('orders.manage');
  });
});

describe('getUserPermissions — employee', () => {
  it('with empty JSONB has no permissions', async () => {
    mockProfile('employee', null);
    const result = await getUserPermissions('user-1');

    expect(result.role).toBe('employee');
    expect(result.permissions).toEqual([]);
  });

  it('with explicit orders.view gets just that', async () => {
    mockProfile('employee', { 'orders.view': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toEqual(['orders.view']);
  });

  it('with orders.manage gets implied orders.view too', async () => {
    mockProfile('employee', { 'orders.manage': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toContain('orders.manage');
    expect(result.permissions).toContain('orders.view');
  });

  it('with documents.generate pulls in documents.view AND orders.view (chain of implied)', async () => {
    mockProfile('employee', { 'documents.generate': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toContain('documents.generate');
    expect(result.permissions).toContain('documents.view'); // implied
    expect(result.permissions).toContain('orders.view');    // implied via documents.view
  });

  it('with payments.verify pulls in orders.view', async () => {
    mockProfile('employee', { 'payments.verify': true });
    const result = await getUserPermissions('user-1');

    expect(result.permissions).toContain('payments.verify');
    expect(result.permissions).toContain('orders.view');
  });
});

describe('getUserPermissions — non-admin roles', () => {
  it.each([
    ['customer'],
    ['partner'],
    ['some-future-role'],
  ])('"%s" role gets no permissions', async (role) => {
    mockProfile(role, null);
    const result = await getUserPermissions('user-1');

    expect(result.role).toBe(role);
    expect(result.isSuperAdmin).toBe(false);
    expect(result.permissions).toEqual([]);
  });

  it('falls back to "customer" with no permissions when DB returns no row', async () => {
    mockProfile(null);
    const result = await getUserPermissions('user-1');

    expect(result.role).toBe('customer');
    expect(result.permissions).toEqual([]);
    expect(result.isSuperAdmin).toBe(false);
  });

  it('falls back to "customer" with no permissions when DB errors out', async () => {
    mockProfile(null, null, true);
    const result = await getUserPermissions('user-1');

    expect(result.role).toBe('customer');
    expect(result.permissions).toEqual([]);
  });
});

describe('checkPermission', () => {
  it('returns true when user has the single permission', async () => {
    mockProfile('manager', null);
    expect(await checkPermission('user-1', 'orders.view')).toBe(true);
  });

  it('returns false when user lacks the single permission', async () => {
    mockProfile('avocat', null);
    expect(await checkPermission('user-1', 'users.manage')).toBe(false);
  });

  it('returns true when user has ALL permissions in array', async () => {
    mockProfile('manager', null);
    expect(await checkPermission('user-1', ['orders.view', 'documents.view'])).toBe(true);
  });

  it('returns false when user is missing ONE permission from the array', async () => {
    mockProfile('avocat', null);
    expect(await checkPermission('user-1', ['orders.view', 'users.manage'])).toBe(false);
  });

  it('super_admin always satisfies permission checks', async () => {
    mockProfile('super_admin', null);
    expect(await checkPermission('user-1', 'users.manage')).toBe(true);
    mockProfile('super_admin', null);
    expect(await checkPermission('user-1', ['users.manage', 'settings.manage'])).toBe(true);
  });
});

describe('requirePermission', () => {
  it('resolves silently when user has permission', async () => {
    mockProfile('manager', null);
    await expect(requirePermission('user-1', 'orders.view')).resolves.toBeUndefined();
  });

  it('throws a Response with status 403 when user lacks permission', async () => {
    mockProfile('avocat', null);
    let thrown: unknown;
    try {
      await requirePermission('user-1', 'users.manage');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(403);
  });

  it('the thrown 403 Response has Insufficient permissions JSON body', async () => {
    mockProfile('avocat', null);
    let thrown: unknown;
    try {
      await requirePermission('user-1', 'users.manage');
    } catch (e) {
      thrown = e;
    }
    const body = await (thrown as Response).json();
    expect(body.error).toBe('Insufficient permissions');
  });
});

describe('requireAdmin', () => {
  it.each([
    ['super_admin'],
    ['manager'],
    ['operator'],
    ['contabil'],
    ['avocat'],
    ['employee'],
  ])('resolves silently for admin role "%s"', async (role) => {
    mockProfile(role, null);
    await expect(requireAdmin('user-1')).resolves.toBeUndefined();
  });

  it.each([
    ['customer'],
    ['partner'],
    ['unknown-role'],
  ])('throws 403 for non-admin role "%s"', async (role) => {
    mockProfile(role, null);
    let thrown: unknown;
    try {
      await requireAdmin('user-1');
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(403);
  });
});
