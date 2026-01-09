import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/submit
 *
 * Submits a draft order, changing its status to 'pending'.
 * Links the order to the authenticated user if not already linked.
 * Uses admin client to bypass RLS for reliable database operations.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Get user if authenticated (use regular client for auth)
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json().catch(() => ({}));

    // Fetch the order (use admin client to bypass RLS)
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found',
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership or allow guest orders
    if (order.user_id && user && order.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to submit this order',
          },
        },
        { status: 403 }
      );
    }

    // Only allow submitting draft orders
    if (order.status !== 'draft') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Order has already been submitted',
          },
        },
        { status: 400 }
      );
    }

    // Build update object
    // Use 'pending' status (valid in database constraint)
    const updateData: Record<string, unknown> = {
      status: 'pending',
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    };

    // Update user profile with order data (phone, personal info)
    if (user) {
      // Check if profile exists first (use admin client)
      // Cast to any for columns not in generated types (birth_date, birth_place from migration 015)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (adminClient as any)
        .from('profiles')
        .select('id, phone, first_name, last_name, cnp, birth_date, birth_place')
        .eq('id', user.id)
        .single();

      // Extract customer data from order
      const customerData = order.customer_data as {
        contact?: { email?: string; phone?: string };
        personal?: { firstName?: string; lastName?: string; cnp?: string; birthDate?: string; birthPlace?: string };
      } | null;
      const contactData = customerData?.contact || {};
      const personalData = customerData?.personal || {};

      if (!profile) {
        // Create profile from order contact data
        await adminClient.from('profiles').insert({
          id: user.id,
          email: contactData.email || user.email,
          phone: contactData.phone || null,
          first_name: personalData.firstName || null,
          last_name: personalData.lastName || null,
          cnp: personalData.cnp || null,
          birth_date: personalData.birthDate || null,
          birth_place: personalData.birthPlace || null,
        });
      } else {
        // Update profile with any missing data from order
        const profileUpdates: Record<string, unknown> = {};

        // Update phone if missing or empty in profile but present in order
        if ((!profile.phone || profile.phone === '') && contactData.phone) {
          profileUpdates.phone = contactData.phone;
        }
        // Update other fields if missing
        if (!profile.first_name && personalData.firstName) {
          profileUpdates.first_name = personalData.firstName;
        }
        if (!profile.last_name && personalData.lastName) {
          profileUpdates.last_name = personalData.lastName;
        }
        if (!profile.cnp && personalData.cnp) {
          profileUpdates.cnp = personalData.cnp;
        }
        if (!profile.birth_date && personalData.birthDate) {
          profileUpdates.birth_date = personalData.birthDate;
        }
        if (!profile.birth_place && personalData.birthPlace) {
          profileUpdates.birth_place = personalData.birthPlace;
        }

        // Update profile if there are changes
        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString();
          await adminClient
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id);
        }
      }

      // Link order to user if not already linked
      if (!order.user_id) {
        updateData.user_id = user.id;
      }
    }

    // Update total price if provided
    if (body.total_price !== undefined) {
      updateData.total_price = body.total_price;
    }

    // Update the order (use admin client to bypass RLS)
    const { data: updatedOrder, error: updateError } = await adminClient
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Order submit error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to submit order',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: updatedOrder.id,
          friendly_order_id: updatedOrder.friendly_order_id,
          status: updatedOrder.status,
          user_id: updatedOrder.user_id,
          total_price: updatedOrder.total_price,
          updated_at: updatedOrder.updated_at,
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/orders/[id]/submit:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
