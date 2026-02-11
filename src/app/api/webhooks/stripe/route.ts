import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { createInvoiceFromOrder } from '@/lib/oblio'

// Use service role for webhook handler (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  // If webhook secret is configured, verify signature
  let event: Stripe.Event

  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }
  } else {
    // In development without webhook secret, parse event directly
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

  // 1. Fetch full order data for invoice (with service name)
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*, services(name)')
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

  // 2. Update order status to paid
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (updateError) {
    console.error('Failed to update order after payment:', updateError)
    throw updateError
  }

  console.log(`Order ${orderId} marked as paid and processing`)

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
      notes: `Card payment confirmed. Invoice: ${invoice.invoiceNumber}`,
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
      notes: 'Card payment confirmed. Invoice creation failed - manual action required.',
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
