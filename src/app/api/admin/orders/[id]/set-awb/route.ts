/**
 * POST /api/admin/orders/[id]/set-awb — manually record a courier AWB.
 *
 * For shipments the platform can't generate automatically (DHL / Poșta /
 * international, or email-orders upgraded to physical delivery via an extra
 * payment). Sets delivery_tracking_number (+ tracking URL, auto-built for
 * known couriers) and logs an `awb_created` history event — the client's
 * status page picks the tracking card up automatically.
 *
 * Body: { awb: string, courier?: 'dhl' | 'posta' | string, trackingUrl?: string }
 * Auth: orders.manage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function defaultTrackingUrl(courier: string | null, awb: string): string | null {
  const c = (courier ?? '').toLowerCase();
  if (c.includes('dhl')) {
    return `https://www.dhl.com/ro-ro/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(awb)}`;
  }
  if (c.includes('posta')) {
    return `https://www.posta-romana.ro/awb.html?awb=${encodeURIComponent(awb)}`;
  }
  return null;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  let body: { awb?: unknown; courier?: unknown; trackingUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }
  const awb = typeof body.awb === 'string' ? body.awb.trim() : '';
  if (awb.length < 5 || awb.length > 60) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_AWB', message: 'AWB-ul trebuie să aibă între 5 și 60 de caractere' } },
      { status: 400 }
    );
  }
  const courier = typeof body.courier === 'string' ? body.courier.trim() : null;
  const trackingUrl =
    typeof body.trackingUrl === 'string' && /^https?:\/\//i.test(body.trackingUrl)
      ? body.trackingUrl.trim()
      : defaultTrackingUrl(courier, awb);

  const admin = createAdminClient();
  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('id, order_number, friendly_order_id, delivery_tracking_number')
    .eq('id', id)
    .single();
  if (fetchErr || !order) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin.from('orders') as any)
    .update({
      delivery_tracking_number: awb,
      delivery_tracking_url: trackingUrl,
      ...(courier ? { courier_provider: courier } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updateErr) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_UPDATE_FAILED', message: updateErr.message } },
      { status: 500 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('order_history') as any).insert({
    order_id: id,
    event_type: 'awb_created',
    changed_by: user.email ?? 'admin',
    notes: `AWB introdus manual${courier ? ` (${courier.toUpperCase()})` : ''}: ${awb}${
      order.delivery_tracking_number ? ` · înlocuiește ${order.delivery_tracking_number}` : ''
    }`,
  });

  return NextResponse.json({ success: true, data: { awb, trackingUrl } });
}
