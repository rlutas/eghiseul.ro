import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/dashboard/stats
 *
 * Returns dashboard statistics: orders today/yesterday, revenue this/prev month,
 * pending shipments, pending payments, total orders, total customers.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();

    // Date boundaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString();

    // Paid statuses for revenue calculation
    const paidStatuses = ['paid', 'processing', 'document_ready', 'shipped', 'completed'];

    // Run all queries in parallel
    const [
      ordersTodayRes,
      ordersYesterdayRes,
      revenueMonthRes,
      revenuePrevMonthRes,
      pendingShipmentsRes,
      pendingPaymentsRes,
      totalOrdersRes,
      totalCustomersRes,
    ] = await Promise.all([
      // Orders today (non-draft)
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .neq('status', 'draft'),

      // Orders yesterday (non-draft)
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', yesterdayStart)
        .lt('created_at', todayStart)
        .neq('status', 'draft'),

      // Revenue this month
      adminClient
        .from('orders')
        .select('total_price')
        .gte('created_at', monthStart)
        .in('status', paidStatuses),

      // Revenue previous month
      adminClient
        .from('orders')
        .select('total_price')
        .gte('created_at', prevMonthStart)
        .lte('created_at', prevMonthEnd)
        .in('status', paidStatuses),

      // Pending shipments (document_ready)
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'document_ready'),

      // Pending payments (pending + bank_transfer)
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('payment_method', 'bank_transfer'),

      // Total orders (non-draft)
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'draft'),

      // Total customers
      adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
    ]);

    // Sum revenue
    const revenueMonth = (revenueMonthRes.data || []).reduce(
      (sum, row) => sum + (row.total_price || 0),
      0
    );
    const revenuePrevMonth = (revenuePrevMonthRes.data || []).reduce(
      (sum, row) => sum + (row.total_price || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        ordersToday: ordersTodayRes.count || 0,
        ordersYesterday: ordersYesterdayRes.count || 0,
        revenueMonth: Math.round(revenueMonth * 100) / 100,
        revenuePrevMonth: Math.round(revenuePrevMonth * 100) / 100,
        pendingShipments: pendingShipmentsRes.count || 0,
        pendingPayments: pendingPaymentsRes.count || 0,
        totalOrders: totalOrdersRes.count || 0,
        totalCustomers: totalCustomersRes.count || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
