/**
 * Shared guards for any bulk/automated sender (recovery-emails cron,
 * warmup-campaign cron): never mail internal test traffic or addresses that
 * are structurally undeliverable. A failed send on a bad domain would leave
 * the "sent" stamp unset (by design, for retry), so skipping outright avoids
 * burning a fresh coupon/slot every run on the same dead address.
 */

// Internal test traffic — never send automated campaign email to these.
export const TEST_EMAILS = new Set(['serviciiseonethut@gmail.com']);

// Reserved/undeliverable domains (RFC 2606 + local dev).
const UNDELIVERABLE_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'localhost',
]);

export function isUndeliverable(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 1 || at === email.length - 1) return true; // no local part or no domain
  const domain = email.slice(at + 1).toLowerCase();
  return (
    UNDELIVERABLE_DOMAINS.has(domain) ||
    domain.endsWith('.test') ||
    domain.endsWith('.invalid') ||
    domain.endsWith('.local') ||
    !domain.includes('.')
  );
}
