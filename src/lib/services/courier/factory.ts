/**
 * Courier Provider Factory
 *
 * Factory pattern for instantiating and managing courier providers.
 * Supports domestic (Fan Courier, Sameday) and international (DHL, UPS, FedEx) couriers.
 */

import {
  CourierCode,
  CourierProvider,
  CourierProviderInfo,
  QuoteRequest,
  ShippingQuote,
  Address,
  CourierError,
} from './types';

// Provider implementations
import { FanCourierProvider } from './fancourier';
import { SamedayProvider } from './sameday';
// import { DHLProvider } from './dhl';
// import { UPSProvider } from './ups';
// import { FedExProvider } from './fedex';

// ============================================================================
// Provider Registry
// ============================================================================

/**
 * Static provider information for all supported couriers
 */
export const COURIER_PROVIDERS: Record<CourierCode, CourierProviderInfo> = {
  fancourier: {
    code: 'fancourier',
    name: 'Fan Courier',
    type: 'domestic',
    logo: '/images/couriers/fancourier.svg',
    trackingUrl: 'https://www.fancourier.ro/awb-tracking/?awb=',
    supportedCountries: ['RO'],
  },
  sameday: {
    code: 'sameday',
    name: 'Sameday',
    type: 'domestic',
    logo: '/images/couriers/sameday.webp',
    trackingUrl: 'https://sameday.ro/tracking/awb/',
    supportedCountries: ['RO'],
  },
  dhl: {
    code: 'dhl',
    name: 'DHL Express',
    type: 'international',
    logo: '/images/couriers/dhl.png',
    trackingUrl: 'https://www.dhl.com/ro-ro/home/tracking.html?tracking-id=',
    supportedCountries: ['*'], // All countries
  },
  ups: {
    code: 'ups',
    name: 'UPS',
    type: 'international',
    logo: '/images/couriers/ups.png',
    trackingUrl: 'https://www.ups.com/track?tracknum=',
    supportedCountries: ['*'],
  },
  fedex: {
    code: 'fedex',
    name: 'FedEx',
    type: 'international',
    logo: '/images/couriers/fedex.png',
    trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=',
    supportedCountries: ['*'],
  },
};

// ============================================================================
// Provider Cache
// ============================================================================

/**
 * Singleton cache for provider instances
 * Prevents multiple authentications for the same provider
 */
const providerCache: Map<CourierCode, CourierProvider> = new Map();

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Get a courier provider instance by code
 * Providers are cached and reused (singleton pattern)
 *
 * @param code - The courier provider code
 * @returns CourierProvider instance
 * @throws CourierError if provider is not implemented
 */
export function getCourierProvider(code: CourierCode): CourierProvider {
  // Check cache first
  const cached = providerCache.get(code);
  if (cached) {
    return cached;
  }

  let provider: CourierProvider;

  switch (code) {
    case 'fancourier':
      provider = new FanCourierProvider();
      break;

    case 'sameday':
      provider = new SamedayProvider();
      break;

    case 'dhl':
      // provider = new DHLProvider();
      throw new CourierError(
        'DHL provider not yet implemented',
        'NOT_IMPLEMENTED',
        code
      );

    case 'ups':
      // provider = new UPSProvider();
      throw new CourierError(
        'UPS provider not yet implemented',
        'NOT_IMPLEMENTED',
        code
      );

    case 'fedex':
      // provider = new FedExProvider();
      throw new CourierError(
        'FedEx provider not yet implemented',
        'NOT_IMPLEMENTED',
        code
      );

    default:
      throw new CourierError(
        `Unknown courier provider: ${code}`,
        'UNKNOWN_PROVIDER',
        code as CourierCode
      );
  }

  // Cache the provider
  providerCache.set(code, provider);
  return provider;
}

/**
 * Get provider info without instantiating the provider
 *
 * @param code - The courier provider code
 * @returns Provider information or undefined if not found
 */
export function getCourierProviderInfo(code: CourierCode): CourierProviderInfo | undefined {
  return COURIER_PROVIDERS[code];
}

/**
 * Get all available provider infos
 *
 * @returns Array of all provider information
 */
export function getAllProviderInfos(): CourierProviderInfo[] {
  return Object.values(COURIER_PROVIDERS);
}

/**
 * Get providers available for a specific destination
 *
 * @param destination - The destination address
 * @returns Array of available provider infos
 */
export function getAvailableProvidersForDestination(
  destination: Pick<Address, 'country'>
): CourierProviderInfo[] {
  const country = destination.country?.toUpperCase() || 'RO';

  return Object.values(COURIER_PROVIDERS).filter((provider) => {
    // '*' means all countries supported
    if (provider.supportedCountries.includes('*')) {
      return true;
    }
    return provider.supportedCountries.includes(country);
  });
}

