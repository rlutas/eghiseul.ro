/**
 * Courier Service Types
 *
 * Common interfaces for all courier providers (Fan Courier, Sameday, DHL, UPS, FedEx)
 */

// ============================================================================
// Provider Types
// ============================================================================

export type CourierCode = 'fancourier' | 'sameday' | 'dhl' | 'ups' | 'fedex';
export type CourierType = 'domestic' | 'international' | 'both';

export interface CourierProviderInfo {
  code: CourierCode;
  name: string;
  type: CourierType;
  logo?: string;
  trackingUrl?: string;
  supportedCountries: string[]; // ISO country codes
}

// ============================================================================
// Address Types
// ============================================================================

export interface Address {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  street: string;
  streetNo?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  city: string;
  county: string; // For Romania: județ
  postalCode: string;
  country: string; // ISO 2-letter code (RO, DE, US, etc.)
}

export interface SenderAddress extends Address {
  // Additional sender fields if needed
  contactPerson?: string;
}

// ============================================================================
// Package Types
// ============================================================================

export interface Package {
  weight: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  type: 'parcel' | 'envelope' | 'pallet';
  quantity: number;
}

export interface ShipmentContent {
  description: string;
  declaredValue?: number;
  currency?: string;
  isDocument?: boolean;
}

// ============================================================================
// Shipment Request
// ============================================================================

export interface ShipmentRequest {
  sender: SenderAddress;
  recipient: Address;
  packages: Package[];
  content: ShipmentContent;

  // Service options
  service?: string; // Provider-specific service code
  paymentBy: 'sender' | 'recipient';
  cod?: number; // Cash on delivery amount
  insurance?: boolean;

  // Locker delivery
  lockerId?: string; // Service point ID for locker/EasyBox/FANbox delivery

  // Additional options
  saturdayDelivery?: boolean;
  openAtDelivery?: boolean;
  returnOnFail?: boolean;
  notes?: string;

  // Reference
  orderReference?: string;
  customerReference?: string;
}

// ============================================================================
// Quote & Pricing
// ============================================================================

export interface ShippingQuote {
  provider: CourierCode;
  providerName: string;
  service: string;
  serviceName: string;

  // Pricing
  price: number;
  priceWithVAT: number;
  vat: number;
  currency: string;

  // Breakdown (optional)
  breakdown?: {
    basePrice: number;
    weightSurcharge?: number;
    fuelSurcharge?: number;
    fuelCost?: number; // Fan Courier API field
    extraKmCost?: number; // Fan Courier API field
    insuranceCost?: number;
    optionsCost?: number;
    codFee?: number;
    extraServices?: number;
  };

  // Delivery info
  estimatedDays: number;
  estimatedDeliveryDate?: string;

  // Availability
  pickupAvailable: boolean;
  lockerAvailable?: boolean;

  // Raw response for debugging
  rawResponse?: unknown;
}

export interface QuoteRequest {
  sender: Pick<Address, 'city' | 'county' | 'postalCode' | 'country'>;
  recipient: Pick<Address, 'city' | 'county' | 'postalCode' | 'country'>;
  packages: Package[];
  service?: string;
  cod?: number;
  insurance?: boolean;
}

// ============================================================================
// Shipment Response
// ============================================================================

export interface ShipmentResponse {
  success: boolean;
  provider: CourierCode;

  // AWB info
  awb: string;
  awbBarcode?: string;
  awbPdf?: string; // Base64 or URL

  // Pricing (actual)
  price: number;
  priceWithVAT: number;
  currency: string;

  // Delivery
  estimatedDeliveryDate?: string;
  estimatedDays?: number;

  // Routing
  routingCode?: string;

  // Errors
  error?: string;
  errors?: string[];

  // Raw response
  rawResponse?: unknown;
}

// ============================================================================
// Tracking
// ============================================================================

export interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  statusCode?: string;
  description: string;
  location?: string;
  signedBy?: string;
}

export interface TrackingInfo {
  awb: string;
  provider: CourierCode;
  status: TrackingStatus;
  statusDescription: string;

  // Delivery info
  estimatedDelivery?: string;
  actualDelivery?: string;
  signedBy?: string;

  // Event history
  events: TrackingEvent[];

  // Timestamps
  lastUpdate: string;

  // Tracking URL (public link for end users)
  trackingUrl?: string;

  // Raw response
  rawResponse?: unknown;
}

export type TrackingStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'returned'
  | 'cancelled'
  | 'unknown';

// ============================================================================
// Pickup
// ============================================================================

export interface PickupRequest {
  address: SenderAddress;
  date: string; // YYYY-MM-DD
  timeFrom?: string; // HH:MM
  timeTo?: string; // HH:MM
  awbs: string[];
  notes?: string;
}

export interface PickupResponse {
  success: boolean;
  pickupId?: string;
  confirmationNumber?: string;
  scheduledDate?: string;
  error?: string;
}

// ============================================================================
// Service Points (Lockers, Branches)
// ============================================================================

export interface ServicePoint {
  id: string;
  type: 'locker' | 'branch' | 'pickup_point';
  name: string;
  address: string;
  city: string;
  county?: string;
  postalCode?: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
  provider: CourierCode;
}

// ============================================================================
// Geographic Data
// ============================================================================

export interface County {
  code: string;
  name: string;
}

export interface Locality {
  id?: string;
  name: string;
  county: string;
  postalCode?: string;
}

export interface Street {
  id?: string;
  name: string;
  locality: string;
  county: string;
}

// ============================================================================
// Authentication
// ============================================================================

export interface AuthToken {
  token: string;
  expiresAt: Date;
  refreshToken?: string;
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface CourierProvider {
  readonly info: CourierProviderInfo;

  // Authentication
  authenticate(): Promise<AuthToken>;
  isAuthenticated(): boolean;

  // Quotes
  getQuote(request: QuoteRequest): Promise<ShippingQuote>;
  getQuotes(request: QuoteRequest): Promise<ShippingQuote[]>; // Multiple services

  // Shipments
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;
  cancelShipment(awb: string): Promise<boolean>;

  // Tracking
  trackShipment(awb: string): Promise<TrackingInfo>;
  trackMultiple(awbs: string[]): Promise<TrackingInfo[]>;

  // Pickup
  schedulePickup(request: PickupRequest): Promise<PickupResponse>;
  cancelPickup(pickupId: string): Promise<boolean>;

  // Geographic data (optional)
  getCounties?(): Promise<County[]>;
  getLocalities?(county: string): Promise<Locality[]>;
  getStreets?(county: string, locality: string): Promise<Street[]>;
  getServicePoints?(city: string, county?: string): Promise<ServicePoint[]>;
}

// ============================================================================
// Error Types
// ============================================================================

export class CourierError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: CourierCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CourierError';
  }
}

export class AuthenticationError extends CourierError {
  constructor(provider: CourierCode, details?: unknown) {
    super('Authentication failed', 'AUTH_FAILED', provider, details);
    this.name = 'AuthenticationError';
  }
}

export class QuoteError extends CourierError {
  constructor(provider: CourierCode, message: string, details?: unknown) {
    super(message, 'QUOTE_FAILED', provider, details);
    this.name = 'QuoteError';
  }
}

export class ShipmentError extends CourierError {
  constructor(provider: CourierCode, message: string, details?: unknown) {
    super(message, 'SHIPMENT_FAILED', provider, details);
    this.name = 'ShipmentError';
  }
}
