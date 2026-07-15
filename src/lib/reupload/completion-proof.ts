import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Stateless proof for the completion flow's email-confirm gate.
 *
 * On /verify with the correct order email, the server hands the client
 * `proof = HMAC(secret, token|emailLower)`. Subsequent upload/signature calls
 * send `x-confirm-email` + `x-confirm-proof`; the server recomputes and
 * compares constant-time. Someone who intercepts the link alone cannot derive
 * the proof without knowing the email (anti-forwarding, per the draft-hijack
 * lesson E-260710-2S5EH).
 *
 * Secret: derived from SUPABASE_SERVICE_ROLE_KEY (always present server-side,
 * never shipped to the client) — no new env var needed.
 */
function secret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
  return key;
}

export function computeCompletionProof(token: string, email: string): string {
  return createHmac('sha256', secret())
    .update(`${token}|${email.trim().toLowerCase()}`)
    .digest('base64url');
}

export function verifyCompletionProof(token: string, email: string, proof: string): boolean {
  try {
    const expected = Buffer.from(computeCompletionProof(token, email));
    const given = Buffer.from(proof);
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

/** Extracts + verifies the confirm headers for a completion-flow request. */
export function checkProofHeaders(
  headers: Headers,
  token: string,
  orderEmail: string | null | undefined
): boolean {
  const email = headers.get('x-confirm-email') || '';
  const proof = headers.get('x-confirm-proof') || '';
  if (!email || !proof || !orderEmail) return false;
  if (email.trim().toLowerCase() !== String(orderEmail).trim().toLowerCase()) return false;
  return verifyCompletionProof(token, email, proof);
}
