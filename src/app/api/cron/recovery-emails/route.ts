/**
 * POST /api/cron/recovery-emails
 *
 * Two candidate pools, same treatment (coupon + re-engagement email, stamp
 * `recovery_email_sent_at` so the next run doesn't double-send):
 *
 *   1. `status='abandoned'` — submitted but never paid (flipped by the
 *      auto-abandon cron). Resume link goes to the checkout page.
 *   2. `status='draft'` — abandoned mid-wizard, before submit. Only drafts
 *      where the customer got PAST the contact step (some real field typed in
 *      personal/property/vehicle/etc.) qualify — contact-only drafts are
 *      window-shoppers and mailing them burns sender reputation for nothing.
 *      Resume link goes back INTO the wizard (`/comanda/<slug>?order=&email=`),
 *      the same cross-device resume the wizard already supports.
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

// Drafts are only "abandoned" once the customer has been idle a while — the
// created_at window above still applies, but we also require no wizard
// activity (updated_at) for this long. 2h clears lunch breaks and slow KYC
// uploads without mailing someone who's still mid-session.
const DRAFT_MIN_IDLE_MS = 2 * 60 * 60 * 1000;

// Internal test traffic — never send recovery to these.
const TEST_EMAILS = new Set(['serviciiseonethut@gmail.com']);

const DISCOUNT_PERCENT = 10;
const COUPON_VALIDITY_HOURS = 48;

function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
}

// Abandoned (post-submit) orders resume at checkout; drafts resume inside the
// wizard via the ?order=&email= cross-device restore the provider already
// supports (guest drafts require the matching email — anti-IDOR).
function buildResumeUrl(order: {
  id: string;
  status: string;
  friendly_order_id: string | null;
  serviceSlug: string | null;
  email: string;
  couponCode: string;
}): string {
  // ?coupon= is auto-applied on landing (checkout page + wizard review step),
  // so "cuponul se aplică automat" in the email copy is actually true.
  if (order.status === 'draft' && order.serviceSlug && order.friendly_order_id) {
    const qs = new URLSearchParams({
      order: order.friendly_order_id,
      email: order.email,
      coupon: order.couponCode,
    });
    return `${appBase()}/comanda/${order.serviceSlug}?${qs.toString()}`;
  }
  return `${appBase()}/comanda/checkout/${order.id}?coupon=${encodeURIComponent(order.couponCode)}`;
}

// True when the customer typed something real beyond the contact step.
// `contact` is step 1 (always present) and `billing` is auto-initialized with
// defaults, so neither counts. Any other section counts if it holds at least
// one non-empty string, number, `true`, or non-empty array — empty-string
// scaffolding like {"plateNumber":""} does not qualify.
function hasProgressBeyondContact(customerData: unknown): boolean {
  if (!customerData || typeof customerData !== 'object') return false;
  const sections = customerData as Record<string, unknown>;
  const hasMeaningfulValue = (value: unknown): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (value === true) return true;
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return Object.values(value).some(hasMeaningfulValue);
    }
    return false;
  };
  return Object.entries(sections).some(
    ([key, value]) =>
      key !== 'contact' &&
      key !== 'billing' &&
      value !== null &&
      typeof value === 'object' &&
      hasMeaningfulValue(value)
  );
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
      'id, order_number, friendly_order_id, status, total_price, customer_data, updated_at, services(name, slug)'
    )
    .in('status', ['abandoned', 'draft'])
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
    if (TEST_EMAILS.has(email.toLowerCase())) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'test email' });
      continue;
    }
    if (order.status === 'draft') {
      const lastActivity = Date.parse(order.updated_at ?? '') || 0;
      if (now - lastActivity < DRAFT_MIN_IDLE_MS) {
        results.push({ orderId: order.id, status: 'skipped', reason: 'draft still active' });
        continue;
      }
      if (!hasProgressBeyondContact(order.customer_data)) {
        results.push({ orderId: order.id, status: 'skipped', reason: 'contact-only draft' });
        continue;
      }
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
      resumeUrl: buildResumeUrl({
        id: order.id,
        status: order.status,
        friendly_order_id: order.friendly_order_id ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serviceSlug: (((order as any).services?.slug ?? null) as string | null),
        email,
        couponCode,
      }),
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

// Vercel Cron invokes cron paths with GET (same auth header) — without this
// passthrough the schedule never fires (the route only exported POST, so
// every 15-min tick got a 405 and no recovery email was ever sent by cron).
export async function GET(request: NextRequest) {
  return POST(request);
}
