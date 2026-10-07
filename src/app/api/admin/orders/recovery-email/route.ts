/**
 * POST /api/admin/orders/recovery-email
 *
 * Email de recuperare trimis MANUAL de echipă din `/admin/recuperare-telefonica`,
 * pentru unul sau mai mulți clienți bifați (cerere echipă 07.10.2026: sunt
 * prea mulți ca să-i sune pe toți). Fără cupon. Emailul e semnat cu prenumele
 * colegei și spune unde s-a oprit clientul; răspunsurile vin pe contact@.
 *
 * Gărzi, pe fiecare comandă:
 *   - doar `draft` / `abandoned`, neplătită;
 *   - email valid (nu test, nu inventat, nu domeniu mort);
 *   - adresa nu e suprimată în `contacts` (email întors / plângere de spam);
 *   - nu i s-a mai scris manual în ultimele 24 h (de nicio colegă).
 *
 * Authentication: `orders.manage`.
 * Body: `{ orderIds: string[] (1–50), message?: string }`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import { renderManualRecoveryEmail } from '@/lib/email/templates/manual-recovery';
import { buildResumeUrl } from '@/lib/orders/resume-url';
import { TEST_EMAILS, isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';
import { withUtm } from '@/lib/email/utm';
import { brandForOrder } from '@/lib/brand/for-order';

const MAX_ORDERS = 50;
const MAX_MESSAGE_LENGTH = 1000;
export const MANUAL_EMAIL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

type Outcome = { orderId: string; status: 'sent' | 'skipped' | 'error'; reason?: string };

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  let body: { orderIds?: unknown; message?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // validat mai jos
  }
  const orderIds = Array.isArray(body.orderIds)
    ? [...new Set(body.orderIds.filter((x): x is string => typeof x === 'string' && x.length > 0))]
    : [];
  if (orderIds.length === 0) {
    return NextResponse.json({ success: false, error: 'Alege cel puțin o comandă.' }, { status: 400 });
  }
  if (orderIds.length > MAX_ORDERS) {
    return NextResponse.json({ success: false, error: `Cel mult ${MAX_ORDERS} comenzi o dată.` }, { status: 400 });
  }
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) || null : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('email, first_name').eq('id', user.id).single();
  const changedBy: string = profile?.email ?? user.email ?? 'admin';
  const agentName: string = (profile?.first_name ?? '').trim() || 'echipa';

  const { data: orders, error: fetchError } = await admin
    .from('orders')
    .select(
      'id, order_number, friendly_order_id, status, payment_status, total_price, customer_data, current_step, platform, manual_recovery_email_at, services(name, slug)'
    )
    .in('id', orderIds);
  if (fetchError) {
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  // Adresele suprimate (email întors / spam) — o singură interogare.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emails = (orders ?? []).map((o: any) => String(o.customer_data?.contact?.email ?? '').trim().toLowerCase()).filter(Boolean);
  const suppressed = new Set<string>();
  if (emails.length > 0) {
    const { data: sup } = await admin
      .from('contacts')
      .select('email')
      .in('email', emails)
      .eq('marketing_status', 'suppressed');
    for (const s of sup ?? []) suppressed.add(String(s.email).toLowerCase());
  }

  const now = Date.now();
  const results: Outcome[] = [];
  const found = new Set<string>();

  for (const order of orders ?? []) {
    found.add(order.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cd = (order.customer_data ?? {}) as any;
    const email = String(cd.contact?.email ?? '').trim();
    const lower = email.toLowerCase();

    if (!['draft', 'abandoned'].includes(order.status) || order.payment_status === 'paid') {
      results.push({ orderId: order.id, status: 'skipped', reason: 'comanda nu mai e abandonată' });
      continue;
    }
    if (!email || TEST_EMAILS.has(lower) || isUndeliverable(email) || isSuspiciousEmail(email)) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'email lipsă sau invalid' });
      continue;
    }
    if (suppressed.has(lower)) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'adresa a respins emailurile' });
      continue;
    }
    const last = Date.parse(order.manual_recovery_email_at ?? '') || 0;
    if (now - last < MANUAL_EMAIL_COOLDOWN_MS) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'i s-a scris manual în ultimele 24 h' });
      continue;
    }

    const brand = brandForOrder(order);
    const orderNumber = order.friendly_order_id ?? order.order_number ?? order.id;
    const resumeUrl = withUtm(
      buildResumeUrl({
        id: order.id,
        status: order.status,
        friendly_order_id: order.friendly_order_id ?? null,
        serviceSlug: (order.services?.slug ?? null) as string | null,
        email,
        platform: order.platform ?? null,
      }),
      'recovery',
      'recovery-manual'
    );
    const mail = renderManualRecoveryEmail({
      brand,
      customerFirstName: cd.personal?.firstName ?? cd.billing?.firstName ?? cd.contact?.firstName ?? null,
      agentName,
      serviceName: (order.services?.name ?? 'documentul') as string,
      orderNumber,
      totalRon: Number(order.total_price ?? 0),
      currentStep: order.current_step ?? null,
      message,
      resumeUrl,
    });

    try {
      const res = await sendEmail({
        to: email,
        from: brand.emailFrom,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `manual-recovery-${order.id}-${new Date(now).toISOString().slice(0, 10)}`,
      });
      if (res.skipped) {
        results.push({ orderId: order.id, status: 'error', reason: res.reason ?? 'email netrimis' });
        continue;
      }
    } catch (err) {
      console.error('[recovery-email] send failed:', err);
      results.push({ orderId: order.id, status: 'error', reason: err instanceof Error ? err.message : 'email netrimis' });
      continue;
    }

    const sentAt = new Date().toISOString();
    // Un `from()` nou per scriere (builder-ul postgrest-js nu se refolosește).
    await admin
      .from('orders')
      .update({ manual_recovery_email_at: sentAt, manual_recovery_email_by: changedBy })
      .eq('id', order.id);
    const { error: historyError } = await admin.from('order_history').insert({
      order_id: order.id,
      event_type: 'recovery_email_sent',
      changed_by: changedBy,
      new_value: { manual: true, agent: agentName, ...(message ? { message } : {}) },
      notes: `Email de recuperare trimis manual de ${agentName} (fără cupon)`,
    });
    if (historyError) console.error('[recovery-email] order_history insert failed:', historyError);

    results.push({ orderId: order.id, status: 'sent' });
  }

  for (const id of orderIds) {
    if (!found.has(id)) results.push({ orderId: id, status: 'skipped', reason: 'comanda nu există' });
  }

  return NextResponse.json({
    success: true,
    data: {
      sent: results.filter((r) => r.status === 'sent').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
      results,
    },
  });
}
