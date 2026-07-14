/**
 * POST /api/cron/invoice-health-check
 *
 * Detects paid orders that don't have an Oblio invoice number set after
 * 30+ minutes. Indicates either a transient Oblio outage (rare) or a
 * silent failure in the invoice generation pipeline (the original
 * symptom that motivated this cron on cazierjudiciaronline.com — see
 * their `cazierjudiciaronline.com/docs/admin/orders.md` "Monitorizare
 * automată" section).
 *
 * Output:
 *   - Logs a structured warning per missing-invoice order (admin can grep
 *     Vercel logs).
 *   - When `SLACK_WEBHOOK_URL` is set, posts a Slack message to the
 *     configured channel (`#bots` recommended).
 *   - Otherwise no external side-effect — the JSON response still tells
 *     the caller how many orders are affected.
 *
 * Auth: `Authorization: Bearer ${CRON_SECRET}`.
 * Scheduled: every hour via vercel.json (light enough to run frequently).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ensureInvoiceForPaidOrder } from '@/lib/oblio';

const MIN_AGE_MS = 30 * 60 * 1000;
const MAX_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000; // don't keep alerting on ancient orders

interface AffectedOrder {
  id: string;
  friendlyOrderId: string | null;
  orderNumber: string | null;
  totalPrice: number | null;
  paidAt: string | null;
  status: string | null;
  email: string | null;
}

async function postSlackAlert(orders: AffectedOrder[]): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  const lines = orders
    .slice(0, 20) // cap so we don't blow past Slack's block limit
    .map((o) => {
      const ref = o.friendlyOrderId ?? o.orderNumber ?? o.id;
      const amount = (o.totalPrice ?? 0).toFixed(2);
      const paid = o.paidAt ? o.paidAt.slice(0, 16).replace('T', ' ') : '?';
      return `• ${ref} (${amount} RON, plătit ${paid})`;
    });
  const text =
    `:warning: ${orders.length} comand${orders.length === 1 ? 'ă' : 'e'} plătit${orders.length === 1 ? 'ă' : 'e'} fără factură (peste 30 min de la plată)\n` +
    lines.join('\n');
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.warn('[invoice-health-check] Slack post failed:', err);
  }
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
  const cutoffNewIso = new Date(now - MIN_AGE_MS).toISOString();
  const cutoffOldIso = new Date(now - MAX_LOOKBACK_MS).toISOString();

  // Paid orders without invoice_number set, in the [7 days, 30 min] window.
  // We filter on `paid_at` (when the Stripe webhook fired) — fall back to
  // `updated_at` when `paid_at` is NULL (legacy rows).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordersTable = supabase.from('orders') as any;
  const { data, error } = await ordersTable
    .select(
      'id, friendly_order_id, order_number, total_price, paid_at, updated_at, status, customer_data, payment_status, invoice_number'
    )
    .eq('payment_status', 'paid')
    .is('invoice_number', null)
    .gte('updated_at', cutoffOldIso)
    .lte('updated_at', cutoffNewIso)
    .limit(200);

  if (error) {
    console.error('[invoice-health-check] fetch failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const affected: AffectedOrder[] = (data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any): AffectedOrder => ({
      id: r.id,
      friendlyOrderId: r.friendly_order_id ?? null,
      orderNumber: r.order_number ?? null,
      totalPrice: r.total_price ?? null,
      paidAt: r.paid_at ?? r.updated_at ?? null,
      status: r.status ?? null,
      email: (r.customer_data as { contact?: { email?: string } } | null)?.contact?.email ?? null,
    })
  );

  // BAROU SWEEP (runs every time, independent of the invoice check): paid
  // orders whose Barou numbers were never allocated (e.g. the central registry
  // was unreachable when the webhook fired). Idempotent + fail-soft; capped
  // per run. 14-day lookback.
  let barouHealed = 0;
  try {
    const { data: barouPending } = await ordersTable
      .select('id')
      .eq('payment_status', 'paid')
      .is('barou_numbers_allocated_at', null)
      .gte('updated_at', new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(20);

    if (barouPending?.length) {
      const { ensureBarouDocumentsForPaidOrder } = await import('@/lib/documents/ensure-barou-documents');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const o of barouPending as any[]) {
        const res = await ensureBarouDocumentsForPaidOrder(o.id);
        if (res.ok && !res.skipped) barouHealed++;
      }
    }
  } catch (err) {
    console.error('[invoice-health-check] barou sweep failed:', err);
  }

  // EXTRA-INVOICE SWEEP: paid extra charges whose fiscal invoice failed at the
  // webhook (extra_billing entries with invoice:null — e.g. E-260714-WXGYQ,
  // where only the proforma existed). Issues the invoice from the proforma and
  // writes it back. Fail-soft per entry; 14-day lookback, capped per run.
  let extraHealed = 0;
  try {
    const { data: withExtra } = await ordersTable
      .select('id, friendly_order_id, order_number, customer_data, extra_billing')
      .not('extra_billing', 'is', null)
      .gte('updated_at', new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const needingHeal = ((withExtra ?? []) as any[]).filter((o) =>
      Array.isArray(o.extra_billing) && o.extra_billing.some((e: { invoice?: unknown }) => !e.invoice)
    );
    if (needingHeal.length) {
      const { createInvoiceFromProforma } = await import('@/lib/oblio/proforma');
      for (const o of needingHeal.slice(0, 10)) {
        const orderNum = (o.friendly_order_id ?? o.order_number ?? '') as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entries = o.extra_billing as any[];
        let changed = false;
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].invoice) continue;
          try {
            const inv = await createInvoiceFromProforma({
              orderNumber: orderNum,
              amountRon: Number(entries[i].amount ?? 0),
              description: `Servicii suplimentare comanda ${orderNum}`,
              customerData: o.customer_data ?? {},
              proforma: entries[i].proforma ?? { seriesName: '', number: '', link: null },
              paymentIntentId: entries[i].paymentIntentId ?? null,
            });
            entries[i] = { ...entries[i], invoice: inv };
            changed = true;
            extraHealed++;
            await ordersTable
              .update({ extra_billing: entries })
              .eq('id', o.id);
            await (supabase.from('order_history') as ReturnType<typeof supabase.from>)
              .insert({
                order_id: o.id,
                event_type: 'extra_invoice_issued',
                notes: `Factură extra emisă de cron (webhook eșuase): ${inv.seriesName}-${inv.number} pentru ${Number(entries[i].amount ?? 0).toFixed(2)} RON`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[invoice-health-check] extra-invoice heal failed for ${orderNum}[${i}]:`, msg);
            // Surface the failure in the order timeline — runtime logs aren't
            // reachable from the CLI, and a silent hourly failure is invisible
            // (this exact invoice failed 6+ crons before anyone saw why).
            await (supabase.from('order_history') as ReturnType<typeof supabase.from>)
              .insert({
                order_id: o.id,
                event_type: 'extra_invoice_failed',
                notes: `Emitere factură extra eșuată (cron): ${msg.slice(0, 400)}`,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)
              .then(() => {}, () => {});
          }
        }
        if (changed) console.log(`[invoice-health-check] extra invoice(s) healed for ${orderNum}`);
      }
    }
  } catch (err) {
    console.error('[invoice-health-check] extra-invoice sweep failed:', err);
  }

  if (affected.length === 0) {
    return NextResponse.json({
      success: true,
      data: { affectedCount: 0, healedCount: 0, barouHealed, extraHealed, processedAt: new Date().toISOString() },
    });
  }

  // AUTO-HEAL: try to actually create the missing invoice for each affected
  // order (single chokepoint with atomic lock + graceful degradation). This is
  // the final safety net: even if the webhook AND confirm-payment both missed
  // (e.g. a transient PostgREST schema-cache flap), the hourly cron recovers it.
  const healed: string[] = [];
  const stillMissing: AffectedOrder[] = [];
  for (const o of affected.slice(0, 50)) {
    try {
      const res = await ensureInvoiceForPaidOrder(o.id, 'Card');
      if (res.status === 'created' || res.status === 'already_exists') {
        healed.push(o.friendlyOrderId ?? o.orderNumber ?? o.id);
      } else {
        stillMissing.push(o);
      }
    } catch (err) {
      console.error('[invoice-health-check] heal threw for', o.id, err);
      stillMissing.push(o);
    }
  }

  // Structured warning — searchable in Vercel logs even without Slack.
  console.warn('[invoice-health-check] paid orders without invoice (>30 min):', {
    count: affected.length,
    healed: healed.length,
    stillMissing: stillMissing.length,
    sample: affected.slice(0, 5).map((o) => o.friendlyOrderId ?? o.orderNumber ?? o.id),
  });

  // Only alert a human about the ones we couldn't auto-heal.
  if (stillMissing.length > 0) await postSlackAlert(stillMissing);

  return NextResponse.json({
    success: true,
    data: {
      affectedCount: affected.length,
      healedCount: healed.length,
      barouHealed,
      extraHealed,
      healed,
      stillMissing: stillMissing.map((o) => ({
        id: o.id,
        ref: o.friendlyOrderId ?? o.orderNumber,
        totalPrice: o.totalPrice,
        paidAt: o.paidAt,
        email: o.email,
      })),
      slackPosted: !!process.env.SLACK_WEBHOOK_URL && stillMissing.length > 0,
      processedAt: new Date().toISOString(),
    },
  });
}

// Vercel Cron invokes cron paths with GET (same auth header) — a
// production-blocked GET means the schedule NEVER runs (this cron 405'd on
// every hourly tick until 2026-07-12; E-260710-EFNSH stayed paid with no
// invoice for 2 days because of it).
export async function GET(request: NextRequest) {
  return POST(request);
}
