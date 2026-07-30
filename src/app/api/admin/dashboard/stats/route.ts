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

    // Date boundaries — Romania-local. Vercel runs in UTC, so a plain
    // `new Date(y, m, d)` starts "today" at 03:00 Romania time and orders
    // paid between 00:00–03:00 slid into yesterday (team report 30.07.2026).
    const now = new Date();
    const roOffset =
      new Intl.DateTimeFormat('en', { timeZone: 'Europe/Bucharest', timeZoneName: 'longOffset' })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value.replace('GMT', '') || '+03:00';
    const roParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now); // YYYY-MM-DD in RO
    const [roY, roM, roD] = roParts.split('-').map(Number);
    const roDate = (y: number, m: number, d: number) =>
      new Date(
        `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00${roOffset}`
      );
    const todayStart = roDate(roY, roM, roD).toISOString();
    const yesterdayStart = new Date(roDate(roY, roM, roD).getTime() - 24 * 60 * 60 * 1000).toISOString();
    const monthStart = roDate(roY, roM, 1).toISOString();
    const prevMonthStart = (roM === 1 ? roDate(roY - 1, 12, 1) : roDate(roY, roM - 1, 1)).toISOString();

    // Every status that means "the client's money is with us" — the old list
    // had only 5 of them, so an order sitting in submitted_to_institution /
    // standby / la_tradus… silently DISAPPEARED from revenue (July was
    // under-reported by ~11.000 RON when audited on 30.07.2026). Excludes
    // draft/pending/abandoned (never paid) and cancelled/refunded/
    // cancellation_requested (money returned or on the way back).
    const paidStatuses = [
      'paid',
      'processing',
      'documents_generated',
      'submitted_to_institution',
      'document_received',
      'extras_in_progress',
      'la_tradus',
      'la_legalizat',
      'la_apostila_notari',
      'eliberat_apostila_haga',
      'document_ready',
      'shipped',
      'delivered',
      'standby',
      'in_progress',
      'completed',
    ];
    // Revenue is anchored on paid_at (when the money actually arrived), with
    // created_at as fallback for legacy rows that predate the paid_at column.
    const paidInWindow = (from: string) =>
      `and(paid_at.gte.${from}),and(paid_at.is.null,created_at.gte.${from})`;
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
      revenueRowsRes,
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
      testOrdersRes,
    ] = await Promise.all([
      // Orders PAID today — „Comenzi azi" counted pending/abandoned carts and
      // used the UTC day, so the tile disagreed with actual sales (6 shown vs
      // 4 paid on 30.07.2026). Test orders excluded.
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('paid_at', todayStart)
        .not('is_test', 'is', true),

      // Orders paid yesterday
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('paid_at', yesterdayStart)
        .lt('paid_at', todayStart)
        .not('is_test', 'is', true),

      // Revenue rows since the start of the PREVIOUS month, anchored on
      // paid_at (created_at fallback for legacy rows). One query feeds
      // current-month revenue, previous-month revenue AND the per-service
      // breakdown — partitioned in JS below.
      adminClient
        .from('orders')
        .select('total_price, paid_at, created_at, services(slug, name)')
        .in('status', paidStatuses)
        .not('is_test', 'is', true)
        .or(`paid_at.gte.${prevMonthStart},and(paid_at.is.null,created_at.gte.${prevMonthStart})`),

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

      // Total orders (excludes everything hidden from the default list + test).
      adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .not('status', 'in', `(${HIDDEN_FROM_DEFAULT.map((s) => `"${s}"`).join(',')})`)
        .not('is_test', 'is', true),

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
      // bucket). Excludes drafts + test orders to keep the chart focused on
      // operational work.
      adminClient
        .from('orders')
        .select('status')
        .neq('status', 'draft')
        .not('is_test', 'is', true)
        .gte('created_at', thirtyDaysAgo),

      // Test orders count — surfaces the size of the sandbox cohort so an
      // operator can spot when test orders leak into live (or vice versa).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (adminClient.from('orders') as any)
        .select('id', { count: 'exact', head: true })
        .eq('is_test', true),
    ]);

    // Partition the revenue rows by when the money ARRIVED (paid_at, with
    // created_at fallback for legacy rows without it).
    type RevenueRow = {
      total_price: number | null;
      paid_at: string | null;
      created_at: string | null;
      services: unknown;
    };
    const monthStartMs = new Date(monthStart).getTime();
    const revenueRows = (revenueRowsRes.data ?? []) as unknown as RevenueRow[];
    const isCurrentMonth = (row: RevenueRow) =>
      new Date(row.paid_at ?? row.created_at ?? 0).getTime() >= monthStartMs;
    const currentMonthRows = revenueRows.filter(isCurrentMonth);
    const revenueMonth = currentMonthRows.reduce((sum, row) => sum + (row.total_price || 0), 0);
    const revenuePrevMonth = revenueRows
      .filter((row) => !isCurrentMonth(row))
      .reduce((sum, row) => sum + (row.total_price || 0), 0);

    // Aggregations are extracted to pure helpers in
    // `lib/admin/dashboard-aggregators.ts` so the grouping logic is
    // unit-testable without spinning up Supabase. Behavior unchanged.
    const statusDistribution = aggregateStatusDistribution(
      (statusDistRes.data ?? []) as StatusRow[]
    );
    const serviceBreakdown = aggregateServiceRevenue(
      currentMonthRows as unknown as ServiceRevenueRow[]
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
