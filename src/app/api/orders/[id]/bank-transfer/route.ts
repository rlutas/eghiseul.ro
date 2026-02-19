import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/bank-transfer
 *
 * Submit bank transfer payment proof for an order.
 * Updates order status to 'awaiting_verification'.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentProofKey } = body;

    if (!paymentProofKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment proof is required',
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user (optional - guests can also submit)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, payment_status, customer_data')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Verify ownership for logged-in users
    if (user && order.user_id && order.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have access to this order',
        },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: 'This order has already been paid',
        },
        { status: 400 }
      );
    }

    // Update order with bank transfer info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_method: 'bank_transfer',
        payment_status: 'awaiting_verification',
        payment_proof_url: paymentProofKey,
        status: 'pending', // Order is pending until payment verified
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update order',
        },
        { status: 500 }
      );
    }

    // Add to order history
    await supabase.from('order_history').insert({
      order_id: id,
      event_type: 'payment_proof_submitted',
      notes: 'Client a trimis dovada de plata prin transfer bancar',
      new_value: JSON.stringify({
        payment_method: 'bank_transfer',
        payment_status: 'awaiting_verification',
        payment_proof_url: paymentProofKey,
      }),
      changed_by: user?.id || null,
    });

    // TODO: Send notification to admin about pending verification
    // TODO: Send email to customer confirming submission

    return NextResponse.json({
      success: true,
      message: 'Plata a fost înregistrată și așteaptă verificare.',
    });
  } catch (error) {
    console.error('Bank transfer submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
