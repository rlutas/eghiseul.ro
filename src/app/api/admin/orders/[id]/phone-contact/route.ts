/**
 * POST /api/admin/orders/[id]/phone-contact
 *
 * Marchează o comandă abandonată/draft ca "sunată de echipă". Bifa e
 * suprascrisă la fiecare apel (fără istoric de încercări — decizie
 * 2026-09-14): `phone_contacted_at`/`_by`/`_notes` țin doar ultimul apel.
 * Log complet rămâne în `order_history` (`event_type='phone_contact_logged'`)
 * pentru audit, chiar dacă UI-ul arată doar ultima stare.
 *
 * Opțional (idee Raul, 14.09): dacă la telefon s-a oferit o reducere, ruta
 * creează cuponul (`TEL-XXXXXXXX`, unică folosință, `system_kind='phone_recovery'`)
 * sau validează unul existent, și trimite clientului un email de follow-up
 * („ai vorbit cu <agent>, ai <x>% reducere, reia comanda din link") cu
 * `?coupon=` în link — se aplică automat la aterizare.
 *
 * Authentication: requires `orders.manage` permission.
 * Body: `{ notes?, discountPercent?: 1–50, couponCode?, sendEmail?: boolean, couponValidDays?: 1–30 }`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import { renderPhoneFollowupEmail } from '@/lib/email/templates/phone-followup';
import { generateCouponCode } from '@/lib/coupons/recovery-code';
import { buildResumeUrl } from '@/lib/orders/resume-url';
import { TEST_EMAILS, isUndeliverable } from '@/lib/email/deliverability';

const MAX_NOTES_LENGTH = 2000;
const DEFAULT_COUPON_VALID_DAYS = 7;

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface Body {
  notes?: string;
  discountPercent?: number;
  couponCode?: string;
  sendEmail?: boolean;
  couponValidDays?: number;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  let body: Body = {};
  try {
    body = await request.json();
  } catch {
    // body optional — bifă fără notă e validă
  }

  const rawNotes = typeof body.notes === 'string' ? body.notes : '';
  const notes = rawNotes.trim().slice(0, MAX_NOTES_LENGTH) || null;
  const discountPercent = typeof body.discountPercent === 'number' && Number.isFinite(body.discountPercent) ? Math.round(body.discountPercent) : null;
  const existingCode = typeof body.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : '';
  const wantsCoupon = !!discountPercent || !!existingCode;
  const shouldEmail = body.sendEmail !== false && wantsCoupon;
  const validDays = Math.min(30, Math.max(1, Math.round(Number(body.couponValidDays) || DEFAULT_COUPON_VALID_DAYS)));

  if (discountPercent !== null && (discountPercent < 1 || discountPercent > 50)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID', message: 'Reducerea trebuie să fie între 1% și 50%' } }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: profile } = await admin.from('profiles').select('email, first_name').eq('id', user.id).single();
  const changedBy = profile?.email ?? user.email ?? 'admin';
  const agentName = (profile?.first_name ?? '').trim() || 'echipa';
  const now = new Date();

  const { data: order, error: updateError } = await admin
    .from('orders')
    .update({
      phone_contacted_at: now.toISOString(),
      phone_contacted_by: changedBy,
      phone_contact_notes: notes,
    })
    .eq('id', id)
    .select('id, friendly_order_id, order_number, status, total_price, customer_data, services(name, slug)')
    .single();

  if (updateError) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: updateError.message } },
      { status: 500 }
    );
  }

  // ── Cupon (opțional) ─────────────────────────────────────────────────────
  let coupon: { code: string; discountLabel: string; validUntil: Date } | null = null;
  let couponWarning: string | null = null;

  if (existingCode) {
    const { data: c } = await admin
      .from('coupons')
      .select('code, discount_type, discount_value, valid_until, is_active')
      .eq('code', existingCode)
      .maybeSingle();
    if (!c || !c.is_active) {
      return NextResponse.json({ success: false, error: { code: 'COUPON_NOT_FOUND', message: `Cuponul ${existingCode} nu există sau e inactiv` } }, { status: 400 });
    }
    coupon = {
      code: c.code,
      discountLabel: c.discount_type === 'percentage' ? `${Number(c.discount_value)}%` : `${Number(c.discount_value)} RON`,
      validUntil: c.valid_until ? new Date(c.valid_until) : new Date(now.getTime() + validDays * 86_400_000),
    };
  } else if (discountPercent) {
    const validUntil = new Date(now.getTime() + validDays * 86_400_000);
    let code = generateCouponCode('TEL-');
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { error } = await admin.from('coupons').insert({
        code,
        description: `Cupon telefonic — comanda ${order.friendly_order_id ?? order.order_number ?? id} (${agentName})`,
        discount_type: 'percentage',
        discount_value: discountPercent,
        max_uses: 1,
        valid_from: now.toISOString(),
        valid_until: validUntil.toISOString(),
        is_active: true,
        created_by: user.id,
        system_kind: 'phone_recovery',
      });
      if (!error) {
        lastError = null;
        break;
      }
      lastError = error.message;
      if (!String(error.code ?? '').startsWith('23505')) break;
      code = generateCouponCode('TEL-');
    }
    if (lastError) {
      return NextResponse.json({ success: false, error: { code: 'COUPON_FAILED', message: lastError } }, { status: 500 });
    }
    coupon = { code, discountLabel: `${discountPercent}%`, validUntil };
  }

  // ── Email de follow-up (opțional) ────────────────────────────────────────
  let emailStatus: 'sent' | 'skipped' | 'error' | null = null;
  let resumeUrl: string | null = null;
  if (coupon && shouldEmail) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = (order.customer_data ?? {}) as any;
    const email = String(cd.contact?.email ?? '').trim();
    const serviceSlug = (order.services?.slug ?? null) as string | null;
    resumeUrl = buildResumeUrl({
      id: order.id,
      status: order.status,
      friendly_order_id: order.friendly_order_id ?? null,
      serviceSlug,
      email,
      couponCode: coupon.code,
    });
    if (!email || TEST_EMAILS.has(email.toLowerCase()) || isUndeliverable(email)) {
      emailStatus = 'skipped';
      couponWarning = 'Comanda nu are un email valid — cuponul există, dar trimite-i codul pe alt canal.';
    } else {
      try {
        const mail = renderPhoneFollowupEmail({
          customerFirstName: cd.personal?.firstName ?? cd.billing?.firstName ?? cd.contact?.firstName ?? null,
          agentName,
          serviceName: (order.services?.name ?? 'documentul') as string,
          orderNumber: order.friendly_order_id ?? order.order_number ?? id,
          totalRon: Number(order.total_price ?? 0),
          couponCode: coupon.code,
          discountLabel: coupon.discountLabel,
          couponValidUntil: coupon.validUntil,
          resumeUrl,
        });
        const res = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
        emailStatus = res.skipped ? 'skipped' : 'sent';
        if (res.skipped) couponWarning = `Email netrimis: ${res.reason}`;
      } catch (err) {
        emailStatus = 'error';
        couponWarning = `Email netrimis: ${err instanceof Error ? err.message : 'send failed'}`;
        console.error('[phone-contact] follow-up email failed:', err);
      }
    }
  }

  const historyNotes = [
    notes ? `Contactat telefonic: ${notes}` : 'Contactat telefonic',
    coupon ? `Cupon ${coupon.code} (${coupon.discountLabel})` : null,
    emailStatus === 'sent' ? 'email de follow-up trimis' : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const { error: historyError } = await admin.from('order_history').insert({
    order_id: id,
    event_type: 'phone_contact_logged',
    changed_by: changedBy,
    new_value: coupon ? { coupon_code: coupon.code, discount: coupon.discountLabel, email_status: emailStatus } : null,
    notes: historyNotes,
  });
  if (historyError) {
    console.error('[phone-contact] order_history insert failed:', historyError);
  }

  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      friendly_order_id: order.friendly_order_id,
      coupon: coupon ? { code: coupon.code, discountLabel: coupon.discountLabel, validUntil: coupon.validUntil.toISOString() } : null,
      emailStatus,
      resumeUrl,
      warning: couponWarning,
    },
  });
}
