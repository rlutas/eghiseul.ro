/**
 * Courier Localities API
 *
 * GET /api/courier/localities - Get geographic data (counties, cities)
 *
 * Query parameters:
 * - county: Get localities for a specific county
 * - search: Search localities across all counties
 * - limit: Maximum results for search (default: 10)
 * - provider: 'fancourier' to use Fan Courier's nomenclature (recommended for delivery addresses)
 *
 * If no parameters, returns list of counties
 *
 * NOTE: For delivery addresses, use provider=fancourier to ensure AWB compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCounties,
  fetchLocalities,
  searchLocalities,
  findCounty,
  validateAddress,
} from '@/lib/services/infocui';
import { getCourierProvider } from '@/lib/services/courier';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const county = searchParams.get('county');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const validate = searchParams.get('validate') === 'true';
    const city = searchParams.get('city');

    // Validate address if both county and city provided with validate flag
    if (validate && county && city) {
      const street = searchParams.get('street') || undefined;
      const validation = await validateAddress(county, city, street);

      return NextResponse.json({
        success: true,
        data: {
          type: 'validation',
          validation,
        },
      });
    }

    // Search localities across all counties
    if (search) {
      const localities = await searchLocalities(search, Math.min(limit, 50));

      return NextResponse.json({
        success: true,
        data: {
          type: 'search',
          query: search,
          results: localities,
        },
      });
    }

    // Get localities for a specific county
    if (county) {
      const provider = searchParams.get('provider');

      // Use Fan Courier API for delivery addresses (better AWB compatibility)
      // Also fetch postal codes from Sameday (Fan Courier doesn't provide them)
      if (provider === 'fancourier') {
        try {
          const courierProvider = getCourierProvider('fancourier');
          if (!courierProvider.getLocalities) {
            throw new Error('getLocalities not implemented');
          }
          const localities = await courierProvider.getLocalities(county);

          // Try to enrich with postal codes from Sameday
          try {
            const samedayProvider = getCourierProvider('sameday');
            if (samedayProvider.getLocalities) {
              const samedayLocalities = await samedayProvider.getLocalities(county);
              const postalMap = new Map<string, string>();
              for (const loc of samedayLocalities) {
                if (loc.postalCode) {
                  postalMap.set(loc.name.toLowerCase(), loc.postalCode);
                }
              }
              // Merge postal codes into Fan Courier localities
              for (const loc of localities) {
                if (!loc.postalCode) {
                  loc.postalCode = postalMap.get(loc.name.toLowerCase());
                }
              }
            }
          } catch {
            // Sameday postal code enrichment is optional
          }

          // Sort alphabetically
          localities.sort((a, b) => a.name.localeCompare(b.name, 'ro'));

          return NextResponse.json({
            success: true,
            data: {
              type: 'localities',
              county: { code: county, name: county },
              localities,
              source: 'fancourier',
            },
          });
        } catch (error) {
          console.warn('[Localities API] Fan Courier fallback to InfoCUI:', error);
          // Fallback to InfoCUI
        }
      }

      // Default: Use InfoCUI
      const countyObj = findCounty(county);
      if (!countyObj) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_COUNTY',
              message: `County not found: ${county}`,
              suggestions: getCounties()
                .filter((c) => c.name.toLowerCase().includes(county.toLowerCase().slice(0, 3)))
                .slice(0, 5)
                .map((c) => c.name),
            },
          },
          { status: 400 }
        );
      }

      const localities = await fetchLocalities(county);

      return NextResponse.json({
        success: true,
        data: {
          type: 'localities',
          county: countyObj,
          localities,
          source: 'infocui',
        },
      });
    }

    // Return list of all counties
    const counties = getCounties();

    return NextResponse.json({
      success: true,
      data: {
        type: 'counties',
        counties,
        total: counties.length,
      },
    });
  } catch (error) {
    console.error('[Localities API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GEO_ERROR',
          message: 'Failed to fetch geographic data',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courier/localities - Validate address
 *
 * Body:
 * - county: County name or code
 * - city: City/locality name
 * - street: Street name (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { county, city, street } = body;

    if (!county || !city) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'County and city are required',
          },
        },
        { status: 400 }
      );
    }

    const validation = await validateAddress(county, city, street);

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('[Localities API] Validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate address',
        },
      },
      { status: 500 }
    );
  }
}
