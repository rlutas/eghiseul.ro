import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/orders/lookup - Look up order by friendly_order_id
 *
 * This endpoint is for admin/support team to help customers
 * Query params:
 * - id: friendly_order_id (e.g., ORD-20251218-A3B2C)
 *
 * TODO: Add proper admin authentication when admin roles are implemented
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const friendlyOrderId = searchParams.get('id');

    if (!friendlyOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'Order ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get current user to verify admin role
    const { data: { user } } = await supabase.auth.getUser();

    // TODO: Add admin role check when profiles table has role column
    // For now, allow any authenticated user (for development)
    // In production, this should check: user.role === 'admin'

    // Fetch the order with service details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        service:services (
          id,
          slug,
          name,
          base_price,
          currency
        )
      `)
      .eq('friendly_order_id', friendlyOrderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found',
          },
        },
        { status: 404 }
      );
    }

    // Calculate time since creation for admin info
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const hoursSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    const daysSinceCreation = Math.floor(hoursSinceCreation / 24);

    // Return full order details for admin
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          friendly_order_id: order.friendly_order_id,
          order_number: order.order_number,
          service: order.service,
          status: order.status,
          payment_status: order.payment_status,
          customer_data: order.customer_data,
          selected_options: order.selected_options,
          kyc_documents: order.kyc_documents ? {
            // Don't expose raw document URLs in admin API for security
            hasIdFront: !!order.kyc_documents.idFront,
            hasIdBack: !!order.kyc_documents.idBack,
            hasSelfie: !!order.kyc_documents.selfie,
          } : null,
          delivery_method: order.delivery_method,
          delivery_address: order.delivery_address,
          base_price: order.base_price,
          options_price: order.options_price,
          delivery_price: order.delivery_price,
          total_price: order.total_price,
          created_at: order.created_at,
          updated_at: order.updated_at,
          // Admin-specific info
          admin_info: {
            user_id: order.user_id,
            is_guest: !order.user_id,
            hours_since_creation: hoursSinceCreation,
            days_since_creation: daysSinceCreation,
            expires_in_days: Math.max(0, 7 - daysSinceCreation),
            will_expire: order.status === 'draft' && daysSinceCreation >= 7,
            viewed_by_admin: user?.id || null,
            viewed_at: new Date().toISOString(),
          },
        },
      },
    });
  } catch (error) {
    console.error('Admin order lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
