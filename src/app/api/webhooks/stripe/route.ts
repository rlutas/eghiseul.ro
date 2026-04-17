import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { createInvoiceFromOrder } from '@/lib/oblio'
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

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId
  if (!orderId) {
    console.error('No orderId in payment intent metadata')
    return
  }

  // 1. Fetch full order data for invoice (with service name + estimate fields)
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*, services(name, estimated_days, urgent_days, urgent_available)')
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

  // 3. Create Oblio invoice
  try {
    // Get service name from joined relation
    const serviceName = (order.services as { name: string } | null)?.name || 'Serviciu eGhiseul';

    const invoice = await createInvoiceFromOrder(
      {
        id: order.id,
        order_number: order.order_number ?? undefined,
        friendly_order_id: order.friendly_order_id ?? undefined,
        service_name: serviceName,
        base_price: order.base_price ?? undefined,
        total_price: order.total_price,
        selected_options: order.selected_options as Array<{ code?: string; name: string; price: number }> | undefined,
        delivery_method: order.delivery_method ?? undefined,
        delivery_price: order.delivery_price ?? undefined,
        customer_data: order.customer_data as Record<string, unknown> | undefined,
      },
      'Card'
    )

    // 4. Update order with invoice info
    const { error: invoiceUpdateError } = await supabaseAdmin
      .from('orders')
      .update({
        invoice_number: invoice.invoiceNumber,
        invoice_url: invoice.pdfUrl,
        invoice_issued_at: invoice.createdAt,
      })
      .eq('id', orderId)

    if (invoiceUpdateError) {
      console.error('Failed to store invoice info:', invoiceUpdateError)
      // Don't throw - order is paid, invoice can be created manually
    } else {
      console.log(`Invoice ${invoice.invoiceNumber} created for order ${orderId}`)
    }

    // 5. Add to order history
    await supabaseAdmin.from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_confirmed',
      notes: `Plata cu cardul confirmata. Factura: ${invoice.invoiceNumber}`,
      new_value: JSON.stringify({
        payment_status: 'paid',
        invoice_number: invoice.invoiceNumber,
        stripe_payment_intent: paymentIntent.id,
      }),
    })
  } catch (invoiceError) {
    // Log error but don't fail - payment is confirmed
    console.error('Failed to create Oblio invoice:', invoiceError)

    // Still add to order history
    await supabaseAdmin.from('order_history').insert({
      order_id: orderId,
      event_type: 'payment_confirmed',
      notes: 'Plata cu cardul confirmata. Crearea facturii a esuat - actiune manuala necesara.',
      new_value: JSON.stringify({
        payment_status: 'paid',
        stripe_payment_intent: paymentIntent.id,
        invoice_error: invoiceError instanceof Error ? invoiceError.message : 'Unknown error',
      }),
    })
  }
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
