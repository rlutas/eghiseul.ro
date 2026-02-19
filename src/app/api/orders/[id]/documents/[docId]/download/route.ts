import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDownloadUrl } from '@/lib/aws/s3';

interface RouteParams {
  params: Promise<{ id: string; docId: string }>;
}

/**
 * GET /api/orders/[id]/documents/[docId]/download
 *
 * Generates a presigned S3 download URL for a client-visible order document.
 * Requires authentication and order ownership.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId, docId } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch the document and verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: doc, error } = await (adminClient as any)
      .from('order_documents')
      .select('id, s3_key, file_name, order_id, visible_to_client')
      .eq('id', docId)
      .eq('order_id', orderId)
      .eq('visible_to_client', true)
      .single();

    if (error || !doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Verify the user owns the order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order } = await (adminClient as any)
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate presigned download URL (15 minutes)
    const url = await getDownloadUrl(doc.s3_key, 900);

    return NextResponse.json({
      success: true,
      data: {
        url,
        fileName: doc.file_name,
        expiresIn: 900,
      },
    });
  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
