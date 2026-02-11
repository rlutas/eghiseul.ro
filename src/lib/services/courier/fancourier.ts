/**
 * Fan Courier Provider - API v2.0
 *
 * Implements the CourierProvider interface for Fan Courier API v2.0.
 * Documentation: /docs/fancourier/RO_FANCourier_API_130825.pdf
 *
 * Token Management:
 * - Token is valid for 24 hours
 * - Cached at module level (shared across all requests)
 * - Persisted to file for survival across server restarts
 * - Only refreshed when expired (with 5 min buffer)
 *
 * Environment Variables:
 * - FANCOURIER_USERNAME: API username (selfAWB login)
 * - FANCOURIER_PASSWORD: API password (selfAWB login)
 * - FANCOURIER_CLIENT_ID: Client ID (cod client)
 */

import {
  CourierProvider,
  CourierProviderInfo,
  AuthToken,
  QuoteRequest,
  ShippingQuote,
  ShipmentRequest,
  ShipmentResponse,
  TrackingInfo,
  TrackingEvent,
  TrackingStatus,
  PickupRequest,
  PickupResponse,
  County,
  Locality,
  Street,
  ServicePoint,
  AuthenticationError,
  QuoteError,
  ShipmentError,
  CourierError,
} from './types';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Strip Romanian diacritics for Fan Courier API compatibility.
 * Fan Courier expects county/locality names without diacritics
 * (e.g. "Maramures" not "Maramureș", "Brasov" not "Brașov").
 */
function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ============================================================================
// Configuration - Fan Courier API v2.0
// ============================================================================

const FANCOURIER_API_URL = 'https://api.fancourier.ro';

// Token cache file location (in project root, gitignored)
const TOKEN_CACHE_FILE = path.join(process.cwd(), '.fancourier-token.json');

// Environment variables
const getCredentials = () => ({
  username: process.env.FANCOURIER_USERNAME || '',
  password: process.env.FANCOURIER_PASSWORD || '',
  clientId: process.env.FANCOURIER_CLIENT_ID || '',
});

// ============================================================================
// Module-level Token Cache (shared across all instances)
// ============================================================================

interface TokenCache {
  token: string;
  expiresAt: string; // ISO date string
}

// In-memory cache (fastest access)
let cachedToken: string | null = null;
let cachedTokenExpiry: Date | null = null;

/**
 * Load token from file cache (survives server restarts)
 */
function loadTokenFromFile(): TokenCache | null {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = fs.readFileSync(TOKEN_CACHE_FILE, 'utf8');
      const cache: TokenCache = JSON.parse(data);
      const expiry = new Date(cache.expiresAt);

      // Check if token is still valid (with 5 min buffer)
      if (expiry > new Date(Date.now() + 5 * 60 * 1000)) {
        console.log('[FanCourier] Loaded token from file cache, expires:', cache.expiresAt);
        return cache;
      } else {
        console.log('[FanCourier] Cached token expired, will refresh');
      }
    }
  } catch (error) {
    console.warn('[FanCourier] Could not load token cache:', error);
  }
  return null;
}

/**
 * Save token to file cache
 */
function saveTokenToFile(token: string, expiresAt: Date): void {
  try {
    const cache: TokenCache = {
      token,
      expiresAt: expiresAt.toISOString(),
    };
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('[FanCourier] Token saved to file cache, expires:', expiresAt.toISOString());
  } catch (error) {
    console.warn('[FanCourier] Could not save token cache:', error);
  }
}

/**
 * Get valid token from cache (memory or file)
 * Returns null if no valid token available
 */
function getCachedToken(): { token: string; expiry: Date } | null {
  // First check memory cache
  if (cachedToken && cachedTokenExpiry && cachedTokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
    return { token: cachedToken, expiry: cachedTokenExpiry };
  }

  // Try file cache
  const fileCache = loadTokenFromFile();
  if (fileCache) {
    // Update memory cache
    cachedToken = fileCache.token;
    cachedTokenExpiry = new Date(fileCache.expiresAt);
    return { token: cachedToken, expiry: cachedTokenExpiry };
  }

  return null;
}

/**
 * Update both memory and file cache with new token
 */
function updateTokenCache(token: string, expiresAt: Date): void {
  cachedToken = token;
  cachedTokenExpiry = expiresAt;
  saveTokenToFile(token, expiresAt);
}

