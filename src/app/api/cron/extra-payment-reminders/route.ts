/**
 * GET/POST /api/cron/extra-payment-reminders — hourly sweep for PENDING
 * extra payments (admin Modifică → Stripe Checkout link, 24h lifetime).
 *
 * For each paid order with a pending extra-payment link:
 *   - link expires within the next 6 hours AND no reminder sent for it →
 *     email the customer a reminder with the SAME (still valid) link.
 *     Dedupe: `pending_extra_reminder_sent_at` column (reset on regenerate)
 *     + Resend Idempotency-Key on the session id as a second net.
 *   - already expired → nothing is emailed automatically (the admin sees the
 *     red "LINK EXPIRAT" alert on the order + the list chip and regenerates
 *     with one click); counted in the response for visibility.
 *
 * Registered in vercel.json (trailing slash — 308 footgun) with GET
 * passthrough (Vercel Cron invokes GET; a 405 means it NEVER runs).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import {
  buildExtraPaymentReminderSubject,
  buildExtraPaymentReminderHtml,
  buildExtraPaymentReminderText,
} from '@/lib/email/templates/extra-payment';

const REMINDER_WINDOW_MS = 6 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error('[extra-payment-reminders] CRON_SECRET not configured');
    return NextResponse.json({ success: false, error: 'Not configured' }, { status: 500 });
  }
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (admin as any)
    .from('orders')
    .select('id, order_number, friendly_order_id, customer_data, pending_extra_payment_amount, pending_extra_payment_url, pending_extra_payment_intent_id, pending_extra_payment_expires_at, pending_extra_reminder_sent_at')
    .not('pending_extra_payment_url', 'is', null)
    .gt('pending_extra_payment_amount', 0)
    .eq('payment_status', 'paid');
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  let remindersSent = 0;
  let expired = 0;
  const errors: string[] = [];

  for (const o of orders ?? []) {
    const expiresAt = o.pending_extra_payment_expires_at
      ? new Date(o.pending_extra_payment_expires_at).getTime()
      : null;
    // Pre-133 links have no recorded expiry — the admin alert shows them as
    // "vechime necunoscută"; no automatic email without a reliable clock.
    if (!expiresAt) continue;

    if (expiresAt <= now) {
      expired++;
      continue;
    }
    if (o.pending_extra_reminder_sent_at) continue;
    if (expiresAt > now + REMINDER_WINDOW_MS) continue;

    const cd = (o.customer_data ?? {}) as {
      contact?: { email?: string; firstName?: string };
      personal?: { firstName?: string };
    };
    const email = cd.contact?.email?.trim();
    if (!email) continue;

    const orderNum = (o.friendly_order_id ?? o.order_number ?? '') as string;
    const hoursLeft = Math.max(1, Math.round((expiresAt - now) / 3_600_000));
    const input = {
      orderNumber: orderNum,
      amountRon: Number(o.pending_extra_payment_amount),
      customerFirstName: cd.personal?.firstName ?? cd.contact?.firstName ?? null,
      changesDescription: `Servicii suplimentare comanda ${orderNum}`,
      paymentUrl: o.pending_extra_payment_url as string,
      hoursLeft,
    };

    try {
      const result = await sendEmail({
        to: email,
        subject: buildExtraPaymentReminderSubject(input),
        html: buildExtraPaymentReminderHtml(input),
        text: buildExtraPaymentReminderText(input),
        idempotencyKey: `extra-reminder-${o.pending_extra_payment_intent_id ?? o.id}`,
      });
      if (result.skipped) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('orders')
        .update({ pending_extra_reminder_sent_at: nowIso })
        .eq('id', o.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('order_history').insert({
        order_id: o.id,
        event_type: 'extra_payment_reminder_sent',
        changed_by: 'system',
        notes: `Reminder plată extra trimis (link expiră în ~${hoursLeft}h) · ${email}`,
      });
      remindersSent++;
    } catch (err) {
      // Column stays null → retried next hour; Resend idempotency prevents
      // double emails if the send actually went through.
      errors.push(`${orderNum}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    success: true,
    data: { scanned: orders?.length ?? 0, remindersSent, expiredAwaitingAdmin: expired, errors },
  });
}

// Vercel Cron invokes with GET — without this passthrough the schedule 405s
// and NEVER runs (real incident 2026-07-12).
export async function GET(request: NextRequest) {
  return POST(request);
}
