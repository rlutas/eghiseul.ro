/**
 * POST /api/cron/recovery-emails — la 15 minute (după auto-abandon)
 *
 * Secvență de recovery în 3 pași pentru coșurile abandonate (rescrisă
 * 2026-09-14; emailul unic cu cupon avea 1,4% redemption — cercetare în
 * docs/marketing/email-marketing-plan-2026-09.md §4.1):
 *
 *   pasul 1  la ≥30 min de la creare (draft: ≥2 h idle) — „reia de unde ai
 *            rămas", FĂRĂ cupon
 *   pasul 2  la ≥24 h după pasul 1 — încredere: ce urmează după plată,
 *            echipă reală, recenzii, WhatsApp; FĂRĂ cupon
 *   pasul 3  la ≥48 h după pasul 2 — FĂRĂ email și fără cupon (din
 *            07.10.2026): comanda e marcată „2 emailuri fără răspuns" și
 *            echipa o sună / îi scrie din /admin/recuperare-telefonica.
 *            Cuponul de 10% adusese 0 plăți din 74 de comenzi (14.09–07.10);
 *            toate recuperările veneau din pașii 1–2.
 *
 * Două pool-uri de candidați, același tratament:
 *   1. `status='abandoned'` — trimisă, neplătită (auto-abandon). Link la checkout.
 *   2. `status='draft'` — abandon în wizard, doar dacă a trecut de pasul de
 *      contact (`hasProgressBeyondContact`). Link înapoi ÎN wizard
 *      (`/comanda/<slug>?order=&email=`).
 *
 * Progresul e pe comandă: `recovery_email_step` (0–3) +
 * `recovery_email_last_sent_at`; `recovery_email_sent_at` rămâne = primul
 * email (dashboardul îl citește). Cine a fost sunat de echipă primește în
 * continuare secvența — cele două canale se completează (+45% recuperare
 * multi-canal vs un singur canal).
 *
 * Fereastra: comenzi create în ultimele 7 zile (pasul 3 cade la ~72 h).
 * Auth: CRON_SECRET (Bearer). Vercel Cron cheamă cu GET → passthrough.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { buildRecoveryStep1, buildRecoveryStep2 } from '@/lib/email/templates/abandoned-recovery-sequence';
import { hasProgressBeyondContact } from '@/lib/orders/abandoned-progress';
import { TEST_EMAILS, isSuspiciousEmail, isUndeliverable } from '@/lib/email/deliverability';
import { buildResumeUrl } from '@/lib/orders/resume-url';
import { withUtm } from '@/lib/email/utm';
import { brandForOrder } from '@/lib/brand/for-order';

const MIN_AGE_MS = 30 * 60 * 1000;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DRAFT_MIN_IDLE_MS = 2 * 60 * 60 * 1000;

/** Așteptarea până la pasul următor, măsurată de la ultimul email trimis. */
export const STEP_DELAYS_MS: Record<1 | 2 | 3, number> = {
  1: 0, // condiționat doar de MIN_AGE / DRAFT_MIN_IDLE
  2: 24 * 60 * 60 * 1000,
  3: 48 * 60 * 60 * 1000,
};
const FINAL_STEP = 3;


