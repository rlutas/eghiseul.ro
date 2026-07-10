import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserPermissions, getCollaboratorServices } from '@/lib/admin/permissions';

/**
 * Monthly settlement view for the authenticated collaborator (topograph):
 * paid orders of their assigned services, month keyed by paid_at, fee per
 * order from services.lawyer_fee_ron (15 RON for the cadastral catalog).
 *
 * Same settlement rule as the admin view (/api/admin/collaborators/orders):
 * payment_status=paid, not cancelled, not refunded; test orders visible but
 * not billable. NO client personal data in the response.
 *
 * Query: month=YYYY-MM (defaults to the current month).
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
      return NextResponse.json({
        success: true,
        data: { month: null, orders: [], summary: { count: 0, totalFees: 0 } },
      });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const month = /^\d{4}-\d{2}$/.test(searchParams.get('month') || '')
      ? (searchParams.get('month') as string)
      : defaultMonth;

    const [y, m] = month.split('-').map(Number);
    const start = new Date(Date.UTC(y!, m! - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y!, m!, 1)).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { data, error } = await admin
      .from('orders')
      .select('id, friendly_order_id, status, paid_at, is_test, customer_data, services:service_id(name, lawyer_fee_ron)')
      .in('service_id', serviceIds)
      .eq('payment_status', 'paid')
      .neq('status', 'cancelled')
      .is('refunded_at', null)
      .gte('paid_at', start)
      .lt('paid_at', end)
      .order('paid_at', { ascending: false });

    if (error) {
      console.error('[collaborator] earnings error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea decontului' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = (data ?? []).map((o: any) => {
      const p = o.customer_data?.property ?? {};
      return {
        id: o.id,
        friendlyOrderId: o.friendly_order_id || o.id.slice(0, 8),
        service: o.services?.name || '—',
        locality: [p.locality, p.county].filter(Boolean).join(', ') || '—',
        status: o.status,
        paidAt: o.paid_at,
        fee: Number(o.services?.lawyer_fee_ron) || 0,
        isTest: !!o.is_test,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const billable = orders.filter((o: any) => !o.isTest);
    const summary = {
      count: billable.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalFees: Math.round(billable.reduce((s: number, o: any) => s + o.fee, 0) * 100) / 100,
    };

    return NextResponse.json({ success: true, data: { month, orders, summary } });
  } catch (error) {
    console.error('[collaborator] earnings error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
