/**
 * Courier Service Utilities
 *
 * Common helper functions for all courier providers.
 */

import { Address, Package, TrackingStatus } from './types';

// ============================================================================
// Package Helpers
// ============================================================================

/**
 * Default package for document shipments
 * Used for most eGhiseul services (cazier, certificate, etc.)
 */
export const DEFAULT_DOCUMENT_PACKAGE: Package = {
  weight: 0.5, // kg
  type: 'envelope',
  quantity: 1,
  length: 30, // cm (A4 envelope)
  width: 22, // cm
  height: 1, // cm
};

/**
 * Create a package object with defaults filled in
 */
export function createPackage(
  weight: number,
  quantity: number = 1,
  type: Package['type'] = 'parcel'
): Package {
  return {
    weight,
    type,
    quantity,
    // Default dimensions based on type
    ...(type === 'envelope' && { length: 30, width: 22, height: 1 }),
    ...(type === 'parcel' && { length: 30, width: 20, height: 10 }),
  };
}

/**
 * Calculate total weight of packages
 */
export function calculateTotalWeight(packages: Package[]): number {
  return packages.reduce((total, pkg) => total + pkg.weight * pkg.quantity, 0);
}

/**
 * Calculate volumetric weight (DIM weight)
 * Standard formula: L × W × H / 5000 (for international)
 */
export function calculateVolumetricWeight(pkg: Package, divisor: number = 5000): number {
  if (!pkg.length || !pkg.width || !pkg.height) {
    return pkg.weight;
  }
  return (pkg.length * pkg.width * pkg.height) / divisor;
}

/**
 * Get chargeable weight (max of actual and volumetric)
 */
export function getChargeableWeight(pkg: Package, divisor: number = 5000): number {
  const volumetric = calculateVolumetricWeight(pkg, divisor);
  return Math.max(pkg.weight, volumetric);
}

// ============================================================================
// Address Helpers
// ============================================================================

/**
 * Format address as a single line string
 */
export function formatAddressLine(address: Address): string {
  const parts: string[] = [];

  // Street with number
  if (address.street) {
    let streetLine = address.street;
    if (address.streetNo) streetLine += ` ${address.streetNo}`;
    parts.push(streetLine);
  }

  // Building details
  const buildingParts: string[] = [];
  if (address.building) buildingParts.push(`Bl. ${address.building}`);
  if (address.entrance) buildingParts.push(`Sc. ${address.entrance}`);
  if (address.floor) buildingParts.push(`Et. ${address.floor}`);
  if (address.apartment) buildingParts.push(`Ap. ${address.apartment}`);
  if (buildingParts.length > 0) {
    parts.push(buildingParts.join(', '));
  }

  // City and postal code
  if (address.city) {
    let cityLine = address.city;
    if (address.postalCode) cityLine = `${address.postalCode} ${cityLine}`;
    parts.push(cityLine);
  }

  // County
  if (address.county) {
    parts.push(`Jud. ${address.county}`);
  }

  // Country (if not Romania)
  if (address.country && address.country !== 'RO') {
    parts.push(address.country);
  }

  return parts.join(', ');
}

/**
 * Format address as multiline string
 */
export function formatAddressMultiline(address: Address): string[] {
  const lines: string[] = [];

  // Name
  if (address.name) {
    lines.push(address.name);
  }

  // Company
  if (address.company) {
    lines.push(address.company);
  }

  // Street with number
  if (address.street) {
    let streetLine = address.street;
    if (address.streetNo) streetLine += ` nr. ${address.streetNo}`;
    lines.push(streetLine);
  }

  // Building details
  const buildingParts: string[] = [];
  if (address.building) buildingParts.push(`Bl. ${address.building}`);
  if (address.entrance) buildingParts.push(`Sc. ${address.entrance}`);
  if (address.floor) buildingParts.push(`Et. ${address.floor}`);
  if (address.apartment) buildingParts.push(`Ap. ${address.apartment}`);
  if (buildingParts.length > 0) {
    lines.push(buildingParts.join(', '));
  }

  // City, postal code, county
  let locationLine = '';
  if (address.postalCode) locationLine += address.postalCode + ' ';
  if (address.city) locationLine += address.city;
  if (address.county) locationLine += `, Jud. ${address.county}`;
  if (locationLine) lines.push(locationLine.trim());

  // Country
  if (address.country && address.country !== 'RO') {
    lines.push(address.country);
  }

  // Phone
  if (address.phone) {
    lines.push(`Tel: ${address.phone}`);
  }

  return lines;
}

