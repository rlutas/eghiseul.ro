/**
 * POST /api/cron/recovery-emails
 *
 * For each `status='abandoned'` order from the last 7 days with a customer
 * email and no recovery sent yet, generate a single-use coupon and send a
 * re-engagement email. Stamps `recovery_email_sent_at` so the next run
 * doesn't double-send.
 *
 * Coupon:
 *   - code: RECOVERY-<8 chars random>
 *   - discount_type: percentage, discount_value: 10
 *   - max_uses: 1, valid 48h
 *   - system_kind: 'recovery' (admin UI filters by this)
 *   - created_by: NULL (system-generated)
 *
 * Authentication: `CRON_SECRET` in `Authorization: Bearer ...` header.
 * Scheduled: every 15 minutes via vercel.json (chained after auto-abandon).
 *
 * Mirror of cazierjudiciaronline.com `/api/cron/abandonment` step 2 — same
 * 10% / 48h / single-use shape so customers who got recovery emails on the
 * sister platform see consistent behavior here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import {
  buildRecoverySubject,
  buildRecoveryHtml,
  buildRecoveryText,
  type RecoveryEmailInput,
} from '@/lib/email/templates/abandoned-recovery';
import { generateRecoveryCouponCode } from '@/lib/coupons/recovery-code';

// Window: orders abandoned between 30 min (allow auto-abandon cron to flip them
// first) and 7 days (older = customer is gone, recovery effort wasted).
const MIN_AGE_MS = 30 * 60 * 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const DISCOUNT_PERCENT = 10;
const COUPON_VALIDITY_HOURS = 48;

function buildResumeUrl(orderId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
  return `${base}/comanda/checkout/${orderId}`;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = Date.now();
  const minIso = new Date(now - MAX_AGE_MS).toISOString();
  const maxIso = new Date(now - MIN_AGE_MS).toISOString();

  // 1. Find candidates — abandoned, has email, hasn't been mailed yet.
  // The `recovery_email_sent_at` column was added in migration 041; the
  // generated Supabase types lag behind so we cast through `unknown` to
  // pass type-check without regenerating types this session.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersTable = supabase.from('orders') as any;
  const { data: candidates, error: fetchError } = await ordersTable
    .select(
      'id, order_number, friendly_order_id, total_price, customer_data, services(name)'
    )
    .eq('status', 'abandoned')
    .is('recovery_email_sent_at', null)
    .gte('created_at', minIso)
    .lte('created_at', maxIso)
    .limit(100); // throttle so a single run doesn't burst Resend

  if (fetchError) {
    console.error('[recovery-emails] fetch failed:', fetchError);
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      success: true,
      data: { sentCount: 0, skippedCount: 0, processedAt: new Date().toISOString() },
    });
  }

  const results: Array<{ orderId: string; status: 'sent' | 'skipped' | 'error'; reason?: string }> = [];

  for (const order of candidates) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = (order.customer_data ?? {}) as any;
    const email = (cd.contact?.email ?? '').toString().trim();
    if (!email) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'no email' });
      continue;
    }
    const firstName = cd.personal?.firstName ?? cd.contact?.firstName ?? null;
    const totalRon = Number(order.total_price ?? 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceName = ((order as any).services?.name ?? 'documentul') as string;

    // 2. Allocate coupon. Retry once if collision (extremely rare).
    let couponCode = generateRecoveryCouponCode();
    const validUntilIso = new Date(now + COUPON_VALIDITY_HOURS * 3600 * 1000).toISOString();
    let couponError: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      // The `coupons` table isn't in the generated Supabase types so we have
      // to cast the client itself to escape the schema literal type check.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const couponsTable = (supabase as any).from('coupons');
      const couponRow: Record<string, unknown> = {
        code: couponCode,
        description: `Recovery automat pentru comanda ${order.friendly_order_id ?? order.order_number}`,
        discount_type: 'percentage',
        discount_value: DISCOUNT_PERCENT,
        max_uses: 1,
        valid_from: new Date(now).toISOString(),
        valid_until: validUntilIso,
        is_active: true,
        system_kind: 'recovery',
      };
      const { error } = await couponsTable.insert(couponRow);
      if (!error) {
        couponError = null;
        break;
      }
      couponError = error.message;
      // 23505 = unique_violation
      if (!String(error.code ?? '').startsWith('23505')) break;
      couponCode = generateRecoveryCouponCode();
    }
    if (couponError) {
      results.push({ orderId: order.id, status: 'error', reason: `coupon: ${couponError}` });
      continue;
    }

    // 3. Send the email.
    const payload: RecoveryEmailInput = {
      customerFirstName: firstName,
      serviceName,
      totalRon,
      couponCode,
      discountPercent: DISCOUNT_PERCENT,
      resumeUrl: buildResumeUrl(order.id),
      orderNumber: order.friendly_order_id ?? order.order_number ?? '',
    };
    try {
      const sendRes = await sendEmail({
        to: email,
        subject: buildRecoverySubject(payload),
        html: buildRecoveryHtml(payload),
        text: buildRecoveryText(payload),
        idempotencyKey: `recovery-${order.id}`,
      });
      if (sendRes.skipped) {
        results.push({ orderId: order.id, status: 'skipped', reason: sendRes.reason });
        // Don't flag recovery_email_sent_at yet — we want a retry once
        // RESEND_API_KEY is configured. The coupon is created either way.
        continue;
      }
    } catch (err) {
      results.push({
        orderId: order.id,
        status: 'error',
        reason: err instanceof Error ? err.message : 'send failed',
      });
      continue;
    }

    // 4. Stamp the order + audit log. Same type cast as the SELECT above
    // because `recovery_email_sent_at` isn't in the generated types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('orders') as any)
      .update({ recovery_email_sent_at: new Date().toISOString() })
      .eq('id', order.id);
    await supabase.from('order_history').insert({
      order_id: order.id,
      event_type: 'recovery_email_sent' as const,
      changed_by: 'system-cron',
      new_value: { coupon_code: couponCode, discount_percent: DISCOUNT_PERCENT },
      notes: `Email recovery trimis cu cupon ${couponCode} (-${DISCOUNT_PERCENT}%, 48h)`,
    });

    results.push({ orderId: order.id, status: 'sent' });
  }

  const summary = {
    sentCount: results.filter((r) => r.status === 'sent').length,
    skippedCount: results.filter((r) => r.status === 'skipped').length,
    errorCount: results.filter((r) => r.status === 'error').length,
    processedAt: new Date().toISOString(),
    results,
  };
  return NextResponse.json({ success: true, data: summary });
}
