/**
 * Marks an order urgent (or clears it), so it jumps to the top of the work
 * queues instead of waiting its turn by age.
 *
 * Why it exists: the collaborator's list is oldest-first, which is the right
 * default — but when a client writes in angry, that order has to be next, and
 * "caut-o pe asta prin 100 de rânduri" is not a process.
 *
 * POST body: { urgent: boolean }
 * Permission: orders.manage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const body = await request.json().catch(() => ({}));
    const urgent = body?.urgent === true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: order } = await admin
      .from('orders')
      .select('id, friendly_order_id, priority')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }

    const priority = urgent ? 1 : 0;
    if ((order.priority ?? 0) === priority) {
      return NextResponse.json({ success: true, data: { priority } }); // already there
    }

    const { error } = await admin
      .from('orders')
      .update({ priority, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) {
      console.error('[admin] set priority error:', error.message);
      return NextResponse.json({ success: false, error: 'Prioritatea nu a putut fi salvată' }, { status: 500 });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();
    const who = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      || profile?.email
      || 'admin';

    // event_type is CHECK-constrained; 'note_added' is in the list.
    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'note_added',
      changed_by: who,
      notes: urgent
        ? 'Comandă marcată URGENT — trece prima în lista de lucru'
        : 'Marcajul de urgență a fost scos',
    });

    return NextResponse.json({ success: true, data: { priority } });
  } catch (error) {
    console.error('[admin] set priority error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
