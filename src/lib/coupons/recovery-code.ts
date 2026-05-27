/**
 * Recovery coupon code generator — used by `/api/cron/recovery-emails` to
 * mint single-use 48h coupons for abandoned-cart customers. Extracted to
 * its own module so the alphabet + length contract is unit-testable and
 * can be reused by future flows (manual recovery from admin UI, etc.).
 *
 * Conventions:
 *   - Prefix: `RECOVERY-`
 *   - Body: 8 chars from a curated alphabet (no `0`/`O`, no `1`/`I`/`L`,
 *     no lowercase) so customers who type the code from a phone screen
 *     don't hit confusion-prone glyphs.
 *   - Approx. uniqueness: 31^8 ≈ 8.5×10^11 combos — at ~10k coupons/year
 *     collision probability is ~10^-7. The cron retries on UNIQUE
 *     violation anyway, so the retry path is the safety net.
 */

const PREFIX = 'RECOVERY-';
const BODY_LENGTH = 8;
/** Uppercase letters + digits, with 0/O/1/I/L removed to avoid look-alikes
 *  when customers transcribe the code from email to checkout. */
export const RECOVERY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateRecoveryCouponCode(rng: () => number = Math.random): string {
  let body = '';
  for (let i = 0; i < BODY_LENGTH; i++) {
    body += RECOVERY_ALPHABET[Math.floor(rng() * RECOVERY_ALPHABET.length)];
  }
  return PREFIX + body;
}

/** Matches a recovery coupon emitted by this generator. Used by audit /
 *  reporting to filter recovery codes out of analytic counts of admin
 *  coupons (cazierjudiciaronline.com pattern). */
export function isRecoveryCouponCode(code: string): boolean {
  if (!code || !code.startsWith(PREFIX)) return false;
  const body = code.slice(PREFIX.length);
  if (body.length !== BODY_LENGTH) return false;
  for (const ch of body) {
    if (!RECOVERY_ALPHABET.includes(ch)) return false;
  }
  return true;
}
