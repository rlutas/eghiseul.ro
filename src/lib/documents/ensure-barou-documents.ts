/**
 * Post-payment Barou allocation + contract-asistenta generation.
 *
 * Barou numbers (contract asistență juridică + împuterniciri) are FINITE
 * ranges from Baroul Satu Mare — they must be consumed ONLY by paid orders.
 * This helper runs after a successful payment (Stripe webhook,
 * confirm-payment fallback, cron sweep) and:
 *   1. allocates the Barou contract number from the CENTRAL registry
 *      (dedicated Supabase project — see src/lib/registry/client.ts),
 *   2. generates contract-asistenta with the real number,
 *   3. allocates all delegation (împuternicire) numbers.
 *
 * Idempotent + fail-soft (D2/D3 in the plan):
 *   - `orders.barou_numbers_allocated_at` marks completion; re-runs no-op.
 *   - the central allocate_number RPC reuses existing allocations, so a
 *     partial failure retried later never burns extra numbers.
 *   - NEVER throws — a registry outage must not break payment processing.
 *     Failures are recorded in order_history (`barou_allocation_failed`) and
 *     retried by the hourly cron sweep (invoice-health-check).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { autoGenerateOrderDocuments } from '@/lib/documents/auto-generate';
import { isNoLawyerService } from '@/lib/documents/no-lawyer-services';

export async function ensureBarouDocumentsForPaidOrder(
  orderId: string
): Promise<{ ok: boolean; skipped?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as any;

  try {
    const { data: order, error } = await adminClient
      .from('orders')
      .select('id, payment_status, barou_numbers_allocated_at, services(slug)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('[barou] order not found:', orderId, error?.message);
      return { ok: false };
    }

    if (order.barou_numbers_allocated_at) {
      return { ok: true, skipped: 'already-allocated' };
    }
    if (order.payment_status !== 'paid') {
      return { ok: true, skipped: 'not-paid' };
    }
    const serviceSlug = order.services?.slug || '';
    if (isNoLawyerService(serviceSlug)) {
      // No lawyer involvement → no Barou numbers ever. Mark so the cron
      // sweep doesn't keep picking the order up.
      await adminClient
        .from('orders')
        .update({ barou_numbers_allocated_at: new Date().toISOString() })
        .eq('id', orderId);
      return { ok: true, skipped: 'no-lawyer-service' };
    }

    // Pre-cutover orders may already have contract-asistenta generated at
    // submit (with a number from the OLD local registry, migrated centrally).
    // Skip document generation for those; the central RPC would return the
    // migrated number anyway (reused=true).
    const { data: existingDoc } = await adminClient
      .from('order_documents')
      .select('id')
      .eq('order_id', orderId)
      .eq('type', 'contract_asistenta')
      .limit(1)
      .maybeSingle();

    if (existingDoc) {
      await adminClient
        .from('orders')
        .update({ barou_numbers_allocated_at: new Date().toISOString() })
        .eq('id', orderId);
      return { ok: true, skipped: 'doc-already-exists' };
    }

    // Allocate + generate. autoGenerateOrderDocuments swallows per-template
    // errors (recorded in order_history) and THROWS on delegation failures,
    // so verify contract-asistenta actually landed in the results.
    const results = await autoGenerateOrderDocuments(orderId, null, 'post-payment');
    const contractGenerated = results.some((r) => r.template === 'contract-asistenta');

    if (!contractGenerated) {
      throw new Error('contract-asistenta generation did not complete');
    }

    await adminClient
      .from('orders')
      .update({ barou_numbers_allocated_at: new Date().toISOString() })
      .eq('id', orderId);

    console.log(`[barou] numbers allocated + contract-asistenta generated for ${orderId}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[barou] allocation failed for', orderId, message);

    // Surface to admin; the hourly cron sweep retries automatically.
    try {
      await adminClient.from('order_history').insert({
        order_id: orderId,
        changed_by: null,
        event_type: 'barou_allocation_failed',
        new_value: { error: message },
        notes: `Alocarea numerelor Barou a eșuat (se reîncearcă automat): ${message}`,
      });
    } catch {
      /* never let logging break the payment path */
    }

    return { ok: false };
  }
}
