import { describe, it, expect, beforeAll } from 'vitest';
import { issuePaymentProofToken, verifyPaymentProofToken, PAYMENT_PROOF_TOKEN_TTL_SECONDS } from '@/lib/orders/payment-proof-token';

const ORDER = 'e0a5b3f2-1111-4222-8333-444455556666';

describe('payment proof token', () => {
  beforeAll(() => { process.env.PAYMENT_PROOF_TOKEN_SECRET = 'test-secret'; });

  it('verifies only for the same order, before expiry', () => {
    const t = issuePaymentProofToken(ORDER)!;
    expect(verifyPaymentProofToken(t, ORDER)).toBe(true);
    expect(verifyPaymentProofToken(t, 'other-order')).toBe(false);
    expect(verifyPaymentProofToken(t, ORDER, Date.now() + (PAYMENT_PROOF_TOKEN_TTL_SECONDS + 5) * 1000)).toBe(false);
  });

  it('rejects tampered, malformed or missing tokens', () => {
    const t = issuePaymentProofToken(ORDER)!;
    const [o, exp, mac] = t.split('.');
    expect(verifyPaymentProofToken(`${o}.${Number(exp) + 9999}.${mac}`, ORDER)).toBe(false);
    expect(verifyPaymentProofToken(`${o}.${exp}.${'0'.repeat(mac.length)}`, ORDER)).toBe(false);
    expect(verifyPaymentProofToken('nope', ORDER)).toBe(false);
    expect(verifyPaymentProofToken(undefined, ORDER)).toBe(false);
    expect(verifyPaymentProofToken(null, ORDER)).toBe(false);
  });
});
