/**
 * GET/POST/DELETE /api/admin/orders/[id]/supplier-costs
 *
 * Team records what a collaborator (translator/notary/…) charged US for work
 * on this order. Used for per-order margin + the monthly supplier report.
 * Auth: orders.manage (operators do the work + record the cost).
 * Table: order_supplier_costs (migration 136). Admin-client only (RLS blocks anon).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  validateSupplierCost,
  pendingCostRows,
  institutionFeeMap,
  lastAmountKey,
  type SupplierTariff,
} from '@/lib/admin/supplier-costs';

/**
 * Everything the finalize dialog needs to pre-fill itself: which cost lines the
 * order still misses, and what each one probably costs (configured tariff
 * first, last amount we actually paid second).
 */
async function buildPending(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  orderId: string,
  existingCategories: string[]
) {
  const { data: order } = await admin
    .from('orders')
    .select('selected_options, service_id, services(slug)')
    .eq('id', orderId)
    .single();
  if (!order) return [];

  const { data: tariffRow } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'supplier_tariffs')
    .maybeSingle();
  const tariffs = (tariffRow?.value ?? []) as SupplierTariff[];

  // Last amount used per supplier+category+language — newest wins, so the
  // dialog follows price changes without anyone editing a setting.
  const { data: history } = await admin
    .from('order_supplier_costs')
    .select('supplier, category, document_language, amount_ron, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  const lastAmounts: Record<string, number> = {};
  for (const row of history ?? []) {
    const key = lastAmountKey(row.supplier, row.category, row.document_language);
    if (!(key in lastAmounts)) lastAmounts[key] = Number(row.amount_ron);
  }

  const service = order.services as { slug?: string } | { slug?: string }[] | null;
  const serviceSlug = Array.isArray(service) ? service[0]?.slug : service?.slug;

  return pendingCostRows({
    options: order.selected_options ?? [],
    serviceSlug: serviceSlug ?? null,
    institutionFeeSuppliers: institutionFeeMap(tariffs),
    existingCategories,
    tariffs,
    lastAmounts,
  });
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function authed(): Promise<{ userId: string; email: string } | Response> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  return { userId: user.id, email: user.email ?? 'admin' };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await authed();
  if (auth instanceof Response) return auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('order_supplier_costs')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  const costs = data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pending = await buildPending(admin, id, costs.map((c: any) => c.category));
  return NextResponse.json({ success: true, data: costs, pending });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await authed();
  if (auth instanceof Response) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON body required' }, { status: 400 });
  }
  // The finalize dialog submits every line at once; the card submits one.
  const items = Array.isArray(body) ? body : [body];
  if (items.length === 0) {
    return NextResponse.json({ success: false, error: 'Niciun cost de salvat' }, { status: 400 });
  }
  for (const item of items) {
    const err = validateSupplierCost(item);
    if (err) {
      return NextResponse.json({ success: false, error: err }, { status: 400 });
    }
  }
  const rows = (items as Array<{
    supplier: string;
    category: string;
    description?: string | null;
    documentLanguage?: string | null;
    amountRon: number;
  }>).map((b) => ({
    order_id: id,
    supplier: b.supplier.trim(),
    category: b.category,
    description: b.description?.trim() || null,
    document_language: b.documentLanguage?.trim() || null,
    amount_ron: Math.round(Number(b.amountRon) * 100) / 100,
    recorded_by: auth.email,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('order_supplier_costs')
    .insert(rows)
    .select();
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  await params; // route shape parity
  const auth = await authed();
  if (auth instanceof Response) return auth;

  const costId = request.nextUrl.searchParams.get('costId');
  if (!costId) {
    return NextResponse.json({ success: false, error: 'costId lipsește' }, { status: 400 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { error } = await admin.from('order_supplier_costs').delete().eq('id', costId);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
