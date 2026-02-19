/**
 * Sameday Courier Provider - API v3.1
 *
 * Implements the CourierProvider interface for Sameday API.
 * Documentation: /docs/sameday/descarca-documentatia-api.pdf
 *
 * Token Management:
 * - Token is valid for 12 hours (14 days with remember_me=1)
 * - Cached at module level (shared across all requests)
 * - Persisted to file for survival across server restarts
 * - Only refreshed when expired (with 5 min buffer)
 *
 * Environment Variables:
 * - SAMEDAY_USERNAME: API username
 * - SAMEDAY_PASSWORD: API password
 * - SAMEDAY_USE_DEMO: 'true' to use demo API (default: false)
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
  ServicePoint,
  AuthenticationError,
  QuoteError,
  ShipmentError,
  CourierError,
} from './types';
import { normalizeTrackingStatus } from './utils';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const SAMEDAY_API_URL = 'https://api.sameday.ro';
const SAMEDAY_DEMO_URL = 'https://sameday-api.demo.zitec.com';

const TOKEN_CACHE_FILE = path.join(process.cwd(), '.sameday-token.json');

const getCredentials = () => ({
  username: process.env.SAMEDAY_USERNAME || '',
  password: process.env.SAMEDAY_PASSWORD || '',
  useDemo: process.env.SAMEDAY_USE_DEMO === 'true',
});

function getApiUrl(): string {
  return getCredentials().useDemo ? SAMEDAY_DEMO_URL : SAMEDAY_API_URL;
}

// ============================================================================
// Module-level Token Cache
// ============================================================================

interface TokenCache {
  token: string;
  expiresAt: string;
}

let cachedToken: string | null = null;
let cachedTokenExpiry: Date | null = null;

// Auth failure cooldown — avoid hammering the API when credentials are invalid
// Use globalThis to survive Next.js HMR (module-level vars reset on hot reload)
const AUTH_FAILURE_COOLDOWN_MS = 30 * 1000; // 30 seconds (short: credentials may change)
const globalForSameday = globalThis as typeof globalThis & {
  _samedayAuthFailedAt?: Date | null;
};

function getAuthFailedAt(): Date | null {
  return globalForSameday._samedayAuthFailedAt ?? null;
}

function setAuthFailedAt(date: Date | null): void {
  globalForSameday._samedayAuthFailedAt = date;
}

// Reset stale cooldown on module load (credentials may have changed via env update)
if (getAuthFailedAt()) {
  console.log('[Sameday] Clearing stale auth cooldown from previous session');
  setAuthFailedAt(null);
}

function loadTokenFromFile(): TokenCache | null {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = fs.readFileSync(TOKEN_CACHE_FILE, 'utf8');
      const cache: TokenCache = JSON.parse(data);
      const expiry = new Date(cache.expiresAt);

      if (expiry > new Date(Date.now() + 5 * 60 * 1000)) {
        console.log('[Sameday] Loaded token from file cache, expires:', cache.expiresAt);
        return cache;
      } else {
        console.log('[Sameday] Cached token expired, will refresh');
      }
    }
  } catch (error) {
    console.warn('[Sameday] Could not load token cache:', error);
  }
  return null;
}

function saveTokenToFile(token: string, expiresAt: Date): void {
  try {
    const cache: TokenCache = {
      token,
      expiresAt: expiresAt.toISOString(),
    };
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log('[Sameday] Token saved to file cache, expires:', expiresAt.toISOString());
  } catch (error) {
    console.warn('[Sameday] Could not save token cache:', error);
  }
}

function getCachedToken(): { token: string; expiry: Date } | null {
  if (cachedToken && cachedTokenExpiry && cachedTokenExpiry > new Date(Date.now() + 5 * 60 * 1000)) {
    return { token: cachedToken, expiry: cachedTokenExpiry };
  }

  const fileCache = loadTokenFromFile();
  if (fileCache) {
    cachedToken = fileCache.token;
    cachedTokenExpiry = new Date(fileCache.expiresAt);
    return { token: cachedToken, expiry: cachedTokenExpiry };
  }

  return null;
}

function updateTokenCache(token: string, expiresAt: Date): void {
  cachedToken = token;
  cachedTokenExpiry = expiresAt;
  saveTokenToFile(token, expiresAt);
}

function invalidateTokenCache(): void {
  cachedToken = null;
  cachedTokenExpiry = null;
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      fs.unlinkSync(TOKEN_CACHE_FILE);
    }
  } catch {
    // Ignore file deletion errors
  }
}

// ============================================================================
// County/City ID Resolver (Sameday uses numeric IDs)
// ============================================================================

interface SamedayCounty {
  id: number;
  name: string;
  code: string;
}

interface SamedayCity {
  id: number;
  name: string;
  county: string;
  countyId: number;
  postalCode?: string;
}

// Lazy-loaded caches
let countyCache: SamedayCounty[] | null = null;
const cityCache: Map<number, SamedayCity[]> = new Map(); // countyId -> cities

// Cache for OOH/locker locations (refreshed every 24 hours)
let lockerCache: ServicePoint[] | null = null;
let lockerCacheTimestamp: number = 0;
const LOCKER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Normalize string for fuzzy matching (remove diacritics, lowercase)
 */
