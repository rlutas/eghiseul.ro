import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted user identity + supabase mock so route module sees them at import time.
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

const { GET, POST } = await import('@/app/api/user/addresses/route');
const { PATCH, DELETE } = await import('@/app/api/user/addresses/[id]/route');

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
// GET — list user addresses
// ──────────────────────────────────────────────────────────────

describe('GET /api/user/addresses', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with mapped address records (flattens .data into top-level)', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'addr-1',
                    label: 'Acasă',
                    data: { street: 'Str. Test 1', city: 'București' },
                    is_default: true,
                    created_at: '2026-04-01T10:00:00Z',
                    updated_at: '2026-04-01T10:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data[0]).toMatchObject({
      id: 'addr-1',
      label: 'Acasă',
      street: 'Str. Test 1', // flattened from .data
      city: 'București',
      isDefault: true,
    });
  });

  it('scopes query to the authenticated user_id and data_type=address', async () => {
    let capturedFilters: { field: string; value: string }[] = [];

    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn((field: string, value: string) => {
          capturedFilters.push({ field, value });
          return {
            eq: vi.fn((f2: string, v2: string) => {
              capturedFilters.push({ field: f2, value: v2 });
              return {
                order: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              };
            }),
          };
        }),
      }),
    });

    await GET();

    expect(capturedFilters).toContainEqual({ field: 'user_id', value: 'user-1' });
    expect(capturedFilters).toContainEqual({ field: 'data_type', value: 'address' });
  });

  it('returns 500 on DB error', async () => {
    fromMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: null, error: { message: 'connection lost' } }),
            }),
          }),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

// ──────────────────────────────────────────────────────────────
// POST — create address
// ──────────────────────────────────────────────────────────────

describe('POST /api/user/addresses', () => {
  function makeReq(body: unknown): Request {
    return new Request('http://localhost:3000/api/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await POST(makeReq({ street: 'X' }));
    expect(res.status).toBe(401);
  });

  it('creates address and returns 201 with flattened response shape', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'addr-new',
              label: 'Acasă',
              data: { street: 'Str. Test 1', city: 'București' },
              is_default: false,
              created_at: '2026-04-28T10:00:00Z',
              updated_at: '2026-04-28T10:00:00Z',
            },
            error: null,
          }),
        }),
      }),
    });

    const res = await POST(makeReq({
      label: 'Acasă',
      street: 'Str. Test 1',
      city: 'București',
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('addr-new');
    expect(body.data.street).toBe('Str. Test 1');
  });

  it('uses "Adresă nouă" as default label when none provided', async () => {
    let capturedInsert: Record<string, unknown> = {};

    fromMock.mockReturnValue({
      insert: vi.fn((row) => {
        capturedInsert = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'a', label: row.label, data: row.data, is_default: false, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    });

    await POST(makeReq({ street: 'X' })); // no label

    expect(capturedInsert.label).toBe('Adresă nouă');
  });

  it('unsets other defaults FIRST when isDefault=true (data integrity)', async () => {
    const calls: string[] = [];

    fromMock.mockImplementation(() => ({
      // For the unset-defaults UPDATE call (no select chain)
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            calls.push('unset_defaults');
            return Promise.resolve({ error: null });
          }),
        }),
      }),
      // For the INSERT
      insert: vi.fn(() => {
        calls.push('insert');
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'a', label: 'X', data: {}, is_default: true, created_at: '', updated_at: '' },
              error: null,
            }),
          }),
        };
      }),
    }));

    await POST(makeReq({ label: 'New default', street: 'Y', isDefault: true }));

    // Unset must run BEFORE insert
    expect(calls).toEqual(['unset_defaults', 'insert']);
  });

  it('returns 500 on insert error', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'constraint violation' } }),
        }),
      }),
    });

    const res = await POST(makeReq({ street: 'X' }));
    expect(res.status).toBe(500);
  });
});

// ──────────────────────────────────────────────────────────────
// PATCH — update address (ownership-scoped)
// ──────────────────────────────────────────────────────────────

describe('PATCH /api/user/addresses/[id]', () => {
  function makeReq(body: unknown): Request {
    return new Request('http://localhost:3000/api/user/addresses/x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await PATCH(makeReq({ label: 'X' }), { params: Promise.resolve({ id: 'addr-1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when address does not belong to user (IDOR protection)', async () => {
    fromMock.mockReturnValue({
      // ownership check fails
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'no rows' } }),
          }),
        }),
      }),
    });

    const res = await PATCH(makeReq({ label: 'Hijacked' }), { params: Promise.resolve({ id: 'someone-elses-id' }) });
    expect(res.status).toBe(404);
  });

  it('successfully updates and returns flattened response', async () => {
    fromMock.mockImplementation(() => ({
      // ownership check
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id: 'addr-1' }, error: null }),
          }),
        }),
      }),
      // update
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'addr-1',
                  label: 'Updated',
                  data: { street: 'New Street' },
                  is_default: false,
                  created_at: '',
                  updated_at: '',
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    }));

    const res = await PATCH(makeReq({ label: 'Updated', street: 'New Street' }), {
      params: Promise.resolve({ id: 'addr-1' }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.label).toBe('Updated');
    expect(body.data.street).toBe('New Street');
  });
});

// ──────────────────────────────────────────────────────────────
// DELETE — delete address (ownership-scoped)
// ──────────────────────────────────────────────────────────────

describe('DELETE /api/user/addresses/[id]', () => {
  function makeReq(): Request {
    return new Request('http://localhost:3000/api/user/addresses/x', { method: 'DELETE' });
  }

  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: 'addr-1' }) });
    expect(res.status).toBe(401);
  });

  it('scopes DELETE by both id AND user_id (IDOR protection)', async () => {
    let capturedFilters: { field: string; value: string }[] = [];

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

    await DELETE(makeReq(), { params: Promise.resolve({ id: 'addr-1' }) });

    // Both id AND user_id filters must be present
    expect(capturedFilters).toContainEqual({ field: 'id', value: 'addr-1' });
    expect(capturedFilters).toContainEqual({ field: 'user_id', value: 'user-1' });
  });

  it('returns 200 + success message on successful delete', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    });

    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: 'addr-1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 500 on DB delete error', async () => {
    fromMock.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'fk constraint' } }),
        }),
      }),
    });

    const res = await DELETE(makeReq(), { params: Promise.resolve({ id: 'addr-1' }) });
    expect(res.status).toBe(500);
  });
});
