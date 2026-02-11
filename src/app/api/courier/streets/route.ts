/**
 * Courier Streets API
 *
 * GET /api/courier/streets - Get streets for a locality
 *
 * Query parameters:
 * - county: County name (required)
 * - locality: Locality/city name (required)
 * - provider: 'fancourier' (default)
 *
 * Returns list of streets from Fan Courier nomenclature
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourierProvider } from '@/lib/services/courier';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const county = searchParams.get('county');
    const locality = searchParams.get('locality');
    const provider = searchParams.get('provider') || 'fancourier';

    // Validate required parameters
    if (!county || !locality) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: 'Both county and locality parameters are required',
          },
        },
        { status: 400 }
      );
    }

    // Only fancourier provider is supported for now
    if (provider !== 'fancourier') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_PROVIDER',
            message: 'Only fancourier provider is supported for streets',
          },
        },
        { status: 400 }
      );
    }

    // Get streets from Fan Courier API
    const courierProvider = getCourierProvider('fancourier');

    if (!courierProvider.getStreets) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_IMPLEMENTED',
            message: 'Streets API not available for this provider',
          },
        },
        { status: 501 }
      );
    }

    const streets = await courierProvider.getStreets(county, locality);

    // Filter out streets without names and sort alphabetically
    const validStreets = streets.filter((s) => s.name && s.name.trim());
    validStreets.sort((a, b) => a.name.localeCompare(b.name, 'ro'));

    return NextResponse.json({
      success: true,
      data: {
        type: 'streets',
        county,
        locality,
        streets: validStreets,
        total: validStreets.length,
        source: 'fancourier',
      },
    });
  } catch (error) {
    console.error('[Streets API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STREETS_ERROR',
          message: 'Failed to fetch streets data',
        },
      },
      { status: 500 }
    );
  }
}
