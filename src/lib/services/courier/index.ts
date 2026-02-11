/**
 * Courier Service Module
 *
 * Unified interface for all courier providers:
 * - Domestic: Fan Courier, Sameday
 * - International: DHL, UPS, FedEx
 *
 * @example
 * ```typescript
 * import { getCourierProvider, getAllQuotes, COURIER_PROVIDERS } from '@/lib/services/courier';
 *
 * // Get quotes from all available providers
 * const quotes = await getAllQuotes({
 *   sender: { city: 'București', county: 'București', postalCode: '010011', country: 'RO' },
 *   recipient: { city: 'Cluj-Napoca', county: 'Cluj', postalCode: '400001', country: 'RO' },
 *   packages: [{ weight: 0.5, type: 'parcel', quantity: 1 }],
 * });
 *
 * // Use a specific provider
 * const fancourier = getCourierProvider('fancourier');
 * const shipment = await fancourier.createShipment(request);
 * ```
 */

// Types
export * from './types';

// Factory
export {
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
} from './factory';

// Utilities
export * from './utils';

// Provider implementations
export { FanCourierProvider, FANCOURIER_SERVICES, FANCOURIER_PAYMENT } from './fancourier';
export { SamedayProvider, SAMEDAY_SERVICES } from './sameday';
// export { DHLProvider } from './dhl';
// export { UPSProvider } from './ups';
// export { FedExProvider } from './fedex';
