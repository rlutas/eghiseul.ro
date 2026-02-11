/**
 * Courier Track API
 *
 * GET /api/courier/track - Track a shipment by AWB
 *
 * Query parameters:
 * - awb: AWB number (required)
 * - provider: Courier provider code (optional, will try to detect)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCourierProvider,
  getTrackingUrl,
  CourierCode,
  COURIER_PROVIDERS,
} from '@/lib/services/courier';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const awb = searchParams.get('awb');
    const provider = searchParams.get('provider') as CourierCode | null;

    if (!awb) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_AWB',
            message: 'AWB number is required',
          },
        },
        { status: 400 }
      );
    }

    // Determine provider if not specified
    let providerCode = provider;

    if (!providerCode) {
      // Try to detect provider from AWB format
      // Fan Courier AWBs are typically numeric
      // Sameday AWBs start with specific prefixes
      // DHL AWBs are 10-digit numeric
      if (/^\d{10,}$/.test(awb)) {
        // Could be Fan Courier or DHL
        providerCode = 'fancourier'; // Default to Fan Courier for domestic
      } else if (awb.startsWith('SD')) {
        providerCode = 'sameday';
      } else if (/^\d{10}$/.test(awb)) {
        providerCode = 'dhl';
      } else {
        // Default to Fan Courier
        providerCode = 'fancourier';
      }
    }

    // Get the courier provider
    let courierProvider;
    try {
      courierProvider = getCourierProvider(providerCode);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROVIDER',
            message: error instanceof Error ? error.message : 'Invalid courier provider',
          },
        },
        { status: 400 }
      );
    }

    // Track the shipment
    const tracking = await courierProvider.trackShipment(awb);

    // Get tracking URL
    const trackingUrl = getTrackingUrl(providerCode, awb);
    const providerInfo = COURIER_PROVIDERS[providerCode];

    return NextResponse.json({
      success: true,
      data: {
        awb: tracking.awb,
        provider: {
          code: providerCode,
          name: providerInfo?.name || providerCode,
          logo: providerInfo?.logo,
        },
        status: tracking.status,
        statusDescription: tracking.statusDescription,
        estimatedDelivery: tracking.estimatedDelivery,
        actualDelivery: tracking.actualDelivery,
        signedBy: tracking.signedBy,
        events: tracking.events,
        lastUpdate: tracking.lastUpdate,
        trackingUrl,
      },
    });
  } catch (error) {
    console.error('[Courier Track API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRACKING_ERROR',
          message: error instanceof Error ? error.message : 'Failed to track shipment',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courier/track - Track multiple AWBs
 *
 * Body:
 * - awbs: Array of AWB numbers
 * - provider: Courier provider code (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { awbs, provider } = body;

    if (!awbs || !Array.isArray(awbs) || awbs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_AWBS',
            message: 'Array of AWB numbers is required',
          },
        },
        { status: 400 }
      );
    }

    // Limit to prevent abuse
    if (awbs.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_AWBS',
            message: 'Maximum 50 AWBs per request',
          },
        },
        { status: 400 }
      );
    }

    const providerCode = (provider || 'fancourier') as CourierCode;

    // Get the courier provider
    let courierProvider;
    try {
      courierProvider = getCourierProvider(providerCode);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PROVIDER',
            message: error instanceof Error ? error.message : 'Invalid courier provider',
          },
        },
        { status: 400 }
      );
    }

    // Track all shipments
    const results = await courierProvider.trackMultiple(awbs);

    return NextResponse.json({
      success: true,
      data: {
        provider: providerCode,
        results: results.map((tracking) => ({
          awb: tracking.awb,
          status: tracking.status,
          statusDescription: tracking.statusDescription,
          lastUpdate: tracking.lastUpdate,
          events: tracking.events.slice(0, 3), // Return only last 3 events for bulk
        })),
      },
    });
  } catch (error) {
    console.error('[Courier Track API] Bulk error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRACKING_ERROR',
          message: 'Failed to track shipments',
        },
      },
      { status: 500 }
    );
  }
}
