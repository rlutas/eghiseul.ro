import { describe, expect, it, vi } from 'vitest';
import { reopenOrderAsDraft, reopenRefusal } from '@/lib/orders/reopen-draft';

describe('reopenRefusal', () => {
  it('trimisă și neplătită (pending/abandoned) → se poate redeschide', () => {
    expect(reopenRefusal({ status: 'abandoned', payment_status: 'unpaid', channel: 'web' })).toBeNull();
    expect(reopenRefusal({ status: 'pending', payment_status: 'unpaid', channel: null })).toBeNull();
  });

  it('plătită → refuz, chiar dacă statusul a rămas în urmă', () => {
    expect(reopenRefusal({ status: 'abandoned', payment_status: 'paid' })).toMatch(/plătită/);
    expect(reopenRefusal({ status: 'pending', payment_status: 'unpaid', paid_at: '2026-11-12T08:00:00Z' })).toMatch(/plătită/);
    expect(reopenRefusal({ status: 'processing', payment_status: 'paid' })).toMatch(/plătită/);
  });

  it('transfer bancar în așteptare → refuz', () => {
    expect(reopenRefusal({ status: 'awaiting_payment', payment_status: 'awaiting_verification' })).toMatch(/transfer bancar/);
    expect(reopenRefusal({ status: 'pending', payment_status: 'awaiting_verification' })).toMatch(/transfer bancar/);
  });

  it('ciornă, anulată, telefonică → refuz', () => {
    expect(reopenRefusal({ status: 'draft', payment_status: 'unpaid' })).toMatch(/deja ciornă/);
    expect(reopenRefusal({ status: 'cancelled', payment_status: 'unpaid' })).toMatch(/nu poate fi redeschisă/);
    expect(reopenRefusal({ status: 'pending', payment_status: 'unpaid', channel: 'phone' })).toMatch(/telefonică/);
  });
});

/** Minimal chainable stand-in for the two tables the function touches. */
function fakeClient(order: Record<string, unknown> | null, updatedRows: Array<{ id: string }> = [{ id: 'o1' }]) {
  const calls: { update?: Record<string, unknown>; filters: Array<[string, string, unknown]>; history?: Record<string, unknown>; docFilters: Array<[string, unknown]> } = { filters: [], docFilters: [] };
  const client = {
    from(table: string) {
      if (table === 'order_documents') {
        const del = {
          eq(c: string, v: unknown) { calls.docFilters.push([c, v]); return del; },
          in: async (c: string, v: unknown) => { calls.docFilters.push([c, v]); return { error: null }; },
        };
        return { delete: () => del };
      }
      if (table === 'order_history') {
        return { insert: async (row: Record<string, unknown>) => { calls.history = row; return { error: null }; } };
      }
      const updateChain = {
        eq(c: string, v: unknown) { calls.filters.push(['eq', c, v]); return updateChain; },
        in(c: string, v: unknown) { calls.filters.push(['in', c, v]); return updateChain; },
        neq(c: string, v: unknown) { calls.filters.push(['neq', c, v]); return updateChain; },
        is(c: string, v: unknown) { calls.filters.push(['is', c, v]); return updateChain; },
        select: async () => ({ data: updatedRows, error: null }),
      };
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: order }) }) }),
        update(payload: Record<string, unknown>) { calls.update = payload; return updateChain; },
      };
    },
  };
  return { client, calls };
}

const submitted = {
  id: 'o1',
  friendly_order_id: 'E-1',
  status: 'abandoned',
  payment_status: 'unpaid',
  paid_at: null,
  channel: 'web',
  platform: 'documentero',
  stripe_checkout_session_id: 'cs_live_old',
  services: { slug: 'certificat-celibat' },
};

describe('reopenOrderAsDraft', () => {
  it('trece pe ciornă, expiră sesiunea Stripe veche și dă link pe brandul comenzii', async () => {
    const { client, calls } = fakeClient(submitted);
    const expire = vi.fn().mockResolvedValue(undefined);
    const res = await reopenOrderAsDraft(client, 'o1', 'admin-1', {
      expireCheckoutSession: expire,
      now: () => new Date('2026-11-12T08:00:00Z'),
    });

    expect(expire).toHaveBeenCalledWith('cs_live_old');
    expect(calls.update).toMatchObject({
      status: 'draft',
      submitted_at: null,
      contract_signed_at: null,
      stripe_checkout_session_id: null,
      resume_token_expires_at: '2026-11-14T08:00:00.000Z',
    });
    // The write must lose against a payment that landed in between.
    expect(calls.filters).toEqual(
      expect.arrayContaining([
        ['in', 'status', ['pending', 'abandoned']],
        ['neq', 'payment_status', 'paid'],
        ['is', 'paid_at', null],
      ])
    );
    expect(calls.history).toMatchObject({ event_type: 'admin_action', changed_by: 'admin-1', new_value: { status: 'draft' } });
    // The contract from the first submit goes; the next submit writes a new one.
    expect(calls.docFilters).toEqual([['order_id', 'o1'], ['type', ['contract_prestari', 'conventie']]]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.resumeUrl).toMatch(/^https:\/\/documentero\.ro\/comanda\/certificat-celibat\?resume=[\w-]{20,}$/);
      expect(res.resumeUrl).toContain(String(calls.update?.resume_token));
    }
  });

  it('sesiunea Stripe deja expirată nu oprește redeschiderea', async () => {
    const { client } = fakeClient(submitted);
    const res = await reopenOrderAsDraft(client, 'o1', 'admin-1', {
      expireCheckoutSession: vi.fn().mockRejectedValue(new Error('already expired')),
    });
    expect(res.ok).toBe(true);
  });

  it('comandă plătită → 409, fără scriere', async () => {
    const { client, calls } = fakeClient({ ...submitted, payment_status: 'paid' });
    const res = await reopenOrderAsDraft(client, 'o1', 'admin-1');
    expect(res).toMatchObject({ ok: false, status: 409 });
    expect(calls.update).toBeUndefined();
  });

  it('plată sosită între citire și scriere → 409, fără rând în istoric', async () => {
    const { client, calls } = fakeClient(submitted, []);
    const res = await reopenOrderAsDraft(client, 'o1', 'admin-1');
    expect(res).toMatchObject({ ok: false, status: 409 });
    expect(calls.history).toBeUndefined();
  });

  it('comandă inexistentă → 404', async () => {
    const { client } = fakeClient(null);
    expect(await reopenOrderAsDraft(client, 'nope', 'admin-1')).toMatchObject({ ok: false, status: 404 });
  });
});
