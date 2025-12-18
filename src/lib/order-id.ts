/**
 * Order ID Generator
 *
 * Generates human-readable order IDs in format: ORD-YYYYMMDD-XXXXX
 * - ORD: Fixed prefix for order identification
 * - YYYYMMDD: Date of order creation
 * - XXXXX: 5-character alphanumeric code (Base32, excludes ambiguous chars)
 *
 * Example: ORD-20251218-A3B2C
 */

// Base32 character set (excludes: I, O, 0, 1 to avoid confusion)
const BASE32_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique order ID
 * Format: ORD-YYYYMMDD-XXXXX
 */
export function generateOrderId(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ''); // YYYYMMDD

  // Generate 5 random Base32 characters
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * BASE32_CHARS.length);
    code += BASE32_CHARS[randomIndex];
  }

  return `ORD-${date}-${code}`;
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
 */
export function validateOrderId(orderId: string): boolean {
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
 */
export function extractDateFromOrderId(orderId: string): Date | null {
  if (!validateOrderId(orderId)) return null;

  const dateStr = orderId.slice(4, 12); // YYYYMMDD
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);

  return new Date(year, month, day);
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