function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// ============================================================================
// Service Constants
// ============================================================================

export const SAMEDAY_SERVICES = {
  STANDARD_24H: 7,
  LOCKER_NEXTDAY: 15,
  PUDO_NEXTDAY: 57,
  STANDARD_RETURN: 10,
  LOCKER_RETURN: 24,
} as const;

// ============================================================================
// Sameday Provider Class
// ============================================================================

export class SamedayProvider implements CourierProvider {
  readonly info: CourierProviderInfo = {
    code: 'sameday',
    name: 'Sameday',
    type: 'domestic',
    logo: '/images/couriers/sameday.webp',
    trackingUrl: 'https://sameday.ro/tracking/awb/',
    supportedCountries: ['RO'],
  };

  private hasCredentials(): boolean {
    const { username, password } = getCredentials();
    return !!(username && password);
  }

  /**
   * Check if API is currently usable (has credentials and not in auth failure cooldown)
   */
  private isApiAvailable(): boolean {
    if (!this.hasCredentials()) return false;
    const failedAt = getAuthFailedAt();
    if (failedAt && Date.now() - failedAt.getTime() < AUTH_FAILURE_COOLDOWN_MS) return false;
    return true;
  }

  /**
   * Authenticate with Sameday API
   * Uses X-AUTH-USERNAME / X-AUTH-PASSWORD headers
   * Token valid 12h (14 days with remember_me=1)
   */
  async authenticate(): Promise<AuthToken> {
    const cached = getCachedToken();
    if (cached) {
      return { token: cached.token, expiresAt: cached.expiry };
    }

    if (!this.hasCredentials()) {
      throw new AuthenticationError('sameday', 'Sameday credentials not configured');
    }

    // Skip retries during cooldown after a failed auth attempt
    const failedAt = getAuthFailedAt();
    if (failedAt && Date.now() - failedAt.getTime() < AUTH_FAILURE_COOLDOWN_MS) {
      throw new AuthenticationError('sameday', 'Auth failed recently, in cooldown');
    }

    const { username, password } = getCredentials();

    try {
      console.log('[Sameday] Requesting new token...');
      const response = await fetch(`${getApiUrl()}/api/authenticate`, {
        method: 'POST',
        headers: {
          'X-AUTH-USERNAME': username,
          'X-AUTH-PASSWORD': password,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'remember_me=1&_format=json',
      });

      if (!response.ok) {
        setAuthFailedAt(new Date());
        console.warn(`[Sameday] Auth failed (${response.status}), cooldown for 30s. Using mock data.`);
        throw new AuthenticationError('sameday', `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.token) {
        setAuthFailedAt(new Date());
        throw new AuthenticationError('sameday', 'No token in response');
      }

      // Auth succeeded — clear any failure state
      setAuthFailedAt(null);

      const token = data.token;
      // Parse expire_at_utc (preferred) or expire_at (format: "2024-09-24 12:54")
      const expiresAt = data.expire_at_utc
        ? new Date(data.expire_at_utc.replace(' ', 'T') + ':00Z')
        : data.expire_at
          ? new Date(data.expire_at.replace(' ', 'T') + ':00')
          : new Date(Date.now() + 12 * 60 * 60 * 1000);

      updateTokenCache(token, expiresAt);
      console.log('[Sameday] New token obtained, expires:', expiresAt.toISOString());

      return { token, expiresAt };
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      setAuthFailedAt(new Date());
      throw new AuthenticationError('sameday', `Authentication error: ${error}`);
    }
  }

  private async ensureAuthenticated(): Promise<string> {
    const cached = getCachedToken();
    if (cached) return cached.token;
    const auth = await this.authenticate();
    return auth.token;
  }

  /**
   * Make authenticated API request to Sameday
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<T> {
    const token = await this.ensureAuthenticated();

    const response = await fetch(`${getApiUrl()}${endpoint}`, {
      ...options,
      headers: {
        'X-AUTH-TOKEN': token,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle 401: token may be invalid/revoked — invalidate and retry once
    if (response.status === 401 && !_isRetry) {
      console.warn('[Sameday] Token rejected (401), invalidating and retrying...');
      invalidateTokenCache();
      try {
        return await this.apiRequest<T>(endpoint, options, true);
      } catch {
        // Retry also failed — enter cooldown to stop hammering
        setAuthFailedAt(new Date());
        throw new CourierError(
          'Sameday API: token invalid after re-authentication',
          'AUTH_INVALID',
          'sameday'
        );
      }
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new CourierError(
        `Sameday API error: ${response.status} ${response.statusText} - ${text}`,
        'API_ERROR',
        'sameday'
      );
    }

    return response.json();
  }

  isAuthenticated(): boolean {
    return getCachedToken() !== null;
  }

  // ============================================================================
  // County/City Resolution
  // ============================================================================

  /**
   * Load all Sameday counties (lazy, cached)
   */
  private async loadCounties(): Promise<SamedayCounty[]> {
    if (countyCache) return countyCache;

    try {
      const data = await this.apiRequest<{
        data: Array<{ id: number; name: string; code: string }>;
      }>('/api/geolocation/county?countPerPage=50');

      countyCache = data.data.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code || '',
      }));

      console.log(`[Sameday] Loaded ${countyCache.length} counties`);
      return countyCache;
    } catch {
      // Expected when credentials are invalid/expired — silently fall back
      return [];
    }
  }

  /**
   * Resolve county name to Sameday county ID
   */
  private async resolveCountyId(countyName: string): Promise<number | null> {
    const counties = await this.loadCounties();
    const normalized = normalizeForMatch(countyName);

    // Exact match first
    const exact = counties.find(
      (c) => normalizeForMatch(c.name) === normalized
    );
    if (exact) return exact.id;

    // Partial match
    const partial = counties.find(
      (c) =>
        normalizeForMatch(c.name).includes(normalized) ||
        normalized.includes(normalizeForMatch(c.name))
    );
    if (partial) return partial.id;

    // Special case: "București" / "Bucuresti"
    if (normalized.includes('bucuresti') || normalized.includes('bucharest')) {
      const buc = counties.find((c) =>
        normalizeForMatch(c.name).includes('bucuresti')
      );
      if (buc) return buc.id;
    }

    // Silent when counties list is empty (auth failed) — only warn when we have data but no match
    if (counties.length > 0) {
      console.warn(`[Sameday] Could not resolve county: ${countyName}`);
    }
    return null;
  }

  /**
   * Load cities for a county (lazy, cached)
   */
  private async loadCities(countyId: number): Promise<SamedayCity[]> {
    if (cityCache.has(countyId)) return cityCache.get(countyId)!;

    try {
      // Fetch all cities for county (paginated)
      const allCities: SamedayCity[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const data = await this.apiRequest<{
          total: number;
          pages: number;
          data: Array<{
            id: number;
            name: string;
            county: { id: number; name: string };
            postalCode?: string;
          }>;
        }>(`/api/geolocation/city?county=${countyId}&countPerPage=500&page=${page}`);

        totalPages = data.pages;

        for (const c of data.data) {
          allCities.push({
            id: c.id,
            name: c.name,
            county: c.county.name,
            countyId: c.county.id,
            postalCode: c.postalCode,
          });
        }

        page++;
      } while (page <= totalPages);

      cityCache.set(countyId, allCities);
      console.log(`[Sameday] Loaded ${allCities.length} cities for county ${countyId}`);
      return allCities;
    } catch (error) {
      console.error('[Sameday] Failed to load cities:', error);
      return [];
    }
  }

  /**
   * Resolve city name to Sameday city ID
   */
  private async resolveCityId(cityName: string, countyId: number): Promise<number | null> {
    const cities = await this.loadCities(countyId);
    const normalized = normalizeForMatch(cityName);

    // Exact match
    const exact = cities.find((c) => normalizeForMatch(c.name) === normalized);
    if (exact) return exact.id;

    // Partial match
    const partial = cities.find(
      (c) =>
        normalizeForMatch(c.name).includes(normalized) ||
        normalized.includes(normalizeForMatch(c.name))
    );
    if (partial) return partial.id;

    console.warn(`[Sameday] Could not resolve city: ${cityName} in county ${countyId}`);
    return null;
  }

  // ============================================================================
  // Quotes
  // ============================================================================

  async getQuote(request: QuoteRequest): Promise<ShippingQuote> {
    const quotes = await this.getQuotes(request);
    if (quotes.length === 0) {
      throw new QuoteError('sameday', 'No quotes available for this route');
    }
    return quotes[0];
  }

  /**
   * Get shipping quotes for Sameday services.
   * Note: Sameday API has no public estimate/tariff endpoint.
   * Prices shown are base estimates; actual cost is determined at AWB creation.
   */
  async getQuotes(request: QuoteRequest): Promise<ShippingQuote[]> {
    // Note: Sameday API has no public estimate/tariff endpoint.
    // Prices shown are base estimates; actual cost is determined at AWB creation.
    return this.getBasePriceQuotes(request);
  }

  /**
   * Fallback: return quotes based on known base prices
   */
  private getBasePriceQuotes(request: QuoteRequest): ShippingQuote[] {
    const totalWeight = request.packages.reduce(
      (sum, pkg) => sum + pkg.weight * pkg.quantity,
      0
    );

    // Sameday base prices (approximate, RON without VAT)
    const basePrice = 14 + totalWeight * 4; // ~14 RON base + 4 RON/kg
    const lockerPrice = basePrice * 0.85; // Locker is ~15% cheaper
    const codFee = request.cod ? 4 : 0;

    const standardPrice = basePrice + codFee;
    const standardVat = standardPrice * 0.19;

    const lockerPriceTotal = lockerPrice + codFee;
    const lockerVat = lockerPriceTotal * 0.19;

    const quotes: ShippingQuote[] = [
      {
        provider: 'sameday',
        providerName: 'Sameday',
        service: 'STANDARD_24H',
        serviceName: 'Standard 24H',
        price: standardPrice,
        priceWithVAT: standardPrice + standardVat,
        vat: standardVat,
        currency: 'RON',
        estimatedDays: 1,
        pickupAvailable: true,
        breakdown: {
          basePrice,
          codFee,
        },
      },
      {
        provider: 'sameday',
        providerName: 'Sameday',
        service: 'LOCKER_NEXTDAY',
        serviceName: 'EasyBox (Locker)',
        price: lockerPriceTotal,
        priceWithVAT: lockerPriceTotal + lockerVat,
        vat: lockerVat,
        currency: 'RON',
        estimatedDays: 1,
        pickupAvailable: false,
        lockerAvailable: true,
        breakdown: {
          basePrice: lockerPrice,
          codFee,
        },
      },
    ];

    return quotes;
  }

  // ============================================================================
  // Shipments
  // ============================================================================

  /**
   * Create a shipment (generate AWB) via POST /api/awb
   */
  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!this.hasCredentials()) {
      throw new ShipmentError('sameday', 'Sameday credentials not configured');
    }

    try {
      // Resolve county and city IDs
      const countyId = await this.resolveCountyId(request.recipient.county);
      const cityId = countyId
        ? await this.resolveCityId(request.recipient.city, countyId)
        : null;

      if (!countyId || !cityId) {
        throw new ShipmentError(
          'sameday',
          `Could not resolve location: ${request.recipient.city}, ${request.recipient.county}`
        );
      }

      // Get pickup points to find default
      let pickupPointId: string | undefined;
      let contactPersonId: string | undefined;
      try {
        const pickupData = await this.apiRequest<{
          data: Array<{
            id: number;
            defaultPickupPoint: boolean;
            contactPersons: Array<{ id: number; default: boolean }>;
          }>;
        }>('/api/client/pickup-points?countPerPage=100');

        const defaultPickup = pickupData.data.find((p) => p.defaultPickupPoint) || pickupData.data[0];
        if (defaultPickup) {
          pickupPointId = String(defaultPickup.id);
          const defaultContact = defaultPickup.contactPersons.find((c) => c.default)
            || defaultPickup.contactPersons[0];
          if (defaultContact) {
            contactPersonId = String(defaultContact.id);
          }
        }
      } catch {
        // Will use API defaults
      }

      const totalWeight = request.packages.reduce(
        (sum, pkg) => sum + pkg.weight * pkg.quantity,
        0
      );
      const totalParcels = request.packages.reduce((sum, pkg) => sum + pkg.quantity, 0);

      // Determine service ID
      let serviceId: number = SAMEDAY_SERVICES.STANDARD_24H;
      if (request.service === 'LOCKER_NEXTDAY' || request.service === String(SAMEDAY_SERVICES.LOCKER_NEXTDAY)) {
        serviceId = SAMEDAY_SERVICES.LOCKER_NEXTDAY;
      } else if (request.service === 'PUDO_NEXTDAY' || request.service === String(SAMEDAY_SERVICES.PUDO_NEXTDAY)) {
        serviceId = SAMEDAY_SERVICES.PUDO_NEXTDAY;
      }

      // Build AWB request
      const isLocker = serviceId === SAMEDAY_SERVICES.LOCKER_NEXTDAY;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const awbRequest: Record<string, any> = {
        packageType: totalWeight <= 1 ? '1' : '0',
        packageNumber: String(totalParcels),
        packageWeight: String(totalWeight),
        service: String(serviceId),
        awbPayment: request.paymentBy === 'sender' ? '1' : '2',
        cashOnDelivery: request.cod ? String(request.cod) : '0',
        insuredValue: request.content.declaredValue ? String(request.content.declaredValue) : '0',
        thirdPartyPickup: '0',
        observation: request.notes || '',
        clientInternalReference: request.orderReference || `eghiseul-${Date.now()}`,
        awbRecipient: {
          name: request.recipient.name,
          phoneNumber: request.recipient.phone,
          personType: '0', // natural person
          ...(isLocker
            ? {
                // Locker delivery: no address needed, just name/phone/email
                email: request.recipient.email || '',
              }
            : {
                // Home delivery: full address
                county: String(countyId),
                city: String(cityId),
                address: [
                  request.recipient.street,
                  request.recipient.streetNo ? `Nr. ${request.recipient.streetNo}` : '',
                  request.recipient.building ? `Bl. ${request.recipient.building}` : '',
                  request.recipient.entrance ? `Sc. ${request.recipient.entrance}` : '',
                  request.recipient.floor ? `Et. ${request.recipient.floor}` : '',
                  request.recipient.apartment ? `Ap. ${request.recipient.apartment}` : '',
                ]
                  .filter(Boolean)
                  .join(', '),
                postalCode: request.recipient.postalCode || '',
              }),
        },
        parcels: request.packages.map((pkg) => ({
          weight: String(pkg.weight),
          width: String(pkg.width || 22),
          length: String(pkg.length || 30),
          height: String(pkg.height || 1),
        })),
      };

      if (pickupPointId) awbRequest.pickupPoint = pickupPointId;
      if (contactPersonId) awbRequest.contactPerson = contactPersonId;

      // For locker delivery, add oohLastMile with locker ID
      if (isLocker && request.lockerId) {
        awbRequest.oohLastMile = request.lockerId;
      }

      const data = await this.apiRequest<{
        awbNumber: string;
        awbCost: number;
        parcels: Array<{ position: number; awbNumber: string }>;
        pdfLink?: string;
      }>('/api/awb', {
        method: 'POST',
        body: JSON.stringify(awbRequest),
      });

      return {
        success: true,
        provider: 'sameday',
        awb: data.awbNumber,
        awbPdf: data.pdfLink,
        price: data.awbCost,
        priceWithVAT: data.awbCost * 1.19,
        currency: 'RON',
        estimatedDays: 1,
        rawResponse: JSON.stringify(data),
      };
    } catch (error) {
      if (error instanceof ShipmentError) throw error;
      throw new ShipmentError('sameday', `Failed to create shipment: ${error}`);
    }
  }

  /**
   * Cancel a shipment by AWB
   */
  async cancelShipment(awb: string): Promise<boolean> {
    if (!this.hasCredentials()) return false;

    try {
      await this.apiRequest<unknown>(`/api/awb/${awb}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('[Sameday] Cancel shipment error:', error);
      return false;
    }
  }

  // ============================================================================
  // Tracking
  // ============================================================================

  /**
   * Track a shipment using GET /api/client/status-sync
   *
   * Note: The status-sync endpoint requires startTimestamp and endTimestamp
   * with a MAXIMUM 2-hour interval (per official docs). It is designed for
   * batch polling of recent status changes, not historical lookups.
   * We always include a public tracking URL as fallback.
   */
  async trackShipment(awb: string): Promise<TrackingInfo> {
    const trackingUrl = `https://sameday.ro/#awb=${awb}`;

    if (!this.isApiAvailable()) {
      return { ...this.getMockTracking(awb), trackingUrl };
    }

    try {
      // status-sync requires a max 2-hour window per official API docs
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      const params = new URLSearchParams({
        'awb[]': awb,
        startTimestamp: String(Math.floor(startDate.getTime() / 1000)),
        endTimestamp: String(Math.floor(endDate.getTime() / 1000)),
      });

      const data = await this.apiRequest<{
        data: Array<{
          awbNumber: string;
          awbHistory: Array<{
            status: string;
            statusId: number;
            statusState: string;
            statusDate: string;
            county: string;
            reason: string;
            transitLocation: string;
          }>;
        }>;
      }>(`/api/client/status-sync?${params}`);

      if (!data.data || data.data.length === 0) {
        // No recent updates in the 2-hour window — return minimal info with tracking URL
        return {
          awb,
          provider: 'sameday',
          status: 'pending',
          statusDescription: 'Verifică statusul pe sameday.ro',
          events: [],
          lastUpdate: new Date().toISOString(),
          trackingUrl,
        };
      }

      const trackingData = data.data[0];

      const events: TrackingEvent[] = (trackingData.awbHistory || []).map((event) => ({
        date: event.statusDate?.split(' ')[0] || '',
        time: event.statusDate?.split(' ')[1] || '',
        status: event.status,
        statusCode: String(event.statusId),
        description: event.reason || event.status,
        location: event.transitLocation || event.county || '',
      }));

      const latestEvent = events[events.length - 1];
      const status: TrackingStatus = latestEvent
        ? normalizeTrackingStatus(latestEvent.status, 'sameday')
        : 'pending';

      return {
        awb,
        provider: 'sameday',
        status,
        statusDescription: latestEvent?.description || '',
        events,
        lastUpdate: new Date().toISOString(),
        actualDelivery: status === 'delivered' ? latestEvent?.date : undefined,
        trackingUrl,
      };
    } catch (error) {
      console.error('[Sameday] Tracking error:', error);
      return { ...this.getMockTracking(awb), trackingUrl };
    }
  }

  async trackMultiple(awbs: string[]): Promise<TrackingInfo[]> {
    // Track each AWB individually
    return Promise.all(awbs.map((awb) => this.trackShipment(awb)));
  }

  // ============================================================================
  // Pickup
  // ============================================================================

  async schedulePickup(_request: PickupRequest): Promise<PickupResponse> {
    // Sameday handles pickup scheduling through their platform
    return {
      success: false,
      error: 'Sameday pickup scheduling is managed through the Sameday platform',
    };
  }

  async cancelPickup(_pickupId: string): Promise<boolean> {
    return false;
  }

  // ============================================================================
  // Geographic Data
  // ============================================================================

  async getCounties(): Promise<County[]> {
    if (!this.isApiAvailable()) {
      const { ROMANIAN_COUNTIES } = await import('@/lib/services/infocui');
      return ROMANIAN_COUNTIES;
    }

    try {
      const counties = await this.loadCounties();
      return counties.map((c) => ({
        code: c.code || c.name,
        name: c.name,
      }));
    } catch (error) {
      console.error('[Sameday] Get counties error:', error);
      const { ROMANIAN_COUNTIES } = await import('@/lib/services/infocui');
      return ROMANIAN_COUNTIES;
    }
  }

  async getLocalities(county: string): Promise<Locality[]> {
    if (!this.isApiAvailable()) {
      const { fetchLocalities } = await import('@/lib/services/infocui');
      return fetchLocalities(county);
    }

    try {
      const countyId = await this.resolveCountyId(county);
      if (!countyId) return [];

      const cities = await this.loadCities(countyId);
      return cities.map((c) => ({
        id: String(c.id),
        name: c.name,
        county: c.county,
        postalCode: c.postalCode,
      }));
    } catch (error) {
      console.error('[Sameday] Get localities error:', error);
      const { fetchLocalities } = await import('@/lib/services/infocui');
      return fetchLocalities(county);
    }
  }

  // ============================================================================
  // Service Points (EasyBox Lockers)
  // ============================================================================

  /**
   * Get EasyBox locker locations via GET /api/client/ooh-locations
   */
  async getServicePoints(city: string, county?: string): Promise<ServicePoint[]> {
    if (!this.hasCredentials()) {
      return [];
    }

    // Force-clear auth cooldown — it may have been set by unrelated
    // endpoint failures (e.g. estimate 405), not actual auth issues
    setAuthFailedAt(null);

    try {
      // Check cache first
      const now = Date.now();
      if (lockerCache && (now - lockerCacheTimestamp) < LOCKER_CACHE_TTL) {
        const filteredPoints = lockerCache.filter((point) => {
          const matchesCity = city === '*' || normalizeForMatch(point.city).includes(normalizeForMatch(city));
          const matchesCounty = !county || normalizeForMatch(point.county || '').includes(normalizeForMatch(county)) || normalizeForMatch(county).includes(normalizeForMatch(point.county || ''));
          return matchesCity && matchesCounty;
        });
        return filteredPoints;
      }

      // Fetch all locker locations (oohType=0 for EasyBox only)
      const allLockers: ServicePoint[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const params = new URLSearchParams({
          countPerPage: '500',
          page: String(page),
          listingType: '0', // 0=lockers only, 1=lockers+PUDOs
          countryCode: 'RO',
        });

        const data = await this.apiRequest<{
          total: number;
          pages: number;
          data: Array<{
            oohId: number;
            name: string;
            address: string;
            city: string;
            cityId: number;
            county: string;
            countyId: number;
            country: string;
            postalCode: string;
            lat: number;
            lng: number;
            oohType: number;
            schedule: Array<{ day: number; openingHour: string; closingHour: string }>;
          }>;
        }>(`/api/client/ooh-locations?${params}`);

        totalPages = data.pages;

        for (const locker of data.data) {
          allLockers.push({
            id: String(locker.oohId),
            type: 'locker',
            name: locker.name,
            address: locker.address,
            city: locker.city,
            county: locker.county,
            country: 'RO',
            postalCode: locker.postalCode,
            coordinates:
              locker.lat && locker.lng
                ? { lat: locker.lat, lng: locker.lng }
                : undefined,
            openingHours: locker.schedule?.[0]
              ? `${locker.schedule[0].openingHour} - ${locker.schedule[0].closingHour}`
              : '00:00 - 23:59',
            provider: 'sameday',
          });
        }

        page++;
      } while (page <= totalPages);

      // Store in cache (all lockers, unfiltered)
      lockerCache = allLockers;
      lockerCacheTimestamp = Date.now();

      // Filter by city/county
      const filteredPoints = allLockers.filter((point) => {
        const matchesCity =
          city === '*' ||
          normalizeForMatch(point.city).includes(normalizeForMatch(city));
        const matchesCounty =
          !county ||
          normalizeForMatch(point.county || '').includes(normalizeForMatch(county)) ||
          normalizeForMatch(county).includes(normalizeForMatch(point.county || ''));
        return matchesCity && matchesCounty;
      });

      return filteredPoints;
    } catch (err) {
      console.error('[Sameday] getServicePoints error:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  // ============================================================================
  // Mock Data
  // ============================================================================

  private getMockQuotes(request: QuoteRequest): ShippingQuote[] {
    // Mock mode uses the same base price formula as getBasePriceQuotes
    return this.getBasePriceQuotes(request);
  }

  private getMockTracking(awb: string): TrackingInfo {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const events: TrackingEvent[] = [
      {
        date: now.toISOString().split('T')[0],
        time: '10:30',
        status: 'Colet in tranzit',
        statusCode: '5',
        description: 'Coletul este in tranzit catre destinatie',
        location: 'Hub București',
      },
      {
        date: yesterday.toISOString().split('T')[0],
        time: '16:00',
        status: 'Colet preluat',
        statusCode: '2',
        description: 'Coletul a fost preluat de curier',
        location: 'Satu Mare',
      },
    ];

    return {
      awb,
      provider: 'sameday',
      status: 'in_transit',
      statusDescription: 'Coletul este in tranzit catre destinatie',
      events,
      lastUpdate: now.toISOString(),
    };
  }
}

// ============================================================================
// Export
// ============================================================================

export default SamedayProvider;
