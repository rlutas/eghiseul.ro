import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock supabase client BEFORE importing route — webhook calls it for state mutation.
vi.mock('@supabase/supabase-js', () => {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
  const maybeSingle = vi.fn().mockResolvedValue({ data: null });
  const eq = vi.fn().mockResolvedValue({ error: null });
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ single, maybeSingle })) }));
  const ilike = vi.fn(() => ({ maybeSingle }));
  const from = vi.fn(() => ({ select, insert, update: () => ({ eq }), ilike, eq }));
  const createClient = vi.fn(() => ({ from }));
  return { createClient };
});

// Mock stripe.webhooks.constructEvent so we can control signature verification outcomes.
vi.mock('@/lib/stripe', () => {
  const constructEvent = vi.fn();
  return {
    stripe: {
      webhooks: { constructEvent },
      paymentIntents: { retrieve: vi.fn() },
    },
    __mocks: { constructEvent },
  };
});

vi.mock('@/lib/oblio', () => ({ createInvoiceFromOrder: vi.fn() }));
vi.mock('@/lib/delivery-estimate-helper', () => ({ computeEstimatedCompletionISO: vi.fn(() => null) }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripeMocks = (await import('@/lib/stripe') as any).__mocks;
const { POST } = await import('@/app/api/webhooks/stripe/route');

function makeRequest(body: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers,
  });
}

describe('POST /api/webhooks/stripe — security: rejects unsigned requests', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    stripeMocks.constructEvent.mockReset();
  });

  it('rejects 400 when stripe-signature header is missing (no secret env, dev)', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/stripe-signature/i);
  });

  it('rejects 400 when stripe-signature header is missing (secret IS set)', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_dummy');

    const res = await POST(makeRequest('{}'));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/stripe-signature/i);
    expect(stripeMocks.constructEvent).not.toHaveBeenCalled();
  });

  it('rejects 400 in production when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');

    const res = await POST(makeRequest('{}', { 'stripe-signature': 't=123,v1=abc' }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/not configured/i);
  });

  it('rejects 400 when signature verification throws (forged or stale signature)', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_dummy');
    stripeMocks.constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });

    const res = await POST(makeRequest('{"type":"payment_intent.succeeded"}', {
      'stripe-signature': 't=123,v1=tampered',
    }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/signature verification failed/i);
  });

  it('does NOT use the dev bypass when running in production', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');

    const res = await POST(makeRequest('{}', { 'stripe-signature': 't=123,v1=abc' }));

    expect(res.status).toBe(400);
    expect(stripeMocks.constructEvent).not.toHaveBeenCalled();
  });
});

describe('POST /api/webhooks/stripe — event dispatching', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_dummy');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    stripeMocks.constructEvent.mockReset();
  });

  it('returns 200 for unhandled event types (no-op, no error)', async () => {
    stripeMocks.constructEvent.mockReturnValueOnce({
      type: 'customer.created',
      data: { object: {} },
    });

    const res = await POST(makeRequest('{"type":"customer.created"}', {
      'stripe-signature': 't=123,v1=ok',
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ received: true });
  });

  it('returns 200 ack for payment_intent.succeeded with no orderId metadata (handler logs + returns)', async () => {
    stripeMocks.constructEvent.mockReturnValueOnce({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_x', metadata: {} } },
    });

    const res = await POST(makeRequest('{"type":"payment_intent.succeeded"}', {
      'stripe-signature': 't=123,v1=ok',
    }));

    expect(res.status).toBe(200);
  });

  it('returns 400 on malformed JSON when bypass active (dev) but signature header present', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');

    const res = await POST(makeRequest('not-valid-json', {
      'stripe-signature': 't=123,v1=devbypass',
    }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid webhook payload/i);
  });
});
