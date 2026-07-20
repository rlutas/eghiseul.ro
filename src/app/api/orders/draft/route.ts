import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateOrderId, validateOrderId } from '@/lib/order-id';

// Draft order data interface (minimal validation, flexible structure)
interface DraftOrderData {
  id?: string;
  friendly_order_id?: string;
  service_id: string;
  current_step?: string;
  customer_data?: Record<string, unknown>;
  selected_options?: unknown[];
  kyc_documents?: unknown;
  delivery_method?: unknown;
  delivery_address?: unknown;
  signature?: string | null;
  base_price?: number;
  options_price?: number;
  delivery_price?: number;
  total_price?: number;
  coupon_code?: string | null;
  discount_amount?: number;
}

/** True when a value carries no actual data (recursively): null/''/[]/{} of empties. */
function isEmptyDeep(v: unknown): boolean {
  if (v == null || v === '') return true;
  if (Array.isArray(v)) return v.every(isEmptyDeep);
  if (typeof v === 'object') return Object.values(v as Record<string, unknown>).every(isEmptyDeep);
  return false; // numbers/booleans count as data
}

/**
 * Merge incoming customer_data over the stored one WITHOUT letting an empty
 * client section wipe a non-empty server section. Root cause of incident
 * E-260710-2S5EH (2026-07-10): a resume session whose local state had an empty
 * `property` autosaved and destroyed the property data of a draft the customer
 * then paid for. Sections the client genuinely edited are non-empty, so they
 * still overwrite; only "empty over non-empty" is refused.
 */
function mergeCustomerData(
  existing: Record<string, unknown> | null,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  const base = existing ?? {};
  const merged: Record<string, unknown> = { ...base };
  for (const [key, val] of Object.entries(incoming)) {
    if (isEmptyDeep(val) && !isEmptyDeep(base[key])) continue;
    merged[key] = val;
  }
  return merged;
}

/**
 * Ownership gate shared by the POST-upsert and PATCH paths.
 * Rules (guest cross-device resume stays possible via matching email):
 *  - session user owns the order → allowed
 *  - unclaimed (guest) draft → allowed only when the draft has no email yet,
 *    or the request/session email matches the stored contact email
 *  - anything else → denied
 */
function canUpdateDraft(
  user: { id: string; email?: string } | null,
  order: { user_id: string | null; customer_data: unknown },
  requestEmail: string | undefined
): boolean {
  const existingEmail = (
    (order.customer_data as { contact?: { email?: string } } | null)?.contact?.email || ''
  ).toLowerCase() || undefined;
  const sessionEmail = user?.email?.toLowerCase();

  if (user && order.user_id === user.id) return true;
  if (order.user_id && order.user_id !== (user?.id ?? null)) return false;
  if (!order.user_id) {
    if (!existingEmail) return true; // first contact entry on a fresh draft
    return existingEmail === requestEmail || existingEmail === sessionEmail;
  }
  return false;
}

// Simple validation function
function validateDraftData(data: unknown): { valid: boolean; data?: DraftOrderData; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const obj = data as Record<string, unknown>;

  // Only service_id is required
  if (!obj.service_id || typeof obj.service_id !== 'string') {
    return { valid: false, error: 'service_id is required and must be a string' };
  }

  // UUID format check for service_id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(obj.service_id)) {
    return { valid: false, error: 'service_id must be a valid UUID' };
  }

  return { valid: true, data: obj as unknown as DraftOrderData };
}

