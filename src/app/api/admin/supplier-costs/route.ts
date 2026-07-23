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
        [cd.personal?.firstName, cd.personal?.lastName].filter(Boolean).join(' ') ||
        [cd.billing?.firstName, cd.billing?.lastName].filter(Boolean).join(' ') ||
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
    },
  });
}
