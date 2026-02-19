/**
 * GET /api/orders/[id]/tracking
 *
 * Public/authenticated endpoint to get tracking info for an order.
 *
 * Access control:
 * - Authenticated user must own the order (or be admin)
 * - Guest access allowed for orders without user_id, but requires email verification
 *   (query parameter: ?email=customer@example.com)
 *
 * Caching:
 * - If cached tracking data exists and is less than 30 minutes old, returns cached data
 * - Otherwise, fetches fresh tracking from courier API and caches in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCourierProvider, CourierCode } from '@/lib/services/courier';
import { isFinalStatus, extractCourierProviderFromDeliveryMethod } from '@/lib/services/courier/utils';
import type { TrackingInfo, TrackingStatus } from '@/lib/services/courier/types';
import type { Json } from '@/types/supabase';

// Cache TTL: 30 minutes
const TRACKING_CACHE_TTL_MS = 30 * 60 * 1000;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Fetch order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select(
        'id, user_id, status, delivery_tracking_number, delivery_tracking_url, delivery_tracking_events, delivery_tracking_status, delivery_tracking_last_update, courier_provider, delivery_method, customer_data'
      )
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    // 3. Access control
    if (user) {
      // Authenticated user: must own the order or be admin
      if (order.user_id && order.user_id !== user.id) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || !['admin', 'employee'].includes(profile.role as string)) {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this order' } },
            { status: 403 }
          );
        }
      }
    } else {
      // Guest: require email verification to prevent unauthorized tracking
      if (order.user_id) {
        // Order belongs to a user - authentication required
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
          { status: 401 }
        );
      }

      // Guest order - verify email parameter matches order email
      const guestEmail = request.nextUrl.searchParams.get('email');
      if (!guestEmail) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Email verification required for guest tracking' } },
          { status: 401 }
        );
      }

      // Extract email from customer_data
      const customerData = order.customer_data as { contact?: { email?: string }; email?: string } | null;
      const orderEmail = customerData?.contact?.email || customerData?.email;

      if (!orderEmail || orderEmail.toLowerCase() !== guestEmail.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Email does not match order' } },
          { status: 401 }
        );
      }
    }

    // 4. No AWB yet
    const awb = order.delivery_tracking_number as string | null;
    if (!awb) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'pending' as TrackingStatus,
          statusDescription: 'AWB-ul nu a fost inca generat',
          message: 'Comanda este in curs de procesare. Vei primi un numar de tracking cand coletul va fi expediat.',
          awb: null,
          events: [],
          trackingUrl: null,
        },
      });
    }

    // 5. Check cache
    const cachedEvents = order.delivery_tracking_events;
    const lastUpdate = order.delivery_tracking_last_update
      ? new Date(order.delivery_tracking_last_update as string)
      : null;

    const cacheAge = lastUpdate ? Date.now() - lastUpdate.getTime() : Infinity;
    const cachedStatus = order.delivery_tracking_status as TrackingStatus | null;

    // Return cached data if fresh enough (or if status is final - no need to re-fetch)
    if (
      cachedEvents &&
      lastUpdate &&
      (cacheAge < TRACKING_CACHE_TTL_MS || (cachedStatus && isFinalStatus(cachedStatus)))
    ) {
      return NextResponse.json({
        success: true,
        data: {
          status: cachedStatus || 'unknown',
          statusDescription: getStatusDescription(cachedStatus),
          awb,
          events: cachedEvents,
          trackingUrl: order.delivery_tracking_url || null,
          lastUpdate: lastUpdate.toISOString(),
          cached: true,
        },
      });
    }

    // 6. Fetch fresh tracking data from courier
    const deliveryMethod = order.delivery_method as { name?: string } | null;
    const providerCode = (order.courier_provider || extractCourierProviderFromDeliveryMethod(deliveryMethod)) as CourierCode | null;

    if (!providerCode) {
      // Can't determine provider - return what we have
      return NextResponse.json({
        success: true,
        data: {
          status: cachedStatus || 'pending',
          statusDescription: getStatusDescription(cachedStatus),
          awb,
          events: cachedEvents || [],
          trackingUrl: order.delivery_tracking_url || null,
          lastUpdate: lastUpdate?.toISOString() || null,
          cached: !!cachedEvents,
        },
      });
    }

    let trackingInfo: TrackingInfo;
    try {
      const provider = getCourierProvider(providerCode);
      trackingInfo = await provider.trackShipment(awb);
    } catch (error) {
      console.error('[Tracking] Courier tracking failed:', error);
      // Return cached data on failure
      return NextResponse.json({
        success: true,
        data: {
          status: cachedStatus || 'unknown',
          statusDescription: getStatusDescription(cachedStatus),
          awb,
          events: cachedEvents || [],
          trackingUrl: order.delivery_tracking_url || null,
          lastUpdate: lastUpdate?.toISOString() || null,
          cached: !!cachedEvents,
          fetchError: 'Could not refresh tracking data from courier',
        },
      });
    }

    // 7. Update cache in database
    const now = new Date().toISOString();
    await adminClient
      .from('orders')
      .update({
        delivery_tracking_events: trackingInfo.events as unknown as Json,
        delivery_tracking_status: trackingInfo.status,
        delivery_tracking_last_update: now,
        // Update tracking URL if provider returned one
        ...(trackingInfo.trackingUrl ? { delivery_tracking_url: trackingInfo.trackingUrl } : {}),
        // If delivered, update order status
        ...(trackingInfo.status === 'delivered' ? { status: 'delivered' } : {}),
      })
      .eq('id', id);

    // If status changed to delivered, log to order history
    if (trackingInfo.status === 'delivered' && cachedStatus !== 'delivered') {
      await adminClient.from('order_history').insert({
        order_id: id,
        event_type: 'status_change',
        notes: trackingInfo.signedBy
          ? `Coletul a fost livrat. Semnat de: ${trackingInfo.signedBy}`
          : 'Coletul a fost livrat',
        new_value: JSON.stringify({
          status: 'delivered',
          previous_status: order.status,
          tracking_status: trackingInfo.status,
          signed_by: trackingInfo.signedBy,
          delivered_at: trackingInfo.actualDelivery,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: trackingInfo.status,
        statusDescription: trackingInfo.statusDescription || getStatusDescription(trackingInfo.status),
        awb,
        events: trackingInfo.events,
        trackingUrl: trackingInfo.trackingUrl || order.delivery_tracking_url || null,
        lastUpdate: now,
        cached: false,
        signedBy: trackingInfo.signedBy,
        actualDelivery: trackingInfo.actualDelivery,
      },
    });
  } catch (error) {
    console.error('[Tracking] Error:', error);
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

function getStatusDescription(status: TrackingStatus | string | null): string {
  const descriptions: Record<string, string> = {
    pending: 'In asteptare - coletul va fi preluat de curier',
    picked_up: 'Preluat de curier',
    in_transit: 'In tranzit catre destinatie',
    out_for_delivery: 'In curs de livrare',
    delivered: 'Livrat',
    failed_delivery: 'Livrare esuata',
    returned: 'Returnat la expeditor',
    cancelled: 'Anulat',
    unknown: 'Status necunoscut',
  };
  return descriptions[status || 'unknown'] || 'Status necunoscut';
}
