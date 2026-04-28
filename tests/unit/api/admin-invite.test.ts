import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };
const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({ auth: { getUser } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { requirePermission } = vi.hoisted(() => ({ requirePermission: vi.fn() }));
vi.mock('@/lib/admin/permissions', async () => {
  // Need ALL_PERMISSIONS to be the real exported list (the route filters by it)
  const real = await vi.importActual<typeof import('@/lib/admin/permissions')>('@/lib/admin/permissions');
  return {
    ...real,
    requirePermission,
  };
});

const { POST } = await import('@/app/api/admin/users/invite/route');

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/users/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  requirePermission.mockReset();
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@x.com' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/admin/users/invite — auth', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await POST(makeReq({ email: 'x@y.com', permissions: {} }))).status).toBe(401);
  });

  it('returns 403 when missing users.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 }),
    );
    expect((await POST(makeReq({ email: 'x@y.com', permissions: {} }))).status).toBe(403);
  });

  it('uses users.manage (NOT settings.manage)', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
    await POST(makeReq({
      email: 'new@example.com',
      permissions: { 'orders.view': true },
    }));
    expect(requirePermission).toHaveBeenCalledWith('admin-1', 'users.manage');
  });
});

describe('POST /api/admin/users/invite — validation', () => {
  it.each(['x', 'noatsign', 'nodomain@', '@nolocal.com', 'bad email@x.com'])(
    'returns 400 for invalid email "%s"',
    async (email) => {
      const res = await POST(makeReq({ email, permissions: { 'orders.view': true } }));
      expect(res.status).toBe(400);
    },
  );

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeReq({ permissions: { 'orders.view': true } }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when permissions object is missing', async () => {
    const res = await POST(makeReq({ email: 'x@y.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when permission key is invalid (not in ALL_PERMISSIONS)', async () => {
    const res = await POST(makeReq({
      email: 'x@y.com',
      permissions: { 'fake.perm': true, 'orders.view': true },
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/fake.perm/);
  });

  it('returns 400 for invalid role', async () => {
    const res = await POST(makeReq({
      email: 'x@y.com',
      permissions: { 'orders.view': true },
      role: 'super_admin', // not in VALID_INVITE_ROLES (super_admin can't be invited)
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid role/);
  });

  it.each(['employee', 'avocat', 'manager', 'operator', 'contabil'])(
    'accepts valid role "%s"',
    async (role) => {
      persistentFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: { id: 'inv-1' }, error: null }),
      });

      // We just check the role check passes; don't assert downstream state
      const res = await POST(makeReq({
        email: 'new@example.com',
        permissions: { 'orders.view': true },
        role,
      }));
      // Should NOT be 400 (role validation passes)
      expect(res.status).not.toBe(400);
    },
  );
});

describe('POST /api/admin/users/invite — duplicate detection', () => {
  it('returns 409 when target user already has admin/employee role', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'existing-1', email: 'existing@x.com', role: 'manager' },
            error: null,
          }),
        }),
      }),
    });

    const res = await POST(makeReq({
      email: 'existing@x.com',
      permissions: { 'orders.view': true },
    }));

    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already has/);
  });

  it('proceeds when target email not found in profiles', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    const res = await POST(makeReq({
      email: 'brand-new@example.com',
      permissions: { 'orders.view': true },
    }));

    // Should NOT be 409 (user doesn't already exist)
    expect(res.status).not.toBe(409);
  });

  it('proceeds when existing profile is a customer (not admin/employee)', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cust-1', email: 'cust@x.com', role: 'customer' },
            error: null,
          }),
        }),
      }),
    });

    // Customer being invited TO become an employee is allowed
    const res = await POST(makeReq({
      email: 'cust@x.com',
      permissions: { 'orders.view': true },
    }));

    expect(res.status).not.toBe(409);
  });
});

describe('POST /api/admin/users/invite — email lowercased', () => {
  it('looks up existing profile case-insensitively (.toLowerCase)', async () => {
    let captured = '';
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn((field: string, val: string) => {
          if (field === 'email') captured = val;
          return {
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }),
      }),
    });

    await POST(makeReq({
      email: 'MixedCase@Example.COM',
      permissions: { 'orders.view': true },
    }));

    expect(captured).toBe('mixedcase@example.com');
  });
});
