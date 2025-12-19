import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/orders/list - List all orders (for admin)
 * Query params:
 * - status: filter by status (draft, pending, etc.)
 * - limit: number of results (default 20)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'draft';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        friendly_order_id,
        order_number,
        status,
        total_price,
        customer_data,
        created_at,
        updated_at
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Summarize orders for admin view
    const summary = orders?.map((o) => ({
      friendly_order_id: o.friendly_order_id,
      order_number: o.order_number,
      email: (o.customer_data as { contact?: { email?: string } })?.contact?.email || 'N/A',
      total_price: o.total_price,
      created_at: o.created_at,
      age_hours: Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60)),
    }));

    return NextResponse.json({
      success: true,
      data: {
        count: orders?.length || 0,
        orders: summary,
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
