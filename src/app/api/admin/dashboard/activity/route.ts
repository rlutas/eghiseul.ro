import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

/**
 * GET /api/admin/dashboard/activity
 *
 * Returns the 20 most recent entries from order_history,
 * joined with orders to include the order_number.
 *
 * Column mapping (from supabase types):
 *   event_type (not 'event'), metadata (JSONB), new_value, old_value, notes
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

    const { data, error } = await adminClient
      .from('order_history')
      .select(`
        id,
        order_id,
        event_type,
        metadata,
        new_value,
        notes,
        created_at,
        orders!inner(order_number, friendly_order_id)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Activity query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Shape the response
    const activity = (data || []).map((row) => {
      const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
      return {
        id: row.id,
        orderId: row.order_id,
        orderNumber:
          (order as { friendly_order_id?: string })?.friendly_order_id ||
          (order as { order_number?: string })?.order_number ||
          '-',
        event: row.event_type,
        details: row.metadata as Record<string, unknown> | null,
        newValue: row.new_value,
        notes: row.notes,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Dashboard activity error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
