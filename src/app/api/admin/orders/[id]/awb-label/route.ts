/**
 * GET /api/admin/orders/[id]/awb-label
 *
 * Admin endpoint to download the AWB shipping label PDF.
 * Supports both Fan Courier (URL-based label) and Sameday (redirect to PDF link).
 *
 * Query params:
 * - format: 'pdf' | 'html' | 'zpl' (default: 'pdf', only for Fan Courier)
 *
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getCourierProvider, CourierCode } from '@/lib/services/courier';
import { FanCourierProvider } from '@/lib/services/courier/fancourier';
import { extractCourierProviderFromDeliveryMethod } from '@/lib/services/courier/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // 1. Verify admin authentication
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
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    // 2. Fetch order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, delivery_tracking_number, courier_provider, delivery_method, friendly_order_id')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // 3. Check AWB exists
    const awb = order.delivery_tracking_number as string | null;
    if (!awb) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_AWB', message: 'No AWB generated for this order' } },
        { status: 400 }
      );
    }

    // Determine courier provider
    const deliveryMethod = order.delivery_method as { name?: string } | null;
    const providerCode = (order.courier_provider || extractCourierProviderFromDeliveryMethod(deliveryMethod)) as CourierCode;

    if (!providerCode) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_PROVIDER', message: 'Could not determine courier provider' } },
        { status: 400 }
      );
    }

    // 4. Get label based on provider
    const format = (request.nextUrl.searchParams.get('format') || 'pdf') as 'pdf' | 'html' | 'zpl';

    if (providerCode === 'fancourier') {
      // Fan Courier: getAwbLabel returns a URL with embedded token
      const provider = getCourierProvider('fancourier') as FanCourierProvider;
      const labelUrl = await provider.getAwbLabel([awb], format);

      // Fetch the label and stream it back
      try {
        const response = await fetch(labelUrl);

        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'LABEL_FETCH_FAILED', message: `Failed to fetch label: ${response.status}` },
            },
            { status: 502 }
          );
        }

        const contentType = format === 'pdf'
          ? 'application/pdf'
          : format === 'zpl'
            ? 'application/octet-stream'
            : 'text/html';

        const extension = format === 'pdf' ? 'pdf' : format === 'zpl' ? 'zpl' : 'html';
        const filename = `AWB-${awb}.${extension}`;

        const body = await response.arrayBuffer();

        return new NextResponse(body, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache',
          },
        });
      } catch (fetchError) {
        console.error('[AWB Label] Failed to fetch Fan Courier label:', fetchError);
        // Fallback: return the URL for the client to open directly
        return NextResponse.json({
          success: true,
          data: {
            type: 'url',
            url: labelUrl,
            awb,
            provider: providerCode,
          },
        });
      }
    } else if (providerCode === 'sameday') {
      // Sameday: use the /api/awb/download/{awb}/pdf endpoint
      try {
        const provider = getCourierProvider('sameday');
        // Ensure authenticated to get token
        const auth = await provider.authenticate();

        const apiUrl = process.env.SAMEDAY_USE_DEMO === 'true'
          ? 'https://sameday-api.demo.zitec.com'
          : 'https://api.sameday.ro';

        const pdfUrl = `${apiUrl}/api/awb/download/${awb}/pdf`;

        const response = await fetch(pdfUrl, {
          headers: {
            'X-AUTH-TOKEN': auth.token,
          },
        });

        if (!response.ok) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'LABEL_FETCH_FAILED', message: `Failed to fetch Sameday label: ${response.status}` },
            },
            { status: 502 }
          );
        }

        const body = await response.arrayBuffer();
        const filename = `AWB-${awb}.pdf`;

        return new NextResponse(body, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Cache-Control': 'no-cache',
          },
        });
      } catch (error) {
        console.error('[AWB Label] Failed to fetch Sameday label:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'LABEL_ERROR',
              message: error instanceof Error ? error.message : 'Failed to get Sameday label',
            },
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'UNSUPPORTED_PROVIDER', message: `Label download not supported for ${providerCode}` } },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[AWB Label] Error:', error);
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