/**
 * Get domestic providers (Romania only)
 *
 * @returns Array of domestic provider infos
 */
export function getDomesticProviders(): CourierProviderInfo[] {
  return Object.values(COURIER_PROVIDERS).filter(
    (provider) => provider.type === 'domestic' || provider.type === 'both'
  );
}

/**
 * Get international providers
 *
 * @returns Array of international provider infos
 */
export function getInternationalProviders(): CourierProviderInfo[] {
  return Object.values(COURIER_PROVIDERS).filter(
    (provider) => provider.type === 'international' || provider.type === 'both'
  );
}

// ============================================================================
// Quote Aggregation
// ============================================================================

/**
 * Get shipping quotes from all available providers for a destination
 *
 * @param request - The quote request
 * @returns Array of quotes from all available providers, sorted by price
 */
export async function getAllQuotes(request: QuoteRequest): Promise<ShippingQuote[]> {
  const implemented = getImplementedProviders();
  const availableProviders = getAvailableProvidersForDestination(request.recipient)
    .filter((p) => implemented.includes(p.code));
  const quotes: ShippingQuote[] = [];
  const errors: Array<{ provider: CourierCode; error: string }> = [];

  // Fetch quotes from all available providers in parallel
  const quotePromises = availableProviders.map(async (providerInfo) => {
    try {
      const provider = getCourierProvider(providerInfo.code);
      const providerQuotes = await provider.getQuotes(request);
      return { success: true as const, quotes: providerQuotes };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false as const, provider: providerInfo.code, error: message };
    }
  });

  const results = await Promise.all(quotePromises);

  for (const result of results) {
    if (result.success) {
      quotes.push(...result.quotes);
    } else {
      errors.push({ provider: result.provider, error: result.error });
    }
  }

  // Log errors for debugging (in production, send to monitoring)
  if (errors.length > 0) {
    console.warn('Some courier providers failed to return quotes:', errors);
  }

  // Sort by price (lowest first)
  return quotes.sort((a, b) => a.price - b.price);
}

/**
 * Get the cheapest quote from all available providers
 *
 * @param request - The quote request
 * @returns The cheapest quote or undefined if no quotes available
 */
export async function getCheapestQuote(
  request: QuoteRequest
): Promise<ShippingQuote | undefined> {
  const quotes = await getAllQuotes(request);
  return quotes[0]; // Already sorted by price
}

/**
 * Get the fastest quote from all available providers
 *
 * @param request - The quote request
 * @returns The fastest quote or undefined if no quotes available
 */
export async function getFastestQuote(
  request: QuoteRequest
): Promise<ShippingQuote | undefined> {
  const quotes = await getAllQuotes(request);
  if (quotes.length === 0) return undefined;

  return quotes.reduce((fastest, current) =>
    current.estimatedDays < fastest.estimatedDays ? current : fastest
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a provider is available (implemented and configured)
 *
 * @param code - The courier provider code
 * @returns true if the provider is available
 */
export function isProviderAvailable(code: CourierCode): boolean {
  try {
    getCourierProvider(code);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get tracking URL for an AWB
 *
 * @param code - The courier provider code
 * @param awb - The AWB number
 * @returns Full tracking URL
 */
export function getTrackingUrl(code: CourierCode, awb: string): string | undefined {
  const provider = COURIER_PROVIDERS[code];
  if (!provider?.trackingUrl) return undefined;
  return `${provider.trackingUrl}${awb}`;
}

/**
 * Clear the provider cache
 * Useful for testing or when credentials change
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Get list of implemented providers
 * (providers that won't throw NOT_IMPLEMENTED error)
 *
 * @returns Array of implemented provider codes
 */
export function getImplementedProviders(): CourierCode[] {
  const implemented: CourierCode[] = [];

  for (const code of Object.keys(COURIER_PROVIDERS) as CourierCode[]) {
    if (isProviderAvailable(code)) {
      implemented.push(code);
    }
  }

  return implemented;
}

// ============================================================================
// Default Export
// ============================================================================

const courierFactory = {
  getCourierProvider,
  getCourierProviderInfo,
  getAllProviderInfos,
  getAvailableProvidersForDestination,
  getDomesticProviders,
  getInternationalProviders,
  getAllQuotes,
  getCheapestQuote,
  getFastestQuote,
  isProviderAvailable,
  getTrackingUrl,
  clearProviderCache,
  getImplementedProviders,
  COURIER_PROVIDERS,
};

export default courierFactory;
