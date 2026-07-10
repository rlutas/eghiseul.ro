import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserPermissions, getCollaboratorServices } from '@/lib/admin/permissions';

/**
 * Lists orders for the services assigned to the authenticated collaborator.
 * Scoping is by service_id via collaborator_service_assignments. Only paid+
 * orders are relevant for fulfilment (drafts/unpaid are hidden).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { role } = await getUserPermissions(user.id);
    if (role !== 'collaborator') {
      return NextResponse.json({ success: false, error: 'Collaborator access required' }, { status: 403 });
    }

    const serviceIds = await getCollaboratorServices(user.id);
    if (serviceIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('orders')
      .select('id, friendly_order_id, status, created_at, service_id, customer_data, services:service_id(name, slug)')
      .in('service_id', serviceIds)
      .neq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(200);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[collaborator] list orders error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea comenzilor' }, { status: 500 });
    }

    // Privacy: the collaborator gets ONLY the work data (property). Client
    // contact/billing/personal never leave the server on this endpoint.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized = (data ?? []).map((o: any) => ({
      ...o,
      customer_data: { property: o.customer_data?.property ?? null },
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('[collaborator] list orders error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
