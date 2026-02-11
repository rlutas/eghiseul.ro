import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createPaymentIntent } from '@/lib/stripe'

// Service role client for bypassing RLS (for guest orders)
const getServiceClient = () => createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface RouteParams {
  params: Promise<{ id: string }>
}

interface OrderWithService {
  id: string
  user_id: string | null
  order_number: string
  friendly_order_id: string | null
  total_price: number
  payment_status: string
  stripe_payment_intent_id: string | null
  created_at: string
  services: { name: string } | null
  customer_data: {
    contact?: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
    }
    personal?: {
      firstName?: string
      lastName?: string
      cnp?: string
    }
    company?: {
      companyName?: string
      cui?: string
      regCom?: string
    }
    address?: {
      street?: string
      city?: string
      county?: string
      postalCode?: string
      country?: string
    }
    billing?: {
      type?: 'individual' | 'company' | 'persoana_fizica' | 'persoana_juridica'
      source?: 'self' | 'other_pf' | 'company'
      firstName?: string
      lastName?: string
      cnp?: string
      companyName?: string
      cui?: string
      regCom?: string
      address?: string  // Full address string for PF
      companyAddress?: string  // Full address string for PJ
      city?: string
      county?: string
    }
  } | null
}

// POST /api/orders/[id]/payment - Create payment intent
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication (optional - guests can also pay)
    const { data: { user } } = await supabase.auth.getUser()

    // Use service client to bypass RLS for order lookup
    const serviceClient = getServiceClient()

    // Fetch order with customer data
    const { data, error: orderError } = await serviceClient
      .from('orders')
      .select(`
        id, user_id, order_number, friendly_order_id, total_price, payment_status, stripe_payment_intent_id, created_at, customer_data,
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

    // Verify user owns this order (if logged in)
    if (user && order.user_id && order.user_id !== user.id) {
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

    // Link order to user if logged in and not already linked
    if (user && !order.user_id) {
      await serviceClient
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
    if (order.stripe_payment_intent_id) {
      // Return existing payment intent client secret
      // In production, you'd retrieve the payment intent to get its client secret
      return NextResponse.json({
        success: true,
        data: {
          paymentIntentId: order.stripe_payment_intent_id,
          message: 'Payment intent already exists'
        }
      })
    }

    // Create new payment intent
    // Use friendly_order_id directly (e.g., ORD-20260112-EWG22)
    const orderNumber = order.friendly_order_id || order.order_number
    const serviceName = order.services?.name || 'Serviciu eGhiseul'

    // Extract customer data for Stripe
    const customerData = order.customer_data
    const contact = customerData?.contact
    const personal = customerData?.personal
    const company = customerData?.company
    const address = customerData?.address
    const billing = customerData?.billing

    const isCompany = billing?.type === 'company' || billing?.type === 'persoana_juridica' || billing?.source === 'company' || !!company?.cui

    // Build address for Stripe - check address, billing.address (PF), and billing.companyAddress (PJ)
    // Note: billing.address and billing.companyAddress are stored as single strings (full address)
    const billingAddressStr = isCompany ? billing?.companyAddress : billing?.address
    const hasAddressData = address?.street || address?.city || billingAddressStr
    const stripeAddress = hasAddressData ? {
      // Use address.street if available, otherwise use the full billing address string
      line1: address?.street || billingAddressStr || '',
      city: address?.city || '',
      state: address?.county || '',
      postal_code: address?.postalCode || '',
      country: address?.country || 'RO',
    } : undefined

    // Build customer info for Stripe
    const stripeCustomer = contact?.email ? {
      email: contact.email,
      name: isCompany
        ? (company?.companyName || billing?.companyName || '')
        : `${personal?.firstName || contact?.firstName || billing?.firstName || ''} ${personal?.lastName || contact?.lastName || billing?.lastName || ''}`.trim(),
      phone: contact?.phone,
      address: stripeAddress,
      ...(isCompany && {
        companyName: company?.companyName || billing?.companyName,
        cui: company?.cui || billing?.cui,
      }),
      ...(!isCompany && personal?.cnp && { cnp: personal.cnp }),
    } : undefined

    const paymentIntent = await createPaymentIntent(
      parseFloat(String(order.total_price)),
      {
        orderId: order.id,
        orderNumber,
        userId: user?.id || 'guest',
        serviceName,
      },
      {
        description: `${serviceName} - ${orderNumber}`,
        customer: stripeCustomer,
        receiptEmail: contact?.email,
      }
    )

    // Update order with payment intent ID
    await serviceClient
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
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
