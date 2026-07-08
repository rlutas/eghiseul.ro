import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PATCH /api/admin/orders/[id]/contact
 *
 * Admin correction of the customer's contact details (phone/email) — clients
 * frequently mistype their phone number and become unreachable. Updates
 * customer_data.contact and writes an audit note (old → new) to order_history.
 *
 * Body: { email?: string, phone?: string } — at least one required.
 * Permission: orders.manage
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  let body: { email?: string; phone?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Cerere invalidă' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const phone = body.phone?.trim();
  if (!email && !phone) {
    return NextResponse.json({ success: false, error: 'Nimic de actualizat' }, { status: 400 });
  }
  if (email && (!EMAIL_RE.test(email) || email.length > 254)) {
    return NextResponse.json({ success: false, error: 'Email invalid' }, { status: 400 });
  }
  if (phone && !/^\+?[0-9 ()-]{6,20}$/.test(phone)) {
    return NextResponse.json({ success: false, error: 'Telefon invalid' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: fetchError } = await (admin as any)
    .from('orders')
    .select('customer_data')
    .eq('id', id)
    .single();
  if (fetchError || !order) {
    return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cd = (order.customer_data as any) || {};
  const oldEmail = cd?.contact?.email || '—';
  const oldPhone = cd?.contact?.phone || '—';
  cd.contact = { ...(cd.contact || {}), ...(email ? { email } : {}), ...(phone ? { phone } : {}) };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updError } = await (admin as any)
    .from('orders')
    .update({ customer_data: cd, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (updError) {
    return NextResponse.json({ success: false, error: updError.message }, { status: 500 });
  }

  // Audit note — who changed what (old → new), visible in Note Echipă.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
  const changes: string[] = [];
  if (phone && phone !== oldPhone) changes.push(`telefon: ${oldPhone} → ${phone}`);
  if (email && email !== oldEmail) changes.push(`email: ${oldEmail} → ${email}`);
  if (changes.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: id,
      event_type: 'note_added',
      changed_by: profile?.email || 'admin',
      notes: `Contact actualizat de echipă — ${changes.join('; ')}`,
    });
  }

  return NextResponse.json({ success: true });
}
