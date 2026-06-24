import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getDownloadUrl } from '@/lib/aws/s3';

/**
 * GET /api/admin/orders/[id] - Get full order details by UUID (for admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Check permission
    try {
      await requirePermission(user.id, 'orders.view');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const adminClient = createAdminClient();

    // Fetch full order with service join
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error: orderError } = await (adminClient as any)
      .from('orders')
      .select(`
        *,
        services(id, name, slug, base_price, estimated_days)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // Fetch the customer's ACCOUNT profile (registered user vs guest).
    // null user_id = guest checkout; set = has an eGhișeul account.
    let account: {
      id: string; email: string | null; firstName: string | null;
      lastName: string | null; phone: string | null; kycVerified: boolean;
    } | null = null;
    if (order.user_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (adminClient as any)
        .from('profiles')
        .select('id, email, first_name, last_name, phone, kyc_verified')
        .eq('id', order.user_id)
        .maybeSingle();
      if (profile) {
        account = {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          kycVerified: !!profile.kyc_verified,
        };
      }
    }

    // Fetch order history / timeline
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: history } = await (adminClient as any)
      .from('order_history')
      .select('id, event_type, notes, new_value, created_at, changed_by, from_status, to_status')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    // Fetch order documents (contracts, cereri, documents received, etc.)
    // Order by created_at DESC so the latest version of each type comes first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents } = await (adminClient as any)
      .from('order_documents')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    // Fetch order option statuses (extras: traducere, apostila, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: optionStatuses } = await (adminClient as any)
      .from('order_option_status')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    // Generate presigned URL for client signature if stored in S3
    let signatureUrl: string | undefined;
    const cd = order.customer_data as Record<string, unknown> | null;
    if (cd?.signature_s3_key) {
      try {
        signatureUrl = await getDownloadUrl(cd.signature_s3_key as string, 3600);
      } catch {
        // Signature not available from S3
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        account,
        timeline: history || [],
        documents: documents || [],
        option_statuses: optionStatuses || [],
        ...(signatureUrl ? { signature_url: signatureUrl } : {}),
      },
    });
  } catch (error) {
    console.error('Admin order detail error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal error' } },
      { status: 500 }
    );
  }
}
