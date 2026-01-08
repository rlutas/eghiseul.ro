import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/orders/status
 *
 * Public endpoint to check order status by order code and email.
 * Used by guests who don't have accounts to track their orders.
 *
 * Query parameters:
 * - order_code: The friendly order ID (ORD-YYYYMMDD-XXXXX)
 * - email: The email used when placing the order
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderCode = searchParams.get('order_code');
    const email = searchParams.get('email');

    // Validate required parameters
    if (!orderCode) {
      return NextResponse.json(
        { error: 'Missing order_code parameter' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email parameter' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up order by friendly_order_id and email
    // Use lowercase comparison for email to handle case sensitivity
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        friendly_order_id,
        order_number,
        status,
        created_at,
        updated_at,
        base_price,
        options_price,
        delivery_price,
        total_price,
        payment_status,
        delivery_method,
        customer_data,
        service:services(
          id,
          name,
          slug,
          category
        )
      `)
      .or(`friendly_order_id.eq.${orderCode},order_number.eq.${orderCode}`)
      .single();

    if (error || !order) {
      return NextResponse.json(
        {
          error: 'Order not found',
          message: 'Nu am găsit comanda. Verifică codul și emailul introduse.',
        },
        { status: 404 }
      );
    }

    // Validate email matches order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = order.customer_data as any;
    const orderEmail =
      customerData?.contact?.email ||
      customerData?.email;

    if (!orderEmail || orderEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          error: 'Email mismatch',
          message: 'Emailul nu corespunde cu cel asociat comenzii.',
        },
        { status: 403 }
      );
    }

    // Get order status history for timeline
    const { data: history } = await supabase
      .from('order_history')
      .select('id, status, note, created_at, created_by')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    // Return order details (sanitized for public view)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deliveryMethod = order.delivery_method as any;

    return NextResponse.json({
      success: true,
      data: {
        orderCode: order.friendly_order_id || order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        service: order.service,
        delivery: {
          method: deliveryMethod?.type || null,
          methodName: deliveryMethod?.name || null,
          estimatedDays: deliveryMethod?.estimated_days || null,
        },
        pricing: {
          basePrice: order.base_price,
          optionsPrice: order.options_price,
          deliveryPrice: order.delivery_price,
          totalPrice: order.total_price,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeline: (history || []).map((h: any) => ({
          status: h.status,
          note: h.note,
          createdAt: h.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Order status lookup error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'A apărut o eroare. Te rugăm să încerci din nou.',
      },
      { status: 500 }
    );
  }
}
