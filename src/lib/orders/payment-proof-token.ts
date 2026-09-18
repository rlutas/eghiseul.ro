/**
 * A short-lived, order-scoped bearer that lets a GUEST attach a payment proof
 * without a session: the status page (order code + email) and the checkout
 * page (order UUID already authorized by `GET /api/orders/[id]`) issue it, and
 * only the `payment-proof` upload branch and the bank-transfer route accept
 * it. Audience is fixed, so the token cannot be used for anything else.
 *
 * Format: `<orderId>.<exp>.<hex hmac>` — HMAC-SHA256 over
 * `payment-proof:<orderId>:<exp>` with PAYMENT_PROOF_TOKEN_SECRET, or, when
 * that is not set, a key derived from the service-role key (so the feature
 * works without a new env var; rotate by setting the dedicated secret).
 */

import { createHmac, createHash, timingSafeEqual } from 'crypto';

export const PAYMENT_PROOF_TOKEN_TTL_SECONDS = 2 * 60 * 60;
const AUDIENCE = 'payment-proof';

function secret(): Buffer | null {
  const dedicated = process.env.PAYMENT_PROOF_TOKEN_SECRET;
  if (dedicated) return Buffer.from(dedicated, 'utf8');
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!fallback) return null;
  return createHash('sha256').update(`payment-proof-token:${fallback}`).digest();
}

function sign(orderId: string, exp: number, key: Buffer): string {
  return createHmac('sha256', key).update(`${AUDIENCE}:${orderId}:${exp}`).digest('hex');
}

/** A token for this order, or null when no secret is configured. */
export function issuePaymentProofToken(orderId: string, now = Date.now()): string | null {
  const key = secret();
  if (!key || !/^[A-Za-z0-9-]+$/.test(orderId)) return null;
  const exp = Math.floor(now / 1000) + PAYMENT_PROOF_TOKEN_TTL_SECONDS;
  return `${orderId}.${exp}.${sign(orderId, exp, key)}`;
}

/** True only for a well-formed, unexpired token signed for THIS order. */
export function verifyPaymentProofToken(token: unknown, orderId: string, now = Date.now()): boolean {
  if (typeof token !== 'string' || !/^[A-Za-z0-9-]+$/.test(orderId)) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [tokenOrder, expRaw, mac] = parts;
  if (tokenOrder !== orderId) return false;
  const exp = Number(expRaw);
  if (!Number.isInteger(exp) || exp * 1000 < now) return false;
  const key = secret();
  if (!key) return false;
  const expected = Buffer.from(sign(orderId, exp, key), 'hex');
  const given = /^[a-f0-9]+$/.test(mac) ? Buffer.from(mac, 'hex') : Buffer.alloc(0);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
