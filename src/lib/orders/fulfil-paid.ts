import { createAdminClient } from '@/lib/supabase/admin';
import { ensureInvoiceForPaidOrder } from '@/lib/oblio';
import { upsertContactForPaidOrder } from '@/lib/contacts/upsert';
import { ensureOnrcJobForPaidOrder } from '@/lib/onrc/ensure-onrc-job';
import { ensureAncpiJobForPaidOrder } from '@/lib/ancpi/ensure-ancpi-job';
import { computeEstimatedCompletionISOForOrder } from '@/lib/orders/order-estimate';

/**
 * Post-payment fulfilment chain for MANUALLY-collected payments (comenzi
 * telefonice plătite prin transfer bancar / cash, marcate de admin).
 *
 * Mirrors the Stripe webhook's handlePaymentSucceeded step-by-step and reuses
 * the exact same idempotent helpers (invoice lock, contact upsert, ONRC/ANCPI
 * job ensure, Barou documents) — every step fail-soft, misses self-heal via
 * the hourly crons. The webhook itself is deliberately NOT refactored to call
 * this (live payment path stays untouched).
 */
export async function fulfilManuallyPaidOrder(
  orderId: string,
  opts: {
    /** Oblio collect type — 'Transfer bancar' | 'Cash'. */
    collect: 'Transfer bancar' | 'Cash';
    /** Payment reference (bank transaction id / receipt no) — stored on the order. */
    reference: string;
    /** Admin user id who confirmed the payment. */
    adminId: string;
  }
): Promise<{ ok: true; alreadyPaid?: boolean } | { ok: false; error: string }> {
  const supabaseAdmin = createAdminClient();

  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*, services(name, slug, estimated_days, urgent_days, urgent_available)')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { ok: false, error: 'Comanda nu a fost găsită.' };
  }

  // Idempotent: second click / double-submit is a no-op.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((order as any).payment_status === 'paid') {
    return { ok: true, alreadyPaid: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = (order as any).services as {
    estimated_days?: number | null;
    urgent_days?: number | null;
    urgent_available?: boolean | null;
  } | null;
  const estimatedCompletionISO = await computeEstimatedCompletionISOForOrder(
    supabaseAdmin,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order as any,
    svc
  );

  const paidAtNow = new Date().toISOString();
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'paid',
      updated_at: paidAtNow,
      paid_at: paidAtNow,
      payment_method: opts.collect === 'Cash' ? 'cash' : 'transfer',
      payment_reference: opts.reference,
      ...(estimatedCompletionISO ? { estimated_completion_date: estimatedCompletionISO } : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq('id', orderId);

  if (updateError) {
    return { ok: false, error: `Eroare la marcarea plății: ${updateError.message}` };
  }

  await supabaseAdmin.from('order_history').insert({
    order_id: orderId,
    event_type: 'payment_confirmed',
    notes: `Plată manuală confirmată de admin (${opts.collect}) · referință: ${opts.reference}`,
    changed_by: opts.adminId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // Invoice — same atomic-lock chokepoint as the webhook; collect type carries
  // through to Oblio so the payment shows up correctly in decontări.
  const result = await ensureInvoiceForPaidOrder(orderId, opts.collect, { historyNote: undefined });
  if (result.status === 'created') await upsertContactForPaidOrder(orderId);
  if (result.status === 'failed') {
    console.error(`[fulfil-paid] Order ${orderId}: invoice creation failed:`, result.error);
  }

  try {
    const { sendOrderConfirmationIfNeeded } = await import('@/lib/email/order-confirmation');
    await sendOrderConfirmationIfNeeded(supabaseAdmin, orderId);
  } catch (e) {
    console.error(`[fulfil-paid] Order ${orderId}: confirmation email failed (non-fatal):`, e instanceof Error ? e.message : e);
  }

  try {
    await ensureOnrcJobForPaidOrder(orderId);
  } catch (e) {
    console.error(`[fulfil-paid] Order ${orderId}: ensureOnrcJob failed (non-fatal):`, e instanceof Error ? e.message : e);
  }
  try {
    await ensureAncpiJobForPaidOrder(orderId);
  } catch (e) {
    console.error(`[fulfil-paid] Order ${orderId}: ensureAncpiJob failed (non-fatal):`, e instanceof Error ? e.message : e);
  }

  try {
    const { ensureBarouDocumentsForPaidOrder } = await import('@/lib/documents/ensure-barou-documents');
    await ensureBarouDocumentsForPaidOrder(orderId);
  } catch (e) {
    console.error(`[fulfil-paid] Order ${orderId}: ensureBarouDocuments failed (non-fatal):`, e instanceof Error ? e.message : e);
  }

  return { ok: true };
}
