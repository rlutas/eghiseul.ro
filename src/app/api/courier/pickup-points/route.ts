/**
 * Courier Pickup Points API
 *
 * GET /api/courier/pickup-points - Get locker/pickup points
 *
 * Query params:
 * - provider: Courier provider code ('fancourier' | 'sameday', default: all)
 * - county: Filter by county (optional)
 * - city: Filter by city (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCourierProvider, getImplementedProviders, CourierCode, ServicePoint } from '@/lib/services/courier';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const county = searchParams.get('county') || '';
    const city = searchParams.get('city') || '';
    const providerCode = searchParams.get('provider') as CourierCode | null;

    // Determine which providers to query
    const providerCodes: CourierCode[] = providerCode
      ? [providerCode]
      : getImplementedProviders().filter((code) => ['fancourier', 'sameday'].includes(code));

    let allPoints: ServicePoint[] = [];

    // Fetch from all requested providers in parallel
    const results = await Promise.all(
      providerCodes.map(async (code) => {
        try {
          const provider = getCourierProvider(code);
          if (!provider.getServicePoints) {
            return [];
          }
          const points = await provider.getServicePoints(city || '*', county || undefined);
          return points;
        } catch (err) {
          console.error(`[Pickup Points] Provider ${code} error:`, err instanceof Error ? err.message : err);
          return [];
        }
      })
    );

    allPoints = results.flat();

    // Additional county filtering if needed
    let filteredPoints = allPoints;
    if (county && !city) {
      const countyLower = county.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      filteredPoints = allPoints.filter((point) => {
        const pointCounty = (point.county || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return pointCounty.includes(countyLower) || countyLower.includes(pointCounty);
      });
    }

    // Sort by city name
    filteredPoints.sort((a, b) => (a.city || '').localeCompare(b.city || ''));

    return NextResponse.json({
      success: true,
      data: filteredPoints,
      meta: {
        total: filteredPoints.length,
        filters: {
          provider: providerCode || 'all',
          county: county || null,
          city: city || null,
        },
      },
    });
  } catch (error) {
    console.error('[Courier Pickup Points API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch pickup points',
        },
      },
      { status: 500 }
    );
  }
}
