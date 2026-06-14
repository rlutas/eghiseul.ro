import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ensureOnrcJobForPaidOrder — queue creation correctness.
 *
 * Runs in the payment flow (Stripe webhook + confirm-payment), so it must:
 *  - only queue ONRC services (certificat-constatator),
 *  - extract CUI + constatator detail from customer_data,
 *  - be idempotent (unique_violation 23505 is the "already queued" path),
 *  - never throw into the payment flow.
 */

// In-memory fakes mutated per test.
let orderRow: Record<string, unknown> | null = null;
let insertedJobs: Record<string, unknown>[] = [];
let insertError: { code?: string; message: string } | null = null;

function fakeClient() {
  return {
    from(table: string) {
      if (table === 'orders') {
        const chain = {
          select: () => chain,
          eq: () => chain,
          single: () =>
            Promise.resolve({ data: orderRow, error: orderRow ? null : { message: 'not found' } }),
        };
        return chain;
      }
      if (table === 'onrc_jobs') {
        return {
          insert: (payload: Record<string, unknown>) => {
            if (insertError) return Promise.resolve({ error: insertError });
            insertedJobs.push(payload);
            return Promise.resolve({ error: null });
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
}

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => fakeClient() }));

import { ensureOnrcJobForPaidOrder } from '@/lib/onrc/ensure-onrc-job';

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    services: { slug: 'certificat-constatator' },
    customer_data: {
      company: { cui: 'RO123', companyName: 'ACME SRL' },
      constatator: {
        documentType: 'istoric',
        reportType: 'Certificat constatator CAS',
        purpose: 'ANAF',
        period: 'founding',
        requesterName: 'Ion Popescu',
        requesterCnp: '1900101080010',
      },
      contact: { email: 'a@b.ro' },
    },
    ...overrides,
  };
}

beforeEach(() => {
  orderRow = null;
  insertedJobs = [];
  insertError = null;
});

describe('ensureOnrcJobForPaidOrder', () => {
  it('queues a job for an ONRC service with CUI + detail', async () => {
    orderRow = order();
    await ensureOnrcJobForPaidOrder('order-1');
    expect(insertedJobs).toHaveLength(1);
    const job = insertedJobs[0];
    expect(job.order_id).toBe('order-1');
    expect(job.status).toBe('PENDING');
    expect(job.document_type).toBe('CERTIFICAT_CONSTATATOR');
    expect(job.cui).toBe('RO123');
    expect(job.company_name).toBe('ACME SRL');
    expect((job.detail as Record<string, unknown>).documentType).toBe('istoric');
    expect((job.detail as Record<string, unknown>).purpose).toBe('ANAF');
    expect((job.detail as Record<string, unknown>).requesterCnp).toBe('1900101080010');
  });

  it('keeps "Altele" purpose AND the free-text reason as separate fields', async () => {
    // The worker needs both: `purpose` = 'Altele' to select the ONRC "Altele"
    // option, and `otherPurpose` for the documentTypeOtherReason free text.
    orderRow = order({
      customer_data: {
        company: { cui: 'RO9', companyName: 'X' },
        constatator: { purpose: 'Altele', otherPurpose: 'dosar special' },
        contact: { email: 'a@b.ro' },
      },
    });
    await ensureOnrcJobForPaidOrder('order-1');
    const detail = insertedJobs[0].detail as Record<string, unknown>;
    expect(detail.purpose).toBe('Altele');
    expect(detail.otherPurpose).toBe('dosar special');
  });

  it('does NOT queue a non-ONRC service', async () => {
    orderRow = order({ services: { slug: 'cazier-fiscal' } });
    await ensureOnrcJobForPaidOrder('order-1');
    expect(insertedJobs).toHaveLength(0);
  });

  it('does NOT queue when CUI is missing', async () => {
    orderRow = order({ customer_data: { company: {}, constatator: {}, contact: {} } });
    await ensureOnrcJobForPaidOrder('order-1');
    expect(insertedJobs).toHaveLength(0);
  });

  it('handles services as an array (PostgREST relation shape)', async () => {
    orderRow = order({ services: [{ slug: 'certificat-constatator' }] });
    await ensureOnrcJobForPaidOrder('order-1');
    expect(insertedJobs).toHaveLength(1);
  });

  it('is idempotent — a unique_violation (23505) does not throw', async () => {
    orderRow = order();
    insertError = { code: '23505', message: 'duplicate key value violates unique constraint' };
    await expect(ensureOnrcJobForPaidOrder('order-1')).resolves.toBeUndefined();
  });

  it('does nothing when the order is not found', async () => {
    orderRow = null;
    await ensureOnrcJobForPaidOrder('missing');
    expect(insertedJobs).toHaveLength(0);
  });
});
