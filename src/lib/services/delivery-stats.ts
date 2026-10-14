import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Real issuance time for a service, measured from paid_at to the first
 * `document_ready` status in order_history, over the most recent paid orders.
 * Shown on service pages instead of a hand-written promise, so the number is
 * always backed by data (content rule 3: no invented figures).
 */
export interface DeliveryStats {
  /** Median minutes from payment to document ready. */
  medianMinutes: number;
  /** Share of orders ready within 10 minutes, 0–100. */
  under10Pct: number;
  /** Number of orders measured. */
  sample: number;
}

const MIN_SAMPLE = 20;

export async function getDeliveryStats(serviceSlug: string, limit = 100): Promise<DeliveryStats | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: svc } = await admin.from('services').select('id').eq('slug', serviceSlug).single();
    if (!svc) return null;

    const { data: orders, error } = await admin
      .from('orders')
      .select('id, paid_at')
      .eq('service_id', svc.id)
      .eq('is_test', false)
      .not('paid_at', 'is', null)
      .order('paid_at', { ascending: false })
      .limit(limit);
    if (error || !orders?.length) return null;

    const { data: events } = await admin
      .from('order_history')
      .select('order_id, created_at')
      .in('order_id', orders.map((o: { id: string }) => o.id))
      .eq('event_type', 'status_changed')
      .eq('new_value->>status', 'document_ready')
      .order('created_at', { ascending: true });

    const readyAt = new Map<string, string>();
    for (const e of (events ?? []) as { order_id: string; created_at: string }[]) {
      if (!readyAt.has(e.order_id)) readyAt.set(e.order_id, e.created_at);
    }

    const minutes = (orders as { id: string; paid_at: string }[])
      .map((o) => {
        const r = readyAt.get(o.id);
        return r ? (new Date(r).getTime() - new Date(o.paid_at).getTime()) / 60000 : null;
      })
      .filter((m): m is number => m !== null && m >= 0)
      .sort((a, b) => a - b);

    if (minutes.length < MIN_SAMPLE) return null;
    const mid = Math.floor(minutes.length / 2);
    const median = minutes.length % 2 ? minutes[mid] : (minutes[mid - 1] + minutes[mid]) / 2;
    return {
      medianMinutes: Math.max(1, Math.round(median)),
      under10Pct: Math.round((minutes.filter((m) => m <= 10).length / minutes.length) * 100),
      sample: minutes.length,
    };
  } catch (e) {
    console.error('getDeliveryStats failed', e instanceof Error ? e.message : e);
    return null;
  }
}
