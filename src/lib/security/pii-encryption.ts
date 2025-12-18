/**
 * PII Encryption Helper
 * Handles encryption/decryption of sensitive personal data
 * Uses pgcrypto on the database side, this is the API interface
 */

import { createClient } from '@/lib/supabase/server';

// Encryption key from environment
const getEncryptionKey = () => {
  const key = process.env.PII_ENCRYPTION_KEY;
  if (!key) {
    console.warn('[SECURITY] PII_ENCRYPTION_KEY not set - encryption disabled');
    return null;
  }
  if (key.length < 32) {
    console.error('[SECURITY] PII_ENCRYPTION_KEY must be at least 32 characters');
    return null;
  }
  return key;
};

export interface DecryptedPII {
  cnp: string | null;
  ci_series: string | null;
  ci_number: string | null;
}

/**
 * Get decrypted PII for an order
 * Only use this when absolutely necessary (e.g., processing documents)
 */
export async function getDecryptedPII(orderId: string): Promise<DecryptedPII | null> {
  const key = getEncryptionKey();
  if (!key) {
    // Fallback: return data from customer_data (unencrypted mode)
    const supabase = await createClient();
    const { data: order } = await supabase
      .from('orders')
      .select('customer_data')
      .eq('id', orderId)
      .single();

    if (!order) return null;

    // customer_data is JSONB, cast to expected structure
    const customerData = order.customer_data as { personal?: Record<string, string> } | null;
    const personal = customerData?.personal;
    return {
      cnp: personal?.cnp || null,
      ci_series: personal?.ci_series || null,
      ci_number: personal?.ci_number || null,
    };
  }

  try {
    const supabase = await createClient();

    // Use the RPC function to decrypt
    const { data, error } = await supabase.rpc('get_order_decrypted_pii', {
      p_order_id: orderId,
      p_encryption_key: key,
    });

    if (error) {
      console.error('[SECURITY] Failed to decrypt PII:', error.message);
      return null;
    }

    // RPC returns an array, get first result
    const result = Array.isArray(data) ? data[0] : data;
    return result || null;
  } catch (error) {
    console.error('[SECURITY] PII decryption error:', error);
    return null;
  }
}

/**
 * Check if PII encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  return !!getEncryptionKey();
}

/**
 * Mask a CNP for display (1***********3456)
 */
export function maskCNP(cnp: string | null | undefined): string {
  if (!cnp || cnp.length < 13) return '***';
  return cnp.substring(0, 1) + '***********' + cnp.substring(9, 13);
}

/**
 * Mask a CI number for display (***628)
 */
export function maskCINumber(ciNumber: string | null | undefined): string {
  if (!ciNumber || ciNumber.length < 3) return '***';
  return '***' + ciNumber.substring(ciNumber.length - 3);
}

/**
 * Prepare customer data for storage
 * In production with encryption key: removes raw PII (handled by DB trigger)
 * Without encryption key: keeps data as-is for development
 */
export function prepareCustomerDataForStorage(customerData: Record<string, unknown>): Record<string, unknown> {
  // If encryption is disabled, return data as-is
  if (!isEncryptionEnabled()) {
    return customerData;
  }

  // With encryption enabled, the DB trigger will handle encryption
  // We just need to ensure the data structure is correct
  return customerData;
}

/**
 * Validate CNP format (Romanian Personal Numeric Code)
 */
export function validateCNP(cnp: string): { valid: boolean; error?: string } {
  if (!cnp || cnp.length !== 13) {
    return { valid: false, error: 'CNP trebuie să aibă 13 cifre' };
  }

  if (!/^\d{13}$/.test(cnp)) {
    return { valid: false, error: 'CNP trebuie să conțină doar cifre' };
  }

  // Check first digit (gender and century)
  const firstDigit = parseInt(cnp[0], 10);
  if (firstDigit < 1 || firstDigit > 8) {
    return { valid: false, error: 'Prima cifră CNP invalidă' };
  }

  // Validate checksum (control digit)
  const controlWeights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnp[i], 10) * controlWeights[i];
  }
  const remainder = sum % 11;
  const expectedControl = remainder === 10 ? 1 : remainder;
  const actualControl = parseInt(cnp[12], 10);

  if (expectedControl !== actualControl) {
    return { valid: false, error: 'CNP invalid (cifra de control incorectă)' };
  }

  return { valid: true };
}

/**
 * Validate CI Series format
 */
export function validateCISeries(series: string): { valid: boolean; error?: string } {
  if (!series || series.length !== 2) {
    return { valid: false, error: 'Seria CI trebuie să aibă 2 caractere' };
  }

  if (!/^[A-Z]{2}$/.test(series)) {
    return { valid: false, error: 'Seria CI trebuie să conțină 2 litere mari' };
  }

  return { valid: true };
}

/**
 * Validate CI Number format
 */
export function validateCINumber(number: string): { valid: boolean; error?: string } {
  if (!number || number.length !== 6) {
    return { valid: false, error: 'Numărul CI trebuie să aibă 6 cifre' };
  }

  if (!/^\d{6}$/.test(number)) {
    return { valid: false, error: 'Numărul CI trebuie să conțină doar cifre' };
  }

  return { valid: true };
}
