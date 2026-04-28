import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { GET } = await import('@/app/api/admin/invite/accept/route');

interface InvitationRow {
  id?: string;
  email?: string;
  permissions?: Record<string, boolean>;
  status?: 'pending' | 'accepted' | 'revoked' | 'expired';
  expires_at?: string;
  created_at?: string;
}

function setupInvitation(invitation: InvitationRow | null) {
  persistentFrom.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(
          invitation ? { data: invitation, error: null } : { data: null, error: { message: 'not found' } },
        ),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  }));
}

function makeReq(token?: string): NextRequest {
  const url = new URL('http://localhost:3000/api/admin/invite/accept');
  if (token) url.searchParams.set('token', token);
  return new NextRequest(url);
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/admin/invite/accept (public — token-gated)', () => {
  it('returns 400 when token query param missing', async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Token is required/i);
  });

  it('returns 404 when token not found in DB', async () => {
    setupInvitation(null);
    const res = await GET(makeReq('non-existent-token'));
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/Invalid invitation token/i);
  });

  it('returns 410 GONE when invitation already accepted (idempotency)', async () => {
    setupInvitation({
      id: 'inv-1',
      email: 'x@y.com',
      status: 'accepted',
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      permissions: { 'orders.view': true },
    });

    const res = await GET(makeReq('valid-token'));
    expect(res.status).toBe(410);
    expect((await res.json()).error).toMatch(/already been accepted/i);
  });

  it('returns 410 when invitation revoked', async () => {
    setupInvitation({
      id: 'inv-1',
      email: 'x@y.com',
      status: 'revoked',
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      permissions: {},
    });

    const res = await GET(makeReq('valid-token'));
    expect(res.status).toBe(410);
    expect((await res.json()).error).toMatch(/revoked/i);
  });

  it('returns 410 when invitation already expired status', async () => {
    setupInvitation({
      id: 'inv-1',
      email: 'x@y.com',
      status: 'expired',
      expires_at: new Date(Date.now() - 86_400_000).toISOString(),
      permissions: {},
    });

    const res = await GET(makeReq('valid-token'));
    expect(res.status).toBe(410);
    expect((await res.json()).error).toMatch(/expired/i);
  });

  it('marks pending invitations as expired when expires_at < now (auto-expire)', async () => {
    let updateCalled = false;
    persistentFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'inv-1',
              email: 'x@y.com',
              status: 'pending',
              expires_at: new Date(Date.now() - 1000).toISOString(), // 1 sec ago
              permissions: {},
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn(() => {
        updateCalled = true;
        return {
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }),
    }));

    const res = await GET(makeReq('expired-token'));
    expect(res.status).toBe(410);
    // Auto-marked expired in DB
    expect(updateCalled).toBe(true);
  });

  it('returns 200 with invitation details for valid pending invitation', async () => {
    setupInvitation({
      id: 'inv-1',
      email: 'newemployee@x.com',
      permissions: { 'orders.view': true, 'documents.view': true },
      status: 'pending',
      expires_at: new Date(Date.now() + 86_400_000).toISOString(), // 24h future
      created_at: new Date().toISOString(),
    });

    const res = await GET(makeReq('valid-token'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.invitation.email).toBe('newemployee@x.com');
    expect(body.invitation.status).toBe('pending');
    expect(body.invitation.permissions).toEqual({
      'orders.view': true,
      'documents.view': true,
    });
  });
});
