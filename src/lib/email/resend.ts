/**
 * Minimal Resend client wrapper — uses the public REST API via `fetch` so we
 * don't pull a dependency for one call. When `RESEND_API_KEY` is missing we
 * log + return null (jobs like the abandoned-cart recovery cron still
 * progress in environments where email isn't configured).
 *
 * Resend docs: https://resend.com/docs/api-reference/emails/send-email
 */

const FROM_DEFAULT = process.env.RESEND_FROM ?? 'eGhișeul.ro <contact@eghiseul.ro>';
const REPLY_TO_DEFAULT = process.env.RESEND_REPLY_TO ?? 'contact@eghiseul.ro';

/**
 * Domains Resend has verified for this account (SPF + DKIM). A `from` on any
 * other domain is rejected by Resend with 403 and the email is LOST — which
 * is exactly what would happen to documentero.ro order emails until its
 * domain is verified (19.09.2026: no MX/TXT on the domain yet). Until then
 * the brand's `from` falls back to the default sender, with a log line, so
 * the customer still gets the email. documentero.ro verified 20.09.2026
 * (DKIM + SPF on send.documentero.ro), so both are in the default; a third
 * brand goes through `RESEND_VERIFIED_DOMAINS` once its DNS is in.
 */
const VERIFIED_DOMAINS = (process.env.RESEND_VERIFIED_DOMAINS ?? 'eghiseul.ro,documentero.ro')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

function domainOf(from: string): string {
  const m = from.match(/<([^>]+)>/);
  const addr = (m ? m[1] : from).trim();
  return addr.split('@')[1]?.toLowerCase() ?? '';
}

/** The `from` Resend will accept: the requested one when its domain is verified, else the default. */
export function resolveFrom(from: string | undefined): string {
  if (!from) return FROM_DEFAULT;
  const domain = domainOf(from);
  if (VERIFIED_DOMAINS.includes(domain)) return from;
  console.warn(`[email/resend] from domain "${domain}" not in RESEND_VERIFIED_DOMAINS — sending as default sender`);
  return FROM_DEFAULT;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative. Resend renders it for clients that block HTML. */
  text?: string;
  /** Overrides the env default. Use sparingly. */
  from?: string;
  /** Reply-To override. */
  replyTo?: string;
  /** Idempotency key — Resend dedupes within ~24h on the same key. */
  idempotencyKey?: string;
  /**
   * Extra message headers (e.g. `List-Unsubscribe` for bulk/marketing mail —
   * Gmail/Yahoo bulk-sender rules want one-click unsubscribe in the header,
   * not only a link in the body).
   */
  headers?: Record<string, string>;
}

/** Thrown when Resend rejects the request; `status` lets callers tell a bad
 *  recipient (4xx, permanent) from rate limit / outage (429/5xx, retry). */
export class ResendError extends Error {
  constructor(
    public readonly status: number,
    body: string
  ) {
    super(`Resend ${status}: ${body.slice(0, 200)}`);
    this.name = 'ResendError';
  }
}

export interface SendEmailResult {
  id: string | null;
  skipped: boolean;
  reason?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email/resend] RESEND_API_KEY not configured — skipping send', {
      to: input.to,
      subject: input.subject,
    });
    return { id: null, skipped: true, reason: 'RESEND_API_KEY not set' };
  }

  const body = {
    from: resolveFrom(input.from),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
    reply_to: input.replyTo ?? REPLY_TO_DEFAULT,
    ...(input.headers ? { headers: input.headers } : {}),
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (input.idempotencyKey) {
    headers['Idempotency-Key'] = input.idempotencyKey;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ResendError(res.status, text);
  }
  const data = (await res.json()) as { id?: string };
  return { id: data.id ?? null, skipped: false };
}
