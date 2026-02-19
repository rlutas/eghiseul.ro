/**
 * POST /api/cron/update-tracking
 *
 * Cron job endpoint to batch-update tracking status for all active shipments.
 * Runs every 30 minutes via Vercel Cron.
 *
 * Authentication: CRON_SECRET in Authorization header
 *
 * Flow:
 * 1. Query all orders with active shipments (not in final state)
 * 2. For each order, fetch fresh tracking from courier
 * 3. Update cached tracking data in database
 * 4. If status changed to 'delivered', update order status
 * 5. Return summary of updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCourierProvider, CourierCode } from '@/lib/services/courier';
import { isFinalStatus, extractCourierProviderFromDeliveryMethod } from '@/lib/services/courier/utils';

// Active tracking statuses (non-final)
const ACTIVE_TRACKING_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
];

export async function POST(request: NextRequest) {
  try {
    // 1. Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Cron Tracking] CRON_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Query all orders with active shipments
    const { data: orders, error: queryError } = await adminClient
      .from('orders')
      .select(
        'id, delivery_tracking_number, courier_provider, delivery_method, delivery_tracking_status, status'
      )
      .not('delivery_tracking_number', 'is', null)
      .in('delivery_tracking_status', ACTIVE_TRACKING_STATUSES);

    if (queryError) {
      console.error('[Cron Tracking] Query error:', queryError);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No active shipments to update',
          total: 0,
          updated: 0,
          errors: 0,
        },
      });
    }

    console.log(`[Cron Tracking] Processing ${orders.length} active shipments`);

    // 3. Group orders by provider for efficient batch processing
    const ordersByProvider = new Map<CourierCode, typeof orders>();
    for (const order of orders) {
      const deliveryMethod = order.delivery_method as { name?: string } | null;
      const providerCode = (order.courier_provider || extractCourierProviderFromDeliveryMethod(deliveryMethod)) as CourierCode | null;

      if (!providerCode || !order.delivery_tracking_number) continue;

      const existing = ordersByProvider.get(providerCode) || [];
      existing.push(order);
      ordersByProvider.set(providerCode, existing);
    }

    let updated = 0;
    let errors = 0;
    const statusChanges: Array<{
      orderId: string;
      awb: string;
      oldStatus: string;
      newStatus: string;
    }> = [];

    // 4. Process each provider group
    for (const [providerCode, providerOrders] of ordersByProvider) {
      let provider;
      try {
        provider = getCourierProvider(providerCode);
      } catch (error) {
        console.error(`[Cron Tracking] Failed to get provider ${providerCode}:`, error);
        errors += providerOrders.length;
        continue;
      }

      // Process orders individually (or use trackMultiple if available)
      const awbs = providerOrders.map((o) => o.delivery_tracking_number as string);

      try {
        const trackingResults = await provider.trackMultiple(awbs);

        for (let i = 0; i < providerOrders.length; i++) {
          const order = providerOrders[i];
          const tracking = trackingResults[i];

          if (!tracking) {
            errors++;
            continue;
          }

          const now = new Date().toISOString();
          const oldStatus = order.delivery_tracking_status as string;
          const newStatus = tracking.status;

          // Update tracking cache
          const updatePayload: Record<string, unknown> = {
            delivery_tracking_events: tracking.events as unknown as Record<string, unknown>,
            delivery_tracking_status: newStatus,
            delivery_tracking_last_update: now,
          };

          // If tracking URL is available, update it
          if (tracking.trackingUrl) {
            updatePayload.delivery_tracking_url = tracking.trackingUrl;
          }

          // If delivered, update order status
          if (newStatus === 'delivered' && order.status !== 'delivered') {
            updatePayload.status = 'delivered';
            updatePayload.updated_at = now;
          }

          // If returned or cancelled, note in tracking
          if (isFinalStatus(newStatus) && newStatus !== 'delivered') {
            updatePayload.updated_at = now;
          }

          const { error: updateError } = await adminClient
            .from('orders')
            .update(updatePayload)
            .eq('id', order.id);

          if (updateError) {
            console.error(`[Cron Tracking] Update failed for ${order.id}:`, updateError);
            errors++;
            continue;
          }

          updated++;

          // Log status changes
          if (oldStatus !== newStatus) {
            statusChanges.push({
              orderId: order.id,
              awb: order.delivery_tracking_number as string,
              oldStatus,
              newStatus,
            });

            // Add to order history for significant changes
            if (newStatus === 'delivered') {
              await adminClient.from('order_history').insert({
                order_id: order.id,
                event_type: 'status_change',
                notes: tracking.signedBy
                  ? `Coletul a fost livrat (auto-update). Semnat de: ${tracking.signedBy}`
                  : 'Coletul a fost livrat (auto-update)',
                new_value: JSON.stringify({
                  status: 'delivered',
                  previous_status: order.status,
                  tracking_status: newStatus,
                  signed_by: tracking.signedBy,
                  delivered_at: tracking.actualDelivery,
                  source: 'cron',
                }),
              });
            } else if (newStatus === 'returned' || newStatus === 'failed_delivery') {
              await adminClient.from('order_history').insert({
                order_id: order.id,
                event_type: 'tracking_update',
                notes: `Status tracking actualizat: ${oldStatus} -> ${newStatus}`,
                new_value: JSON.stringify({
                  tracking_status: newStatus,
                  previous_tracking_status: oldStatus,
                  source: 'cron',
                }),
              });
            }
          }
        }
      } catch (error) {
        console.error(`[Cron Tracking] Batch tracking failed for ${providerCode}:`, error);
        errors += providerOrders.length;
      }
    }

    const result = {
      message: `Tracking update complete`,
      total: orders.length,
      updated,
      errors,
      statusChanges: statusChanges.length > 0 ? statusChanges : undefined,
    };

    console.log('[Cron Tracking] Result:', JSON.stringify(result));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Cron Tracking] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      { status: 500 }
    );
  }
}

// Also support GET for Vercel Cron (Vercel sends GET requests for crons)
export async function GET(request: NextRequest) {
  return POST(request);
}
