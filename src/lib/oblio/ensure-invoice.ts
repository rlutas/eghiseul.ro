/**
 * ensureInvoiceForPaidOrder — single chokepoint for first-time Oblio invoice
 * emission on a PAID order.
 *
 * Why this exists: a paid order can have its invoice created from several
 * places (the Stripe webhook `payment_intent.succeeded`/`checkout.session
 * .completed`, the `confirm-payment` success-page fallback when the webhook
 * is slow/misses on Hosted Checkout, the admin verify-payment flow, and the
 * invoice-health-check cron backfill). Previously only the webhook created
 * the invoice, so orders confirmed via the fallback path stayed paid with no
 * invoice (e.g. E-260610-NMU25). This helper centralises that logic with an
 * atomic claim so concurrent callers never double-issue.
 *
 * Concurrency: `orders.invoice_generating_at` is the lock. Exactly one caller
 * wins the conditional UPDATE and creates the invoice; the rest get `locked`.
 * On failure the lock is released so a later retry (cron / confirm-payment)
 * can re-claim — the lock also self-expires after 2 min as a backstop.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { createInvoiceFromOrder } from './invoice';

type PaymentMethodType = 'Card' | 'Transfer bancar' | 'Cash';

export type EnsureInvoiceResult =
  | { status: 'created'; invoiceNumber: string; invoiceUrl: string | null }
  | { status: 'already_exists'; invoiceNumber: string }
  | { status: 'locked' }
  | { status: 'failed'; error: string };

const LOCK_STALE_MS = 2 * 60 * 1000;

export async function ensureInvoiceForPaidOrder(
  orderId: string,
  paymentMethod: PaymentMethodType = 'Card',
  opts?: { historyNote?: string }
): Promise<EnsureInvoiceResult> {
  const admin = createAdminClient();

  // 1. Fetch order + service fields needed for the invoice.
  const { data: order, error: fetchError } = await admin
    .from('orders')
    .select('*, services(name, lawyer_fee_ron)')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { status: 'failed', error: fetchError?.message || 'Order not found' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const o = order as any;

  if (o.invoice_number) {
    return { status: 'already_exists', invoiceNumber: o.invoice_number };
  }
  if (o.payment_status !== 'paid') {
    return { status: 'failed', error: 'Order is not paid' };
  }

  // 2. Atomic claim — only the winner creates the invoice. Self-expires after
  //    2 min so a genuine retry can re-claim if creation failed.
  //
  // IMPORTANT: no `.or()` here. The production PostgREST instance rejects
  // `or=` filters on ANY mutation with 42703 "column ... does not exist"
  // (the column exists — the message is misleading). The original `.or()`
  // claim therefore errored on EVERY call, fell into the degradation path
  // below, and the webhook/confirm-payment race double-issued invoices
  // (EGI2024-24097 + 24098 on E-260612-QT376, 2026-06-12). Instead we run
  // two sequential conditional UPDATEs — each one atomic on its own.
  //
  // `invoice_generating_at` was added by migration 049 but the generated
  // Database types aren't regenerated yet — cast to bypass the stale type.
  const nowIso = new Date().toISOString();
  // 2a. Normal case: nobody holds the lock.
  let { data: claimRows, error: claimError } = await (admin
    .from('orders')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ invoice_generating_at: nowIso } as any)
    .eq('id', orderId)
    .is('invoice_number', null)
    .is('invoice_generating_at', null)
    .select('id'));

  // 2b. Takeover: a previous claimant died mid-creation (>2 min ago).
  if (!claimError && (!claimRows || claimRows.length === 0)) {
    const lockStaleBefore = new Date(Date.now() - LOCK_STALE_MS).toISOString();
    ({ data: claimRows, error: claimError } = await (admin
      .from('orders')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ invoice_generating_at: nowIso } as any)
      .eq('id', orderId)
      .is('invoice_number', null)
      .lt('invoice_generating_at', lockStaleBefore)
      .select('id')));
  }

  if (claimError) {
    // GRACEFUL DEGRADATION: if PostgREST can't see the lock column (its schema
    // cache went stale after the migration that added invoice_generating_at —
    // observed flapping across the replica fleet), DON'T skip the invoice.
    // Re-check invoice_number to avoid an obvious duplicate, then proceed
    // WITHOUT the lock. A rare duplicate (recoverable via storno) is far better
    // than a paid order silently left without an invoice.
    const msg = claimError.message || '';
    const lockColumnMissing =
      claimError.code === 'PGRST204' || // column not found in schema cache
      claimError.code === '42703' || // undefined_column
      /invoice_generating_at/.test(msg) ||
      /schema cache/i.test(msg);
    if (!lockColumnMissing) {
      return { status: 'failed', error: msg };
    }
    console.warn(
      `[ensure-invoice] lock column unavailable (${msg}) — creating invoice WITHOUT lock for ${orderId}`
    );
    const { data: recheck } = await admin
      .from('orders')
      .select('invoice_number')
      .eq('id', orderId)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((recheck as any)?.invoice_number) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { status: 'already_exists', invoiceNumber: (recheck as any).invoice_number };
    }
    // fall through to the create block (degraded, no lock held)
  } else if (!claimRows || claimRows.length === 0) {
    return { status: 'locked' };
  }

  // 3. Create the invoice (only the lock winner reaches here).
  try {
    const svcRel = o.services as { name: string; lawyer_fee_ron?: number | null } | null;
    const invoice = await createInvoiceFromOrder(
      {
        id: o.id,
        order_number: o.order_number ?? undefined,
        friendly_order_id: o.friendly_order_id ?? undefined,
        service_name: svcRel?.name || 'Serviciu eGhiseul',
        lawyer_fee_ron: svcRel?.lawyer_fee_ron ?? undefined,
        base_price: o.base_price ?? undefined,
        total_price: o.total_price,
        selected_options: o.selected_options ?? undefined,
        delivery_method: o.delivery_method ?? undefined,
        delivery_price: o.delivery_price ?? undefined,
        coupon_code: o.coupon_code ?? null,
        discount_amount: o.discount_amount ?? null,
        customer_data: o.customer_data ?? undefined,
      },
      paymentMethod
    );

    await admin
      .from('orders')
      .update({
        invoice_number: invoice.invoiceNumber,
        invoice_url: invoice.pdfUrl,
        invoice_issued_at: invoice.createdAt,
      })
      .eq('id', orderId);

    // Release the lock in a SEPARATE update: if the lock column is invisible
    // to a stale PostgREST schema cache, bundling it above would fail the
    // critical invoice_number write too. Best-effort — ignore errors.
    try {
      await admin
        .from('orders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ invoice_generating_at: null } as any)
        .eq('id', orderId);
    } catch {
      /* lock column not visible — nothing to release */
    }

    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_confirmed',
      notes:
        opts?.historyNote ?? `Factură emisă automat: ${invoice.invoiceNumber}`,
      new_value: JSON.stringify({ invoice_number: invoice.invoiceNumber }),
    });

    console.log(`[ensure-invoice] Invoice ${invoice.invoiceNumber} created for order ${orderId}`);
    return {
      status: 'created',
      invoiceNumber: invoice.invoiceNumber,
      invoiceUrl: invoice.pdfUrl ?? null,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[ensure-invoice] Oblio invoice creation failed for ${orderId}:`, msg);

    // Self-heal: release the lock so a later retry can re-claim. Best-effort —
    // in degraded mode the lock column may be invisible to PostgREST, so ignore
    // any error here (we never held a real lock in that case anyway).
    try {
      await admin
        .from('orders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ invoice_generating_at: null } as any)
        .eq('id', orderId);
    } catch {
      /* lock column not visible — nothing to release */
    }

    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_confirmed',
      notes: 'Crearea facturii a eșuat — se va reîncerca automat.',
      new_value: JSON.stringify({ invoice_error: msg }),
    });

    return { status: 'failed', error: msg };
  }
}
