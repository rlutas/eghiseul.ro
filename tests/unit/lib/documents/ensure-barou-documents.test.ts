import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ensureBarouDocumentsForPaidOrder — the post-payment Barou allocation gate.
 *
 * Runs in the Stripe webhook / confirm-payment / cron sweep, so it must:
 *  - allocate ONLY for paid orders (never for unpaid),
 *  - be idempotent (barou_numbers_allocated_at marker + existing-doc check),
 *  - skip no-lawyer services but STILL set the marker (so the cron stops
 *    picking them up),
 *  - NEVER throw into the payment flow; failures land in order_history and
 *    leave the marker NULL for the cron retry.
 */

// ── In-memory fakes, mutated per test ─────────────────────────────
let orderRow: Record<string, unknown> | null = null;
let existingContractDoc: { id: string } | null = null;
let orderUpdates: Record<string, unknown>[] = [];
let historyInserts: Record<string, unknown>[] = [];
let generateResults: { template: string }[] = [];
let generateError: Error | null = null;
let generateCalls: { orderId: string; mode: string }[] = [];

function fakeClient() {
  return {
    from(table: string) {
      if (table === 'orders') {
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: () =>
            Promise.resolve({ data: orderRow, error: orderRow ? null : { message: 'not found' } }),
          update: (payload: Record<string, unknown>) => {
            orderUpdates.push(payload);
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
        return chain;
      }
      if (table === 'order_documents') {
        const chain = {
          select: () => chain,
          eq: () => chain,
          limit: () => chain,
          maybeSingle: () => Promise.resolve({ data: existingContractDoc, error: null }),
        };
        return chain;
      }
      if (table === 'order_history') {
        return {
          insert: (payload: Record<string, unknown>) => {
            historyInserts.push(payload);
            return Promise.resolve({ error: null });
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => fakeClient() }));
vi.mock('@/lib/documents/auto-generate', () => ({
  autoGenerateOrderDocuments: (orderId: string, _by: string | null, mode: string) => {
    generateCalls.push({ orderId, mode });
    if (generateError) return Promise.reject(generateError);
    return Promise.resolve(generateResults);
  },
}));
vi.mock('@/lib/documents/no-lawyer-services', () => ({
  isNoLawyerService: (slug: string) => slug === 'certificat-constatator',
}));

import { ensureBarouDocumentsForPaidOrder } from '@/lib/documents/ensure-barou-documents';

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    payment_status: 'paid',
    barou_numbers_allocated_at: null,
    services: { slug: 'cazier-judiciar' },
    ...overrides,
  };
}

beforeEach(() => {
  orderRow = null;
  existingContractDoc = null;
  orderUpdates = [];
  historyInserts = [];
  generateResults = [{ template: 'contract-asistenta' }];
  generateError = null;
  generateCalls = [];
});

describe('ensureBarouDocumentsForPaidOrder', () => {
  it('happy path: generates contract-asistenta post-payment and sets the marker', async () => {
    orderRow = order();
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result.ok).toBe(true);
    expect(generateCalls).toEqual([{ orderId: 'order-1', mode: 'post-payment' }]);
    expect(orderUpdates).toHaveLength(1);
    expect(orderUpdates[0].barou_numbers_allocated_at).toBeTruthy();
  });

  it('no-ops when the marker is already set (idempotency)', async () => {
    orderRow = order({ barou_numbers_allocated_at: '2026-07-09T10:00:00Z' });
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result).toEqual({ ok: true, skipped: 'already-allocated' });
    expect(generateCalls).toHaveLength(0);
    expect(orderUpdates).toHaveLength(0);
  });

  it('refuses unpaid orders — Barou numbers only after payment', async () => {
    orderRow = order({ payment_status: 'pending' });
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result).toEqual({ ok: true, skipped: 'not-paid' });
    expect(generateCalls).toHaveLength(0);
    expect(orderUpdates).toHaveLength(0);
  });

  it('marks no-lawyer services WITHOUT generating (so the cron stops retrying)', async () => {
    orderRow = order({ services: { slug: 'certificat-constatator' } });
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result).toEqual({ ok: true, skipped: 'no-lawyer-service' });
    expect(generateCalls).toHaveLength(0);
    expect(orderUpdates).toHaveLength(1); // marker set
  });

  it('skips generation when contract-asistenta already exists (pre-cutover orders)', async () => {
    orderRow = order();
    existingContractDoc = { id: 'doc-legacy' };
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result).toEqual({ ok: true, skipped: 'doc-already-exists' });
    expect(generateCalls).toHaveLength(0);
    expect(orderUpdates).toHaveLength(1); // marker set
  });

  it('leaves the marker NULL and records order_history when generation fails', async () => {
    orderRow = order();
    generateResults = []; // contract-asistenta did NOT land
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result.ok).toBe(false);
    expect(orderUpdates).toHaveLength(0); // NO marker → cron retries
    expect(historyInserts).toHaveLength(1);
    expect(historyInserts[0].event_type).toBe('barou_allocation_failed');
  });

  it('NEVER throws into the payment flow — registry outage returns ok:false', async () => {
    orderRow = order();
    generateError = new Error('registry unreachable');
    const result = await ensureBarouDocumentsForPaidOrder('order-1');

    expect(result.ok).toBe(false);
    expect(orderUpdates).toHaveLength(0);
    expect(historyInserts[0].notes).toMatch(/registry unreachable/);
  });

  it('returns ok:false when the order does not exist (no throw)', async () => {
    orderRow = null;
    const result = await ensureBarouDocumentsForPaidOrder('missing');
    expect(result.ok).toBe(false);
    expect(generateCalls).toHaveLength(0);
  });
});
