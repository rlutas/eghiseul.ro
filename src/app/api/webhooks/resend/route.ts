/**
 * Resend webhook — bounce / complaint safety net.
 *
 * Context: E-260713-MG6MF (2026-07-13) — the client typo'd a valid-looking
 * Gmail address; both order emails hard-bounced silently and nobody knew the
 * document was sitting there ready. Domain-level guards (wizard typo
 * suggestion + submit MX check) can't catch a wrong local part on a valid
 * domain, so this webhook is the last line of defense:
 *
 *   email.bounced / email.complained →
 *     1. mark the client's recent orders (email_bounced_at + reason,
 *        migration 111) — admin order page shows a red banner
 *     2. alert admin (email to contact@) with orders + client phone
 *
 * Setup (one-time, Resend dashboard → Webhooks):
 *   - endpoint: https://eghiseul.ro/api/webhooks/resend
 *   - events:   email.bounced, email.complained
 *   - copy the signing secret (whsec_...) → Vercel env RESEND_WEBHOOK_SECRET
 *
 * Signature: Resend signs with Svix (svix-id / svix-timestamp /
 * svix-signature headers, HMAC-SHA256 over "id.timestamp.body").
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

const ADMIN_ALERT_TO = process.env.ADMIN_ALERT_EMAIL ?? 'contact@eghiseul.ro';

function verifySvixSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  const id = req.headers.get('svix-id');
  const timestamp = req.headers.get('svix-timestamp');
  const signatures = req.headers.get('svix-signature');
  if (!id || !timestamp || !signatures) return false;

  // Reject stale timestamps (>5 min) — replay protection.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(`${id}.${timestamp}.${rawBody}`)
    .digest('base64');

  // Header format: "v1,<base64> v1,<base64> ..."
  return signatures.split(' ').some((part) => {
    const sig = part.split(',')[1];
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

interface ResendWebhookPayload {
  type?: string;
  created_at?: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    bounce?: { type?: string; subType?: string; message?: string };
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!process.env.RESEND_WEBHOOK_SECRET) {
    console.error('[webhooks/resend] RESEND_WEBHOOK_SECRET not set — rejecting');
    return NextResponse.json({ error: 'webhook secret not configured' }, { status: 503 });
  }
  if (!verifySvixSignature(request, rawBody)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const type = payload.type ?? '';
  if (type !== 'email.bounced' && type !== 'email.complained') {
    // Not our concern — ack so Resend doesn't retry.
    return NextResponse.json({ received: true });
  }

  const data = payload.data ?? {};
  const toList = Array.isArray(data.to) ? data.to : data.to ? [data.to] : [];
  const bouncedEmail = (toList[0] ?? '').toLowerCase();
  const subject = data.subject ?? '';
  const bounceInfo = data.bounce?.message || data.bounce?.subType || data.bounce?.type || type;

  console.error('[webhooks/resend] bounce/complaint received', {
    type,
    to: bouncedEmail,
    subject,
    bounceInfo,
  });

  // Find the client's recent orders (last 60 days) and mark them bounced —
  // the admin order page shows a red banner off email_bounced_at.
  let orderInfo = '';
  let clientPhone = '';
  let orderNumber = '';
  if (bouncedEmail) {
    try {
      const admin = createAdminClient();
      const since = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: orders } = await (admin as any)
        .from('orders')
        .select('id, order_number, status, created_at, customer_data')
        .eq('customer_data->contact->>email', bouncedEmail)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5);
      if (orders?.length) {
        orderNumber = orders[0].order_number;
        clientPhone = orders[0].customer_data?.contact?.phone ?? '';
        orderInfo = orders
          .map(
            (o: { order_number: string; status: string; created_at: string }) =>
              `${o.order_number} (${o.status}, ${o.created_at?.slice(0, 10)})`
          )
          .join(', ');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any)
          .from('orders')
          .update({
            email_bounced_at: new Date().toISOString(),
            email_bounce_reason: `${type}: ${bounceInfo}`.slice(0, 500),
          })
          .in('id', orders.map((o: { id: string }) => o.id));
      }
    } catch (err) {
      console.error('[webhooks/resend] order lookup/update failed', err);
    }
  }

  // 1. Admin alert email.
  await sendEmail({
    to: ADMIN_ALERT_TO,
    subject: `⚠️ Email ${type === 'email.complained' ? 'marcat SPAM' : 'BOUNCE'}: ${bouncedEmail}${orderNumber ? ` — ${orderNumber}` : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px">
        <h2 style="color:#b91c1c">Email ne-livrat către client</h2>
        <p><strong>Adresă:</strong> ${bouncedEmail}<br/>
        <strong>Subiect email:</strong> ${subject}<br/>
        <strong>Motiv:</strong> ${bounceInfo}<br/>
        <strong>Comenzi găsite:</strong> ${orderInfo || 'niciuna în ultimele 60 zile'}<br/>
        <strong>Telefon client:</strong> ${clientPhone || 'necunoscut'}</p>
        <p>Clientul NU primește emailurile — probabil adresă greșită.
        Sună-l pentru adresa corectă, actualizeaz-o în admin și retrimite documentele.</p>
        ${orderNumber ? `<p><a href="https://eghiseul.ro/admin/orders?search=${encodeURIComponent(orderNumber)}">Deschide în admin</a></p>` : ''}
      </div>`,
    idempotencyKey: `bounce-alert-${data.email_id ?? bouncedEmail}-${type}`,
  });

  return NextResponse.json({ received: true });
}
