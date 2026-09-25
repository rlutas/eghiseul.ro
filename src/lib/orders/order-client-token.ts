/**
 * Order-scoped bearer for the CLIENT side of an order, without a session:
 * reading/writing the order's messages and attaching files to them.
 *
 * Issued by the public status API right after it verified order code + email
 * (the same proof the status page itself runs on), and by the account order
 * page for the order's owner. Separate audience from the payment-proof token,
 * so neither token opens the other's routes.
 *
 * Format: `<orderId>.<exp>.<hex hmac>` — HMAC-SHA256 over
 * `order-client:<orderId>:<exp>`, same key derivation as payment-proof-token.
 */

import { createHmac, createHash, timingSafeEqual } from 'crypto';

/** Long enough for a client to read a message, go find an act and reply. */
export const ORDER_CLIENT_TOKEN_TTL_SECONDS = 24 * 60 * 60;
const AUDIENCE = 'order-client';

function secret(): Buffer | null {
  const dedicated = process.env.PAYMENT_PROOF_TOKEN_SECRET;
  if (dedicated) return createHash('sha256').update(`${AUDIENCE}:${dedicated}`).digest();
  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!fallback) return null;
  return createHash('sha256').update(`order-client-token:${fallback}`).digest();
}

function sign(orderId: string, exp: number, key: Buffer): string {
  return createHmac('sha256', key).update(`${AUDIENCE}:${orderId}:${exp}`).digest('hex');
}

/** A token for this order, or null when no secret is configured. */
export function issueOrderClientToken(orderId: string, now = Date.now()): string | null {
  const key = secret();
  if (!key || !/^[A-Za-z0-9-]+$/.test(orderId)) return null;
  const exp = Math.floor(now / 1000) + ORDER_CLIENT_TOKEN_TTL_SECONDS;
  return `${orderId}.${exp}.${sign(orderId, exp, key)}`;
}

/** True only for a well-formed, unexpired token signed for THIS order. */
export function verifyOrderClientToken(token: unknown, orderId: string, now = Date.now()): boolean {
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
