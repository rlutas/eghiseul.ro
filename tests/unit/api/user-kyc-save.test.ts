import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getUser, fromMock, adminFromMock } = vi.hoisted(() => ({
  getUser: vi.fn(),
  fromMock: vi.fn(),
  adminFromMock: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser },
    from: fromMock,
  }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({ from: adminFromMock })),
}));

const { POST } = await import('@/app/api/user/kyc/save/route');

const MOCK_USER = { id: 'user-1', email: 'a@b.com' };

function makeReq(body: unknown): Request {
  return new Request('http://localhost:3000/api/user/kyc/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  fromMock.mockReset();
  adminFromMock.mockReset();
  getUser.mockReset();
  getUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setupChain(insertResult: { data: unknown; error: unknown } = { data: { id: 'kyc-1' }, error: null }) {
  fromMock.mockImplementation(() => ({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(insertResult),
      }),
    }),
  }));
  adminFromMock.mockImplementation(() => ({
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
    insert: vi.fn().mockResolvedValue({ error: null }),
  }));
}

describe('POST /api/user/kyc/save — auth + validation', () => {
  it('returns 401 when not authenticated', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await POST(makeReq({ documentType: 'ci_front', fileUrl: 'x' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when documentType missing', async () => {
    setupChain();
    const res = await POST(makeReq({ fileUrl: 'http://example.com/img.jpg' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when fileUrl missing', async () => {
    setupChain();
    const res = await POST(makeReq({ documentType: 'ci_front' }));
    expect(res.status).toBe(400);
  });

  it.each([
    'ci_front', 'ci_back', 'selfie', 'passport',
    'address_certificate', 'ci_nou_front', 'ci_nou_back',
    'company_registration_cert', 'company_statement_cert',
  ])('accepts valid documentType "%s"', async (type) => {
    setupChain();
    const res = await POST(makeReq({ documentType: type, fileUrl: 'http://example.com/x' }));
    expect(res.status).not.toBe(400);
  });

  it('returns 400 for invalid documentType', async () => {
    setupChain();
    const res = await POST(makeReq({ documentType: 'random_doc', fileUrl: 'x' }));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/user/kyc/save — versioning (deactivate previous)', () => {
  it('deactivates existing documents of same type before inserting new', async () => {
    let updateCalled = false;
    let insertCalled = false;
    let updatePayload: Record<string, unknown> = {};

    fromMock.mockImplementation(() => ({
      update: vi.fn((row) => {
        updateCalled = true;
        updatePayload = row;
        return {
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }),
      insert: vi.fn((row) => {
        insertCalled = true;
        // The update for is_active=false MUST happen before insert
        expect(updateCalled).toBe(true);
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'kyc-1', ...row },
              error: null,
            }),
          }),
        };
      }),
    }));
    adminFromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));

    await POST(makeReq({ documentType: 'ci_front', fileUrl: 'http://example.com/new.jpg' }));

    expect(updateCalled).toBe(true);
    expect(insertCalled).toBe(true);
    expect(updatePayload.is_active).toBe(false);
  });
});

describe('POST /api/user/kyc/save — expiry date logic', () => {
  it('uses document expiry date when provided', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
          }),
        };
      }),
    }));
    adminFromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));

    await POST(makeReq({
      documentType: 'ci_front',
      fileUrl: 'x',
      documentExpiry: '2031-08-03',
    }));

    expect(captured.expires_at).toMatch(/2031-08-03/);
  });

  it('defaults to KYC validity period (90 days from now) when no documentExpiry', async () => {
    let captured: Record<string, unknown> = {};
    fromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
      insert: vi.fn((row) => {
        captured = row;
        return {
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: row, error: null }),
          }),
        };
      }),
    }));
    adminFromMock.mockImplementation(() => ({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));

    await POST(makeReq({ documentType: 'ci_front', fileUrl: 'x' }));

    const expiresAt = new Date(captured.expires_at as string);
    const ninetyDaysFromNow = Date.now() + 90 * 24 * 60 * 60 * 1000;
    // Allow ±1 minute slack
    expect(Math.abs(expiresAt.getTime() - ninetyDaysFromNow)).toBeLessThan(60_000);
  });
});

describe('POST /api/user/kyc/save — error handling', () => {
  it('returns 500 on insert error', async () => {
    setupChain({ data: null, error: { message: 'unique violation' } });

    const res = await POST(makeReq({ documentType: 'ci_front', fileUrl: 'x' }));
    expect(res.status).toBe(500);
  });
});
