import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

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

  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)

  if (error) {
    console.error('Failed to update order after payment:', error)
    throw error
  }

  console.log(`Order ${orderId} marked as paid and processing`)
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
    .eq('stripe_payment_intent', paymentIntentId)
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
