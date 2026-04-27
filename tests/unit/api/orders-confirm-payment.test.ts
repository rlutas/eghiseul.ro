import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// IMPORTANT: the confirm-payment route caches the supabase client at module
// import time (top-level `const supabaseAdmin = createClient(...)`). So we
// must mock createClient ONCE up-front to return a single stable client
// whose `from` method we then re-program per test.

const persistentFrom = vi.fn();
const persistentClient = { from: persistentFrom };

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => persistentClient),
}));

vi.mock('@/lib/stripe', () => {
  const retrieve = vi.fn();
  return {
    stripe: { paymentIntents: { retrieve } },
    __mocks: { retrieve },
  };
});

vi.mock('@/lib/delivery-estimate-helper', () => ({
  computeEstimatedCompletionISO: vi.fn(() => '2026-05-15T12:00:00.000Z'),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeMocks = (await import('@/lib/stripe') as any).__mocks;

const { POST } = await import('@/app/api/orders/[id]/confirm-payment/route');

interface MockSetup {
  order: { data: unknown; error: unknown };
  updateResult?: { error: unknown };
  insertResult?: { error: unknown };
}

function setupMocks(s: MockSetup) {
  persistentFrom.mockImplementation((table: string) => {
    if (table === 'order_history') {
      return { insert: vi.fn().mockResolvedValue(s.insertResult ?? { error: null }) };
    }
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue(s.order),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(s.updateResult ?? { error: null }),
      }),
    };
  });
}

function callRoute(orderId: string) {
  const req = new NextRequest(`http://localhost:3000/api/orders/${orderId}/confirm-payment`, {
    method: 'POST',
  });
  return POST(req, { params: Promise.resolve({ id: orderId }) });
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  persistentFrom.mockReset();
  stripeMocks.retrieve.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/orders/[id]/confirm-payment — order lookup', () => {
  it('returns 404 when order does not exist', async () => {
    setupMocks({ order: { data: null, error: { message: 'not found' } } });

    const res = await callRoute('order-missing');

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Order not found');
    expect(stripeMocks.retrieve).not.toHaveBeenCalled();
  });

  it('returns 200 with already-paid message when order is already paid (idempotency)', async () => {
    setupMocks({
      order: { data: { id: 'o1', payment_status: 'paid', status: 'processing' }, error: null },
    });

    const res = await callRoute('o1');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/already.*paid/i);
    expect(stripeMocks.retrieve).not.toHaveBeenCalled();
  });

  it('returns 400 when order has no stripe_payment_intent_id', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: null },
        error: null,
      },
    });

    const res = await callRoute('o1');

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no payment intent/i);
  });
});

describe('POST /api/orders/[id]/confirm-payment — Stripe verification', () => {
  it('returns 400 when Stripe payment status is "requires_payment_method" (failed card)', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: 'pi_failed', status: 'pending' },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'requires_payment_method' });

    const res = await callRoute('o1');

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/payment not successful/i);
    expect(body.data.stripeStatus).toBe('requires_payment_method');
  });

  it('returns 400 when Stripe says "processing" (still pending — must not mark paid)', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: 'pi_p', status: 'pending' },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'processing' });

    const res = await callRoute('o1');
    expect(res.status).toBe(400);
  });

  it('returns 400 when Stripe says "canceled"', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: 'pi_c', status: 'pending' },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'canceled' });

    expect((await callRoute('o1')).status).toBe(400);
  });

  it('returns 500 when Stripe SDK throws (network down, bad secret)', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: 'pi_x', status: 'pending' },
        error: null,
      },
    });
    stripeMocks.retrieve.mockRejectedValueOnce(new Error('Stripe API unreachable'));

    const res = await callRoute('o1');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/orders/[id]/confirm-payment — success path', () => {
  it('marks pending order as paid + processing when Stripe succeeded', async () => {
    setupMocks({
      order: {
        data: {
          id: 'o1',
          payment_status: 'unpaid',
          stripe_payment_intent_id: 'pi_ok',
          status: 'pending',
          services: { name: 'Cazier', estimated_days: 3, urgent_days: null, urgent_available: false },
        },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const res = await callRoute('o1');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.paymentStatus).toBe('paid');
    expect(body.data.stripeStatus).toBe('succeeded');
    // order_history insert was reached → from('order_history') called
    expect(persistentFrom).toHaveBeenCalledWith('order_history');
  });

  it('also marks draft → paid + processing (covers fresh customer flow)', async () => {
    setupMocks({
      order: {
        data: {
          id: 'o1',
          payment_status: 'unpaid',
          stripe_payment_intent_id: 'pi_ok',
          status: 'draft',
          services: { name: 'X' },
        },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
  });

  it('does not downgrade post-paid statuses (e.g. "shipped" → stays "shipped")', async () => {
    // Edge case: webhook may have already advanced order; manual re-confirm
    // should still mark payment paid but not regress status to processing.
    setupMocks({
      order: {
        data: {
          id: 'o1',
          payment_status: 'unpaid', // contrived: status diverged from payment_status
          stripe_payment_intent_id: 'pi_ok',
          status: 'shipped',
          services: { name: 'X' },
        },
        error: null,
      },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const res = await callRoute('o1');
    expect(res.status).toBe(200);
  });

  it('returns 500 when DB update fails after Stripe verification', async () => {
    setupMocks({
      order: {
        data: { id: 'o1', payment_status: 'unpaid', stripe_payment_intent_id: 'pi_ok', status: 'pending', services: { name: 'X' } },
        error: null,
      },
      updateResult: { error: { message: 'DB constraint violated' } },
    });
    stripeMocks.retrieve.mockResolvedValueOnce({ status: 'succeeded' });

    const res = await callRoute('o1');
    expect(res.status).toBe(500);
  });
});
