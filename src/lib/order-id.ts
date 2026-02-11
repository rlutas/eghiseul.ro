/**
 * Order ID Generator
 *
 * Generates human-readable order IDs in format: E-YYMMDD-XXXXX
 * - E: Fixed prefix for eGhiseul
 * - YYMMDD: Date of order creation (short year)
 * - XXXXX: 5-character alphanumeric code (Base32, excludes ambiguous chars)
 *
 * Example: E-260112-A3B2C
 *
 * Legacy format (still supported for search): ORD-YYYYMMDD-XXXXX
 */

// Base32 character set (excludes: I, O, 0, 1 to avoid confusion)
const BASE32_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique order ID
 * Format: E-YYMMDD-XXXXX (14 chars total)
 */
export function generateOrderId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2); // Last 2 digits of year
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const date = `${yy}${mm}${dd}`; // YYMMDD

  // Generate 5 random Base32 characters
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * BASE32_CHARS.length);
    code += BASE32_CHARS[randomIndex];
  }

  return `E-${date}-${code}`;
}

/**
 * Generate a payment reference for bank transfers
 * Format: PAY-YYYYMMDD-XXXXX
 */
export function generatePaymentReference(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');

  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * BASE32_CHARS.length);
    code += BASE32_CHARS[randomIndex];
  }

  return `PAY-${date}-${code}`;
}

/**
 * Validate an order ID format
 * Supports both new format (E-YYMMDD-XXXXX) and legacy format (ORD-YYYYMMDD-XXXXX)
 */
export function validateOrderId(orderId: string): boolean {
  // New format: E-YYMMDD-XXXXX (14 chars)
  const newPattern = /^E-\d{6}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;
  // Legacy format: ORD-YYYYMMDD-XXXXX (19 chars)
  const legacyPattern = /^ORD-\d{8}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;

  return newPattern.test(orderId) || legacyPattern.test(orderId);
}

/**
 * Check if order ID is in new short format
 */
export function isShortOrderId(orderId: string): boolean {
  const pattern = /^E-\d{6}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;
  return pattern.test(orderId);
}

/**
 * Check if order ID is in legacy format
 */
export function isLegacyOrderId(orderId: string): boolean {
  const pattern = /^ORD-\d{8}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;
  return pattern.test(orderId);
}

/**
 * Validate a payment reference format
 */
export function validatePaymentReference(ref: string): boolean {
  const pattern = /^PAY-\d{8}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;
  return pattern.test(ref);
}

/**
 * Extract date from order ID
 * Supports both new format (E-YYMMDD-XXXXX) and legacy format (ORD-YYYYMMDD-XXXXX)
 */
export function extractDateFromOrderId(orderId: string): Date | null {
  if (!validateOrderId(orderId)) return null;

  if (isShortOrderId(orderId)) {
    // New format: E-YYMMDD-XXXXX
    const dateStr = orderId.slice(2, 8); // YYMMDD
    const year = 2000 + parseInt(dateStr.slice(0, 2), 10);
    const month = parseInt(dateStr.slice(2, 4), 10) - 1;
    const day = parseInt(dateStr.slice(4, 6), 10);
    return new Date(year, month, day);
  } else {
    // Legacy format: ORD-YYYYMMDD-XXXXX
    const dateStr = orderId.slice(4, 12); // YYYYMMDD
    const year = parseInt(dateStr.slice(0, 4), 10);
    const month = parseInt(dateStr.slice(4, 6), 10) - 1;
    const day = parseInt(dateStr.slice(6, 8), 10);
    return new Date(year, month, day);
  }
}

/**
 * Format order ID for display (with spaces for readability)
 */
export function formatOrderIdForDisplay(orderId: string): string {
  return orderId; // Already formatted nicely
}

/**
 * Local storage key for draft orders
 */
export function getDraftStorageKey(orderId: string): string {
  return `order_draft_${orderId}`;
}

/**
 * Check if order ID belongs to today
 */
export function isOrderIdFromToday(orderId: string): boolean {
  const orderDate = extractDateFromOrderId(orderId);
  if (!orderDate) return false;

  const today = new Date();
  return (
    orderDate.getFullYear() === today.getFullYear() &&
    orderDate.getMonth() === today.getMonth() &&
    orderDate.getDate() === today.getDate()
  );
}
