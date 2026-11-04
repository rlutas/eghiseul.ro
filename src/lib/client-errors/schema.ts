/**
 * Client error log — shared contract between the browser helper
 * (`report.ts`) and `POST /api/client-errors`.
 *
 * Privacy: the row never carries CNP, names, emails, phone numbers, images or
 * file contents. The server keeps only allowlisted fields, truncates them and
 * scrubs long digit runs / emails from free text, whatever the client sends.
 */

export const CLIENT_ERROR_KINDS = [
  'image_decode',
  'image_compress',
  'upload_failed',
  'cnp_invalid',
  'ocr_failed',
  'kyc_failed',
  'payment_error',
  'save_failed',
  'module_load_failed',
  'other',
] as const;

export type ClientErrorKind = (typeof CLIENT_ERROR_KINDS)[number];

/** Keys allowed inside `meta`. Values: short strings, numbers, booleans. */
export const CLIENT_ERROR_META_KEYS = [
  'mime',
  'sizeBucket',
  'fallback',
  'docType',
  'status',
  'attempt',
  'source',
] as const;

export interface ClientErrorPayload {
  kind: ClientErrorKind;
  code?: string;
  message?: string;
  page?: string;
  step?: string;
  serviceSlug?: string;
  orderRef?: string;
  meta?: Partial<Record<(typeof CLIENT_ERROR_META_KEYS)[number], string | number | boolean>>;
}

export interface ClientErrorRow {
  kind: ClientErrorKind;
  code: string | null;
  message: string | null;
  page: string | null;
  step: string | null;
  service_slug: string | null;
  order_ref: string | null;
  meta: Record<string, string | number | boolean> | null;
}

/** Remove anything that could identify a person from free text. */
export function scrubText(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\d[\d\s-]{6,}\d/g, '[cifre]');
}

function str(value: unknown, max: number, scrub = false): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const clean = scrub ? scrubText(trimmed) : trimmed;
  return clean.slice(0, max);
}

/** Identifier-like fields: letters, digits, `-_./`, nothing else. */
function ident(value: unknown, max: number): string | null {
  const s = str(value, max);
  if (!s) return null;
  return /^[A-Za-z0-9_\-./]+$/.test(s) ? s : null;
}

/** Order refs look like E-260710-F3AYS, CJO-20260710-86615, TEST-NOT-REAL. */
function orderRef(value: unknown): string | null {
  const s = str(value, 40);
  if (!s) return null;
  return /^[A-Z]{1,6}-[A-Z0-9-]{3,30}$/i.test(s) ? s.toUpperCase() : null;
}

/** Strip query + hash (resume tokens, emails in links) and long digit runs. */
function pagePath(value: unknown): string | null {
  const s = str(value, 300);
  if (!s) return null;
  let path = s;
  try {
    path = new URL(s, 'https://x.invalid').pathname;
  } catch {
    path = s.split(/[?#]/)[0];
  }
  return scrubText(path).slice(0, 200);
}

/**
 * Validate + sanitize a raw body. Returns null when the kind is unknown or the
 * body is not an object (the route then drops it silently).
 */
export function sanitizeClientErrorPayload(body: unknown): ClientErrorRow | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  if (typeof b.kind !== 'string' || !(CLIENT_ERROR_KINDS as readonly string[]).includes(b.kind)) return null;

  let meta: Record<string, string | number | boolean> | null = null;
  if (b.meta && typeof b.meta === 'object' && !Array.isArray(b.meta)) {
    for (const key of CLIENT_ERROR_META_KEYS) {
      const v = (b.meta as Record<string, unknown>)[key];
      if (typeof v === 'number' && Number.isFinite(v)) (meta ??= {})[key] = v;
      else if (typeof v === 'boolean') (meta ??= {})[key] = v;
      else if (typeof v === 'string' && v.trim()) (meta ??= {})[key] = scrubText(v.trim()).slice(0, 60);
    }
  }

  return {
    kind: b.kind as ClientErrorKind,
    code: ident(b.code, 40),
    message: str(b.message, 300, true),
    page: pagePath(b.page),
    step: ident(b.step, 60),
    service_slug: ident(b.serviceSlug, 80),
    order_ref: orderRef(b.orderRef),
    meta,
  };
}

/** Coarse file size bucket — enough to spot „huge photo" without the bytes. */
export function sizeBucket(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return '<1MB';
  if (mb < 3) return '1-3MB';
  if (mb < 6) return '3-6MB';
  if (mb < 10) return '6-10MB';
  return '>10MB';
}
