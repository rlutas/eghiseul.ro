import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Calculate business days (skip weekends)
function addBusinessDays(startDate: Date, days: number): Date {
  const result = new Date(startDate)

  // Start from next business day
  result.setDate(result.getDate() + 1)
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1)
  }

  // Add business days
  let addedDays = 0
  while (addedDays < days) {
    result.setDate(result.getDate() + 1)
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }

  return result
}

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

    // Fetch order history for timeline
    const { data: history } = await supabase
      .from('order_history')
      .select('id, event_type, notes, new_value, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    // Calculate estimated completion using business days
    const createdAt = order.created_at ? new Date(order.created_at) : new Date()
    const baseServiceDays = order.services?.estimated_days || 5

    // Check if order has urgent processing option
    const hasUrgent = (order.selected_options as Array<{ option_name?: string }> || [])
      .some(opt => opt.option_name?.toLowerCase().includes('urgent'))

    // Urgent reduces processing time, but add buffer for safety
    const processingDays = hasUrgent ? Math.max(2, Math.ceil(baseServiceDays / 2)) : baseServiceDays
    const bufferDays = 2 // Add 2 days buffer for safety
    const totalBusinessDays = processingDays + bufferDays

    // Calculate estimated completion with business days only
    const estimatedCompletion = addBusinessDays(createdAt, totalBusinessDays)

    // Use friendly_order_id from DB if available, otherwise construct from order_number
    const displayOrderNumber = order.friendly_order_id ||
      `ORD-${createdAt.getFullYear()}-${String(order.order_number).padStart(7, '0')}`

    const transformedOrder = {
      id: order.id,
      orderNumber: displayOrderNumber,
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

    // Build timeline from history - extract status from new_value when available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const timeline = (history || []).map((h: any) => {
      const newValue = h.new_value as { status?: string; payment_status?: string } | null

      // Determine status to show based on event type
      let status = newValue?.status || h.event_type
      if (h.event_type === 'payment_confirmed') {
        status = 'payment_confirmed'
      } else if (h.event_type === 'order_created' || h.event_type === 'draft_created') {
        status = 'order_created'
      }

      return {
        id: h.id,
        status,
        event: h.event_type,
        note: h.notes,
        createdAt: h.created_at,
      }
    })

    // Add initial order creation if not in timeline
    if (timeline.length === 0 || !timeline.find(t => t.event === 'order_created' || t.event === 'draft_created')) {
      timeline.unshift({
        id: 'initial',
        status: 'order_created',
        event: 'order_created',
        note: 'Comanda a fost plasată',
        createdAt: order.created_at,
      })
    }

    // Add payment confirmed if paid but not in timeline
    if (order.payment_status === 'paid' && !timeline.find(t => t.event === 'payment_confirmed')) {
      const insertIndex = timeline.findIndex(t => t.event !== 'order_created' && t.event !== 'draft_created')
      const paymentEvent = {
        id: 'payment',
        status: 'payment_confirmed',
        event: 'payment_confirmed',
        note: 'Plata a fost confirmată',
        createdAt: order.updated_at || order.created_at,
      }
      if (insertIndex === -1) {
        timeline.push(paymentEvent)
      } else {
        timeline.splice(insertIndex, 0, paymentEvent)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: transformedOrder,
        timeline
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
