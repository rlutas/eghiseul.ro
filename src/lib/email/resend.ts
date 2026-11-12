/**
 * Minimal Resend client wrapper — uses the public REST API via `fetch` so we
 * don't pull a dependency for one call. When `RESEND_API_KEY` is missing we
 * log + return null (jobs like the abandoned-cart recovery cron still
 * progress in environments where email isn't configured).
 *
 * Resend docs: https://resend.com/docs/api-reference/emails/send-email
 */
import { BRANDS } from '@/lib/brand/brands';

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

/**
 * Reply-To when the caller gave none: the address inside the resolved `from`
 * (contact@documentero.ro for a documentero order), never the eghiseul
 * default on another brand's email. Found 21.09.2026: every brand-aware
 * sender passed `from` but not `replyTo`, so a documentero customer who hit
 * "Reply" wrote to contact@eghiseul.ro.
 */
export function defaultReplyToFor(resolvedFrom: string): string {
  if (resolvedFrom === FROM_DEFAULT) return REPLY_TO_DEFAULT;
  // The brand that sends from this domain decides where replies go: its
  // `contactEmail` is the inbox someone actually reads (for documentero that
  // is the eghiseul inbox — decision 21.09.2026, no separate mailbox yet).
  const domain = domainOf(resolvedFrom);
  const brand = Object.values(BRANDS).find((b) => b.domain === domain);
  if (brand?.contactEmail) return brand.contactEmail;
  const m = resolvedFrom.match(/<([^>]+)>/);
  return (m ? m[1] : resolvedFrom).trim() || REPLY_TO_DEFAULT;
}

/**
 * Fallback sender for a brand whose domain Resend won't accept: the brand's
 * display name on the default (verified) address, e.g.
 * `documentero.ro <contact@eghiseul.ro>`. The customer still sees the brand
 * name; Reply-To stays on the brand (see `defaultReplyToFor`, which callers get
 * from the ORIGINAL from).
 */
export function fallbackFrom(from: string): string {
  const name = from.match(/^\s*([^<]+?)\s*</)?.[1];
  const m = FROM_DEFAULT.match(/<([^>]+)>/);
  const addr = (m ? m[1] : FROM_DEFAULT).trim();
  return name ? `${name} <${addr}>` : FROM_DEFAULT;
}

/**
 * Where a brand email may explain its sender. The shells print this marker in
 * the legal footer; `applySenderNote` turns it into one line — or removes it.
 *
 * Why: a documentero / cazierfiscal / constatator email carries that brand's
 * logo and colors, but when the brand's domain is not verified in Resend it
 * leaves from an @eghiseul.ro address. A brand name on another site's address
 * reads like phishing; one honest line says who is sending (Raul, 12.11.2026).
 * When the email does leave from the brand's own domain, nothing is added.
 */
export const SENDER_NOTE_MARKER = '<!--sender-note-->';

export function applySenderNote(html: string, requestedFrom: string | undefined, actualFrom: string): string {
  if (!html.includes(SENDER_NOTE_MARKER)) return html;
  const requestedDomain = requestedFrom ? domainOf(requestedFrom) : '';
  const actualDomain = domainOf(actualFrom);
  const brand = Object.values(BRANDS).find((b) => b.domain === requestedDomain);
  const viaOtherDomain = !!brand && !!actualDomain && actualDomain !== requestedDomain;
  const note = viaOtherDomain
    ? `<p style="margin:8px 0 0;color:#94a3b8;font-size:11px;line-height:1.6;">Email trimis prin eGhișeul.ro, platforma eDigitalizare SRL care operează și ${brand!.name}. De aceea adresa expeditorului este @${actualDomain}.</p>`
    : '';
  return html.replaceAll(SENDER_NOTE_MARKER, note);
}

/** The `from` Resend will accept: the requested one when its domain is verified, else the brand name on the default address. */
export function resolveFrom(from: string | undefined): string {
  if (!from) return FROM_DEFAULT;
  const domain = domainOf(from);
  if (VERIFIED_DOMAINS.includes(domain)) return from;
  console.warn(`[email/resend] from domain "${domain}" not in RESEND_VERIFIED_DOMAINS — sending from the default address`);
  return fallbackFrom(from);
}

/** Resend's 403 when the `from` domain was removed or never verified in the account. */
function isUnverifiedDomainError(status: number, text: string): boolean {
  return status === 403 && /domain is not verified/i.test(text);
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

  const from = resolveFrom(input.from);
  const body = {
    from,
    to: [input.to],
    subject: input.subject,
    html: applySenderNote(input.html, input.from, from),
    ...(input.text ? { text: input.text } : {}),
    // Reply-To follows the brand the caller asked for, even when the address
    // had to fall back to the default domain.
    reply_to: input.replyTo ?? defaultReplyToFor(input.from && from !== input.from ? input.from : from),
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
    // 11.11.2026: documentero.ro had been removed from the Resend account
    // (plan limit, 10 domains) and every documentero email since 19.10 was
    // lost with this 403. Retry once from the default address, brand name kept.
    const retryFrom = fallbackFrom(from);
    if (isUnverifiedDomainError(res.status, text) && retryFrom !== from) {
      console.error(`[email/resend] DOMAIN NOT VERIFIED in Resend: "${domainOf(from)}" — resent from ${retryFrom}. Add the domain back in Resend.`);
      const retryHeaders = { ...headers };
      if (input.idempotencyKey) retryHeaders['Idempotency-Key'] = `${input.idempotencyKey}:fallback`;
      const retry = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: retryHeaders,
        body: JSON.stringify({ ...body, from: retryFrom, html: applySenderNote(input.html, input.from, retryFrom) }),
      });
      if (!retry.ok) throw new ResendError(retry.status, await retry.text());
      const data = (await retry.json()) as { id?: string };
      return { id: data.id ?? null, skipped: false, reason: 'from-domain-fallback' };
    }
    throw new ResendError(res.status, text);
  }
  const data = (await res.json()) as { id?: string };
  return { id: data.id ?? null, skipped: false };
}
