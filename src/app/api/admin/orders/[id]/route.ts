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
        services(id, name, slug, base_price, estimated_days, verification_config)
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

    // Fetch order history / timeline.
    // order_history stores status transitions in old_value/new_value jsonb
    // ({ status: '...' }). Select those (NOT the non-existent from_status/
    // to_status columns — that select silently failed and wiped the whole
    // timeline, so notes + history never rendered) and derive from_status/
    // to_status for the UI below.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawHistory, error: historyError } = await (adminClient as any)
      .from('order_history')
      .select('id, event_type, notes, old_value, new_value, created_at, changed_by')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    if (historyError) {
      console.error('Failed to fetch order history:', historyError.message);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = (rawHistory || []).map((h: any) => ({
      ...h,
      from_status: h.old_value?.status ?? null,
      to_status: h.new_value?.status ?? null,
    }));

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

    // Active "Solicită documente" request — surfaced on the order page so the
    // team always sees what was asked from the customer (and can re-share the
    // link) even after a page refresh.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let reuploadRequest: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: reupload } = await (adminClient as any)
        .from('reupload_requests')
        .select('id, token, document_type, document_types, completed_documents, status, reason, requested_at, token_expires_at')
        .eq('order_id', orderId)
        .in('status', ['pending', 'completed'])
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (reupload) {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
        const expired =
          reupload.status === 'pending' &&
          new Date(reupload.token_expires_at).getTime() < Date.now();
        reuploadRequest = {
          id: reupload.id,
          status: expired ? 'expired' : reupload.status,
          documentTypes:
            Array.isArray(reupload.document_types) && reupload.document_types.length > 0
              ? reupload.document_types
              : [reupload.document_type],
          completedDocuments: Array.isArray(reupload.completed_documents)
            ? reupload.completed_documents
            : [],
          reason: reupload.reason ?? null,
          requestedAt: reupload.requested_at,
          expiresAt: reupload.token_expires_at,
          url: `${base}/reincarca-poza/${reupload.token}`,
        };
      }
    } catch (err) {
      console.error('[admin order] reupload lookup failed (continuing):', err);
    }

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
        reupload_request: reuploadRequest,
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