// ============================================================================
// Service Constants
// ============================================================================

/**
 * Fan Courier service codes (from /reports/services)
 */
export const FANCOURIER_SERVICES = {
  STANDARD: 'Standard',
  RED_CODE: 'RedCode',
  CONT_COLECTOR: 'Cont Colector',
  EXPRESS_LOCO_1H: 'Express Loco 1H',
  EXPRESS_LOCO_2H: 'Express Loco 2H',
  EXPRESS_LOCO_4H: 'Express Loco 4H',
  EXPRESS_LOCO_6H: 'Express Loco 6H',
  EXPORT: 'Export',
  COLLECT_POINT: 'CollectPoint',
  FANBOX: 'FANbox',
  FANBOX_CONT_COLECTOR: 'FANbox Cont Colector',
} as const;

/**
 * Fan Courier payment options
 */
export const FANCOURIER_PAYMENT = {
  EXPEDITOR: 'expeditor', // Sender pays
  DESTINATAR: 'destinatar', // Recipient pays
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map Fan Courier tracking status to normalized status
 */
function mapTrackingStatus(eventId: string): TrackingStatus {
  // Based on AWB Events from documentation
  switch (eventId) {
    case 'S2':
      return 'delivered';
    case 'S1':
      return 'out_for_delivery';
    case 'H10':
    case 'H11':
    case 'H2':
    case 'H12':
    case 'H17':
      return 'in_transit';
    case 'C0':
    case 'C1':
      return 'picked_up';
    case 'S6':
    case 'S7':
    case 'S15':
    case 'S50':
      return 'failed_delivery';
    case 'S43':
    case 'S33':
    case 'S16':
      return 'returned';
    case 'S38':
      return 'cancelled';
    default:
      if (eventId.startsWith('H')) return 'in_transit';
      if (eventId.startsWith('S')) return 'pending';
      return 'unknown';
  }
}

// ============================================================================
// Fan Courier Provider Class - API v2.0
// ============================================================================

export class FanCourierProvider implements CourierProvider {
  /**
   * Provider information
   */
  readonly info: CourierProviderInfo = {
    code: 'fancourier',
    name: 'Fan Courier',
    type: 'domestic',
    logo: '/images/couriers/fancourier.svg',
    trackingUrl: 'https://www.fancourier.ro/awb-tracking/?awb=',
    supportedCountries: ['RO'],
  };

  /**
   * Check if credentials are configured
   */
  private hasCredentials(): boolean {
    const { username, password, clientId } = getCredentials();
    return !!(username && password && clientId);
  }

  /**
   * Authenticate with Fan Courier API v2.0
   * Token is valid for 24 hours and is cached at module level
   *
   * Per documentation: "Nu este necesar sa se genereze token pentru fiecare request
   * transmis, trebuie folosit unul pentru toate request-urile dintr-o zi."
   */
  async authenticate(): Promise<AuthToken> {
    // First check if we have a valid cached token
    const cached = getCachedToken();
    if (cached) {
      console.log('[FanCourier] Using cached token, expires:', cached.expiry.toISOString());
      return {
        token: cached.token,
        expiresAt: cached.expiry,
      };
    }

    // Need to get a new token
    if (!this.hasCredentials()) {
      throw new AuthenticationError('fancourier', 'Fan Courier credentials not configured');
    }

    const { username, password } = getCredentials();

    try {
      console.log('[FanCourier] Requesting new token...');
      const response = await fetch(
        `${FANCOURIER_API_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.status !== 'success' || !data.data?.token) {
        throw new AuthenticationError('fancourier', data.message || 'Authentication failed');
      }

      const token = data.data.token;
      const expiresAt = new Date(data.data.expiresAt);

      // Save to cache (memory + file)
      updateTokenCache(token, expiresAt);

      console.log('[FanCourier] New token obtained, expires:', expiresAt.toISOString());

      return {
        token,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('fancourier', `Authentication error: ${error}`);
    }
  }

  /**
   * Ensure we have a valid token (from cache or by authenticating)
   */
  private async ensureAuthenticated(): Promise<string> {
    // Check cache first (memory, then file)
    const cached = getCachedToken();
    if (cached) {
      return cached.token;
    }

    // Get new token (this will also cache it)
    const auth = await this.authenticate();
    return auth.token;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.ensureAuthenticated();

    const response = await fetch(`${FANCOURIER_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (data.status === 'fail') {
      throw new CourierError(data.message || 'API request failed', 'API_ERROR', 'fancourier');
    }

    return data;
  }

  /**
   * Check if authenticated (has valid cached token)
   */
  isAuthenticated(): boolean {
    const cached = getCachedToken();
    return cached !== null;
  }

  /**
   * Get shipping quote for a single service
   */
  async getQuote(request: QuoteRequest): Promise<ShippingQuote> {
    const quotes = await this.getQuotes(request);
    if (quotes.length === 0) {
      throw new QuoteError('fancourier', 'No quotes available for this route');
    }
    return quotes[0];
  }

  /**
   * Get shipping quotes for all available services
   * Uses /reports/awb/internal-tariff endpoint
   */
  async getQuotes(request: QuoteRequest): Promise<ShippingQuote[]> {
    if (!this.hasCredentials()) {
      console.warn('[FanCourier] No credentials, returning mock quotes');
      return this.getMockQuotes(request);
    }

    try {
      const { clientId } = getCredentials();
      const totalWeight = request.packages.reduce(
        (sum, pkg) => sum + pkg.weight * pkg.quantity,
        0
      );
      const totalParcels = request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);

      // Determine package type: envelope for documents (weight <= 0.5kg), parcel otherwise
      // eGhiseul sends mostly documents, so default to envelope
      const isEnvelope = totalWeight <= 0.5 || request.packages[0]?.type === 'envelope';
      const envelopeCount = isEnvelope ? totalParcels : 0;
      const parcelCount = isEnvelope ? 0 : totalParcels;

      // Build query params for internal tariff
      const params = new URLSearchParams({
        clientId,
        'info[service]': 'Standard',
        'info[payment]': 'expeditor',
        'info[weight]': String(totalWeight),
        'info[packages][parcel]': String(parcelCount),
        'info[packages][envelope]': String(envelopeCount),
        'recipient[locality]': stripDiacritics(request.recipient.city),
        'recipient[county]': stripDiacritics(request.recipient.county),
      });

      // Add sender if provided
      if (request.sender.county && request.sender.city) {
        params.append('sender[county]', stripDiacritics(request.sender.county));
        params.append('sender[locality]', stripDiacritics(request.sender.city));
      }

      // Add dimensions if available
      const firstPackage = request.packages[0];
      if (firstPackage?.length || firstPackage?.width || firstPackage?.height) {
        params.append('info[dimensions][length]', String(firstPackage.length || 10));
        params.append('info[dimensions][width]', String(firstPackage.width || 10));
        params.append('info[dimensions][height]', String(firstPackage.height || 10));
      }

      const data = await this.apiRequest<{
        status: string;
        data: {
          extraKmCost: number;
          weightCost: number;
          insuranceCost: number;
          optionsCost: number;
          fuelCost: number;
          costNoVAT: number;
          vat: number;
          total: number;
        };
      }>(`/reports/awb/internal-tariff?${params.toString()}`);

      const priceData = data.data;

      // Build quotes array
      const quotes: ShippingQuote[] = [
        {
          provider: 'fancourier',
          providerName: 'Fan Courier',
          service: 'STANDARD',
          serviceName: 'Standard',
          price: priceData.costNoVAT,
          priceWithVAT: priceData.total,
          vat: priceData.vat,
          currency: 'RON',
          estimatedDays: 2,
          pickupAvailable: true,
          breakdown: {
            basePrice: priceData.weightCost,
            fuelCost: priceData.fuelCost,
            extraKmCost: priceData.extraKmCost,
            insuranceCost: priceData.insuranceCost,
            optionsCost: priceData.optionsCost,
            codFee: request.cod ? 5 : 0,
          },
        },
      ];

      // Try to get Cont Colector quote if COD is requested
      if (request.cod && request.cod > 0) {
        try {
          const contColectorParams = new URLSearchParams(params);
          contColectorParams.set('info[service]', 'Cont Colector');

          const contColectorData = await this.apiRequest<{
            status: string;
            data: {
              costNoVAT: number;
              vat: number;
              total: number;
            };
          }>(`/reports/awb/internal-tariff?${contColectorParams.toString()}`);

          quotes.push({
            provider: 'fancourier',
            providerName: 'Fan Courier',
            service: 'CONT_COLECTOR',
            serviceName: 'Cont Colector (ramburs în cont)',
            price: contColectorData.data.costNoVAT,
            priceWithVAT: contColectorData.data.total,
            vat: contColectorData.data.vat,
            currency: 'RON',
            estimatedDays: 2,
            pickupAvailable: true,
          });
        } catch {
          // Cont Colector not available, continue
        }
      }

      // Add FANbox option if available
      // Use the actual recipient city for FANbox quotes
      try {
        const fanboxParams = new URLSearchParams({
          clientId,
          'info[service]': 'FANbox',
          'info[payment]': 'expeditor',
          'info[weight]': String(totalWeight),
          'info[packages][parcel]': String(parcelCount),
          'info[packages][envelope]': String(envelopeCount),
          'recipient[locality]': stripDiacritics(request.recipient.city),
          'recipient[county]': stripDiacritics(request.recipient.county),
        });

        // Add sender if provided
        if (request.sender.county && request.sender.city) {
          fanboxParams.append('sender[county]', stripDiacritics(request.sender.county));
          fanboxParams.append('sender[locality]', stripDiacritics(request.sender.city));
        }

        // Add dimensions if available
        if (firstPackage?.length || firstPackage?.width || firstPackage?.height) {
          fanboxParams.append('info[dimensions][length]', String(firstPackage.length || 10));
          fanboxParams.append('info[dimensions][width]', String(firstPackage.width || 10));
          fanboxParams.append('info[dimensions][height]', String(firstPackage.height || 10));
        }

        const fanboxData = await this.apiRequest<{
          status: string;
          data: {
            costNoVAT: number;
            vat: number;
            total: number;
          };
        }>(`/reports/awb/internal-tariff?${fanboxParams.toString()}`);

        quotes.push({
          provider: 'fancourier',
          providerName: 'Fan Courier',
          service: 'FANBOX',
          serviceName: 'FANbox (Locker)',
          price: fanboxData.data.costNoVAT,
          priceWithVAT: fanboxData.data.total,
          vat: fanboxData.data.vat,
          currency: 'RON',
          estimatedDays: 2,
          pickupAvailable: false,
          lockerAvailable: true,
        });
      } catch {
        // FANbox not available for this route
      }

      console.log('[FanCourier] Got quotes:', quotes.length);
      return quotes;
    } catch (error) {
      console.error('[FanCourier] Quote error:', error);
      console.warn('[FanCourier] Falling back to mock quotes');
      return this.getMockQuotes(request);
    }
  }

  /**
   * Create a shipment (generate AWB)
   * Uses POST /intern-awb endpoint
   */
  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.hasCredentials()) {
      throw new ShipmentError('fancourier', 'Fan Courier credentials not configured');
    }

    try {
      const { clientId } = getCredentials();
      const totalWeight = request.packages.reduce(
        (sum, pkg) => sum + pkg.weight * pkg.quantity,
        0
      );
      const totalParcels = request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);

      // Determine service type
      let service = request.service || FANCOURIER_SERVICES.STANDARD;
      if (request.cod && request.cod > 0 && !service.includes('Cont Colector')) {
        service = FANCOURIER_SERVICES.CONT_COLECTOR;
      }

      // Build AWB request body according to API v2.0 spec
      const awbRequest = {
        clientId,
        shipments: [
          {
            info: {
              service,
              bank: '',
              bankAccount: '',
              packages: {
                parcel: totalParcels,
                envelope: 0,
              },
              weight: totalWeight,
              cod: request.cod || 0,
              declaredValue: request.content.declaredValue || 0,
              payment: request.paymentBy === 'sender' ? 'expeditor' : 'destinatar',
              refund: null,
              returnPayment: null,
              observation: request.notes || '',
              content: request.content.description,
              dimensions: {
                length: request.packages[0]?.length || 10,
                width: request.packages[0]?.width || 10,
                height: request.packages[0]?.height || 10,
              },
              costCenter: '',
              options: request.openAtDelivery ? ['A'] : ['X'], // X = ePOD
            },
            recipient: {
              name: request.recipient.name,
              phone: request.recipient.phone,
              secondaryPhone: '',
              email: request.recipient.email || '',
              address: {
                county: stripDiacritics(request.recipient.county),
                locality: stripDiacritics(request.recipient.city),
                street: request.recipient.street,
                streetNo: request.recipient.streetNo || '',
                zipCode: request.recipient.postalCode || '',
                building: request.recipient.building || '',
                entrance: request.recipient.entrance || '',
                floor: request.recipient.floor || '',
                apartment: request.recipient.apartment || '',
              },
            },
          },
        ],
      };

      const data = await this.apiRequest<{
        response: Array<{
          awbNumber: number;
          tariff: number;
          vat: number;
          packages: number;
          routingCode: string;
          estimatedDeliveryTime: number;
          errors: string | null;
        }>;
      }>('/intern-awb', {
        method: 'POST',
        body: JSON.stringify(awbRequest),
      });

      const awbResponse = data.response[0];

      if (awbResponse.errors) {
        throw new ShipmentError('fancourier', awbResponse.errors);
      }

      return {
        success: true,
        provider: 'fancourier',
        awb: String(awbResponse.awbNumber),
        price: awbResponse.tariff,
        priceWithVAT: awbResponse.tariff + awbResponse.vat,
        currency: 'RON',
        estimatedDays: Math.ceil(awbResponse.estimatedDeliveryTime / 24),
        rawResponse: JSON.stringify(data),
      };
    } catch (error) {
      if (error instanceof ShipmentError) throw error;
      throw new ShipmentError('fancourier', `Failed to create shipment: ${error}`);
    }
  }

  /**
   * Cancel a shipment by AWB
   * Uses DELETE /awb endpoint
   */
  async cancelShipment(awb: string): Promise<boolean> {
    if (!this.hasCredentials()) {
      throw new CourierError('Credentials required', 'AUTH_REQUIRED', 'fancourier');
    }

    try {
      const { clientId } = getCredentials();

      await this.apiRequest<{ status: string; data: string }>(
        `/awb?clientId=${clientId}&awb=${awb}`,
        { method: 'DELETE' }
      );

      return true;
    } catch (error) {
      console.error('[FanCourier] Cancel shipment error:', error);
      return false;
    }
  }

  /**
   * Track a shipment by AWB
   * Uses GET /reports/awb/tracking endpoint
   */
  async trackShipment(awb: string): Promise<TrackingInfo> {
    if (!this.hasCredentials()) {
      console.warn('[FanCourier] No credentials, returning mock tracking');
      return this.getMockTracking(awb);
    }

    try {
      const { clientId } = getCredentials();

      const data = await this.apiRequest<{
        status: string;
        data: Array<{
          content: string;
          awbNumber: string;
          date: string;
          paymentDate: string | null;
          returnAwbNumber: string | null;
          redirectionAwbNumber: string | null;
          confirmation: {
            name: string;
            date: string;
          } | null;
          OTD: string;
          events: Array<{
            id: string;
            name: string;
            location: string;
            date: string;
          }>;
        }>;
      }>(`/reports/awb/tracking?clientId=${clientId}&awb[]=${awb}&language=ro`);

      if (!data.data || data.data.length === 0) {
        throw new CourierError('AWB not found', 'AWB_NOT_FOUND', 'fancourier');
      }

      const trackingData = data.data[0];

      // Parse tracking events
      const events: TrackingEvent[] = trackingData.events.map((event) => ({
        date: event.date.split(' ')[0],
        time: event.date.split(' ')[1] || '',
        status: event.name,
        statusCode: event.id,
        description: event.name,
        location: event.location,
      }));

      // Get latest event to determine status
      const latestEvent = events[events.length - 1];
      const status = mapTrackingStatus(latestEvent?.statusCode || 'pending');

      return {
        awb,
        provider: 'fancourier',
        status,
        statusDescription: latestEvent?.description || '',
        events,
        lastUpdate: new Date().toISOString(),
        actualDelivery: status === 'delivered' ? trackingData.confirmation?.date : undefined,
        signedBy: trackingData.confirmation?.name,
        rawResponse: JSON.stringify(data),
      };
    } catch (error) {
      console.error('[FanCourier] Tracking error:', error);
      console.warn('[FanCourier] Falling back to mock tracking');
      return this.getMockTracking(awb);
    }
  }

  /**
   * Track multiple shipments
   */
  async trackMultiple(awbs: string[]): Promise<TrackingInfo[]> {
    if (!this.hasCredentials()) {
      return awbs.map((awb) => this.getMockTracking(awb));
    }

    try {
      const { clientId } = getCredentials();
      const awbParams = awbs.map((awb) => `awb[]=${awb}`).join('&');

      const data = await this.apiRequest<{
        status: string;
        data: Array<{
          awbNumber: string;
          events: Array<{
            id: string;
            name: string;
            location: string;
            date: string;
          }>;
          confirmation: { name: string; date: string } | null;
        }>;
      }>(`/reports/awb/tracking?clientId=${clientId}&${awbParams}&language=ro`);

      return data.data.map((trackingData) => {
        const events: TrackingEvent[] = trackingData.events.map((event) => ({
          date: event.date.split(' ')[0],
          time: event.date.split(' ')[1] || '',
          status: event.name,
          statusCode: event.id,
          description: event.name,
          location: event.location,
        }));

        const latestEvent = events[events.length - 1];
        const status = mapTrackingStatus(latestEvent?.statusCode || 'pending');

        return {
          awb: trackingData.awbNumber,
          provider: 'fancourier',
          status,
          statusDescription: latestEvent?.description || '',
          events,
          lastUpdate: new Date().toISOString(),
          signedBy: trackingData.confirmation?.name,
        };
      });
    } catch (error) {
      console.error('[FanCourier] Track multiple error:', error);
      return awbs.map((awb) => this.getMockTracking(awb));
    }
  }

  /**
   * Schedule a pickup (Comanda Curier)
   * Uses POST /order endpoint
   */
  async schedulePickup(request: PickupRequest): Promise<PickupResponse> {
    if (!this.hasCredentials()) {
      throw new CourierError('Credentials required', 'AUTH_REQUIRED', 'fancourier');
    }

    try {
      const { clientId } = getCredentials();

      const orderRequest = {
        clientId,
        info: {
          packages: {
            parcel: request.awbs.length,
            envelope: 0,
          },
          weight: 1, // Default weight
          dimensions: {
            width: 10,
            length: 10,
            height: 10,
          },
          orderType: 'Standard',
          pickupDate: request.date,
          pickupHours: {
            first: request.timeFrom || '09:00',
            second: request.timeTo || '18:00',
          },
          observations: request.notes || '',
        },
      };

      const data = await this.apiRequest<{
        status: string;
        data: { id: number };
      }>('/order', {
        method: 'POST',
        body: JSON.stringify(orderRequest),
      });

      return {
        success: true,
        pickupId: String(data.data.id),
        confirmationNumber: String(data.data.id),
        scheduledDate: request.date,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a pickup
   * Uses DELETE /order endpoint
   */
  async cancelPickup(pickupId: string): Promise<boolean> {
    if (!this.hasCredentials()) {
      return false;
    }

    try {
      const { clientId } = getCredentials();

      await this.apiRequest<{ status: string }>(
        `/order?clientId=${clientId}&id=${pickupId}`,
        { method: 'DELETE' }
      );

      return true;
    } catch (error) {
      console.error('[FanCourier] Cancel pickup error:', error);
      return false;
    }
  }

  /**
   * Get Romanian counties
   * Uses GET /reports/counties endpoint
   */
  async getCounties(): Promise<County[]> {
    if (!this.hasCredentials()) {
      // Return cached counties from InfoCUI
      const { ROMANIAN_COUNTIES } = await import('@/lib/services/infocui');
      return ROMANIAN_COUNTIES;
    }

    try {
      const data = await this.apiRequest<{
        status: string;
        data: Array<{ name: string }>;
      }>('/reports/counties');

      return data.data.map((county) => ({
        code: county.name,
        name: county.name,
      }));
    } catch (error) {
      console.error('[FanCourier] Get counties error:', error);
      // Fallback to InfoCUI
      const { ROMANIAN_COUNTIES } = await import('@/lib/services/infocui');
      return ROMANIAN_COUNTIES;
    }
  }

  /**
   * Get localities for a county
   * Uses GET /reports/localities endpoint
   */
  async getLocalities(county: string): Promise<Locality[]> {
    if (!this.hasCredentials()) {
      const { fetchLocalities } = await import('@/lib/services/infocui');
      return fetchLocalities(county);
    }

    try {
      const data = await this.apiRequest<{
        status: string;
        data: Array<{
          id: number;
          name: string;
          county: string;
          agency: string;
          exteriorKm: number;
        }>;
      }>(`/reports/localities?county=${encodeURIComponent(stripDiacritics(county))}`);

      return data.data.map((loc) => ({
        id: String(loc.id),
        name: loc.name,
        county: loc.county,
      }));
    } catch (error) {
      console.error('[FanCourier] Get localities error:', error);
      // Fallback to InfoCUI
      const { fetchLocalities } = await import('@/lib/services/infocui');
      return fetchLocalities(county);
    }
  }

  /**
   * Get streets for a locality
   * Uses GET /reports/streets endpoint
   */
  async getStreets(county: string, locality: string): Promise<Street[]> {
    if (!this.hasCredentials()) {
      console.warn('[FanCourier] No credentials, returning empty streets');
      return [];
    }

    try {
      const data = await this.apiRequest<{
        status: string;
        total: number;
        data: Array<{
          id: number;
          street: string; // API returns "street" not "name"
          type?: string; // "Bulevard", "Strada", "Aleea", etc.
          locality: string;
          county: string;
        }>;
      }>(`/reports/streets?county=${encodeURIComponent(stripDiacritics(county))}&locality=${encodeURIComponent(stripDiacritics(locality))}&perPage=1000`);

      return data.data.map((item) => ({
        id: String(item.id),
        // Combine type with street name for better display (e.g., "Bulevard 1 Decembrie 1918")
        name: item.type ? `${item.type} ${item.street}` : item.street,
        locality: item.locality,
        county: item.county,
      }));
    } catch (error) {
      console.error('[FanCourier] Get streets error:', error);
      return [];
    }
  }

  /**
   * Get FANbox/pickup points (PUDO)
   * Uses GET /reports/pickup-points endpoint
   */
  async getServicePoints(city: string, county?: string): Promise<ServicePoint[]> {
    if (!this.hasCredentials()) {
      return [];
    }

    try {
      // Get FANbox points
      const fanboxData = await this.apiRequest<{
        status: string;
        data: Array<{
          id: string;
          name: string;
          routingLocation: string;
          description: string;
          address: {
            locality: string;
            county: string;
            street: string;
            streetNo: string;
            zipCode: string;
          };
          latitude: string;
          longitude: string;
          schedule: Array<{ firstHour: string; secondHour: string }>;
          drawer: Array<{ type: string; number: number }>;
        }>;
      }>('/reports/pickup-points?type=fanbox');

      // Filter by city/county
      // Use '*' to get all points (no city filter)
      const filteredPoints = fanboxData.data.filter((point) => {
        const matchesCity = city === '*' || stripDiacritics(point.address.locality).toLowerCase().includes(stripDiacritics(city).toLowerCase());
        const matchesCounty = !county || stripDiacritics(point.address.county).toLowerCase().includes(stripDiacritics(county).toLowerCase())
          || stripDiacritics(county).toLowerCase().includes(stripDiacritics(point.address.county).toLowerCase());
        return matchesCity && matchesCounty;
      });

      return filteredPoints.map((point) => ({
        id: point.id,
        type: 'locker' as const,
        name: point.name,
        address: `${point.address.street} ${point.address.streetNo}`,
        city: point.address.locality,
        county: point.address.county,
        country: 'RO',
        postalCode: point.address.zipCode,
        coordinates: point.latitude && point.longitude
          ? {
              lat: parseFloat(point.latitude),
              lng: parseFloat(point.longitude),
            }
          : undefined,
        openingHours: point.schedule[0]
          ? `${point.schedule[0].firstHour} - ${point.schedule[0].secondHour}`
          : undefined,
        provider: 'fancourier',
      }));
    } catch (error) {
      console.error('[FanCourier] Get service points error:', error);
      return [];
    }
  }

  /**
   * Get available services
   * Uses GET /reports/services endpoint
   */
  async getServices(): Promise<Array<{ id: number; name: string; description: string }>> {
    try {
      const data = await this.apiRequest<{
        status: string;
        data: Array<{
          id: number;
          name: string;
          description: string | null;
        }>;
      }>('/reports/services');

      return data.data.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
      }));
    } catch (error) {
      console.error('[FanCourier] Get services error:', error);
      return [];
    }
  }

  /**
   * Print AWB label
   * Uses GET /awb/label endpoint
   */
  async getAwbLabel(awbs: string[], format: 'html' | 'pdf' | 'zpl' = 'pdf'): Promise<string> {
    const { clientId } = getCredentials();
    const token = await this.ensureAuthenticated();

    const awbParams = awbs.map((awb) => `awbs[]=${awb}`).join('&');
    const formatParam = format === 'pdf' ? 'pdf=1' : format === 'zpl' ? 'zpl=1' : '';

    const url = `${FANCOURIER_API_URL}/awb/label?clientId=${clientId}&${awbParams}&${formatParam}`;

    // Return URL for direct download
    return `${url}&token=${token}`;
  }

  /**
   * Generate mock quotes for development/testing
   */
  private getMockQuotes(request: QuoteRequest): ShippingQuote[] {
    const totalWeight = request.packages.reduce(
      (sum, pkg) => sum + pkg.weight * pkg.quantity,
      0
    );

    // Base price calculation (simplified)
    const basePrice = 15 + totalWeight * 5; // 15 RON base + 5 RON per kg
    const codFee = request.cod ? 5 : 0;
    const price = basePrice + codFee;
    const vat = price * 0.19;

    const quotes: ShippingQuote[] = [
      {
        provider: 'fancourier',
        providerName: 'Fan Courier',
        service: 'STANDARD',
        serviceName: 'Standard',
        price,
        priceWithVAT: price + vat,
        vat,
        currency: 'RON',
        estimatedDays: 2,
        pickupAvailable: true,
        breakdown: {
          basePrice,
          codFee,
        },
      },
    ];

    // Add same-county express option
    if (request.sender.county === request.recipient.county) {
      quotes.push({
        provider: 'fancourier',
        providerName: 'Fan Courier',
        service: 'EXPRESS_LOCO_1H',
        serviceName: 'Express Loco (1h)',
        price: price * 2.5,
        priceWithVAT: price * 2.5 * 1.19,
        vat: price * 2.5 * 0.19,
        currency: 'RON',
        estimatedDays: 0,
        pickupAvailable: true,
      });
    }

    // Add Collect Point option
    quotes.push({
      provider: 'fancourier',
      providerName: 'Fan Courier',
      service: 'FANBOX',
      serviceName: 'FANbox (Locker)',
      price: price * 0.8, // 20% cheaper
      priceWithVAT: price * 0.8 * 1.19,
      vat: price * 0.8 * 0.19,
      currency: 'RON',
      estimatedDays: 2,
      pickupAvailable: false,
      lockerAvailable: true,
    });

    return quotes;
  }

  /**
   * Generate mock tracking data for development/testing
   */
  private getMockTracking(awb: string): TrackingInfo {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Generate realistic mock tracking events
    const events: TrackingEvent[] = [
      {
        date: now.toISOString().split('T')[0],
        time: '14:30',
        status: 'Expeditie in tranzit spre depozitul de destinatie',
        statusCode: 'H10',
        description: 'Expeditie in tranzit spre depozitul de destinatie',
        location: 'Hub București',
      },
      {
        date: yesterday.toISOString().split('T')[0],
        time: '09:15',
        status: 'Expeditie preluate spre livrare',
        statusCode: 'C1',
        description: 'Expeditie preluate spre livrare',
        location: 'București, Sector 1',
      },
      {
        date: twoDaysAgo.toISOString().split('T')[0],
        time: '16:45',
        status: 'AWB inregistrat',
        statusCode: 'H4',
        description: 'Expeditie sortata pe banda',
        location: 'Online',
      },
    ];

    return {
      awb,
      provider: 'fancourier',
      status: 'in_transit',
      statusDescription: 'Expeditie in tranzit spre depozitul de destinatie',
      events,
      lastUpdate: now.toISOString(),
    };
  }
}

// ============================================================================
// Export
// ============================================================================

export default FanCourierProvider;
