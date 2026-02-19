/**
 * POST /api/admin/orders/[id]/cancel-awb
 *
 * Admin endpoint to cancel an AWB (shipping label) for an order.
 * Calls the courier provider to cancel the shipment and clears
 * tracking data from the order.
 *
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { getCourierProvider, CourierCode } from '@/lib/services/courier';
import { extractCourierProviderFromDeliveryMethod } from '@/lib/services/courier/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Read optional reason from body
    let reason = '';
    try {
      const body = await request.json();
      reason = body.reason || '';
    } catch {
      // Body is optional
    }

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
      .select('id, delivery_tracking_number, courier_provider, delivery_method, status, friendly_order_id')
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
        { success: false, error: { code: 'NO_AWB', message: 'No AWB to cancel for this order' } },
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

    // 4. Cancel shipment with courier
    let cancelled = false;
    let cancelError = '';
    try {
      const provider = getCourierProvider(providerCode);
      cancelled = await provider.cancelShipment(awb);
    } catch (error) {
      cancelError = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Cancel AWB] Courier cancellation failed for ${awb}:`, error);
    }

    if (!cancelled) {
      // Still clear tracking data even if courier cancel fails
      // The shipment may already be picked up or the API may be unreachable
      console.warn(`[Cancel AWB] Courier cancel returned false for ${awb}, clearing tracking data anyway`);
    }

    // 5. Clear AWB fields on order and revert status
    const previousStatus = order.status;
    const { error: updateError } = await adminClient
      .from('orders')
      .update({
        delivery_tracking_number: null,
        delivery_tracking_url: null,
        delivery_tracking_events: null,
        delivery_tracking_status: null,
        delivery_tracking_last_update: null,
        status: 'document_ready', // Revert to pre-shipped status
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Cancel AWB] Failed to update order:', updateError);
      return NextResponse.json(
        { success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update order after cancellation' } },
        { status: 500 }
      );
    }

    // 6. Log to order history
    await adminClient.from('order_history').insert({
      order_id: id,
      event_type: 'awb_cancelled',
      notes: [
        `AWB anulat: ${awb} (${providerCode})`,
        reason ? `Motiv: ${reason}` : '',
        !cancelled ? `Nota: Anulare curier esuata${cancelError ? ` - ${cancelError}` : ''}, date tracking sterse din sistem` : '',
      ]
        .filter(Boolean)
        .join('. '),
      changed_by: user.id,
      new_value: JSON.stringify({
        awb,
        provider: providerCode,
        courier_cancelled: cancelled,
        cancel_error: cancelError || undefined,
        previous_status: previousStatus,
        new_status: 'document_ready',
        reason: reason || undefined,
      }),
    });

    return NextResponse.json({
      success: true,
      data: {
        awb,
        courierCancelled: cancelled,
        cancelWarning: !cancelled
          ? 'Courier cancellation failed or was not confirmed. Tracking data has been cleared from the order. You may need to manually cancel with the courier.'
          : undefined,
        orderStatus: 'document_ready',
      },
    });
  } catch (error) {
    console.error('[Cancel AWB] Error:', error);
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
