/**
 * Contact registry sync — upserts a row in `contacts` for every PAID order so
 * the client list (imported historically from WPForms via
 * scripts/import-contacts.mjs) stays current without any manual step.
 *
 * Fire-and-forget from the payment paths (webhook / confirm-payment): a
 * failure here must never affect order fulfilment.
 */
import { createAdminClient } from '@/lib/supabase/admin';

export async function upsertContactForPaidOrder(orderId: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data: order } = await admin
      .from('orders')
      .select('paid_at, total_price, customer_data, services:service_id(slug)')
      .eq('id', orderId)
      .single();
    if (!order) return;

    const email = (order.customer_data?.contact?.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;

    const slug: string = order.services?.slug ?? 'necunoscut';
    const paidAt: string = order.paid_at ?? new Date().toISOString();
    const totalRon = Number(order.total_price) || 0;
    const firstName = order.customer_data?.billing?.firstName ?? null;
    const lastName = order.customer_data?.billing?.lastName ?? null;
    const phone = order.customer_data?.contact?.phone ?? null;

    const { data: existing } = await admin
      .from('contacts')
      .select('id, sources, services, orders_count, total_spent_ron, first_seen_at, first_name, last_name, phone')
      .eq('email', email)
      .maybeSingle();

    const source = `platforma:${slug}`;
    if (existing) {
      await admin
        .from('contacts')
        .update({
          first_name: existing.first_name ?? firstName,
          last_name: existing.last_name ?? lastName,
          phone: existing.phone ?? phone,
          sources: Array.from(new Set([...(existing.sources ?? []), source])),
          services: Array.from(new Set([...(existing.services ?? []), slug])),
          is_customer: true,
          orders_count: (existing.orders_count ?? 0) + 1,
          total_spent_ron: Math.round(((Number(existing.total_spent_ron) || 0) + totalRon) * 100) / 100,
          first_seen_at: existing.first_seen_at ?? paidAt,
          last_activity_at: paidAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await admin.from('contacts').insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        sources: [source],
        services: [slug],
        is_customer: true,
        orders_count: 1,
        total_spent_ron: totalRon,
        first_seen_at: paidAt,
        last_activity_at: paidAt,
      });
    }
  } catch (err) {
    console.warn('[contacts] upsert failed (non-blocking):', err instanceof Error ? err.message : err);
  }
}
