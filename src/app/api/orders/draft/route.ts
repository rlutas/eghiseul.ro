import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { generateOrderId, validateOrderId } from '@/lib/order-id';

// Validation schema for draft order
const draftOrderSchema = z.object({
  friendly_order_id: z.string().optional(),
  service_id: z.string().uuid(),
  current_step: z.string().optional(),
  customer_data: z.object({
    contact: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      preferredContact: z.string().optional(),
    }).optional(),
    personal: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      cnp: z.string().optional(),
      idCardSeries: z.string().optional(),
      idCardNumber: z.string().optional(),
      birthDate: z.string().optional(),
      address: z.any().optional(),
    }).optional(),
  }).optional(),
  selected_options: z.array(z.any()).optional(),
  kyc_documents: z.any().optional(),
  delivery_method: z.any().optional(),
  delivery_address: z.any().optional(),
  signature: z.string().optional(),
  base_price: z.number().optional(),
  options_price: z.number().optional(),
  delivery_price: z.number().optional(),
  total_price: z.number().optional(),
});

/**
 * POST /api/orders/draft - Create a new draft order
 *
 * Creates a draft order with a unique friendly_order_id
 * Works for both authenticated and guest users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user if authenticated (optional for drafts)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse and validate request body
    const body = await request.json();
    const validation = draftOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid draft data',
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate friendly order ID
    const friendlyOrderId = data.friendly_order_id || generateOrderId();

    // Validate the friendly order ID format
    if (data.friendly_order_id && !validateOrderId(data.friendly_order_id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ORDER_ID',
            message: 'Invalid order ID format',
          },
        },
        { status: 400 }
      );
    }

    // Create the draft order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: 'DRAFT', // Will be replaced when finalized
        friendly_order_id: friendlyOrderId,
        user_id: user?.id || null,
        service_id: data.service_id,
        status: 'draft',
        customer_data: data.customer_data || {},
        selected_options: data.selected_options || [],
        kyc_documents: data.kyc_documents || {},
        delivery_method: data.delivery_method || null,
        delivery_address: data.delivery_address || null,
        base_price: data.base_price || 0,
        options_price: data.options_price || 0,
        delivery_price: data.delivery_price || 0,
        total_price: data.total_price || 0,
        payment_status: 'unpaid',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Draft creation error:', orderError);

      // Handle unique constraint violation (duplicate friendly_order_id)
      if (orderError.code === '23505') {
        // Retry with a new ID
        const newFriendlyOrderId = generateOrderId();
        const { data: retryOrder, error: retryError } = await supabase
          .from('orders')
          .insert({
            order_number: 'DRAFT',
            friendly_order_id: newFriendlyOrderId,
            user_id: user?.id || null,
            service_id: data.service_id,
            status: 'draft',
            customer_data: data.customer_data || {},
            selected_options: data.selected_options || [],
            kyc_documents: data.kyc_documents || {},
            delivery_method: data.delivery_method || null,
            delivery_address: data.delivery_address || null,
            base_price: data.base_price || 0,
            options_price: data.options_price || 0,
            delivery_price: data.delivery_price || 0,
            total_price: data.total_price || 0,
            payment_status: 'unpaid',
          })
          .select()
          .single();

        if (retryError) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'DATABASE_ERROR',
                message: 'Failed to create draft order',
              },
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            data: {
              order: {
                id: retryOrder.id,
                friendly_order_id: retryOrder.friendly_order_id,
                status: retryOrder.status,
                current_step: data.current_step || 'contact',
                last_saved_at: retryOrder.updated_at,
              },
            },
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create draft order',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          order: {
            id: order.id,
            friendly_order_id: order.friendly_order_id,
            status: order.status,
            current_step: data.current_step || 'contact',
            last_saved_at: order.updated_at,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/draft - Update an existing draft order
 *
 * Updates a draft order by ID
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json();

    if (!body.id && !body.friendly_order_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'Order ID or friendly_order_id required',
          },
        },
        { status: 400 }
      );
    }

    // Build query to find the order
    let query = supabase.from('orders').select('*');

    if (body.id) {
      query = query.eq('id', body.id);
    } else if (body.friendly_order_id) {
      query = query.eq('friendly_order_id', body.friendly_order_id);
    }

    const { data: existingOrder, error: findError } = await query.single();

    if (findError || !existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft order not found',
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership for authenticated users
    if (user && existingOrder.user_id && existingOrder.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this order',
          },
        },
        { status: 403 }
      );
    }

    // Only allow updating draft orders
    if (existingOrder.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Can only update draft orders',
          },
        },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.customer_data !== undefined) {
      updateData.customer_data = body.customer_data;
    }
    if (body.selected_options !== undefined) {
      updateData.selected_options = body.selected_options;
    }
    if (body.kyc_documents !== undefined) {
      updateData.kyc_documents = body.kyc_documents;
    }
    if (body.delivery_method !== undefined) {
      updateData.delivery_method = body.delivery_method;
    }
    if (body.delivery_address !== undefined) {
      updateData.delivery_address = body.delivery_address;
    }
    if (body.base_price !== undefined) {
      updateData.base_price = body.base_price;
    }
    if (body.options_price !== undefined) {
      updateData.options_price = body.options_price;
    }
    if (body.delivery_price !== undefined) {
      updateData.delivery_price = body.delivery_price;
    }
    if (body.total_price !== undefined) {
      updateData.total_price = body.total_price;
    }

    // Associate with user if they're now authenticated
    if (user && !existingOrder.user_id) {
      updateData.user_id = user.id;
    }

    // Update the order
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', existingOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error('Draft update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update draft order',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          friendly_order_id: order.friendly_order_id,
          status: order.status,
          current_step: body.current_step || 'contact',
          last_saved_at: order.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/draft - Get draft order by friendly_order_id
 *
 * Query params:
 * - id: friendly_order_id (e.g., ORD-20251218-A3B2C)
 * - email: email for guest verification
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const friendlyOrderId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!friendlyOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_ID',
            message: 'Order ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        service:services (
          id,
          slug,
          name,
          base_price,
          currency
        )
      `)
      .eq('friendly_order_id', friendlyOrderId)
      .eq('status', 'draft')
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Draft order not found',
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    // Cast customer_data to expected shape for type checking
    const customerData = order.customer_data as { contact?: { email?: string } } | null;
    const isOwner =
      (user && order.user_id === user.id) ||
      (email && customerData?.contact?.email === email) ||
      (!order.user_id && !customerData?.contact?.email);

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this order',
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          friendly_order_id: order.friendly_order_id,
          service: order.service,
          status: order.status,
          customer_data: order.customer_data,
          selected_options: order.selected_options,
          kyc_documents: order.kyc_documents,
          delivery_method: order.delivery_method,
          delivery_address: order.delivery_address,
          base_price: order.base_price,
          options_price: order.options_price,
          delivery_price: order.delivery_price,
          total_price: order.total_price,
          created_at: order.created_at,
          last_saved_at: order.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
