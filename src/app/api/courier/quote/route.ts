/**
 * Courier Quote API
 *
 * GET /api/courier/quote - Get shipping quotes for a route
 *
 * Query parameters:
 * - senderCounty: Sender county (required)
 * - senderCity: Sender city (required)
 * - recipientCounty: Recipient county (required)
 * - recipientCity: Recipient city (required)
 * - weight: Package weight in kg (default: 0.5)
 * - cod: Cash on delivery amount (optional)
 * - provider: Specific provider code (optional, returns all if not specified)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCourierProvider,
  getAllQuotes,
  getAvailableProvidersForDestination,
  CourierCode,
  QuoteRequest,
  DEFAULT_DOCUMENT_PACKAGE,
} from '@/lib/services/courier';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract parameters
    const senderCounty = searchParams.get('senderCounty');
    const senderCity = searchParams.get('senderCity');
    const recipientCounty = searchParams.get('recipientCounty');
    const recipientCity = searchParams.get('recipientCity');
    const weight = parseFloat(searchParams.get('weight') || '0.5');
    const cod = searchParams.get('cod') ? parseFloat(searchParams.get('cod')!) : undefined;
    const provider = searchParams.get('provider') as CourierCode | null;
    const country = searchParams.get('country') || 'RO';

    // Validate required parameters
    if (!senderCounty || !senderCity || !recipientCounty || !recipientCity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMS',
            message: 'Missing required parameters: senderCounty, senderCity, recipientCounty, recipientCity',
          },
        },
        { status: 400 }
      );
    }

    // Build quote request
    const quoteRequest: QuoteRequest = {
      sender: {
        county: senderCounty,
        city: senderCity,
        postalCode: '', // Will be filled by provider if needed
        country: 'RO',
      },
      recipient: {
        county: recipientCounty,
        city: recipientCity,
        postalCode: '',
        country,
      },
      packages: [
        {
          ...DEFAULT_DOCUMENT_PACKAGE,
          weight,
        },
      ],
      cod,
    };

    let quotes;

    if (provider) {
      // Get quotes from specific provider
      try {
        const courierProvider = getCourierProvider(provider);
        quotes = await courierProvider.getQuotes(quoteRequest);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PROVIDER_ERROR',
              message: error instanceof Error ? error.message : 'Provider not available',
            },
          },
          { status: 400 }
        );
      }
    } else {
      // Get quotes from all available providers
      quotes = await getAllQuotes(quoteRequest);
    }

    // Get available providers for information
    const availableProviders = getAvailableProvidersForDestination({ country });

    return NextResponse.json({
      success: true,
      data: {
        quotes,
        route: {
          sender: { county: senderCounty, city: senderCity },
          recipient: { county: recipientCounty, city: recipientCity, country },
        },
        availableProviders: availableProviders.map((p) => ({
          code: p.code,
          name: p.name,
          type: p.type,
        })),
      },
    });
  } catch (error) {
    console.error('[Courier Quote API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUOTE_ERROR',
          message: 'Failed to get shipping quotes',
        },
      },
      { status: 500 }
    );
  }
}
