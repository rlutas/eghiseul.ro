/**
 * Server-side email domain deliverability check (MX / A record lookup).
 *
 * Catches domains that can't receive email at all (typo'd or made-up
 * domains). NOTE: this can NOT detect a wrong local part on a valid domain
 * (mirceamester@gmail.com, E-260713-MG6MF) — that safety net is the Resend
 * bounce webhook. SMTP mailbox probing is deliberately avoided: Gmail/Yahoo
 * don't answer truthfully and it burns sender IP reputation.
 *
 * Fail-open by design: DNS infrastructure errors/timeouts return `null`
 * (unknown) so our hiccups never block a paying customer. Only definitive
 * DNS answers (NXDOMAIN / no records) return false.
 */
import { resolveMx, resolve4 } from 'node:dns/promises';

const TIMEOUT_MS = 2500;

/** Definitive "this name has no such records" answers — not infra errors. */
const NEGATIVE_CODES = new Set(['ENOTFOUND', 'ENODATA']);

type LookupResult = 'has-records' | 'no-records' | 'unknown';

async function lookup(fn: () => Promise<unknown[]>): Promise<LookupResult> {
  const timeout = new Promise<'timeout'>((resolve) =>
    setTimeout(() => resolve('timeout'), TIMEOUT_MS)
  );
  try {
    const res = await Promise.race([fn(), timeout]);
    if (res === 'timeout') return 'unknown';
    return Array.isArray(res) && res.length > 0 ? 'has-records' : 'no-records';
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code ?? '';
    return NEGATIVE_CODES.has(code) ? 'no-records' : 'unknown';
  }
}

/**
 * true  = domain has MX (or fallback A) records, can receive email
 * false = domain definitively has no mail setup (NXDOMAIN / no MX, no A)
 * null  = could not determine (DNS timeout/infra failure) — treat as OK
 */
export async function emailDomainAcceptsMail(email: string): Promise<boolean | null> {
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain.includes('.')) return false;

  const mx = await lookup(() => resolveMx(domain));
  if (mx === 'has-records') return true;

  // No MX (or unknown) — try the RFC 5321 A-record fallback.
  const a = await lookup(() => resolve4(domain));
  if (a === 'has-records') return true;
  if (mx === 'no-records' && a === 'no-records') return false;
  return null;
}
