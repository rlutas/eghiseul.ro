import { describe, expect, it } from 'vitest';
import { resolveRefundReference } from '@/lib/accounting/refund-tx';

// Refundurile ajungeau în decontări ca „necunoscut": sursa tranzacției e un
// Refund, nu un Charge. Metadata pusă la refund trebuie citită corect pe
// ambele platforme (eghiseul: order_number, CJO Modifică: order_ref).
describe('resolveRefundReference', () => {
  it('reads the eghiseul cancellation metadata', () => {
    const ref = resolveRefundReference({
      id: 're_1',
      charge: 'ch_1',
      payment_intent: 'pi_1',
      metadata: { order_id: 'uuid-1', order_number: 'e-260915-m4a4v', policy: 'self_cancel_70pct' },
    });
    expect(ref).toEqual({
      chargeId: 'ch_1',
      paymentIntentId: 'pi_1',
      orderNumber: 'E-260915-M4A4V',
      orderId: 'uuid-1',
      platformHint: 'eghiseul',
    });
  });

  it('reads the CJO Modify metadata (order_ref) and expanded objects', () => {
    const ref = resolveRefundReference({
      id: 're_2',
      charge: { id: 'ch_2' },
      payment_intent: { id: 'pi_2' },
      metadata: { order_ref: 'CAO-20260915-26899', admin_email: 'x' },
    });
    expect(ref.chargeId).toBe('ch_2');
    expect(ref.paymentIntentId).toBe('pi_2');
    expect(ref.orderNumber).toBe('CAO-20260915-26899');
    expect(ref.platformHint).toBe('cjo');
  });

  it('falls back to the charge when a legacy refund carries only order_id', () => {
    const ref = resolveRefundReference({ id: 're_3', charge: 'ch_3', metadata: { order_id: 'uuid-3' } });
    expect(ref.orderNumber).toBeNull();
    expect(ref.orderId).toBe('uuid-3');
    expect(ref.chargeId).toBe('ch_3');
  });

  it('handles a refund without metadata at all (dashboard refund)', () => {
    const ref = resolveRefundReference({ id: 're_4', charge: 'ch_4', metadata: null });
    expect(ref).toEqual({ chargeId: 'ch_4', paymentIntentId: null, orderNumber: null, orderId: null, platformHint: null });
  });
});
