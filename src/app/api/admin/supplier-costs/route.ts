/**
 * GET /api/admin/supplier-costs?month=YYYY-MM[&supplier=...]
 *
 * Monthly supplier-cost report: every recorded cost in the month, enriched
 * with the order number + client, grouped by supplier with totals — so the
 * team can reconcile a collaborator's invoice against what we logged.
 * Auth: payments.verify (financial view).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { formatPersonName } from '@/lib/format/person-name';
import {
  institutionFeeMap,
  pendingCostRows,
  pendingRowKey,
  type SupplierTariff,
} from '@/lib/admin/supplier-costs';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'payments.verify');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }

  // Month window (RO-local calendar) — default to current month.
  const monthParam = request.nextUrl.searchParams.get('month'); // YYYY-MM
  const supplierParam = request.nextUrl.searchParams.get('supplier');
  const m = /^\d{4}-\d{2}$/.test(monthParam ?? '') ? monthParam! : null;
  const now = new Date();
  const [year, month] = m
    ? m.split('-').map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString();
  const end = new Date(Date.UTC(year, month, 1)).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  let q = admin
    .from('order_supplier_costs')
    .select('*')
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: false });
  if (supplierParam) q = q.eq('supplier', supplierParam);
  const { data: costs, error } = await q;
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Enrich with order number + client name.
  const orderIds = [...new Set((costs ?? []).map((c: { order_id: string }) => c.order_id))];
  const orderMap = new Map<string, { orderNumber: string; client: string }>();
  if (orderIds.length) {
    const { data: orders } = await admin
      .from('orders')
      .select('id, order_number, friendly_order_id, customer_data')
      .in('id', orderIds);
    for (const o of orders ?? []) {
      const cd = o.customer_data ?? {};
      const client =
        formatPersonName(cd.personal?.lastName, cd.personal?.firstName) ||
        formatPersonName(cd.billing?.lastName, cd.billing?.firstName) ||
        cd.billing?.companyName ||
        cd.contact?.email ||
        '';
      orderMap.set(o.id, {
        orderNumber: o.friendly_order_id || o.order_number || '',
        client,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (costs ?? []).map((c: any) => ({
    ...c,
    orderNumber: orderMap.get(c.order_id)?.orderNumber ?? '',
    client: orderMap.get(c.order_id)?.client ?? '',
  }));

  // Group by supplier with totals.
  const bySupplier: Record<string, { supplier: string; count: number; total: number; rows: unknown[] }> = {};
  for (const r of rows) {
    const key = r.supplier;
    (bySupplier[key] ??= { supplier: key, count: 0, total: 0, rows: [] });
    bySupplier[key].count += 1;
    bySupplier[key].total = Math.round((bySupplier[key].total + Number(r.amount_ron)) * 100) / 100;
    bySupplier[key].rows.push(r);
  }
  const grandTotal = Math.round(rows.reduce((s: number, r: { amount_ron: number }) => s + Number(r.amount_ron), 0) * 100) / 100;

  return NextResponse.json({
    success: true,
    data: {
      month: `${year}-${String(month).padStart(2, '0')}`,
      grandTotal,
      count: rows.length,
      suppliers: Object.values(bySupplier).sort((a, b) => b.total - a.total),
      missing: await ordersMissingCosts(admin, start, end),
    },
  });
}

/**
 * Orders finalized in this window that should carry an internal cost but
 * don't — the "completez mai târziu" pile.
 *
 * Derived, never stored: an order qualifies when it has cost-bearing options
 * (or an institution fee) and no recorded cost for them. A stored "completed
 * costs" flag would drift the moment someone deletes a cost row; this cannot.
 */
async function ordersMissingCosts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  start: string,
  end: string
) {
  const { data: tariffRow } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'supplier_tariffs')
    .maybeSingle();
  const feeMap = institutionFeeMap((tariffRow?.value ?? []) as SupplierTariff[]);

  const { data: orders } = await admin
    .from('orders')
    .select('id, order_number, friendly_order_id, selected_options, updated_at, services(slug, name)')
    .eq('status', 'completed')
    .gte('updated_at', start)
    .lt('updated_at', end)
    .limit(500);
  if (!orders?.length) return [];

  const { data: recorded } = await admin
    .from('order_supplier_costs')
    .select('order_id, category, document_label')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .in('order_id', orders.map((o: any) => o.id));
  const byOrder = new Map<string, string[]>();
  for (const r of recorded ?? []) {
    byOrder.set(r.order_id, [
      ...(byOrder.get(r.order_id) ?? []),
      pendingRowKey(r.category, r.document_label),
    ]);
  }

  const missing: Array<{ orderId: string; orderNumber: string; categories: string[] }> = [];
  for (const o of orders) {
    type Svc = { slug?: string; name?: string };
    const service = o.services as Svc | Svc[] | null;
    const svc = Array.isArray(service) ? service[0] : service;
    const pending = pendingCostRows({
      options: o.selected_options ?? [],
      serviceSlug: svc?.slug ?? null,
      serviceName: svc?.name ?? null,
      institutionFeeSuppliers: feeMap,
      existingKeys: byOrder.get(o.id) ?? [],
    });
    if (pending.length > 0) {
      missing.push({
        orderId: o.id,
        orderNumber: o.friendly_order_id || o.order_number || '',
        categories: pending.map((p) => p.label),
      });
    }
  }
  return missing;
}