/**
 * Check if address is domestic (Romania)
 */
export function isDomesticAddress(address: Pick<Address, 'country'>): boolean {
  return !address.country || address.country.toUpperCase() === 'RO';
}

/**
 * Validate Romanian phone number format
 */
export function isValidRomanianPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Romanian mobile: 07XX XXX XXX or +407XX XXX XXX
  // Romanian landline: 02X XXX XXXX or 03X XXX XXXX
  const mobilePattern = /^(\+?40|0)?7\d{8}$/;
  const landlinePattern = /^(\+?40|0)?[23]\d{8}$/;

  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
}

/**
 * Normalize Romanian phone to international format
 */
export function normalizeRomanianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+40')) {
    return cleaned;
  }

  if (cleaned.startsWith('40')) {
    return '+' + cleaned;
  }

  if (cleaned.startsWith('0')) {
    return '+40' + cleaned.slice(1);
  }

  return '+40' + cleaned;
}

// ============================================================================
// Tracking Status Helpers
// ============================================================================

/**
 * Map common tracking status codes to normalized status
 */
export function normalizeTrackingStatus(
  providerStatus: string,
  provider: string
): TrackingStatus {
  const status = providerStatus.toLowerCase();

  // Common delivered patterns
  if (
    status.includes('livrat') ||
    status.includes('delivered') ||
    status.includes('predat')
  ) {
    return 'delivered';
  }

  // Out for delivery
  if (
    status.includes('in livrare') ||
    status.includes('out for delivery') ||
    status.includes('pe drum')
  ) {
    return 'out_for_delivery';
  }

  // In transit
  if (
    status.includes('tranzit') ||
    status.includes('transit') ||
    status.includes('plecat') ||
    status.includes('sosit')
  ) {
    return 'in_transit';
  }

  // Picked up
  if (
    status.includes('preluat') ||
    status.includes('picked') ||
    status.includes('ridicat')
  ) {
    return 'picked_up';
  }

  // Failed delivery
  if (
    status.includes('esuat') ||
    status.includes('failed') ||
    status.includes('nelivrat') ||
    status.includes('refuzat')
  ) {
    return 'failed_delivery';
  }

  // Returned
  if (status.includes('returnat') || status.includes('return')) {
    return 'returned';
  }

  // Cancelled
  if (status.includes('anulat') || status.includes('cancel')) {
    return 'cancelled';
  }

  // Pending (default for new)
  if (status.includes('inregistrat') || status.includes('created') || status.includes('nou')) {
    return 'pending';
  }

  return 'unknown';
}

/**
 * Get human-readable status label in Romanian
 */
export function getTrackingStatusLabel(status: TrackingStatus): string {
  const labels: Record<TrackingStatus, string> = {
    pending: 'În așteptare',
    picked_up: 'Preluat de curier',
    in_transit: 'În tranzit',
    out_for_delivery: 'În livrare',
    delivered: 'Livrat',
    failed_delivery: 'Livrare eșuată',
    returned: 'Returnat',
    cancelled: 'Anulat',
    unknown: 'Necunoscut',
  };
  return labels[status];
}

/**
 * Check if tracking status is final (no more updates expected)
 */
export function isFinalStatus(status: TrackingStatus): boolean {
  return ['delivered', 'returned', 'cancelled'].includes(status);
}

// ============================================================================
// Date/Time Helpers
// ============================================================================

