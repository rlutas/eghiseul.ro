import { beforeEach, describe, expect, it, vi } from 'vitest';

const updates: Array<Record<string, unknown>> = [];
const order = {
  id: 'o1',
  status: 'awaiting_payment',
  payment_status: 'awaiting_verification',
  payment_method: 'bank_transfer',
  proof_verified_at: null,
  payment_proof_url: 'orders/o1/proof.pdf',
  customer_data: {},
  selected_options: [],
  delivery_method: null,
  services: { slug: 'cazier-judiciar-persoana-fizica', estimated_days: 5 },
};

const chain = (result: unknown) => {
  const c: Record<string, unknown> = {};
  for (const m of ['eq', 'is', 'select']) c[m] = () => c;
  c.single = () => Promise.resolve({ data: order, error: null });
  c.then = (r: (v: unknown) => unknown) => Promise.resolve(result).then(r);
  return c;
};

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'order_history') return { insert: () => Promise.resolve({ error: null }) };
      return {
        select: () => chain(null),
        update: (patch: Record<string, unknown>) => {
          updates.push(patch);
          return chain({ data: [{ id: 'o1' }], error: null });
        },
      };
    },
  }),
}));
vi.mock('@/lib/documents/ensure-barou-documents', () => ({
  ensureBarouDocumentsForPaidOrder: vi.fn().mockResolvedValue({ ok: true, skipped: true }),
}));
const compute = vi.fn().mockResolvedValue('2026-11-09T16:00:00.000Z');
vi.mock('@/lib/orders/order-estimate', () => ({ computeEstimatedCompletionISOForOrder: compute }));

const { startWorkOnVerifiedProof } = await import('@/lib/orders/start-work-on-proof-run');

beforeEach(() => {
  updates.length = 0;
  compute.mockClear();
});

describe('startWorkOnVerifiedProof — termenul pornește la dovada verificată (E-261026-B9HW3)', () => {
  it('recalculează termenul din momentul pornirii lucrului', async () => {
    const before = Date.now();
    const res = await startWorkOnVerifiedProof('o1', { adminId: 'admin-1' });
    expect(res.ok).toBe(true);
    expect(compute).toHaveBeenCalledTimes(1);
    const anchor = compute.mock.calls[0][3] as Date;
    expect(anchor.getTime()).toBeGreaterThanOrEqual(before);
    expect(compute.mock.calls[0][2]).toMatchObject({ slug: 'cazier-judiciar-persoana-fizica' });
    expect(updates[0]).toMatchObject({
      status: 'processing',
      estimated_completion_date: '2026-11-09T16:00:00.000Z',
    });
  });
});
