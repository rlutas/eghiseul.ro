import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Stable supabase mock — module-level adminClient is captured at first call
const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => persistentClient),
}));

const { POST } = await import('@/app/api/coupons/validate/route');

interface CouponRow {
  id?: string;
  code?: string;
  description?: string | null;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_amount?: number;
  max_uses?: number | null;
  times_used?: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}

function setupCoupon(coupon: CouponRow | null, error: unknown = null) {
  persistentFrom.mockImplementation(() => ({
    select: vi.fn().mockReturnValue({
      ilike: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: coupon, error }),
        }),
      }),
    }),
  }));
}

function makeRequest(body: unknown, ip = '203.0.113.1'): NextRequest {
  return new NextRequest('http://localhost:3000/api/coupons/validate', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'x-forwarded-for': ip, 'Content-Type': 'application/json' },
  });
}

const ACTIVE_PERCENT = {
  id: 'coupon-1',
  code: 'SAVE10',
  description: '10% reducere',
  discount_type: 'percentage' as const,
  discount_value: 10,
  min_amount: 0,
  max_uses: null,
  times_used: 0,
  valid_from: null,
  valid_until: null,
  is_active: true,
};

beforeEach(() => {
  persistentFrom.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/coupons/validate — body validation', () => {
  it('returns 400 when body is malformed JSON', async () => {
    setupCoupon(null);
    const res = await POST(makeRequest('not-json{{{'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when code is missing', async () => {
    setupCoupon(null);
    const res = await POST(makeRequest({ subtotal: 100 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when subtotal is negative', async () => {
    setupCoupon(null);
    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: -1 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when code exceeds 50 chars', async () => {
    setupCoupon(null);
    const res = await POST(makeRequest({ code: 'X'.repeat(51), subtotal: 100 }));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/coupons/validate — coupon lookup', () => {
  it('returns 404 when coupon not found', async () => {
    setupCoupon(null);
    const res = await POST(makeRequest({ code: 'NOPE', subtotal: 100 }));

    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/invalid/i);
  });

  it('returns 500 when DB lookup errors', async () => {
    setupCoupon(null, { message: 'connection lost' });
    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));

    expect(res.status).toBe(500);
  });

  it('uppercases code before DB lookup (case-insensitive)', async () => {
    let capturedCode = '';
    persistentFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn((_field: string, val: string) => {
          capturedCode = val;
          return {
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: ACTIVE_PERCENT, error: null }),
            }),
          };
        }),
      }),
    }));

    await POST(makeRequest({ code: 'save10', subtotal: 100 }));

    expect(capturedCode).toBe('SAVE10');
  });
});

describe('POST /api/coupons/validate — time window', () => {
  it('rejects coupon not yet active (valid_from in future)', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    setupCoupon({ ...ACTIVE_PERCENT, valid_from: future });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/inca activ/i);
  });

  it('rejects expired coupon (valid_until in past)', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    setupCoupon({ ...ACTIVE_PERCENT, valid_until: past });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expirat/i);
  });

  it('accepts coupon currently in window', async () => {
    setupCoupon({
      ...ACTIVE_PERCENT,
      valid_from: new Date(Date.now() - 86_400_000).toISOString(),
      valid_until: new Date(Date.now() + 86_400_000).toISOString(),
    });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/coupons/validate — usage limit', () => {
  it('rejects when times_used >= max_uses', async () => {
    setupCoupon({ ...ACTIVE_PERCENT, max_uses: 100, times_used: 100 });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/limita/i);
  });

  it('accepts when max_uses is null (unlimited)', async () => {
    setupCoupon({ ...ACTIVE_PERCENT, max_uses: null, times_used: 9999 });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(200);
  });

  it('accepts when times_used below max', async () => {
    setupCoupon({ ...ACTIVE_PERCENT, max_uses: 100, times_used: 99 });
    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/coupons/validate — minimum amount', () => {
  it('rejects when subtotal below min_amount', async () => {
    setupCoupon({ ...ACTIVE_PERCENT, min_amount: 200 });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/200/);
  });

  it('accepts when subtotal exactly equals min_amount', async () => {
    setupCoupon({ ...ACTIVE_PERCENT, min_amount: 200 });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 200 }));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/coupons/validate — discount calculation', () => {
  it('percentage discount: 10% of 250 RON → 25 RON, final 225 RON', async () => {
    setupCoupon(ACTIVE_PERCENT);

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 250 }));
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.data.discount).toBe(25);
    expect(body.data.final).toBe(225);
    expect(body.data.coupon.discount_type).toBe('percentage');
  });

  it('fixed discount: 50 RON off 250 RON → final 200 RON', async () => {
    setupCoupon({
      ...ACTIVE_PERCENT,
      discount_type: 'fixed',
      discount_value: 50,
    });

    const res = await POST(makeRequest({ code: 'FIX50', subtotal: 250 }));
    const body = await res.json();

    expect(body.data.discount).toBe(50);
    expect(body.data.final).toBe(200);
  });

  it('caps discount at subtotal (never negative final)', async () => {
    // Fixed 100 off a 50 RON subtotal → discount capped at 50, final 0
    setupCoupon({ ...ACTIVE_PERCENT, discount_type: 'fixed', discount_value: 100 });

    const res = await POST(makeRequest({ code: 'BIG', subtotal: 50 }));
    const body = await res.json();

    expect(body.data.discount).toBe(50);
    expect(body.data.final).toBe(0);
  });

  it('rounds to 2 decimals (RON cents)', async () => {
    // 10% of 99.99 = 9.999 → rounds to 10.00
    setupCoupon({ ...ACTIVE_PERCENT, discount_value: 10 });

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 99.99 }));
    const body = await res.json();

    expect(body.data.discount).toBeCloseTo(10, 2);
    expect(body.data.final).toBeCloseTo(89.99, 2);
  });

  it('returns coupon metadata (id, code, description, discount_type, discount_value)', async () => {
    setupCoupon(ACTIVE_PERCENT);

    const res = await POST(makeRequest({ code: 'SAVE10', subtotal: 250 }));
    const body = await res.json();

    expect(body.data.coupon).toEqual({
      id: 'coupon-1',
      code: 'SAVE10',
      description: '10% reducere',
      discount_type: 'percentage',
      discount_value: 10,
    });
  });
});

describe('POST /api/coupons/validate — rate limiting', () => {
  it('returns 429 + Retry-After header after 30 requests/min from same IP', async () => {
    setupCoupon(ACTIVE_PERCENT);

    // Use a unique IP so this test doesn't pollute others
    const ip = `198.51.100.${Math.floor(Math.random() * 200)}`;

    // Burn 30 successful requests
    for (let i = 0; i < 30; i++) {
      const ok = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }, ip));
      expect(ok.status).toBe(200);
    }

    // 31st should be rate-limited
    const limited = await POST(makeRequest({ code: 'SAVE10', subtotal: 100 }, ip));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBeTruthy();
  });
});
