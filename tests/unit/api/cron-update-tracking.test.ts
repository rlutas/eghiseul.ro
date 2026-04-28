import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { getCourierProvider } = vi.hoisted(() => ({ getCourierProvider: vi.fn() }));
vi.mock('@/lib/services/courier', () => ({ getCourierProvider, CourierCode: undefined }));

const { extractCourierProviderFromDeliveryMethod, isFinalStatus } = vi.hoisted(() => ({
  extractCourierProviderFromDeliveryMethod: vi.fn(),
  isFinalStatus: vi.fn((s: string) => ['delivered', 'returned', 'cancelled'].includes(s)),
}));
vi.mock('@/lib/services/courier/utils', () => ({
  extractCourierProviderFromDeliveryMethod,
  isFinalStatus,
}));

const { POST } = await import('@/app/api/cron/update-tracking/route');

function makeReq(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader) headers.authorization = authHeader;
  return new NextRequest('http://localhost:3000/api/cron/update-tracking', {
    method: 'POST',
    headers,
  });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  persistentFrom.mockReset();
  getCourierProvider.mockReset();
  extractCourierProviderFromDeliveryMethod.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('POST /api/cron/update-tracking — auth', () => {
  it('returns 500 when CRON_SECRET not configured (server misconfig)', async () => {
    vi.stubEnv('CRON_SECRET', '');

    const res = await POST(makeReq('Bearer something'));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/not configured/i);
  });

  it('returns 401 when no Authorization header', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    const res = await POST(makeReq());
    expect(res.status).toBe(401);
  });

  it('returns 401 when wrong secret', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    const res = await POST(makeReq('Bearer wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('returns 401 when wrong scheme (Basic instead of Bearer)', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    const res = await POST(makeReq('Basic secret123'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/cron/update-tracking — empty results', () => {
  it('returns 200 with no-shipments summary when none active', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    });

    const res = await POST(makeReq('Bearer secret123'));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.total).toBe(0);
    expect(body.data.updated).toBe(0);
  });

  it('returns 500 on DB query error', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        not: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: null, error: { message: 'connection lost' } }),
        }),
      }),
    });

    const res = await POST(makeReq('Bearer secret123'));
    expect(res.status).toBe(500);
  });
});

describe('POST /api/cron/update-tracking — only queries active shipments', () => {
  it('filters by tracking_number IS NOT NULL AND status IN active list', async () => {
    vi.stubEnv('CRON_SECRET', 'secret123');

    let capturedFilter: string[] = [];
    persistentFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        not: vi.fn((field: string, op: string) => {
          capturedFilter.push(`not:${field}:${op}`);
          return {
            in: vi.fn((field2: string, values: string[]) => {
              capturedFilter.push(`in:${field2}:${values.join(',')}`);
              return Promise.resolve({ data: [], error: null });
            }),
          };
        }),
      }),
    });

    await POST(makeReq('Bearer secret123'));

    expect(capturedFilter[0]).toBe('not:delivery_tracking_number:is');
    // Active statuses must include exactly these (and exclude delivered/returned/cancelled)
    expect(capturedFilter[1]).toMatch(/in:delivery_tracking_status:/);
    expect(capturedFilter[1]).toContain('pending');
    expect(capturedFilter[1]).toContain('picked_up');
    expect(capturedFilter[1]).toContain('in_transit');
    expect(capturedFilter[1]).toContain('out_for_delivery');
    // Final statuses MUST NOT be in the active list (otherwise we'd re-poll forever)
    expect(capturedFilter[1]).not.toContain('delivered');
    expect(capturedFilter[1]).not.toContain('returned');
    expect(capturedFilter[1]).not.toContain('cancelled');
  });
});
