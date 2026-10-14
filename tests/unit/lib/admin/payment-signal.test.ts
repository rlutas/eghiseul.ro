import { describe, expect, it } from 'vitest';
import { declineReason, paymentSignal, stripeErrorCode } from '@/lib/admin/payment-signal';

describe('paymentSignal', () => {
  it('declined card wins over the wizard step (E-261014-GD94K: 2 declines, step billing)', () => {
    const s = paymentSignal({
      current_step: 'billing',
      stripe_checkout_session_id: 'cs_live_x',
      payment_failed_count: 2,
      payment_last_error: 'generic_decline',
    });
    expect(s.kind).toBe('failed');
    expect(s.label).toBe('Plată cu cardul eșuată (2×)');
    if (s.kind === 'failed') {
      expect(s.reason).toBe('card refuzat de bancă');
      expect(s.hint).toMatch(/IBAN/);
    }
  });

  it('single decline has no counter and a specific reason', () => {
    const s = paymentSignal({ payment_failed_count: 1, payment_last_error: 'insufficient_funds' });
    expect(s.label).toBe('Plată cu cardul eșuată');
    expect(s.kind === 'failed' && s.reason).toBe('fonduri insuficiente');
  });

  it('a Stripe session without declines means the client reached the card form', () => {
    const s = paymentSignal({ current_step: 'billing', stripe_checkout_session_id: 'cs_live_x' });
    expect(s.kind).toBe('reached_payment');
  });

  it('otherwise shows the wizard step', () => {
    expect(paymentSignal({ current_step: 'delivery' })).toEqual({ kind: 'step', label: 'pas: Livrare' });
    expect(paymentSignal({ current_step: null }).label).toBe('pas: —');
  });
});

describe('stripeErrorCode / declineReason', () => {
  it('prefers decline_code over the generic card_declined code', () => {
    expect(stripeErrorCode({ code: 'card_declined', decline_code: 'expired_card' })).toBe('expired_card');
    expect(stripeErrorCode({ code: 'payment_intent_authentication_failure' })).toBe(
      'payment_intent_authentication_failure'
    );
    expect(stripeErrorCode(null)).toBeNull();
  });

  it('unknown codes fall back to a generic bank refusal', () => {
    expect(declineReason('do_not_honor')).toBe('card refuzat de bancă');
    expect(declineReason(null)).toBe('card refuzat de bancă');
    expect(declineReason('payment_intent_authentication_failure')).toMatch(/3D Secure/);
  });
});
