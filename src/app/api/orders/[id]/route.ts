import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id] - Get order details
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Fetch order with service details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (
          id,
          slug,
          name,
          description,
          category,
          base_price,
          estimated_days,
          config
        )
      `)
      .eq('id', id)
      .single()

    if (error || !order) {
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

    // Check if user owns this order (or is admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    if (order.user_id !== user.id && !isAdmin) {
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

    // Calculate estimated completion
    const createdAt = order.created_at ? new Date(order.created_at) : new Date()
    const estimatedDays = order.services?.estimated_days || 5
    const estimatedCompletion = new Date(createdAt.getTime() + estimatedDays * 24 * 60 * 60 * 1000)

    const transformedOrder = {
      id: order.id,
      orderNumber: `ORD-${createdAt.getFullYear()}-${String(order.order_number).padStart(7, '0')}`,
      userId: order.user_id,
      service: order.services ? {
        id: order.services.id,
        slug: order.services.slug,
        name: order.services.name,
        description: order.services.description,
        category: order.services.category,
        basePrice: parseFloat(String(order.services.base_price))
      } : null,
      status: order.status,
      totalAmount: parseFloat(String(order.total_price)),
      currency: 'RON',
      breakdown: {
        basePrice: order.services ? parseFloat(String(order.services.base_price)) : 0,
        optionsTotal: parseFloat(String(order.total_price)) - (order.services ? parseFloat(String(order.services.base_price)) : 0),
        subtotal: parseFloat(String(order.total_price)),
        tax: 0,
        total: parseFloat(String(order.total_price))
      },
      selectedOptions: order.selected_options || [],
      customerData: order.customer_data,
      deliveryMethod: order.delivery_method,
      deliveryAddress: order.delivery_address,
      paymentStatus: order.payment_status,
      paymentIntentId: order.stripe_payment_intent_id,
      contractUrl: order.contract_url,
      finalDocumentUrl: order.final_document_url,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      estimatedCompletion: estimatedCompletion.toISOString(),
      internalNotes: order.internal_status_notes || null
    }

    return NextResponse.json({
      success: true,
      data: {
        order: transformedOrder
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

// PATCH /api/orders/[id] - Update order (admin only for status)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Admin access required'
          }
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = ['pending', 'processing', 'document_ready', 'delivered', 'completed', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          }
        },
        { status: 400 }
      )
    }

    // Update order
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    if (notes) {
      updateData.admin_notes = notes
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Failed to update order'
          }
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          status: order.status,
          updatedAt: order.updated_at
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
