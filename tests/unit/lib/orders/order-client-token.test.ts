import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { issueOrderClientToken, verifyOrderClientToken } from '@/lib/orders/order-client-token';
import { issuePaymentProofToken } from '@/lib/orders/payment-proof-token';

const ORDER = '11111111-2222-3333-4444-555555555555';
const OTHER = '99999999-2222-3333-4444-555555555555';

describe('order-client token', () => {
  const prev = process.env.SUPABASE_SERVICE_ROLE_KEY;
  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });
  afterEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = prev;
  });

  it('verifies for its own order only', () => {
    const token = issueOrderClientToken(ORDER);
    expect(token).toBeTruthy();
    expect(verifyOrderClientToken(token, ORDER)).toBe(true);
    expect(verifyOrderClientToken(token, OTHER)).toBe(false);
  });

  it('expires', () => {
    const token = issueOrderClientToken(ORDER, Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(verifyOrderClientToken(token, ORDER)).toBe(false);
  });

  it('is not interchangeable with the payment-proof token', () => {
    const proof = issuePaymentProofToken(ORDER);
    expect(verifyOrderClientToken(proof, ORDER)).toBe(false);
  });

  it('rejects tampering', () => {
    const token = issueOrderClientToken(ORDER)!;
    const [id, exp, mac] = token.split('.');
    expect(verifyOrderClientToken(`${id}.${Number(exp) + 1000}.${mac}`, ORDER)).toBe(false);
    expect(verifyOrderClientToken(undefined, ORDER)).toBe(false);
  });
});
