import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  aggregateStatusDistribution,
  aggregateServiceRevenue,
  computeRecoveryRatePercent,
  type StatusRow,
  type ServiceRevenueRow,
} from '@/lib/admin/dashboard-aggregators';

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
    // Statuses that hide from default operational view — same set the orders
    // list uses (HIDDEN_FROM_DEFAULT). Counts derived against this set keep
    // the dashboard aligned with what the operator sees in the list.
    const HIDDEN_FROM_DEFAULT = ['draft', 'pending', 'abandoned'];
    // 30-day window for recovery analytics — older orders are out of the
    // recovery window (max age is 7 days), so 30d is enough lookback to
    // see the funnel.
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Run all queries in parallel. The set keeps growing as the dashboard
    // surface evolves — each query stays cheap (count head:true or a single
    // column projection on indexed columns), so adding rows is fine.
    const [
      ordersTodayRes,
      ordersYesterdayRes,
      revenueMonthRes,
      revenuePrevMonthRes,
      pendingShipmentsRes,
      pendingPaymentsRes,
      totalOrdersRes,
      totalCustomersRes,
      // New (2026-05-27): abandoned cart + recovery analytics + breakdowns
      abandonedTodayRes,
      abandoned30dRes,
      recoveryEmailsSent30dRes,
      recoveryRecovered30dRes,
      statusDistRes,
      serviceBreakdownRes,
      testOrdersRes,
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

      // Total orders (excludes everything hidden from the default list).
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', `(${HIDDEN_FROM_DEFAULT.map((s) => `"${s}"`).join(',')})`),

      // Total customers
      adminClient
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),

      // Abandoned today — driver for the auto-abandon cron health signal.
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'abandoned')
        .gte('updated_at', todayStart),

      // Abandoned in the last 30 days — used to size the recovery funnel.
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'abandoned')
        .gte('created_at', thirtyDaysAgo),

      // Recovery emails actually sent in the last 30 days. The cron
      // stamps `recovery_email_sent_at` after a successful Resend send,
      // so this is the real "we mailed the customer" count.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (adminClient.from('orders') as any)
        .select('id', { count: 'exact', head: true })
        .not('recovery_email_sent_at', 'is', null)
        .gte('recovery_email_sent_at', thirtyDaysAgo),

      // Orders recovered: got a recovery email AND eventually paid.
      // Approximation: status NOT IN abandoned/pending AND recovery email
      // was sent. Doesn't perfectly attribute to coupon use, but it's the
      // cleanest signal without joining on coupons.times_used.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (adminClient.from('orders') as any)
        .select('id', { count: 'exact', head: true })
        .not('recovery_email_sent_at', 'is', null)
        .gte('recovery_email_sent_at', thirtyDaysAgo)
        .in('status', paidStatuses),

      // Status distribution — single SELECT, count happens client-side
      // (we want the labels regardless of how many orders are in each
      // bucket). Excludes drafts to keep the chart focused on operational
      // work.
      adminClient
        .from('orders')
        .select('status')
        .neq('status', 'draft')
        .gte('created_at', thirtyDaysAgo),

      // Service breakdown for the current month: count + revenue per
      // service slug. We fetch base_price + total_price and group client-side
      // since PostgREST doesn't expose grouping primitives natively.
      adminClient
        .from('orders')
        .select('total_price, services(slug, name)')
        .gte('created_at', monthStart)
        .in('status', paidStatuses),

      // Test orders count — surfaces the size of the sandbox cohort so an
      // operator can spot when test orders leak into live (or vice versa).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (adminClient.from('orders') as any)
        .select('id', { count: 'exact', head: true })
        .eq('is_test', true),
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

    // Aggregations are extracted to pure helpers in
    // `lib/admin/dashboard-aggregators.ts` so the grouping logic is
    // unit-testable without spinning up Supabase. Behavior unchanged.
    const statusDistribution = aggregateStatusDistribution(
      (statusDistRes.data ?? []) as StatusRow[]
    );
    const serviceBreakdown = aggregateServiceRevenue(
      (serviceBreakdownRes.data ?? []) as unknown as ServiceRevenueRow[]
    );
    const emailsSent = recoveryEmailsSent30dRes.count || 0;
    const recovered = recoveryRecovered30dRes.count || 0;
    const recoveryRate = computeRecoveryRatePercent({ emailsSent, recovered });

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
        // New 2026-05-27 surface — abandoned cart funnel + breakdowns.
        abandonedToday: abandonedTodayRes.count || 0,
        abandoned30d: abandoned30dRes.count || 0,
        recoveryEmailsSent30d: emailsSent,
        recoveryRecovered30d: recovered,
        recoveryRatePercent: recoveryRate,
        testOrdersTotal: testOrdersRes.count || 0,
        statusDistribution,
        serviceBreakdown,
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
