/**
 * Wizard image pipeline: compress, and when the browser cannot decode or
 * re-encode a perfectly normal JPEG/PNG (older iOS Safari — the client saw his
 * photo in the preview next to „Imaginea nu a putut fi decodificată", 02.11),
 * send the ORIGINAL file instead of blocking the customer.
 *
 * Every compression failure is reported to the client error log (kind
 * `image_decode` / `image_compress`, with mime + size bucket — never the file).
 *
 * Size cap for the fallback: the server accepts up to 10–12 MB per document
 * (`/api/upload` 10 MB, `/submit` 12 MB), but the KYC images travel as base64
 * inside ONE JSON body (draft save → `customer_data.personal`) and Vercel
 * refuses request bodies over 4.5 MB. 2.5 MB original ≈ 3.4 MB base64, which
 * still leaves room for the other (compressed, ~300 KB) documents. Bigger
 * originals keep the old error.
 */
import { compressImage, ImageCompressionError, type CompressOptions, type CompressedImage } from './compress';
import { reportClientError } from '@/lib/client-errors/report';
import { sizeBucket } from '@/lib/client-errors/schema';

export const ORIGINAL_FALLBACK_MAX_BYTES = Math.floor(2.5 * 1024 * 1024);
const FALLBACK_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png']);
const FALLBACK_CODES = new Set<ImageCompressionError['code']>(['DECODE_FAILED', 'CANVAS_UNAVAILABLE', 'ENCODE_FAILED']);

export interface PreparedImage extends Omit<CompressedImage, 'mimeType'> {
  mimeType: string;
  /** 'original' when compression failed and the untouched file is sent. */
  fallback: 'original' | null;
}

export interface PrepareContext {
  docType?: string;
  step?: string;
  serviceSlug?: string | null;
  orderRef?: string | null;
}

interface Deps {
  compress: (file: File, opts?: CompressOptions) => Promise<CompressedImage>;
  readAsDataUrl: (file: File) => Promise<string>;
  report: typeof reportClientError;
}

function readAsDataUrlBrowser(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

const defaultDeps: Deps = { compress: compressImage, readAsDataUrl: readAsDataUrlBrowser, report: reportClientError };

export function canSendOriginal(file: File, code: ImageCompressionError['code']): boolean {
  const mime = (file.type || '').toLowerCase();
  return FALLBACK_CODES.has(code) && FALLBACK_MIME.has(mime) && file.size > 0 && file.size <= ORIGINAL_FALLBACK_MAX_BYTES;
}

export async function prepareImageForUpload(
  file: File,
  ctx: PrepareContext = {},
  opts: CompressOptions = {},
  deps: Deps = defaultDeps
): Promise<PreparedImage> {
  try {
    const compressed = await deps.compress(file, opts);
    return { ...compressed, fallback: null };
  } catch (error) {
    if (!(error instanceof ImageCompressionError)) throw error;

    const useOriginal = canSendOriginal(file, error.code);
    const base = {
      kind: error.code === 'DECODE_FAILED' ? ('image_decode' as const) : ('image_compress' as const),
      code: error.code,
      message: error.message,
      step: ctx.step,
      serviceSlug: ctx.serviceSlug ?? undefined,
      orderRef: ctx.orderRef ?? undefined,
    };
    const meta = {
      mime: (file.type || 'unknown').slice(0, 40),
      sizeBucket: sizeBucket(file.size),
      ...(ctx.docType ? { docType: ctx.docType } : {}),
    };

    if (useOriginal) {
      try {
        const dataUrl = await deps.readAsDataUrl(file);
        const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
        if (!base64) throw new Error('empty read');
        const mimeType = file.type.toLowerCase() === 'image/jpg' ? 'image/jpeg' : file.type.toLowerCase();
        deps.report({ ...base, meta: { ...meta, fallback: 'original' } });
        return {
          base64,
          dataUrl: `data:${mimeType};base64,${base64}`,
          mimeType,
          sizeBefore: file.size,
          sizeAfter: file.size,
          width: 0,
          height: 0,
          fallback: 'original',
        };
      } catch {
        // could not even read the bytes → report + original error below
      }
    }

    deps.report({
      ...base,
      meta: { ...meta, fallback: FALLBACK_CODES.has(error.code) && file.size > ORIGINAL_FALLBACK_MAX_BYTES ? 'too_large' : 'none' },
    });
    throw error;
  }
}
