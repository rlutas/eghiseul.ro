import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const adminClient = createAdminClient()

    // Check authentication (optional — guests can access their orders by UUID)
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch order with service details (use admin client to bypass RLS for guest orders)
    const { data: order, error } = await adminClient
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
          urgent_days,
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

    // Access control:
    // - Authenticated user must own the order (or be admin)
    // - Guest (no auth) can access orders without user_id (guest orders)
    //   or orders linked to no user yet (the UUID acts as a bearer token)
    if (user) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const isAdmin = profile?.role === 'admin'
      if (order.user_id && order.user_id !== user.id && !isAdmin) {
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
    } else {
      // No auth: allow access to guest orders (no user_id) or
      // orders pending payment (checkout flow — UUID acts as bearer token)
      const checkoutStatuses = ['pending', 'draft']
      if (order.user_id && !checkoutStatuses.includes(order.status as string)) {
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
    }

    // Fetch client-visible documents from order_documents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents } = await (adminClient as any)
      .from('order_documents')
      .select('id, type, file_name, file_size, mime_type, document_number, created_at')
      .eq('order_id', order.id)
      .eq('visible_to_client', true)
      .order('created_at', { ascending: true })

    // Fetch order history for timeline
    const { data: history } = await supabase
      .from('order_history')
      .select('id, event_type, notes, new_value, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    // Calculate estimated completion using business days
    const createdAt = order.created_at ? new Date(order.created_at) : new Date()
    const baseServiceDays = order.services?.estimated_days || 5

    // Check if order has urgent processing option (wizard stores as optionName, legacy as option_name)
    const hasUrgent = (order.selected_options as Array<{ option_name?: string; optionName?: string }> || [])
      .some(opt => (opt.optionName || opt.option_name || '').toLowerCase().includes('urgent'))

    // Use service's urgent_days if available, otherwise halve the normal days
    const urgentDays = order.services?.urgent_days
    const processingDays = hasUrgent
      ? (urgentDays || Math.max(2, Math.ceil(baseServiceDays / 2)))
      : baseServiceDays
    const bufferDays = 2 // Add 2 days buffer for safety
    const totalBusinessDays = processingDays + bufferDays

    // Calculate estimated completion with business days only
    const estimatedCompletion = addBusinessDays(createdAt, totalBusinessDays)

    // Use friendly_order_id from DB if available, otherwise construct from order_number
    const displayOrderNumber = order.friendly_order_id ||
      `ORD-${createdAt.getFullYear()}-${String(order.order_number).padStart(7, '0')}`

    // VAT rate is 21%, included in the total price
    const VAT_RATE = 0.21
    const totalAmount = parseFloat(String(order.total_price))
    const basePrice = order.services ? parseFloat(String(order.services.base_price)) : 0
    const optionsPrice = parseFloat(String(order.options_price || 0))
    const deliveryPrice = parseFloat(String(order.delivery_price || 0))
    // Prices are VAT-inclusive: subtotal = total / (1 + VAT_RATE)
    const subtotalWithoutVat = Math.round((totalAmount / (1 + VAT_RATE)) * 100) / 100
    const vatAmount = Math.round((totalAmount - subtotalWithoutVat) * 100) / 100

    // Prefer the persisted estimated_completion_date (computed with the
    // holiday/cutoff-aware calculator at submission/payment time). Fall back
    // to the legacy on-the-fly calculation for orders created before the
    // migration.
    const persistedEstimate = order.estimated_completion_date
      ? new Date(order.estimated_completion_date).toISOString()
      : null

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
        basePrice: parseFloat(String(order.services.base_price)),
        estimatedDays: order.services.estimated_days,
        urgentDays: order.services.urgent_days,
      } : null,
      status: order.status,
      totalAmount,
      currency: 'RON',
      breakdown: {
        basePrice,
        optionsPrice,
        deliveryPrice,
        subtotalWithoutVat,
        vatAmount,
        vatRate: VAT_RATE,
        total: totalAmount,
      },
      selectedOptions: order.selected_options || [],
      customerData: order.customer_data,
      deliveryMethod: order.delivery_method,
      deliveryAddress: order.delivery_address,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      paymentIntentId: order.stripe_payment_intent_id,
      deliveryTrackingNumber: order.delivery_tracking_number || null,
      contractUrl: order.contract_url,
      finalDocumentUrl: order.final_document_url,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      estimatedCompletion: persistedEstimate ?? estimatedCompletion.toISOString(),
      estimatedCompletionDate: persistedEstimate,
      processingDays,
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

    // Transform documents for client display
    const DOC_TYPE_LABELS: Record<string, string> = {
      contract_complet: 'Contract',
      contract_prestari: 'Contract Prestări Servicii',
      contract_asistenta: 'Contract Asistență Juridică',
      imputernicire: 'Împuternicire',
      cerere_eliberare_pf: 'Cerere Eliberare PF',
      cerere_eliberare_pj: 'Cerere Eliberare PJ',
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientDocuments = (documents || []).map((doc: any) => ({
      id: doc.id,
      type: doc.type,
      label: DOC_TYPE_LABELS[doc.type] || doc.type,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      documentNumber: doc.document_number,
      createdAt: doc.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: {
        order: transformedOrder,
        timeline,
        documents: clientDocuments,
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