export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ success: false, error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const now = Date.now();
  const minIso = new Date(now - MAX_AGE_MS).toISOString();
  const maxIso = new Date(now - MIN_AGE_MS).toISOString();

  const { data: candidates, error: fetchError } = await supabase
    .from('orders')
    .select(
      'id, order_number, friendly_order_id, status, total_price, customer_data, updated_at, recovery_email_step, recovery_email_last_sent_at, platform, services(name, slug, processing_config)'
    )
    .in('status', ['abandoned', 'draft'])
    .lt('recovery_email_step', FINAL_STEP)
    .gte('created_at', minIso)
    .lte('created_at', maxIso)
    .order('created_at', { ascending: true })
    .limit(100); // throttle so a single run doesn't burst Resend

  if (fetchError) {
    console.error('[recovery-emails] fetch failed:', fetchError);
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
  }

  // Curățenia rulează indiferent dacă există candidați (rulează la 15 min).
  const cleanedCoupons = await cleanupExpiredSystemCoupons(supabase, now);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({
      success: true,
      data: { sentCount: 0, skippedCount: 0, cleanedCoupons, processedAt: new Date().toISOString() },
    });
  }

  const results: Array<{ orderId: string; step?: number; status: 'sent' | 'handed_to_team' | 'skipped' | 'error'; reason?: string }> = [];

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
    if (isUndeliverable(email) || isSuspiciousEmail(email)) {
      results.push({ orderId: order.id, status: 'skipped', reason: 'undeliverable or suspicious email' });
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

    const step = ((Number(order.recovery_email_step) || 0) + 1) as 1 | 2 | 3;
    if (step > 1) {
      const lastSent = Date.parse(order.recovery_email_last_sent_at ?? '') || 0;
      if (now - lastSent < STEP_DELAYS_MS[step]) {
        results.push({ orderId: order.id, step, status: 'skipped', reason: 'waiting for next step' });
        continue;
      }
    }

    const firstName = cd.personal?.firstName ?? cd.billing?.firstName ?? cd.contact?.firstName ?? null;
    const totalRon = Number(order.total_price ?? 0);
    const serviceName = (order.services?.name ?? 'documentul') as string;
    const serviceSlug = (order.services?.slug ?? null) as string | null;
    const estimatedDaysDisplay = (order.services?.processing_config?.estimated_days_display ?? null) as string | null;
    const orderNumber = order.friendly_order_id ?? order.order_number ?? '';
    // The ORDER's brand (orders.platform): resume link, header and sender follow it.
    const brand = brandForOrder(order);

    // Pasul 3: nu mai trimitem email. Comanda rămâne în coada echipei
    // (/admin/recuperare-telefonica), marcată „2 emailuri fără răspuns".
    if (step === FINAL_STEP) {
      await supabase
        .from('orders')
        .update({ recovery_email_step: FINAL_STEP })
        .eq('id', order.id);
      await supabase.from('order_history').insert({
        order_id: order.id,
        event_type: 'recovery_email_sent',
        changed_by: 'system-cron',
        new_value: { step: FINAL_STEP, email: false },
        notes: 'Secvența de emailuri s-a încheiat fără plată (2 emailuri) — comanda e de sunat în Recuperare telefonică',
      });
      results.push({ orderId: order.id, step, status: 'handed_to_team' });
      continue;
    }

    const resumeUrl = withUtm(
      buildResumeUrl({
        id: order.id,
        status: order.status,
        friendly_order_id: order.friendly_order_id ?? null,
        serviceSlug,
        email,
        platform: (order as { platform?: string | null }).platform ?? null,
      }),
      'recovery',
      `recovery-step${step}`
    );

    const stepInput = { customerFirstName: firstName, serviceName, totalRon, resumeUrl, orderNumber, estimatedDaysDisplay, brand };
    const mail = step === 1 ? buildRecoveryStep1(stepInput) : buildRecoveryStep2(stepInput);

    try {
      const sendRes = await sendEmail({
        to: email,
        from: brand.emailFrom,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        idempotencyKey: `recovery-${order.id}-step${step}`,
      });
      if (sendRes.skipped) {
        // Resend neconfigurat — nu avansa pasul, retry la următoarea rulare.
        results.push({ orderId: order.id, step, status: 'skipped', reason: sendRes.reason });
        continue;
      }
    } catch (err) {
      results.push({ orderId: order.id, step, status: 'error', reason: err instanceof Error ? err.message : 'send failed' });
      continue;
    }

    // Un `from()` nou per scriere (builder-ul postgrest-js nu se refolosește).
    const sentAt = new Date().toISOString();
    await supabase
      .from('orders')
      .update({
        recovery_email_step: step,
        recovery_email_last_sent_at: sentAt,
        ...(step === 1 ? { recovery_email_sent_at: sentAt } : {}),
      })
      .eq('id', order.id);
    await supabase.from('order_history').insert({
      order_id: order.id,
      event_type: 'recovery_email_sent',
      changed_by: 'system-cron',
      new_value: { step },
      notes:
        step === 1
          ? 'Email recovery pasul 1 (reia comanda, fără cupon)'
          : 'Email recovery pasul 2 (încredere, fără cupon)',
    });

    results.push({ orderId: order.id, step, status: 'sent' });
  }

  return NextResponse.json({
    success: true,
    data: {
      sentCount: results.filter((r) => r.status === 'sent').length,
      skippedCount: results.filter((r) => r.status === 'skipped').length,
      errorCount: results.filter((r) => r.status === 'error').length,
      byStep: {
        1: results.filter((r) => r.status === 'sent' && r.step === 1).length,
        2: results.filter((r) => r.status === 'sent' && r.step === 2).length,
        handedToTeam: results.filter((r) => r.status === 'handed_to_team').length,
      },
      processedAt: new Date().toISOString(),
      cleanedCoupons,
      results,
    },
  });
}

// Cupoanele de sistem (RECOVERY-/TEL-) expirate de peste 7 zile și nefolosite
// nu mai au nicio valoare — nici pentru client (expirat), nici pentru raport
// (times_used = 0). Fără curățenie, lista din /admin/coupons ajunsese la
// 1.423 de rânduri moarte (14.09). Cele FOLOSITE rămân (dovada reducerii pe
// comandă); cupoanele manuale nu se ating niciodată.
const COUPON_CLEANUP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanupExpiredSystemCoupons(supabase: any, now: number): Promise<number> {
  const { data, error } = await supabase
    .from('coupons')
    .delete()
    .in('system_kind', ['recovery', 'phone_recovery'])
    .eq('times_used', 0)
    .lt('valid_until', new Date(now - COUPON_CLEANUP_AFTER_MS).toISOString())
    .select('id');
  if (error) {
    console.warn('[recovery-emails] coupon cleanup failed:', error.message);
    return 0;
  }
  return data?.length ?? 0;
}

// Vercel Cron invocă rutele cu GET — fără passthrough programarea nu ar porni.
export async function GET(request: NextRequest) {
  return POST(request);
}
