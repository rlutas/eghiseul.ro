import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for creating an order
const createOrderSchema = z.object({
  serviceId: z.string().uuid(),
  selectedOptions: z.array(z.object({
    optionId: z.string().uuid(),
    value: z.string()
  })).optional(),
  customerData: z.object({
    fullName: z.string().min(2),
    cnp: z.string().regex(/^[1-9]\d{12}$/, 'CNP invalid').optional(),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      county: z.string().min(2),
      postalCode: z.string().min(5)
    }).optional()
  }),
  deliveryMethod: z.enum(['email', 'registered_mail', 'courier']).optional(),
  additionalNotes: z.string().max(1000).optional()
})

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
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

    // Parse and validate request body
    const body = await request.json()
    const validation = createOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid order data',
            details: validation.error.flatten().fieldErrors
          }
        },
        { status: 400 }
      )
    }

    const { serviceId, selectedOptions, customerData, deliveryMethod, additionalNotes } = validation.data

    // Fetch service to verify it exists and is active
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVICE_NOT_FOUND',
            message: 'Service not found or inactive'
          }
        },
        { status: 404 }
      )
    }

    // Calculate total price
    let totalPrice = parseFloat(String(service.base_price))
    const processedOptions: Array<{ optionId: string; name: string; value: string; price: number }> = []

    if (selectedOptions && selectedOptions.length > 0) {
      // Fetch selected options
      const optionIds = selectedOptions.map(o => o.optionId)
      const { data: options } = await supabase
        .from('service_options')
        .select('*')
        .in('id', optionIds)
        .eq('service_id', serviceId)

      if (options) {
        for (const selectedOpt of selectedOptions) {
          const option = options.find(o => o.id === selectedOpt.optionId)
          if (option) {
            const priceModifier = parseFloat(String(option.price_modifier))
            totalPrice += priceModifier
            processedOptions.push({
              optionId: option.id,
              name: option.name,
              value: selectedOpt.value,
              price: priceModifier
            })
          }
        }
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        service_id: serviceId,
        status: 'pending',
        customer_data: customerData,
        options: processedOptions,
        delivery_method: deliveryMethod,
        delivery_address: customerData.address || null,
        total_price: totalPrice,
        payment_status: 'unpaid'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create order'
          }
        },
        { status: 500 }
      )
    }

    // Format order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(order.order_number).padStart(7, '0')}`

    return NextResponse.json(
      {
        success: true,
        data: {
          order: {
            id: order.id,
            orderNumber,
            userId: order.user_id,
            serviceId: order.service_id,
            serviceName: service.name,
            status: order.status,
            totalAmount: totalPrice,
            currency: 'RON',
            breakdown: {
              basePrice: parseFloat(String(service.base_price)),
              optionsTotal: totalPrice - parseFloat(String(service.base_price)),
              subtotal: totalPrice,
              tax: 0,
              total: totalPrice
            },
            selectedOptions: processedOptions,
            customerData: order.customer_data,
            deliveryMethod: order.delivery_method,
            additionalNotes,
            paymentStatus: order.payment_status,
            paymentIntentId: order.stripe_payment_intent,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            estimatedCompletion: new Date(
              Date.now() + (service.estimated_days || 5) * 24 * 60 * 60 * 1000
            ).toISOString()
          }
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
}

// GET /api/orders - List user orders
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate status if provided
    type OrderStatus = 'pending' | 'processing' | 'document_ready' | 'delivered' | 'completed' | 'rejected'
    const validStatuses: OrderStatus[] = ['pending', 'processing', 'document_ready', 'delivered', 'completed', 'rejected']
    const status = statusParam && validStatuses.includes(statusParam as OrderStatus)
      ? statusParam as OrderStatus
      : null

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        services (
          id,
          slug,
          name,
          category
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch orders'
          }
        },
        { status: 500 }
      )
    }

    // Transform orders
    const transformedOrders = orders?.map(order => ({
      id: order.id,
      orderNumber: `ORD-${new Date(order.created_at).getFullYear()}-${String(order.order_number).padStart(7, '0')}`,
      service: order.services ? {
        id: order.services.id,
        slug: order.services.slug,
        name: order.services.name,
        category: order.services.category
      } : null,
      status: order.status,
      totalAmount: parseFloat(String(order.total_price)),
      currency: 'RON',
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (offset + limit) < (count || 0)
        }
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      },
      { status: 500 }
    )
  }
}
