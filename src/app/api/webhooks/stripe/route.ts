import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { ensureInvoiceForPaidOrder } from '@/lib/oblio'
import { ensureOnrcJobForPaidOrder } from '@/lib/onrc/ensure-onrc-job'
import { computeEstimatedCompletionISO } from '@/lib/delivery-estimate-helper'

// Use service role for webhook handler (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  // Verify webhook signature. In production, both the secret and the header are mandatory.
  // In development, the secret can be omitted to allow testing without `stripe listen`.
  // Recommended dev setup: stripe listen --forward-to localhost:3000/api/webhooks/stripe
  let event: Stripe.Event

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction && !webhookSecret) {
    console.error('Webhook fatal: STRIPE_WEBHOOK_SECRET is not set in production')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 400 }
    )
  }

  if (isProduction && !signature) {
    console.error('Webhook rejected: missing stripe-signature header in production')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  if (webhookSecret) {
    // When the secret is configured, signature is mandatory (in every environment)
    if (!signature) {
      console.error('Webhook rejected: missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }
  } else {
    // Dev-only bypass: secret is unset and we are not in production (guard at line 25 enforces this).
    // Still require a stripe-signature header so that unsigned probes cannot hit our handler.
    // For local work, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
    // (the CLI signs each event using a test key).
    if (!signature) {
      console.warn('[WEBHOOK SECURITY] Dev bypass active but no stripe-signature header — rejecting')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }
    console.warn('[WEBHOOK SECURITY] Running without signature verification — dev only')
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch (err) {
      console.error('Failed to parse webhook body:', err)
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        // Embedded Checkout fires this when payment succeeds — same business
        // effect as payment_intent.succeeded (which still fires too but we
        // handle the session first since it carries the order linkage).
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent)
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(charge)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Embedded Checkout fires `checkout.session.completed` BEFORE the
// `payment_intent.succeeded` event lands. We stash the PaymentIntent id +
// orderId back on the order row so the subsequent PI webhook can correlate.
// The actual order-fulfilled work (invoice, status flip, etc.) is still
// done by handlePaymentSucceeded because that path is already idempotent.
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('[stripe webhook] checkout.session.completed without orderId metadata')
    return
  }
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

  if (paymentIntentId) {
    await supabaseAdmin
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq('id', orderId)
  }

  // If the session is already in "complete" payment_status, run the full
  // fulfilment path now (don't wait for the PI event — saves a few seconds
  // and prevents the order sitting in `paid_pending` if PI webhook is slow).
  if (session.payment_status === 'paid' && paymentIntentId) {
    const stripe = (await import('stripe')).default
    const client = new stripe(process.env.STRIPE_SECRET_KEY!)
    const pi = await client.paymentIntents.retrieve(paymentIntentId)
    // Carry orderId forward via metadata so handlePaymentSucceeded finds it.
    if (!pi.metadata?.orderId) {
      pi.metadata = { ...(pi.metadata || {}), orderId }
    }
    await handlePaymentSucceeded(pi)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  // 1. Fetch full order data for invoice (with service name + estimate fields)
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*, services(name, estimated_days, urgent_days, urgent_available, lawyer_fee_ron)')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    console.error('Failed to fetch order for invoice:', fetchError)
    throw fetchError || new Error('Order not found')
  }

  // Check idempotency - don't process if already paid
  if (order.payment_status === 'paid' && order.invoice_number) {
    console.log(`Order ${orderId} already processed, skipping`)
    return
  }

  // Compute estimated completion date using the holiday/cutoff-aware calculator.
  // Anchored to "now" (payment success time) since paid_at is set here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = (order as any).services as {
    estimated_days?: number | null
    urgent_days?: number | null
    urgent_available?: boolean | null
  } | null
  const estimatedCompletionISO = computeEstimatedCompletionISO({
    placedAt: new Date(),
    serviceDays: svc?.estimated_days ?? null,
    urgentDays: svc?.urgent_days ?? null,
    urgentAvailable: svc?.urgent_available ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedOptions: ((order as any).selected_options as Array<Record<string, unknown>> | null) ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deliveryMethod: (order as any).delivery_method ?? null,
  })

  // 2. Update order status to paid
  const paidAtNow = new Date().toISOString()
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      updated_at: paidAtNow,
      ...(estimatedCompletionISO ? { estimated_completion_date: estimatedCompletionISO } : {}),
    })
    .eq('id', orderId)

  if (updateError) {
    console.error('Failed to update order after payment:', updateError)
    throw updateError
  }

  console.log(`Order ${orderId} marked as paid and processing`)

  // 2b. Increment coupon usage if one was applied.
  // Idempotency is provided by the early return on line 135 (checks invoice_number):
  // coupon increment only runs when invoice_number is null (i.e. first-time payment webhook).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const couponCode = (order as any).coupon_code as string | null
  if (couponCode) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: coupon } = await (supabaseAdmin as any)
        .from('coupons')
        .select('id, times_used')
        .ilike('code', couponCode.trim())
        .maybeSingle()
      if (coupon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('coupons')
          .update({ times_used: (coupon.times_used || 0) + 1 })
          .eq('id', coupon.id)
        console.log(`Incremented usage for coupon ${couponCode} (order ${orderId})`)
      }
    } catch (couponErr) {
      // Don't fail the payment flow if coupon tracking fails
      console.error('Failed to increment coupon usage:', couponErr)
    }
  }

  // 3. Create Oblio invoice via the shared chokepoint.
  //
  // The helper holds an atomic claim against duplicate invoices: Stripe fires
  // both checkout.session.completed and payment_intent.succeeded for the same
  // payment ~1-2s apart, and both reach here before either writes
  // invoice_number (the Oblio call takes ~1.5s). Only the lock winner creates
  // the invoice; on failure the lock self-heals so confirm-payment / the cron
  // backfill can retry. The SAME helper is used by confirm-payment so an order
  // confirmed via the Hosted-Checkout fallback also gets an invoice.
  // (Fixes E-260610-ZHGXB duplicate + E-260610-NMU25 missing invoice.)
  const result = await ensureInvoiceForPaidOrder(orderId, 'Card', {
    historyNote: undefined, // helper writes its own "Factură emisă automat: …"
  })
  if (result.status === 'failed') {
    console.error(`Order ${orderId}: invoice creation failed:`, result.error)
  } else if (result.status === 'locked') {
    console.log(`Order ${orderId}: invoice already created or being created by another webhook — skipping`)
  }

  // 4. Queue ONRC automation job (idempotent; no-op for non-ONRC services).
  await ensureOnrcJobForPaidOrder(orderId)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  // Log the failure but don't change order status
  // User might retry payment
  console.log(`Payment failed for order ${orderId}: ${paymentIntent.last_payment_error?.message}`)
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string
  if (!paymentIntentId) return

  // Find order by payment intent ID
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!order) {
    console.error('Order not found for refunded charge')
    return
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id)

  if (error) {
    console.error('Failed to update order after refund:', error)
    throw error
  }

  console.log(`Order ${order.id} marked as refunded`)
}
