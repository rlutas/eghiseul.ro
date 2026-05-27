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
    from: input.from ?? FROM_DEFAULT,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
    reply_to: input.replyTo ?? REPLY_TO_DEFAULT,
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
    throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { id?: string };
  return { id: data.id ?? null, skipped: false };
}
