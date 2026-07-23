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
import { validateSupplierCost } from '@/lib/admin/supplier-costs';

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
  return NextResponse.json({ success: true, data: data ?? [] });
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
  const err = validateSupplierCost(body);
  if (err) {
    return NextResponse.json({ success: false, error: err }, { status: 400 });
  }
  const b = body as {
    supplier: string;
    category: string;
    description?: string | null;
    documentLanguage?: string | null;
    amountRon: number;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('order_supplier_costs')
    .insert({
      order_id: id,
      supplier: b.supplier.trim(),
      category: b.category,
      description: b.description?.trim() || null,
      document_language: b.documentLanguage?.trim() || null,
      amount_ron: Math.round(Number(b.amountRon) * 100) / 100,
      recorded_by: auth.email,
    })
    .select()
    .single();
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
