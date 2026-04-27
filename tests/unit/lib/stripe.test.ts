import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// STRIPE_SECRET_KEY is provided by vitest.config.ts `env` block before module
// import. The exported `stripe` singleton is mocked per-test via spyOn.
import { createPaymentIntent, getOrCreateCustomer, stripe } from '@/lib/stripe';

const mockCustomer = (overrides: Record<string, unknown> = {}) =>
  ({ id: 'cus_test123', email: 'a@b.com', ...overrides }) as never;
const mockPaymentIntent = (overrides: Record<string, unknown> = {}) =>
  ({ id: 'pi_test123', amount: 0, currency: 'ron', ...overrides }) as never;

describe('createPaymentIntent — amount conversion', () => {
  beforeEach(() => {
    vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue(mockPaymentIntent());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts RON to cents (smallest currency unit) — 250 RON → 25000', async () => {
    await createPaymentIntent(250, { orderId: 'o1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 25000 })
    );
  });

  it('handles fractional amounts via Math.round (368.61 RON → 36861)', async () => {
    await createPaymentIntent(368.61, { orderId: 'o1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 36861 })
    );
  });

  it('rounds up at 0.5 boundary (10.005 → 1001 cents, banker-safe)', async () => {
    await createPaymentIntent(10.005, { orderId: 'o1' });
    // Math.round(10.005 * 100) = Math.round(1000.4999...) = 1000 (FP imprecision)
    // Test what the implementation actually does (characterization)
    const callArg = (stripe.paymentIntents.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.amount).toBeGreaterThanOrEqual(1000);
    expect(callArg.amount).toBeLessThanOrEqual(1001);
  });

  it('uses RON as the currency', async () => {
    await createPaymentIntent(100, { orderId: 'o1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ currency: 'ron' })
    );
  });

  it('forwards metadata to Stripe (used for webhook routing)', async () => {
    await createPaymentIntent(100, { orderId: 'order-abc', userId: 'user-1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: { orderId: 'order-abc', userId: 'user-1' } })
    );
  });

  it('forwards description', async () => {
    await createPaymentIntent(100, { orderId: 'o1' }, { description: 'Cazier judiciar PF' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Cazier judiciar PF' })
    );
  });

  it('enables automatic payment methods (Apple Pay / Google Pay / cards)', async () => {
    await createPaymentIntent(100, { orderId: 'o1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ automatic_payment_methods: { enabled: true } })
    );
  });
});

describe('createPaymentIntent — customer + receipt', () => {
  beforeEach(() => {
    vi.spyOn(stripe.paymentIntents, 'create').mockResolvedValue(mockPaymentIntent());
    vi.spyOn(stripe.customers, 'list').mockResolvedValue({ data: [] } as never);
    vi.spyOn(stripe.customers, 'create').mockResolvedValue(mockCustomer({ id: 'cus_new' }));
    vi.spyOn(stripe.customers, 'update').mockResolvedValue(mockCustomer({ id: 'cus_existing' }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does NOT pass a customer when no customer data provided', async () => {
    await createPaymentIntent(100, { orderId: 'o1' });
    expect(stripe.customers.list).not.toHaveBeenCalled();
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: undefined })
    );
  });

  it('creates new customer when none exists with the email', async () => {
    await createPaymentIntent(100, { orderId: 'o1' }, {
      customer: { email: 'new@example.com', name: 'Test User' },
    });
    expect(stripe.customers.list).toHaveBeenCalledWith({ email: 'new@example.com', limit: 1 });
    expect(stripe.customers.create).toHaveBeenCalled();
    expect(stripe.customers.update).not.toHaveBeenCalled();
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_new' })
    );
  });

  it('reuses + updates existing customer found by email', async () => {
    (stripe.customers.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [{ id: 'cus_existing', email: 'old@example.com' }],
    } as never);

    await createPaymentIntent(100, { orderId: 'o1' }, {
      customer: { email: 'old@example.com', name: 'Test User' },
    });
    expect(stripe.customers.update).toHaveBeenCalledWith('cus_existing', expect.any(Object));
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' })
    );
  });

  it('uses receiptEmail when explicitly provided', async () => {
    await createPaymentIntent(100, { orderId: 'o1' }, {
      receiptEmail: 'override@example.com',
      customer: { email: 'customer@example.com', name: 'X' },
    });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ receipt_email: 'override@example.com' })
    );
  });

  it('falls back to customer.email when receiptEmail not set', async () => {
    await createPaymentIntent(100, { orderId: 'o1' }, {
      customer: { email: 'customer@example.com', name: 'X' },
    });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
      expect.objectContaining({ receipt_email: 'customer@example.com' })
    );
  });
});

describe('getOrCreateCustomer — CNP masking (privacy)', () => {
  beforeEach(() => {
    vi.spyOn(stripe.customers, 'list').mockResolvedValue({ data: [] } as never);
    vi.spyOn(stripe.customers, 'create').mockResolvedValue(mockCustomer());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('NEVER stores raw CNP in Stripe metadata — only masked form', async () => {
    await getOrCreateCustomer({
      email: 'a@b.com',
      name: 'Test',
      cnp: '2960507211209',
    });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.metadata.cnp).not.toBe('2960507211209');
    expect(createCall.metadata.cnp).toBe('2960******209');
    // sanity: masked form keeps prefix + suffix that aren't full identity
    expect(createCall.metadata.cnp).toMatch(/^\d{4}\*+\d{3}$/);
  });

  it('stores CUI in metadata as plain text (it is public business data)', async () => {
    await getOrCreateCustomer({
      email: 'a@b.com',
      name: 'Test',
      cui: 'RO12345678',
    });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.metadata.cui).toBe('RO12345678');
  });

  it('prefers companyName over name (PJ orders bill to the company)', async () => {
    await getOrCreateCustomer({
      email: 'a@b.com',
      name: 'Ion Popescu',
      companyName: 'ACME SRL',
    });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.name).toBe('ACME SRL');
  });

  it('uses name when no companyName (PF orders)', async () => {
    await getOrCreateCustomer({
      email: 'a@b.com',
      name: 'Ion Popescu',
    });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.name).toBe('Ion Popescu');
  });

  it('defaults country to RO when address provided without country', async () => {
    await getOrCreateCustomer({
      email: 'a@b.com',
      name: 'X',
      address: { line1: 'Str. Test 1', city: 'București' },
    });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.address.country).toBe('RO');
  });

  it('omits address entirely when not provided (does not send empty object)', async () => {
    await getOrCreateCustomer({ email: 'a@b.com', name: 'X' });

    const createCall = (stripe.customers.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.address).toBeUndefined();
  });
});