/**
 * POST /api/orders/draft - Create a new draft order
 *
 * Creates a draft order with a unique friendly_order_id
 * Works for both authenticated and guest users
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get user if authenticated (optional for drafts)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateDraftData(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error || 'Invalid draft data',
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

    // Check if order with this friendly_order_id already exists (to prevent duplicates)
    // Use admin client to bypass RLS for guest orders
    if (data.friendly_order_id) {
      const { data: existingOrder } = await adminClient
        .from('orders')
        .select('id, friendly_order_id, status, user_id, customer_data')
        .eq('friendly_order_id', data.friendly_order_id)
        .single();

      if (existingOrder) {
        // Order already exists - check if it's still a draft
        if (existingOrder.status !== 'draft') {
          // Order is no longer a draft - can't update via draft endpoint
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

        // SECURITY: this upsert branch previously updated ANY draft known by
        // friendly_order_id with zero ownership checks (the id sits in resume
        // URLs) — same gate as PATCH now applies.
        const postRequestEmail = (
          (data.customer_data as { contact?: { email?: string } } | undefined)?.contact?.email || ''
        ).toLowerCase() || undefined;
        if (!canUpdateDraft(user, existingOrder, postRequestEmail)) {
          console.warn(`Draft POST-update denied for order ${existingOrder.friendly_order_id}`);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'Nu ai permisiunea să modifici această comandă',
              },
            },
            { status: 403 }
          );
        }

        // Order is a draft - update it instead of creating duplicate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePayload: any = {
          customer_data: mergeCustomerData(
            existingOrder.customer_data as Record<string, unknown> | null,
            (data.customer_data as Record<string, unknown>) || {}
          ),
          selected_options: data.selected_options || [],
          kyc_documents: data.kyc_documents || {},
          delivery_method: data.delivery_method || null,
          delivery_address: data.delivery_address || null,
          base_price: data.base_price || 0,
          options_price: data.options_price || 0,
          delivery_price: data.delivery_price || 0,
          total_price: data.total_price || 0,
          coupon_code: data.coupon_code ?? null,
          discount_amount: data.discount_amount || 0,
          updated_at: new Date().toISOString(),
        };
        const { data: updatedOrder, error: updateError } = await adminClient
          .from('orders')
          .update(updatePayload)
          .eq('id', existingOrder.id)
          .select()
          .single();

        if (updateError) {
          console.error('Draft update error (on POST):', updateError);
          console.error('Draft update error details (on POST):', JSON.stringify(updateError, null, 2));
          console.error('Update payload was:', JSON.stringify(updatePayload, null, 2));
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'DATABASE_ERROR',
                message: 'Failed to update draft order',
                details: updateError.message || updateError.code || 'Unknown database error',
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
                id: updatedOrder.id,
                friendly_order_id: updatedOrder.friendly_order_id,
                status: updatedOrder.status,
                current_step: data.current_step || 'contact',
                last_saved_at: updatedOrder.updated_at,
              },
            },
          },
          { status: 200 } // 200 for update, not 201
        );
      }
    }

    // Create the draft order (only if it doesn't exist)
    // Use friendly_order_id as order_number for drafts (unique)

    // Prepare insert data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: any = {
      order_number: friendlyOrderId, // Use friendly ID as order_number for uniqueness
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
      coupon_code: data.coupon_code ?? null,
      discount_amount: data.discount_amount || 0,
      payment_status: 'unpaid',
    };

    // Atribuire — scrisă DOAR aici, la creare. Update-urile ulterioare ale
    // draftului nu o ating: pe parcursul completării, `last` din client s-ar
    // putea schimba (client care revine din altă sursă) și am pierde canalul
    // care a generat efectiv comanda.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attribution = (body as any)?.attribution;
    if (attribution && typeof attribution === 'object') {
      insertData.attribution = attribution;
    }

    console.log('Attempting to insert draft order with data:', JSON.stringify(insertData, null, 2));

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .insert(insertData)
      .select()
      .single();

    if (orderError) {
      console.error('Draft creation error:', orderError);

      // Handle missing column error (migration not applied yet)
      if (orderError.message?.includes('friendly_order_id') || orderError.code === '42703') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MIGRATION_REQUIRED',
              message: 'Database migration required. Please run migration 008_friendly_order_id.sql',
            },
          },
          { status: 500 }
        );
      }

      // Handle unique constraint violation (duplicate friendly_order_id)
      if (orderError.code === '23505') {
        // Retry with a new ID
        const newFriendlyOrderId = generateOrderId();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const retryInsertData: any = {
          order_number: newFriendlyOrderId, // Use new friendly ID as order_number
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
          // Aceeași atribuire ca pe calea principală — altfel comenzile care
          // trec prin retry (coliziune de ID) ar rămâne fără sursă.
          ...(attribution && typeof attribution === 'object' ? { attribution } : {}),
        };
        const { data: retryOrder, error: retryError } = await adminClient
          .from('orders')
          .insert(retryInsertData)
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
    console.error('Unexpected error in POST /api/orders/draft:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error instanceof Error ? { name: error.name, stack: error.stack } : undefined,
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
    const adminClient = createAdminClient();

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

    // Build query to find the order (use admin client to bypass RLS)
    let query = adminClient.from('orders').select('*');

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

    // SECURITY: Verify ownership for ALL orders (not just authenticated users)
    const existingCustomerData = existingOrder.customer_data as { contact?: { email?: string } } | null;
    const existingEmail = existingCustomerData?.contact?.email?.toLowerCase();
    const requestEmail = (body.customer_data?.contact?.email as string)?.toLowerCase();

    // Incident E-260710-2S5EH: a logged-in session could previously claim and
    // overwrite ANY unclaimed guest draft. Now a claim requires the stored
    // contact email to match the session/request email (same rule as guests).
    const canUpdate = canUpdateDraft(user, existingOrder, requestEmail);
    if (!canUpdate) {
      console.warn(`Draft update denied for order ${existingOrder.friendly_order_id}`);
    }

    if (!canUpdate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Nu ai permisiunea să modifici această comandă',
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
      // Never let an empty client section wipe a non-empty stored one.
      updateData.customer_data = mergeCustomerData(
        existingOrder.customer_data as Record<string, unknown> | null,
        body.customer_data as Record<string, unknown>
      );
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
    if (body.coupon_code !== undefined) {
      updateData.coupon_code = body.coupon_code;
    }
    if (body.discount_amount !== undefined) {
      updateData.discount_amount = body.discount_amount;
    }

    // Associate with user only when their identity matches the draft's contact
    // email (a guest who created the draft then logged in). A foreign logged-in
    // session must never silently claim someone else's guest order.
    if (user && !existingOrder.user_id) {
      const sessionEmail = user.email?.toLowerCase();
      if (!existingEmail || existingEmail === sessionEmail) {
        updateData.user_id = user.id;
      }
    }

    // Update the order (use admin client to bypass RLS)
    const { data: order, error: updateError } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', existingOrder.id)
      .select()
      .single();

    if (updateError) {
      console.error('Draft update error:', updateError);
      console.error('Draft update error details:', JSON.stringify(updateError, null, 2));
      console.error('Update data was:', JSON.stringify(updateData, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update draft order',
            details: updateError.message || updateError.code || 'Unknown database error',
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
    console.error('Unexpected error in PATCH /api/orders/draft:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error instanceof Error ? { name: error.name, stack: error.stack } : undefined,
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
    const adminClient = createAdminClient();

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

    // Fetch the order (use admin client to bypass RLS for guest orders)
    const { data: order, error: orderError } = await adminClient
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

    // Verify ownership - SECURITY: Must verify identity for all orders
    // Cast customer_data to expected shape for type checking
    const customerData = order.customer_data as { contact?: { email?: string } } | null;
    const orderEmail = customerData?.contact?.email?.toLowerCase();

    // Ownership rules:
    // 1. Authenticated user owns their orders (user_id matches)
    // 2. Guest with email can access orders with matching email
    // 3. Orders without email require the request to include a matching email
    //    (prevents IDOR attack where anyone can access orders by guessing ID)

    let isOwner = false;

    if (user && order.user_id === user.id) {
      // Authenticated user accessing their own order
      isOwner = true;
    } else if (!order.user_id && orderEmail && email && email.toLowerCase() === orderEmail) {
      // Guest accessing an UNCLAIMED order with matching email. Once a draft
      // belongs to an account (user_id set), the email URL param alone must not
      // expose it — only the owning session may read it.
      isOwner = true;
    } else if (!order.user_id && !orderEmail) {
      // Order has no owner info - this is a fresh draft
      // SECURITY: Deny access unless this is the original session
      // The client should store order ID locally and handle recreation
      // Returning 403 prevents IDOR attacks
      console.warn(`Draft access denied: order ${order.friendly_order_id} has no ownership info`);
      isOwner = false;
    }

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Email requis pentru a accesa comanda. Verifică datele și încearcă din nou.',
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
    console.error('Unexpected error in GET /api/orders/draft:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error instanceof Error ? { name: error.name, stack: error.stack } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
