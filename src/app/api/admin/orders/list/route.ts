import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { parseTestFilter, resolveStatusFilter } from '@/lib/admin/orders-tabs';

/**
 * GET /api/admin/orders/list - List all orders (for admin)
 * Query params:
 * - status: filter by status (default: all non-draft)
 * - search: search by order number, email, name, AWB
 * - page: page number (0-indexed, default 0)
 * - limit: number of results per page (default 25)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
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

    // Check permission
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const service = searchParams.get('service') || '';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    // Sandbox/test filter (parity with cazierjudiciaronline.com):
    //   ?test=only → only test orders (Stripe test-mode)
    //   ?test=all  → both test + live
    //   anything else (default = "hide") → live only (is_test=false)
    const testFilter = parseTestFilter(searchParams.get('test'));

    // Build query
    let query = adminClient
      .from('orders')
      .select(
        `
        id,
        friendly_order_id,
        order_number,
        status,
        total_price,
        payment_status,
        payment_method,
        courier_provider,
        courier_service,
        delivery_tracking_number,
        delivery_method,
        is_test,
        customer_data,
        created_at,
        services(name, slug)
      `,
        { count: 'estimated' }
      )
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    // Apply status filter via the shared resolver — supports tab values
    // (paid/processing/shipped/completed/abandoned) plus the all + debug
    // statuses (draft/pending/etc).
    const statusShape = resolveStatusFilter(status);
    if (statusShape.eq) {
      query = query.eq('status', statusShape.eq);
    } else if (statusShape.in) {
      query = query.filter('status', 'in', `(${statusShape.in.map((s) => `"${s}"`).join(',')})`);
    } else if (statusShape.notIn) {
      query = query.not('status', 'in', `(${statusShape.notIn.map((s) => `"${s}"`).join(',')})`);
    }

    // Sandbox/test filter — three-state chip group: hide | only | all.
    if (testFilter === 'only') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).eq('is_test', true);
    } else if (testFilter === 'hide') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).eq('is_test', false);
    }
    // 'all' → no filter

    // Service filter — exact match on service_id (UUID). The UI passes the
    // service id from the services dropdown.
    if (service) {
      query = query.eq('service_id', service);
    }

    // Apply search filter (server-side)
    if (search) {
      // Search across multiple fields using OR
      // Note: PostgREST uses -> for JSON traversal, ->> for text extraction
      query = query.or(
        `order_number.ilike.%${search}%,friendly_order_id.ilike.%${search}%,delivery_tracking_number.ilike.%${search}%,customer_data->contact->>email.ilike.%${search}%`
      );
    }

    const { data: orders, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
