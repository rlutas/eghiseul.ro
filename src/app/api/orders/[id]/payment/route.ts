import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createEmbeddedCheckoutSession } from '@/lib/stripe'
import { buildStripeLineItems, buildPaymentIntentDescription } from '@/lib/stripe-line-items'
import { normalizeOrderOptions } from '@/lib/orders/normalize'

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
  base_price: number | null
  options_price: number | null
  delivery_price: number | null
  // delivery_method is a JSONB column — usually an object
  // `{ method, methodName, price, ... }` but legacy rows may have a plain
  // string. The renderer normalizes both shapes via `getDeliveryLabel()`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delivery_method: any
  coupon_code: string | null
  discount_amount: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected_options: any[] | null
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
        id, user_id, order_number, friendly_order_id, total_price, base_price, options_price, delivery_price, delivery_method, coupon_code, discount_amount, selected_options, payment_status, stripe_payment_intent_id, created_at, customer_data,
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

    // ── Server-side coupon re-validation ──────────────────────────
    // Recompute subtotal from server-stored values (never trust draft total_price blindly)
    // and re-validate the coupon before charging. If invalid, strip it.
    let finalTotalPrice = parseFloat(String(order.total_price))

    if (order.coupon_code) {
      const subtotal =
        parseFloat(String(order.base_price ?? 0)) +
        parseFloat(String(order.options_price ?? 0)) +
        parseFloat(String(order.delivery_price ?? 0))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: couponRow } = await (serviceClient as any)
        .from('coupons')
        .select('*')
        .ilike('code', order.coupon_code.trim())
        .eq('is_active', true)
        .maybeSingle()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coupon = couponRow as any
      const now = new Date()
      const isValid =
        !!coupon &&
        (coupon.max_uses === null || coupon.times_used < coupon.max_uses) &&
        (!coupon.valid_from || new Date(coupon.valid_from) <= now) &&
        (!coupon.valid_until || new Date(coupon.valid_until) >= now) &&
        subtotal >= Number(coupon.min_amount || 0)

      if (isValid) {
        let discount = 0
        if (coupon.discount_type === 'percentage') {
          discount = (subtotal * Number(coupon.discount_value)) / 100
        } else {
          discount = Number(coupon.discount_value)
        }
        discount = Math.min(discount, subtotal)
        discount = Math.round(discount * 100) / 100
        finalTotalPrice = Math.max(0, Math.round((subtotal - discount) * 100) / 100)

        // Persist re-validated amounts (in case the draft stored stale values)
        await serviceClient
          .from('orders')
          .update({
            total_price: finalTotalPrice,
            discount_amount: discount,
          })
          .eq('id', id)
      } else {
        // Coupon became invalid (expired / usage cap reached / min subtotal no longer met).
        // Strip it and charge full subtotal.
        finalTotalPrice = subtotal
        await serviceClient
          .from('orders')
          .update({
            coupon_code: null,
            discount_amount: 0,
            total_price: finalTotalPrice,
          })
          .eq('id', id)
        console.warn(`Coupon ${order.coupon_code} rejected at payment for order ${id}`)
      }
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

    // ── Build per-line metadata + rich description ────────────────
    // Stripe PaymentIntent has no native line_items, but `description` and
    // `metadata` are visible in the dashboard and on receipt emails. We
    // surface each option as `line_<n>_*` metadata keys + a humanized text
    // breakdown in the description so accounting can see them clearly.
    const normalizedOptions = normalizeOrderOptions(order.selected_options)
    const lineMetadata: Record<string, string> = {
      orderId: order.id,
      orderNumber,
      userId: user?.id || 'guest',
      serviceName,
      basePrice: parseFloat(String(order.base_price ?? 0)).toFixed(2),
    }
    let lineIdx = 1
    // Service line
    lineMetadata[`line_${lineIdx}_name`] = serviceName.slice(0, 250)
    lineMetadata[`line_${lineIdx}_price`] = parseFloat(String(order.base_price ?? 0)).toFixed(2)
    lineIdx++
    for (const opt of normalizedOptions) {
      if (lineIdx > 20) break // Stripe metadata cap is 50 keys total — leave headroom
      const safeName = opt.name.slice(0, 250)
      lineMetadata[`line_${lineIdx}_name`] = safeName
      lineMetadata[`line_${lineIdx}_price`] = opt.total.toFixed(2)
      if (opt.code) lineMetadata[`line_${lineIdx}_code`] = opt.code.slice(0, 40)
      lineIdx++
    }
    // `delivery_method` is a JSONB blob — extract a human-readable label
    // (`methodName` for couriers, otherwise the `method` slug, falling back
    // to "Standard" if neither is set or the column is the legacy string).
    const getDeliveryLabel = (dm: unknown): string => {
      if (!dm) return 'Standard'
      if (typeof dm === 'string') return dm
      if (typeof dm === 'object' && dm !== null) {
        const obj = dm as Record<string, unknown>
        return String(obj.methodName ?? obj.method ?? 'Standard')
      }
      return 'Standard'
    }
    const deliveryLabel = getDeliveryLabel(order.delivery_method)
    if (order.delivery_price && order.delivery_price > 0 && lineIdx <= 20) {
      lineMetadata[`line_${lineIdx}_name`] = `Livrare: ${deliveryLabel.slice(0, 200)}`
      lineMetadata[`line_${lineIdx}_price`] = parseFloat(String(order.delivery_price)).toFixed(2)
      lineIdx++
    }
    if (order.coupon_code && order.discount_amount && Number(order.discount_amount) > 0) {
      lineMetadata.couponCode = String(order.coupon_code).slice(0, 40)
      lineMetadata.discountAmount = parseFloat(String(order.discount_amount)).toFixed(2)
    }

    // Build Checkout Session line items + description.
    // The line_items end up in the Stripe Dashboard checkout summary —
    // operators see each addon individually instead of one lump charge.
    const description = buildPaymentIntentDescription({
      serviceName,
      orderNumber,
      options: normalizedOptions.map((o) => ({ name: o.name, total: o.total })),
      deliveryLabel: order.delivery_price && order.delivery_price > 0 ? deliveryLabel : undefined,
      deliveryPriceRon: order.delivery_price ? Number(order.delivery_price) : undefined,
      couponCode: order.coupon_code || undefined,
      discountAmount: order.discount_amount ? Number(order.discount_amount) : undefined,
    })

    const lineItems = buildStripeLineItems({
      serviceName,
      // The Stripe line items represent the GROSS prices (before coupon).
      // The coupon is applied as a Stripe `discounts` entry on the Session
      // so the customer sees "Subtotal − Cupon X = Total" in the embedded
      // checkout, mirroring the order summary.
      basePrice: Number(order.base_price ?? 0),
      options: normalizedOptions.map((o) => ({
        name: o.name,
        code: o.code,
        total: o.total,
        optionId: o.optionId,
      })),
      delivery: order.delivery_price && order.delivery_price > 0
        ? { label: deliveryLabel, priceRon: Number(order.delivery_price) }
        : null,
    })

    // Origin for return_url — has to be absolute. Falls back to localhost
    // for dev when NEXT_PUBLIC_APP_URL isn't set.
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createEmbeddedCheckoutSession({
      customer: stripeCustomer,
      receiptEmail: contact?.email,
      description,
      lineItems,
      sessionMetadata: {
        orderId: order.id,
        orderNumber,
        userId: user?.id || 'guest',
      },
      paymentIntentMetadata: lineMetadata,
      returnUrl: `${origin}/comanda/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      ...(order.coupon_code && order.discount_amount && Number(order.discount_amount) > 0
        ? {
            couponDiscount: {
              code: order.coupon_code,
              amountRon: Number(order.discount_amount),
            },
          }
        : {}),
    })

    // Flag the order as sandbox/test when the Stripe key is a test key.
    // Used by the admin list to hide synthetic / dev orders from the live
    // operational view (chips: Ascunse / Doar test / Toate).
    const isTestKey = !!process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
    if (isTestKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (serviceClient as any)
        .from('orders')
        .update({ is_test: true })
        .eq('id', id)
    }

    // Stash the session id so the webhook + Modify flow can correlate.
    // The PaymentIntent id will be filled in by the webhook on
    // `checkout.session.completed`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (serviceClient as any)
      .from('orders')
      .update({
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      data: {
        // Embedded Checkout uses the session's client_secret, not the
        // PaymentIntent's. The frontend swaps from <Elements> to
        // <EmbeddedCheckoutProvider> on the back of this.
        sessionId: session.id,
        clientSecret: session.client_secret,
        amount: Math.round(finalTotalPrice * 100),
        currency: 'ron',
      },
    })
  } catch (error) {
    // Log enough detail (Stripe error fields) for ops to diagnose without
    // leaking internals to the client. The customer just sees the generic
    // PAYMENT_ERROR — dev gets a debug field for quick triage.
    const err = error as Error & { type?: string; code?: string; statusCode?: number; raw?: unknown }
    console.error('Payment intent creation error:', {
      message: err.message,
      type: err.type,
      code: err.code,
      statusCode: err.statusCode,
      raw: err.raw,
    })
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Failed to create payment intent',
          ...(process.env.NODE_ENV !== 'production' && {
            debug: { message: err.message, type: err.type, code: err.code },
          }),
        }
      },
      { status: 500 }
    )
  }
}
