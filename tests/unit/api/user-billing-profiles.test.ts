import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser, fromMock } = vi.hoisted(() => ({
  getUser: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser },
    from: fromMock,
  }),
}));

const { GET, POST } = await import('@/app/api/user/billing-profiles/route');
const { PATCH, DELETE } = await import('@/app/api/user/billing-profiles/[id]/route');

const MOCK_USER = { id: 'user-1', email: 'a@b.com' };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  fromMock.mockReset();
  getUser.mockReset();
  getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────
// GET — list billing profiles
// ──────────────────────────────────────────────────────────────

describe('GET /api/user/billing-profiles', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns mapped profiles with type + flattened billing_data', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'bp-1',
                  type: 'persoana_juridica',
                  label: 'Firma SRL',
                  billing_data: { companyName: 'ACME SRL', cui: 'RO12345678' },
                  is_default: true,
                  created_at: '2026-04-01',
                  updated_at: '2026-04-01',
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data[0]).toMatchObject({
      id: 'bp-1',
      type: 'persoana_juridica',
      label: 'Firma SRL',
      companyName: 'ACME SRL',
      cui: 'RO12345678',
      isDefault: true,
    });
  });
});

// ──────────────────────────────────────────────────────────────
// POST — create billing profile
// ──────────────────────────────────────────────────────────────

describe('POST /api/user/billing-profiles', () => {
  function makeReq(body: unknown): Request {
    return new Request('http://localhost:3000/api/user/billing-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeReq({ type: 'persoana_fizica' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when type is missing', async () => {
    fromMock.mockReturnValue({});
    const res = await POST(makeReq({ label: 'Test' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when type is neither persoana_fizica nor persoana_juridica', async () => {
    fromMock.mockReturnValue({});
    const res = await POST(makeReq({ type: 'random_type' }));
    expect(res.status).toBe(400);
  });

  it('uses "Profil personal" as default label for PF when none provided', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'x', type: row.type, label: row.label, billing_data: {}, is_default: false, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    });

    await POST(makeReq({ type: 'persoana_fizica' }));
    expect(captured.label).toBe('Profil personal');
  });

  it('uses "Profil firmă" as default label for PJ when none provided', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'x', type: row.type, label: row.label, billing_data: {}, is_default: false, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    });

    await POST(makeReq({ type: 'persoana_juridica' }));
    expect(captured.label).toBe('Profil firmă');
  });

  it('separates type/label from billing_data when storing', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'x', type: row.type, label: row.label, billing_data: row.billing_data, is_default: false, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    });

    await POST(makeReq({
      type: 'persoana_juridica',
      label: 'My Firma',
      companyName: 'ACME SRL',
      cui: 'RO123',
    }));

    expect(captured.type).toBe('persoana_juridica');
    expect(captured.label).toBe('My Firma');
    expect(captured.billing_data).toEqual({ companyName: 'ACME SRL', cui: 'RO123' });
    // type/label should NOT leak into billing_data
    expect((captured.billing_data as Record<string, unknown>).type).toBeUndefined();
    expect((captured.billing_data as Record<string, unknown>).label).toBeUndefined();
  });

  it('unsets other defaults BEFORE insert when isDefault=true', async () => {
    const calls: string[] = [];
    fromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation(() => {
          calls.push('unset');
          return Promise.resolve({ error: null });
        }),
      }),
      insert: vi.fn(() => {
        calls.push('insert');
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'x', type: 'persoana_fizica', label: 'X', billing_data: {}, is_default: true, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    }));

    await POST(makeReq({ type: 'persoana_fizica', isDefault: true }));

    expect(calls).toEqual(['unset', 'insert']);
  });
});

// ──────────────────────────────────────────────────────────────
// PATCH + DELETE — IDOR protection (mirrors addresses pattern)
// ──────────────────────────────────────────────────────────────

describe('PATCH /api/user/billing-profiles/[id]', () => {
  function makeReq(body: unknown): Request {
    return new Request('http://localhost:3000/api/user/billing-profiles/x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await PATCH(makeReq({ label: 'X' }), { params: Promise.resolve({ id: 'bp-1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when profile does not belong to user (IDOR protection)', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'no rows' } }),
          }),
        }),
      }),
    });

    const res = await PATCH(makeReq({ label: 'Hijack' }), { params: Promise.resolve({ id: 'someone-elses' }) });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/user/billing-profiles/[id]', () => {
  function makeReq(): Request {
    return new Request('http://localhost:3000/api/user/billing-profiles/x', { method: 'DELETE' });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: 'bp-1' }) });
    expect(res.status).toBe(401);
  });

  it('scopes DELETE by id AND user_id (IDOR protection)', async () => {
    const capturedFilters: { field: string; value: string }[] = [];

    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn((f1: string, v1: string) => {
          capturedFilters.push({ field: f1, value: v1 });
          return {
            eq: vi.fn((f2: string, v2: string) => {
              capturedFilters.push({ field: f2, value: v2 });
              return Promise.resolve({ error: null });
            }),
          };
        }),
      }),
    });

    await DELETE(makeReq(), { params: Promise.resolve({ id: 'bp-1' }) });

    expect(capturedFilters).toContainEqual({ field: 'id', value: 'bp-1' });
    expect(capturedFilters).toContainEqual({ field: 'user_id', value: 'user-1' });
  });
});
