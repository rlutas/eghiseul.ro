/**
 * Company Validation API
 *
 * GET /api/company/validate?cui=12345678
 *
 * Validates a Romanian CUI (Cod Unic de Identificare) and returns company data.
 * Uses InfoCUI.ro API for real data, falls back to mock data in development.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCompanyData, validateCUIFormat } from '@/lib/services/infocui';

export const dynamic = 'force-dynamic';

/**
 * GET /api/company/validate
 *
 * Query Parameters:
 * - cui: The CUI to validate (required)
 *
 * Returns:
 * - 200: Company data found
 * - 400: Invalid CUI format
 * - 404: CUI not found in database
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cui = searchParams.get('cui');

    // Validate input
    if (!cui) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CUI',
            message: 'CUI-ul este obligatoriu',
          },
        },
        { status: 400 }
      );
    }

    // Validate CUI format
    const validation = validateCUIFormat(cui);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CUI',
            message: validation.error || 'CUI invalid',
          },
        },
        { status: 400 }
      );
    }

    // Fetch company data
    const result = await fetchCompanyData(validation.cleanCUI);

    if (!result.found || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: result.error || 'CUI inexistent în baza de date',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        cui: result.data.cui,
        name: result.data.name,
        type: result.data.type,
        registrationNumber: result.data.registrationNumber,
        address: result.data.address,
        status: result.data.status,
        isActive: result.data.isActive,
        vatPayer: result.data.vatPayer,
        establishedDate: result.data.establishedDate,
      },
    });

  } catch (error) {
    console.error('[API] Company validation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Eroare internă la validarea CUI',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
