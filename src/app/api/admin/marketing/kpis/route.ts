/**
 * GET /api/admin/marketing/kpis?days=30
 *
 * KPI-urile canalelor de email/telefon, pe fereastra cerută (implicit 30 zile):
 * câte am trimis, câte comenzi au venit din ele, cât venit. Atribuirea
 * comenzilor: `orders.attribution.last.utm_medium/utm_campaign` (setate de
 * linkurile din emailuri prin `lib/email/utm.ts`) — plus, unde există o
 * legătură directă mai bună: recovery (comanda însăși a primit emailul),
 * telefon (bifa pe comandă), cupoane (times_used).
 *
 * Judecăm după comenzi și venit, nu după deschideri (Apple MPP le umflă).
 * Permission: settings.manage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { campaignUtmKey } from '@/lib/email/utm';

export const dynamic = 'force-dynamic';

interface Attributed {
  orders: number;
  revenueRon: number;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  try {
    await requirePermission(user.id, 'settings.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }

  const days = Math.min(365, Math.max(1, parseInt(request.nextUrl.searchParams.get('days') ?? '30', 10) || 30));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  // Un `from()` nou per interogare (postgrest-js mută URL-ul builder-ului).
  const count = (table: string) => admin.from(table).select('id', { count: 'exact', head: true });

  // ── Comenzi plătite în fereastră, cu atribuirea lor (o singură citire) ──
  const { data: paidRaw } = await admin
    .from('orders')
    .select('id, total_price, attribution, recovery_email_step, phone_contacted_at, coupon_code, paid_at')
    .not('paid_at', 'is', null)
    .gte('paid_at', since)
    .eq('is_test', false)
    .limit(5000);
  const paid: Array<{
    id: string;
    total_price: number | null;
    attribution: { last?: { utm_medium?: string; utm_campaign?: string } } | null;
    recovery_email_step: number | null;
    phone_contacted_at: string | null;
    coupon_code: string | null;
  }> = paidRaw ?? [];

  const attributed = (pred: (o: (typeof paid)[number]) => boolean): Attributed => {
    const rows = paid.filter(pred);
    return { orders: rows.length, revenueRon: Math.round(rows.reduce((s, o) => s + Number(o.total_price ?? 0), 0) * 100) / 100 };
  };
  const byUtm = (medium: string, campaign?: string) =>
    attributed((o) => o.attribution?.last?.utm_medium === medium && (!campaign || o.attribution?.last?.utm_campaign === campaign));

  // ── Recovery (3 pași) ───────────────────────────────────────────────────
  const { data: recoveryEvents } = await admin
    .from('order_history')
    .select('new_value')
    .eq('event_type', 'recovery_email_sent')
    .gte('created_at', since)
    .limit(20000);
  const recoverySent = { step1: 0, step2: 0, step3: 0 };
  for (const e of recoveryEvents ?? []) {
    const step = Number(e.new_value?.step ?? 3); // rândurile vechi (un singur email cu cupon) = pasul 3
    if (step === 1) recoverySent.step1 += 1;
    else if (step === 2) recoverySent.step2 += 1;
    else recoverySent.step3 += 1;
  }
  const recoveryConverted = attributed((o) => (o.recovery_email_step ?? 0) > 0);
  const recoveryCouponsUsed = attributed((o) => !!o.coupon_code && o.coupon_code.startsWith('RECOVERY-'));

  // ── Telefon ─────────────────────────────────────────────────────────────
  const [{ count: phoneContacted }, { count: phoneContactedAll }] = await Promise.all([
    count('orders').not('phone_contacted_at', 'is', null).gte('phone_contacted_at', since),
    count('orders').not('phone_contacted_at', 'is', null),
  ]);
  const phoneConverted = attributed((o) => !!o.phone_contacted_at);
  const phoneCouponsUsed = attributed((o) => !!o.coupon_code && o.coupon_code.startsWith('TEL-'));

  // ── Lifecycle ───────────────────────────────────────────────────────────
  const lifecycle: Record<string, { sent: number } & Attributed> = {};
  for (const kind of ['review_request', 'expiry_reminder', 'cross_sell'] as const) {
    const { count: sent } = await count('lifecycle_emails').eq('kind', kind).not('sent_at', 'is', null).gte('sent_at', since);
    const utmKey = kind === 'expiry_reminder' ? 'expiry' : kind === 'cross_sell' ? 'cross_sell' : 'review';
    lifecycle[kind] = { sent: sent ?? 0, ...byUtm('lifecycle', utmKey) };
  }

  // ── Warm-up ─────────────────────────────────────────────────────────────
  const [{ count: warmupSent }, { count: warmupSentAll }, { count: warmupUnsub }] = await Promise.all([
    count('contacts').not('warmup_email_sent_at', 'is', null).gte('warmup_email_sent_at', since),
    count('contacts').not('warmup_email_sent_at', 'is', null),
    count('contacts').not('warmup_email_sent_at', 'is', null).eq('marketing_status', 'unsubscribed'),
  ]);
  const warmup = { sent: warmupSent ?? 0, sentAll: warmupSentAll ?? 0, unsubscribed: warmupUnsub ?? 0, ...byUtm('warmup') };

  // ── Campanii ────────────────────────────────────────────────────────────
  const { data: campaignsRaw } = await admin
    .from('email_campaigns')
    .select('id, name, status, sent_count, started_at')
    .neq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(50);
  const campaigns = (campaignsRaw ?? []).map((c: { id: string; name: string; status: string; sent_count: number; started_at: string | null }) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    sent: c.sent_count,
    startedAt: c.started_at,
    ...byUtm('campaign', campaignUtmKey(c.id)),
  }));

  return NextResponse.json({
    success: true,
    data: {
      days,
      since,
      paidOrdersInWindow: paid.length,
      recovery: { sent: recoverySent, converted: recoveryConverted, couponsUsed: recoveryCouponsUsed },
      phone: { contacted: phoneContacted ?? 0, contactedAll: phoneContactedAll ?? 0, converted: phoneConverted, couponsUsed: phoneCouponsUsed },
      lifecycle,
      warmup,
      campaigns,
    },
  });
}
