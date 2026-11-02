import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { brandFromRequest } from '@/lib/brand/server';
import { sanitizeClientErrorPayload } from '@/lib/client-errors/schema';

export const dynamic = 'force-dynamic';

const OK = () => NextResponse.json({ success: true });
const MAX_BODY_BYTES = 4096;

/**
 * POST /api/client-errors — public, no auth.
 *
 * Records an error the customer saw in the browser (image decode, CNP
 * checksum, OCR, upload…) into `client_error_log`. Always answers
 * `{ success: true }`: invalid kinds, oversized bodies and requests over the
 * per-IP limit are dropped silently, so the endpoint gives nothing to probe.
 * Only allowlisted, truncated, scrubbed fields are stored — never CNP, names,
 * emails or file contents.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    if (!checkRateLimit(`client-errors:${ip}`, { windowMs: 10 * 60 * 1000, maxRequests: 30 }).allowed) {
      return OK();
    }

    const raw = await request.text();
    if (!raw || raw.length > MAX_BODY_BYTES) return OK();
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return OK();
    }

    const row = sanitizeClientErrorPayload(body);
    if (!row) return OK();

    const brand = brandFromRequest(request);
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 300) || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    const { error } = await admin.from('client_error_log').insert({
      ...row,
      platform: brand.id,
      user_agent: userAgent,
    });
    if (error) console.error('[client-errors] insert failed:', error.message);
  } catch (err) {
    console.error('[client-errors] failed:', err instanceof Error ? err.message : err);
  }
  return OK();
}