/**
 * Calculate estimated delivery date from business days
 */
export function calculateEstimatedDelivery(businessDays: number): Date {
  const result = new Date();

  // Start from tomorrow
  result.setDate(result.getDate() + 1);

  // Skip to next business day if weekend
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }

  // Add business days
  let addedDays = 0;
  while (addedDays < businessDays) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Format date as Romanian string
 */
export function formatDateRomanian(date: Date): string {
  return date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Check if date is a business day
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

// ============================================================================
// Price Helpers
// ============================================================================

/**
 * Add VAT to price (19% for Romania)
 */
export function addVAT(price: number, vatRate: number = 0.19): number {
  return Math.round((price * (1 + vatRate)) * 100) / 100;
}

/**
 * Extract VAT from gross price
 */
export function extractVAT(grossPrice: number, vatRate: number = 0.19): number {
  const netPrice = grossPrice / (1 + vatRate);
  return Math.round((grossPrice - netPrice) * 100) / 100;
}

/**
 * Format price in RON
 */
export function formatPriceRON(amount: number): string {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// Romanian Counties
// ============================================================================

/**
 * List of Romanian counties (județe) with codes
 */
export const ROMANIAN_COUNTIES: Array<{ code: string; name: string }> = [
  { code: 'AB', name: 'Alba' },
  { code: 'AR', name: 'Arad' },
  { code: 'AG', name: 'Argeș' },
  { code: 'BC', name: 'Bacău' },
  { code: 'BH', name: 'Bihor' },
  { code: 'BN', name: 'Bistrița-Năsăud' },
  { code: 'BT', name: 'Botoșani' },
  { code: 'BR', name: 'Brăila' },
  { code: 'BV', name: 'Brașov' },
  { code: 'B', name: 'București' },
  { code: 'BZ', name: 'Buzău' },
  { code: 'CL', name: 'Călărași' },
  { code: 'CS', name: 'Caraș-Severin' },
  { code: 'CJ', name: 'Cluj' },
  { code: 'CT', name: 'Constanța' },
  { code: 'CV', name: 'Covasna' },
  { code: 'DB', name: 'Dâmbovița' },
  { code: 'DJ', name: 'Dolj' },
  { code: 'GL', name: 'Galați' },
  { code: 'GR', name: 'Giurgiu' },
  { code: 'GJ', name: 'Gorj' },
  { code: 'HR', name: 'Harghita' },
  { code: 'HD', name: 'Hunedoara' },
  { code: 'IL', name: 'Ialomița' },
  { code: 'IS', name: 'Iași' },
  { code: 'IF', name: 'Ilfov' },
  { code: 'MM', name: 'Maramureș' },
  { code: 'MH', name: 'Mehedinți' },
  { code: 'MS', name: 'Mureș' },
  { code: 'NT', name: 'Neamț' },
  { code: 'OT', name: 'Olt' },
  { code: 'PH', name: 'Prahova' },
  { code: 'SJ', name: 'Sălaj' },
  { code: 'SM', name: 'Satu Mare' },
  { code: 'SB', name: 'Sibiu' },
  { code: 'SV', name: 'Suceava' },
  { code: 'TR', name: 'Teleorman' },
  { code: 'TM', name: 'Timiș' },
  { code: 'TL', name: 'Tulcea' },
  { code: 'VL', name: 'Vâlcea' },
  { code: 'VS', name: 'Vaslui' },
  { code: 'VN', name: 'Vrancea' },
];

/**
 * Get county name by code
 */
export function getCountyName(code: string): string | undefined {
  return ROMANIAN_COUNTIES.find((c) => c.code === code.toUpperCase())?.name;
}

/**
 * Get county code by name
 */
export function getCountyCode(name: string): string | undefined {
  const normalized = name.toLowerCase().trim();
  return ROMANIAN_COUNTIES.find(
    (c) => c.name.toLowerCase() === normalized
  )?.code;
}
