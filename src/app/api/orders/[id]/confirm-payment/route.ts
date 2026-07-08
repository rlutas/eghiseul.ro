import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { computeEstimatedCompletionISO } from '@/lib/delivery-estimate-helper';
import { ensureInvoiceForPaidOrder } from '@/lib/oblio';
import { ensureOnrcJobForPaidOrder } from '@/lib/onrc/ensure-onrc-job';
import { ensureAncpiJobForPaidOrder } from '@/lib/ancpi/ensure-ancpi-job';

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

    // Fetch order (include service fields for estimate computation)
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*, services(name, estimated_days, urgent_days, urgent_available)')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if already paid. Even so, the invoice may be missing (e.g. the
    // order was confirmed before this endpoint emitted invoices) — backfill it.
    if (order.payment_status === 'paid') {
      let invoiceBackfilled = false;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(order as any).invoice_number) {
        const res = await ensureInvoiceForPaidOrder(orderId, 'Card');
        invoiceBackfilled = res.status === 'created';
        if (res.status === 'failed') {
          console.error(`[confirm-payment] Invoice backfill failed for ${orderId}: ${res.error}`);
        }
        await ensureOnrcJobForPaidOrder(orderId);
        await ensureAncpiJobForPaidOrder(orderId);
      }
      // Confirmation email — atomic claim, sends at most once per order.
      try {
        const { sendOrderConfirmationIfNeeded } = await import('@/lib/email/order-confirmation');
        await sendOrderConfirmationIfNeeded(supabaseAdmin, orderId);
      } catch (e) {
        console.error(`[confirm-payment] confirmation email failed (non-fatal):`, e instanceof Error ? e.message : e);
      }
      return NextResponse.json({
        success: true,
        message: 'Order already marked as paid',
        data: { paymentStatus: order.payment_status, invoiceBackfilled }
      });
    }

    // Two paths to verify payment with Stripe, depending on flow:
    //  1) Order has `stripe_payment_intent_id` (legacy PaymentIntent flow OR
    //     webhook already arrived and stashed it) → retrieve PI directly.
    //  2) Order has only `stripe_checkout_session_id` (post-2026-05-28
    //     Hosted Checkout flow + webhook didn't land — common on localhost
    //     dev without `stripe listen`) → retrieve the Session, pull the PI
    //     id from session.payment_intent, then proceed as path 1.
    let paymentIntentId: string | null = order.stripe_payment_intent_id || null;
    const checkoutSessionId = order.stripe_checkout_session_id || null;

    if (!paymentIntentId && checkoutSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
        if (session.payment_status === 'paid') {
          paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null;
        } else {
          return NextResponse.json({
            success: false,
            error: `Checkout session not paid yet. Stripe status: ${session.payment_status}`,
            data: { stripeSessionStatus: session.payment_status, orderId },
          }, { status: 400 });
        }
      } catch (sessionErr) {
        console.error('[confirm-payment] Session retrieve failed:', sessionErr);
        return NextResponse.json({
          success: false,
          error: 'Failed to retrieve Stripe Checkout Session',
        }, { status: 500 });
      }
    }

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

    // Compute estimated completion date (holiday/cutoff-aware) if not set yet.
    // Anchored to now since this endpoint sets the order to paid.
    const svc = order.services as {
      estimated_days?: number | null;
      urgent_days?: number | null;
      urgent_available?: boolean | null;
    } | null;
    const estimatedCompletionISO = order.estimated_completion_date
      ? null
      : computeEstimatedCompletionISO({
          placedAt: new Date(),
          serviceDays: svc?.estimated_days ?? null,
          urgentDays: svc?.urgent_days ?? null,
          urgentAvailable: svc?.urgent_available ?? null,
          selectedOptions: (order.selected_options as Array<Record<string, unknown>> | null) ?? null,
          deliveryMethod: order.delivery_method ?? null,
        });

    // Payment succeeded - update order. Also stash paid_at + the PI id
    // if it wasn't there before (Hosted Checkout webhook-miss path).
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'paid',
        // Sister-parity (team request): after payment the order sits in
        // 'paid' — the team moves it to 'processing' when work starts.
        status: order.status === 'pending' || order.status === 'draft' ? 'paid' : order.status,
        updated_at: now,
        ...(order.paid_at ? {} : { paid_at: now }),
        ...(order.stripe_payment_intent_id ? {} : { stripe_payment_intent_id: paymentIntentId }),
        ...(estimatedCompletionISO ? { estimated_completion_date: estimatedCompletionISO } : {}),
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
      notes: `Plata confirmata prin verificare manuala. Stripe PaymentIntent: ${paymentIntentId}`,
      new_value: JSON.stringify({
        payment_status: 'paid',
        stripe_payment_intent: paymentIntentId,
        confirmed_via: 'manual_check',
      }),
    });

    console.log(`[confirm-payment] Order ${orderId} marked as paid`);

    // Emit the Oblio invoice. This path is the Hosted-Checkout fallback used
    // when the Stripe webhook is slow/misses, so without this the order would
    // stay paid with no invoice (the E-260610-NMU25 symptom). The shared
    // helper's atomic lock makes this safe even if the webhook also fires.
    let invoiceNumber: string | null = null;
    try {
      const res = await ensureInvoiceForPaidOrder(orderId, 'Card');
      if (res.status === 'created') invoiceNumber = res.invoiceNumber;
      else if (res.status === 'already_exists') invoiceNumber = res.invoiceNumber;
      else if (res.status === 'failed') {
        console.error(`[confirm-payment] Invoice creation failed for ${orderId}: ${res.error}`);
      }
      await ensureOnrcJobForPaidOrder(orderId);
      await ensureAncpiJobForPaidOrder(orderId);
    } catch (invErr) {
      // Never fail the payment confirmation because of invoicing.
      console.error('[confirm-payment] Invoice emission threw:', invErr);
    }

    // Confirmation email — atomic claim, sends at most once per order.
    try {
      const { sendOrderConfirmationIfNeeded } = await import('@/lib/email/order-confirmation');
      await sendOrderConfirmationIfNeeded(supabaseAdmin, orderId);
    } catch (e) {
      console.error('[confirm-payment] confirmation email failed (non-fatal):', e instanceof Error ? e.message : e);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        orderId,
        paymentStatus: 'paid',
        stripeStatus: paymentIntent.status,
        invoiceNumber,
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
