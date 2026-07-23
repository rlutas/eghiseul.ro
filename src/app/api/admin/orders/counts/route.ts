import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import {
  HIDDEN_FROM_DEFAULT,
  PROCESSING_GROUP,
  SHIPPED_GROUP,
  parseTestFilter,
  type OrdersCounts,
} from '@/lib/admin/orders-tabs';
import { applyQuickOrStage } from '@/lib/admin/order-quick-filters';

/**
 * GET /api/admin/orders/counts
 *
 * Returns aggregate counts per tab so the orders list UI can show badges
 * next to each tab. Mirrors the filter logic in /api/admin/orders/list so
 * the badge always matches the visible row count.
 *
 * Query params:
 *   - test=hide (default) | only | all
 *   - service=<service_id>   (optional)
 *   - search=<text>          (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const testFilter = parseTestFilter(searchParams.get('test'));
    const service = searchParams.get('service') || '';
    const search = searchParams.get('search') || '';

    const hiddenList = `(${HIDDEN_FROM_DEFAULT.map((s) => `"${s}"`).join(',')})`;
    const processingList = `(${PROCESSING_GROUP.map((s) => `"${s}"`).join(',')})`;
    const shippedList = `(${SHIPPED_GROUP.map((s) => `"${s}"`).join(',')})`;

    // Build a fresh head-only count query and apply the shared filters
    // (test + service + search). Using a factory instead of a generic helper
    // keeps the Supabase builder narrow types intact.
    const buildQuery = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = adminClient
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (testFilter === 'hide') q = q.eq('is_test', false);
      if (testFilter === 'only') q = q.eq('is_test', true);
      if (service) q = q.eq('service_id', service);
      if (search) {
        q = q.or(
          `order_number.ilike.%${search}%,friendly_order_id.ilike.%${search}%,delivery_tracking_number.ilike.%${search}%,customer_data->contact->>email.ilike.%${search}%`
        );
      }
      return q;
    };

    const [
      allRes, paidRes, processingRes, shippedRes, completedRes, abandonedRes, standbyRes, testOnlyRes,
      overdueRes, deadlineSoonRes, withCouponRes, extraPendingRes,
      stageDocsRes, stageSubmittedRes, stageReceivedRes,
      stageTradusRes, stageLegalizatRes, stageApostilaNotariRes, stageApostilaHagaRes,
      stageReadyRes,
    ] =
      await Promise.all([
        buildQuery().not('status', 'in', hiddenList),
        buildQuery().eq('status', 'paid'),
        buildQuery().filter('status', 'in', processingList),
        buildQuery().filter('status', 'in', shippedList),
        buildQuery().eq('status', 'completed'),
        // "Neplătite" tab count = draft + pending + abandoned (matches list).
        buildQuery().filter('status', 'in', hiddenList),
        // "Așteptare client" — parked orders waiting on the customer.
        buildQuery().eq('status', 'standby'),
        // test_only ignores the active testFilter and just counts sandbox rows
        // so the user knows how many are out there even when on "hide".
        adminClient
          .from('orders')
          .select('*', { count: 'exact', head: true })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .eq('is_test' as any, true)
          .not('status', 'in', hiddenList),
        // Quick-filter chip counts
        applyQuickOrStage(buildQuery(), 'overdue'),
        applyQuickOrStage(buildQuery(), 'deadline_soon'),
        applyQuickOrStage(buildQuery(), 'with_coupon'),
        applyQuickOrStage(buildQuery(), 'extra_pending'),
        // Workflow-stage chip counts
        applyQuickOrStage(buildQuery(), 'documents_generated'),
        applyQuickOrStage(buildQuery(), 'submitted'),
        applyQuickOrStage(buildQuery(), 'received'),
        applyQuickOrStage(buildQuery(), 'la_tradus'),
        applyQuickOrStage(buildQuery(), 'la_legalizat'),
        applyQuickOrStage(buildQuery(), 'la_apostila_notari'),
        applyQuickOrStage(buildQuery(), 'apostila_haga'),
        applyQuickOrStage(buildQuery(), 'ready'),
      ]);

    const counts: OrdersCounts = {
      all: allRes.count || 0,
      paid: paidRes.count || 0,
      processing: processingRes.count || 0,
      shipped: shippedRes.count || 0,
      completed: completedRes.count || 0,
      abandoned: abandonedRes.count || 0,
      standby: standbyRes.count || 0,
      test_only: testOnlyRes.count || 0,
      overdue: overdueRes.count || 0,
      deadline_soon: deadlineSoonRes.count || 0,
      with_coupon: withCouponRes.count || 0,
      extra_pending: extraPendingRes.count || 0,
      stage_documents_generated: stageDocsRes.count || 0,
      stage_submitted: stageSubmittedRes.count || 0,
      stage_received: stageReceivedRes.count || 0,
      stage_la_tradus: stageTradusRes.count || 0,
      stage_la_legalizat: stageLegalizatRes.count || 0,
      stage_la_apostila_notari: stageApostilaNotariRes.count || 0,
      stage_apostila_haga: stageApostilaHagaRes.count || 0,
      stage_ready: stageReadyRes.count || 0,
    };

    return NextResponse.json({ success: true, data: counts });
  } catch (error) {
    console.error('Failed to fetch orders counts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
