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
vi.mock('@/lib/admin/permissions', () => ({ requirePermission }));

const { GET: listGet, POST: listPost } = await import('@/app/api/admin/coupons/route');
const { PATCH, DELETE } = await import('@/app/api/admin/coupons/[id]/route');

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  persistentFrom.mockReset();
  getUser.mockReset();
  requirePermission.mockReset();
  getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } }, error: null });
  requirePermission.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────
// GET /api/admin/coupons — list
// ──────────────────────────────────────────────────────────────

describe('GET /api/admin/coupons', () => {
  function makeReq(query: Record<string, string> = {}): NextRequest {
    const url = new URL('http://localhost:3000/api/admin/coupons');
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new NextRequest(url);
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await listGet(makeReq())).status).toBe(401);
  });

  it('returns 403 when missing settings.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 }),
    );
    expect((await listGet(makeReq())).status).toBe(403);
  });

  it('uses settings.manage (NOT orders.manage — coupons are settings)', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
        }),
      }),
    });

    await listGet(makeReq());
    expect(requirePermission).toHaveBeenCalledWith('admin-1', 'settings.manage');
  });

  it('returns paginated list', async () => {
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: [{ id: 'c1', code: 'SAVE10' }],
            count: 1,
            error: null,
          }),
        }),
      }),
    });

    const res = await listGet(makeReq({ page: '1', limit: '50' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.coupons).toHaveLength(1);
    expect(body.data.pagination.total).toBe(1);
    expect(body.data.pagination.page).toBe(1);
  });

  it('applies search filter via ilike on code', async () => {
    let capturedSearch = '';
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockReturnValue({
            ilike: vi.fn((field: string, val: string) => {
              capturedSearch = val;
              return Promise.resolve({ data: [], count: 0, error: null });
            }),
          }),
        }),
      }),
    });

    await listGet(makeReq({ search: 'SAVE' }));
    expect(capturedSearch).toBe('%SAVE%');
  });

  it('clamps limit to max 200 (defensive against runaway queries)', async () => {
    let capturedRange: { from: number; to: number } | null = null;
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn((from: number, to: number) => {
            capturedRange = { from, to };
            return Promise.resolve({ data: [], count: 0, error: null });
          }),
        }),
      }),
    });

    await listGet(makeReq({ page: '1', limit: '99999' }));

    // limit capped at 200 → range is 0..199
    expect(capturedRange!.to - capturedRange!.from).toBe(199);
  });
});

// ──────────────────────────────────────────────────────────────
// POST /api/admin/coupons — create
// ──────────────────────────────────────────────────────────────

describe('POST /api/admin/coupons', () => {
  function makeReq(body: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await listPost(makeReq({ code: 'X' }))).status).toBe(401);
  });

  it('returns 400 when validation fails (missing code)', async () => {
    const res = await listPost(makeReq({ discount_type: 'fixed', discount_value: 10 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when discount_type is invalid', async () => {
    const res = await listPost(makeReq({ code: 'X', discount_type: 'unknown', discount_value: 10 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when percentage discount > 100', async () => {
    const res = await listPost(makeReq({
      code: 'X', discount_type: 'percentage', discount_value: 150,
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/100/);
  });

  it('returns 400 when percentage discount < 1', async () => {
    const res = await listPost(makeReq({
      code: 'X', discount_type: 'percentage', discount_value: 0.5,
    }));
    expect(res.status).toBe(400);
  });

  it('uppercases code before insert (trim + transform)', async () => {
    let captured: Record<string, unknown> = {};
    persistentFrom.mockReturnValue({
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { ...row, id: 'c1' }, error: null }),
          }),
        };
      }),
    });

    await listPost(makeReq({
      code: '  save10  ', // trim + uppercase
      discount_type: 'percentage',
      discount_value: 10,
    }));

    expect(captured.code).toBe('SAVE10');
    expect(captured.created_by).toBe('admin-1');
  });

  it('returns 400 when code already exists (unique constraint violation)', async () => {
    persistentFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '23505', message: 'duplicate key value' },
          }),
        }),
      }),
    });

    const res = await listPost(makeReq({
      code: 'EXISTING',
      discount_type: 'percentage',
      discount_value: 10,
    }));

    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/exista deja/);
  });

  it('returns 201 on successful creation', async () => {
    persistentFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'c1', code: 'NEW10', discount_value: 10 },
            error: null,
          }),
        }),
      }),
    });

    const res = await listPost(makeReq({
      code: 'NEW10',
      discount_type: 'percentage',
      discount_value: 10,
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.coupon.id).toBe('c1');
  });
});

// ──────────────────────────────────────────────────────────────
// PATCH/DELETE /api/admin/coupons/[id]
// ──────────────────────────────────────────────────────────────

describe('PATCH/DELETE /api/admin/coupons/[id]', () => {
  function makeReq(method: string, body?: unknown): NextRequest {
    return new NextRequest('http://localhost:3000/api/admin/coupons/c1', {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  }

  it('PATCH returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(makeReq('PATCH', { is_active: false }), {
      params: Promise.resolve({ id: 'c1' }),
    });
    expect(res.status).toBe(401);
  });

  it('DELETE returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(makeReq('DELETE'), { params: Promise.resolve({ id: 'c1' }) });
    expect(res.status).toBe(401);
  });

  it('PATCH requires settings.manage permission', async () => {
    requirePermission.mockRejectedValue(
      new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 }),
    );
    const res = await PATCH(makeReq('PATCH', { is_active: false }), {
      params: Promise.resolve({ id: 'c1' }),
    });
    expect(res.status).toBe(403);
  });
});
