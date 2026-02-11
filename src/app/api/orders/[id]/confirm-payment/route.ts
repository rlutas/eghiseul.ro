import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// Service role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/confirm-payment
 *
 * Manual payment confirmation endpoint.
 * Can be used to:
 * 1. Manually confirm payment when webhook fails
 * 2. Verify payment status with Stripe and update DB
 *
 * This is a fallback for when webhooks don't work properly.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;

    // Fetch order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, services(name)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Order already marked as paid',
        data: { paymentStatus: order.payment_status }
      });
    }

    // Check with Stripe if payment intent exists
    const paymentIntentId = order.stripe_payment_intent_id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'No payment intent found for this order' },
        { status: 400 }
      );
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(`[confirm-payment] Order ${orderId}: Stripe status = ${paymentIntent.status}`);

    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: `Payment not successful. Stripe status: ${paymentIntent.status}`,
        data: {
          stripeStatus: paymentIntent.status,
          orderId,
          paymentIntentId,
        }
      }, { status: 400 });
    }

    // Payment succeeded - update order
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        status: order.status === 'pending' || order.status === 'draft' ? 'processing' : order.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[confirm-payment] Failed to update order:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Add to order history
    await supabaseAdmin.from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_confirmed',
      notes: `Payment confirmed via manual check. Stripe PaymentIntent: ${paymentIntentId}`,
      new_value: JSON.stringify({
        payment_status: 'paid',
        stripe_payment_intent: paymentIntentId,
        confirmed_via: 'manual_check',
      }),
    });

    console.log(`[confirm-payment] Order ${orderId} marked as paid`);

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        orderId,
        paymentStatus: 'paid',
        stripeStatus: paymentIntent.status,
      }
    });

  } catch (error) {
    console.error('[confirm-payment] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
