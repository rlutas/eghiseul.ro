import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDownloadUrl } from '@/lib/aws/s3';

/**
 * GET /api/upload/download
 *
 * Generate a presigned URL for downloading a file from S3.
 * Returns a temporary URL valid for 15 minutes.
 *
 * Query params:
 * - key: S3 object key
 * - expiresIn: (optional) URL expiry in seconds (default 900)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '900', 10);

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // Check if user is admin (can access all files)
    const adminClient = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (adminClient as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && ['super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee'].includes(profile.role);

    // Validate that the user has access to this file
    if (!isAdmin) {
      const isKycFile = key.startsWith('kyc/');
      const isUserFile = key.includes(`/${user.id}/`);
      const isDocumentFile = key.startsWith('contracts/') || key.startsWith('orders/');

      if (isKycFile && !isUserFile) {
        return NextResponse.json(
          { error: 'Access denied to this file' },
          { status: 403 }
        );
      }

      // For document files (contracts/ or orders/ prefix), verify ownership via order_documents
      if (isDocumentFile && !isUserFile) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: doc } = await (adminClient as any)
          .from('order_documents')
          .select('id, order_id, orders!inner(user_id)')
          .eq('s3_key', key)
          .eq('visible_to_client', true)
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderUserId = (doc?.orders as any)?.user_id;
        if (!doc || orderUserId !== user.id) {
          return NextResponse.json(
            { error: 'Access denied to this file' },
            { status: 403 }
          );
        }
      }
    }

    // Generate presigned download URL
    const url = await getDownloadUrl(key, Math.min(expiresIn, 3600)); // Max 1 hour

    return NextResponse.json({
      success: true,
      data: {
        url,
        expiresIn: Math.min(expiresIn, 3600),
      },
    });
  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
