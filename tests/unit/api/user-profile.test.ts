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

const { PATCH, GET } = await import('@/app/api/user/profile/route');

const MOCK_USER = { id: 'user-1', email: 'a@b.com' };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  fromMock.mockReset();
  getUser.mockReset();
  getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeReq(body: unknown, method = 'PATCH'): Request {
  return new Request('http://localhost:3000/api/user/profile', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/user/profile', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await PATCH(makeReq({ firstName: 'X' }))).status).toBe(401);
  });

  it('updates only the fields explicitly provided (PATCH semantics)', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      update: vi.fn((row) => {
        captured = row;
        return {
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'user-1' }, error: null }),
            }),
          }),
        };
      }),
    });

    await PATCH(makeReq({ firstName: 'Ion' }));

    expect(captured.first_name).toBe('Ion');
    // last_name etc. NOT in payload — should NOT be overwritten with undefined
    expect(captured).not.toHaveProperty('last_name');
    expect(captured).not.toHaveProperty('cnp');
    expect(captured.updated_at).toBeTruthy();
  });

  it('maps camelCase API fields to snake_case DB columns', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      update: vi.fn((row) => {
        captured = row;
        return {
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'user-1' }, error: null }),
            }),
          }),
        };
      }),
    });

    await PATCH(makeReq({
      firstName: 'Ion',
      lastName: 'Popescu',
      cnp: '1820507211209',
      birthDate: '1982-10-10',
      birthPlace: 'București',
      phone: '+40712345678',
    }));

    expect(captured).toMatchObject({
      first_name: 'Ion',
      last_name: 'Popescu',
      cnp: '1820507211209',
      birth_date: '1982-10-10',
      birth_place: 'București',
      phone: '+40712345678',
    });
  });

  it('maps company fields to company_* DB columns', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockReturnValue({
      update: vi.fn((row) => {
        captured = row;
        return {
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'user-1' }, error: null }),
            }),
          }),
        };
      }),
    });

    await PATCH(makeReq({
      companyCui: 'RO12345678',
      companyName: 'ACME SRL',
      companyType: 'SRL',
      companyRegistrationNumber: 'J40/1234/2020',
      companyVatPayer: true,
    }));

    expect(captured.company_cui).toBe('RO12345678');
    expect(captured.company_name).toBe('ACME SRL');
    expect(captured.company_vat_payer).toBe(true);
  });

  it('scopes update by user.id (security: users can only update their own profile)', async () => {
    let capturedFilter: { field: string; value: string } | null = null;
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn((field: string, value: string) => {
          capturedFilter = { field, value };
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'user-1' }, error: null }),
            }),
          };
        }),
      }),
    });

    await PATCH(makeReq({ firstName: 'X' }));

    expect(capturedFilter).toEqual({ field: 'id', value: 'user-1' });
  });

  it('returns 500 on DB update error', async () => {
    fromMock.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'unique violation' } }),
          }),
        }),
      }),
    });

    expect((await PATCH(makeReq({ firstName: 'X' }))).status).toBe(500);
  });
});

describe('GET /api/user/profile', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await GET()).status).toBe(401);
  });

  it('returns user profile data scoped to authenticated user', async () => {
    let capturedFilter: { field: string; value: string } | null = null;

    // GET hits BOTH `profiles` table AND `kyc_verifications` for document info
    fromMock.mockImplementation((table: string) => {
      if (table === 'kyc_verifications') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  order: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      // profiles
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn((field: string, value: string) => {
            capturedFilter = { field, value };
            return {
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'user-1', email: 'a@b.com',
                  first_name: 'Ion', last_name: 'Popescu',
                },
                error: null,
              }),
            };
          }),
        }),
      };
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(capturedFilter).toEqual({ field: 'id', value: 'user-1' });
  });
});
