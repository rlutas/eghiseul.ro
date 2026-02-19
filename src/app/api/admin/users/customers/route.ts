import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/users/customers
 *
 * List customer profiles with pagination, search, and filtering.
 * Requires: users.manage permission
 *
 * Query params:
 * - search: search by email, first_name, last_name, phone
 * - status: 'active' | 'blocked'
 * - kyc: 'verified' | 'partial' | 'unverified'
 * - page: page number (default 1)
 * - limit: results per page (default 20, max 100)
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'users.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const kyc = searchParams.get('kyc') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Build query for customer profiles
    // Using 'any' cast because blocked_at column is not in generated types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (adminClient as any)
      .from('profiles')
      .select('id, email, first_name, last_name, phone, role, kyc_verified, blocked_at, created_at, updated_at', { count: 'exact' })
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    // Apply status filter
    if (status === 'blocked') {
      query = query.not('blocked_at', 'is', null);
    } else if (status === 'active') {
      query = query.is('blocked_at', null);
    }

    // Apply KYC filter
    if (kyc === 'verified') {
      query = query.eq('kyc_verified', true);
    } else if (kyc === 'unverified') {
      query = query.eq('kyc_verified', false);
    }
    // Note: 'partial' KYC would need separate logic (has some docs but not fully verified)
    // For now, we treat partial as same as unverified

    const { data: customers, error, count } = await query;

    if (error) {
      console.error('Failed to fetch customers:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    // Count orders for each customer
    const customersWithOrders = await enrichWithOrderCounts(adminClient, customers || []);

    return NextResponse.json({
      success: true,
      data: customersWithOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('List customers error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Enrich customer profiles with their order counts.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function enrichWithOrderCounts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customers: Array<Record<string, any>>
) {
  if (customers.length === 0) return [];

  const customerIds = customers.map((c) => c.id as string);

  // Batch fetch order counts for all customers
  const { data: orderCounts } = await adminClient
    .from('orders')
    .select('user_id')
    .in('user_id', customerIds)
    .neq('status', 'draft');

  // Build a count map
  const countMap: Record<string, number> = {};
  if (orderCounts) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const order of orderCounts as any[]) {
      const uid = order.user_id as string;
      countMap[uid] = (countMap[uid] || 0) + 1;
    }
  }

  return customers.map((customer) => ({
    ...customer,
    orders_count: countMap[customer.id as string] || 0,
    kyc_status: customer.kyc_verified ? 'verified' : 'unverified',
  }));
}
