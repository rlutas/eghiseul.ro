/**
 * Audit Logger for security-sensitive operations
 * Logs PII access and modifications for GDPR compliance
 */

import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/types/supabase';

export type AuditAction =
  | 'ocr_extract'       // Document OCR extraction
  | 'kyc_validate'      // KYC validation
  | 'order_create'      // Order creation
  | 'order_view'        // Order viewed
  | 'order_update'      // Order updated
  | 'pii_access'        // Personal data accessed
  | 'pii_export'        // Personal data exported
  | 'pii_delete'        // Personal data deleted
  | 'login_success'     // Successful login
  | 'login_failed'      // Failed login attempt
  | 'auth_logout';      // User logout

export type AuditStatus = 'success' | 'failed' | 'blocked';

export interface AuditLogEntry {
  action: AuditAction;
  status: AuditStatus;
  userId?: string | null;        // Logged in user ID
  ipAddress: string;
  userAgent?: string;
  resourceType?: string;         // e.g., 'order', 'document', 'user'
  resourceId?: string;           // e.g., order ID
  metadata?: Record<string, unknown>;  // Additional context (NO PII!)
  errorMessage?: string;
}

/**
 * Log an audit event
 * This logs to both console (for dev) and database (for production)
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Always log to console for development
  const logData = {
    timestamp,
    ...entry,
  };

  if (entry.status === 'failed' || entry.status === 'blocked') {
    console.warn('[AUDIT]', JSON.stringify(logData));
  } else {
    console.log('[AUDIT]', JSON.stringify(logData));
  }

  // Database logging for production persistence
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('audit_logs').insert({
      action: entry.action,
      status: entry.status,
      user_id: entry.userId || null,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent || null,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      metadata: (entry.metadata || {}) as Json,
      error_message: entry.errorMessage || null,
    });

    if (error) {
      // Don't throw - audit logging should not break the main flow
      console.error('[AUDIT DB ERROR]', error.message);
    }
  } catch (dbError) {
    // Silently fail database logging - console log is already done
    console.error('[AUDIT DB ERROR]', dbError instanceof Error ? dbError.message : 'Unknown error');
  }
}

/**
 * Helper to create audit context from request
 */
export function getAuditContext(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  // Get IP address
  let ipAddress = 'unknown';
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    ipAddress = forwarded.split(',')[0].trim();
  } else {
    const realIP = request.headers.get('x-real-ip');
    if (realIP) ipAddress = realIP;
  }

  // Get user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Sanitize metadata to ensure no PII is logged
 * IMPORTANT: Never log actual CNP, names, addresses, etc.
 */
export function sanitizeMetadata(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip sensitive fields
    if ([
      'cnp', 'ci_series', 'ci_number', 'first_name', 'last_name',
      'address', 'phone', 'email', 'birth_date', 'birth_place',
      'imageBase64', 'image', 'signature', 'password'
    ].includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Recursively sanitize objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
