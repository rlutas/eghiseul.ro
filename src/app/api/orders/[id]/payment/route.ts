import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent } from '@/lib/stripe'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface OrderWithService {
  id: string
  user_id: string | null
  order_number: number
  total_price: number
  payment_status: string
  stripe_payment_intent: string | null
  created_at: string
  services: { name: string } | null
}

// POST /api/orders/[id]/payment - Create payment intent
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      )
    }

    // Fetch order
    const { data, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, user_id, order_number, total_price, payment_status, stripe_payment_intent, created_at,
        services (
          name
        )
      `)
      .eq('id', id)
      .single()

    const order = data as OrderWithService | null

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'Order not found'
          }
        },
        { status: 404 }
      )
    }

    // Verify user owns this order (or order has no user assigned)
    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this order'
          }
        },
        { status: 403 }
      )
    }

    // Link order to user if not already linked
    if (!order.user_id) {
      await supabase
        .from('orders')
        .update({ user_id: user.id })
        .eq('id', id)
    }

    // Check if already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_PAID',
            message: 'This order has already been paid'
          }
        },
        { status: 400 }
      )
    }

    // Check if payment intent already exists
    if (order.stripe_payment_intent) {
      // Return existing payment intent client secret
      // In production, you'd retrieve the payment intent to get its client secret
      return NextResponse.json({
        success: true,
        data: {
          paymentIntentId: order.stripe_payment_intent,
          message: 'Payment intent already exists'
        }
      })
    }

    // Create new payment intent
    const orderNumber = `ORD-${new Date(order.created_at).getFullYear()}-${String(order.order_number).padStart(7, '0')}`

    const paymentIntent = await createPaymentIntent(
      parseFloat(String(order.total_price)),
      {
        orderId: order.id,
        orderNumber,
        userId: user.id,
        serviceName: order.services?.name || 'Serviciu eGhiseul'
      }
    )

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Failed to create payment intent'
        }
      },
      { status: 500 }
    )
  }
}
