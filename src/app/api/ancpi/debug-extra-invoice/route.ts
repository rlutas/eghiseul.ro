import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * TEMPORARY diagnostic route (2026-07-15) — REMOVE after E-260714-WXGYQ.
 *
 * The extra-invoice heal fails silently on every hourly cron and Vercel
 * runtime logs are unreachable from the CLI. This runs the exact same heal
 * once, on demand, and returns the real Oblio error. Auth: the ANCPI worker
 * bearer secret (already provisioned in Vercel), same check as /api/ancpi/*.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const secret = process.env.ANCPI_WORKER_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Mirror the cron sweep's query so we also learn whether it FINDS the order.
  const { data: withExtra, error: qErr } = await supabase
    .from('orders')
    .select('id, friendly_order_id, order_number, customer_data, extra_billing')
    .not('extra_billing', 'is', null)
    .gte('updated_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  if (qErr) {
    return NextResponse.json({ success: false, stage: 'query', error: qErr.message });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const needing = ((withExtra ?? []) as any[]).filter(
    (o) => Array.isArray(o.extra_billing) && o.extra_billing.some((e: { invoice?: unknown }) => !e.invoice)
  );
  if (!needing.length) {
    return NextResponse.json({ success: true, stage: 'query', needing: 0 });
  }

  const o = needing[0];
  const entry = o.extra_billing.find((e: { invoice?: unknown }) => !e.invoice);
  try {
    const { createInvoiceFromProforma } = await import('@/lib/oblio/proforma');
    const inv = await createInvoiceFromProforma({
      orderNumber: (o.friendly_order_id ?? o.order_number ?? '') as string,
      amountRon: Number(entry.amount ?? 0),
      description: `Servicii suplimentare comanda ${o.friendly_order_id}`,
      customerData: o.customer_data ?? {},
      proforma: entry.proforma ?? { seriesName: '', number: '', link: null },
      paymentIntentId: entry.paymentIntentId ?? null,
    });
    // Persist exactly like the cron would.
    const entries = o.extra_billing.map((e: { invoice?: unknown }) => (e === entry ? { ...entry, invoice: inv } : e));
    await supabase.from('orders').update({ extra_billing: entries }).eq('id', o.id);
    await supabase.from('order_history').insert({
      order_id: o.id,
      event_type: 'extra_invoice_issued',
      notes: `Factură extra emisă (debug route): ${inv.seriesName}-${inv.number}`,
    });
    return NextResponse.json({ success: true, stage: 'issued', invoice: inv });
  } catch (err) {
    return NextResponse.json({
      success: false,
      stage: 'oblio',
      order: o.friendly_order_id,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
