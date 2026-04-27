/**
 * Client-side image compression for KYC uploads.
 *
 * Reduces 3-7 MB phone photos to 200-500 KB JPEGs while keeping OCR-quality
 * resolution for Romanian CI cards (CNP, names, address all readable).
 *
 * Targets: longest edge 1600 px, JPEG quality 0.85.
 * EXIF orientation is applied via createImageBitmap (no upside-down faces).
 *
 * Falls back gracefully:
 *   - If decode fails (HEIC, corrupt) → throws DECODE_ERROR; caller should
 *     surface a clear message and ask the user to retake the photo.
 *   - If OffscreenCanvas is missing (very old browsers) → uses HTMLCanvasElement.
 */

export interface CompressedImage {
  /** Raw base64 (no `data:` prefix) — for OCR / KYC API bodies. */
  base64: string;
  /** Full data URL with `data:image/jpeg;base64,` prefix — for `<img src=>` previews. */
  dataUrl: string;
  mimeType: 'image/jpeg';
  /** Original file size in bytes (for telemetry / UI). */
  sizeBefore: number;
  /** Compressed size in bytes. */
  sizeAfter: number;
  width: number;
  height: number;
}

export interface CompressOptions {
  /** Max length of the longest side (preserves aspect ratio). Default 1600. */
  maxEdge?: number;
  /** JPEG quality 0–1. Default 0.85. */
  quality?: number;
}

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 0.85;
const HEIC_RX = /heic|heif/i;

export class ImageCompressionError extends Error {
  constructor(public code: 'HEIC_UNSUPPORTED' | 'DECODE_FAILED' | 'CANVAS_UNAVAILABLE' | 'ENCODE_FAILED', message: string) {
    super(message);
    this.name = 'ImageCompressionError';
  }
}

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<CompressedImage> {
  const maxEdge = opts.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = opts.quality ?? DEFAULT_QUALITY;
  const sizeBefore = file.size;

  if (HEIC_RX.test(file.type) || /\.heic$|\.heif$/i.test(file.name)) {
    throw new ImageCompressionError(
      'HEIC_UNSUPPORTED',
      'HEIC nu poate fi procesat în browser. Setează iPhone-ul: Settings → Camera → Formats → Most Compatible, sau retrage poza ca JPEG.'
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new ImageCompressionError('DECODE_FAILED', 'Imaginea nu a putut fi decodificată. Încearcă altă poză.');
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const useOffscreen = typeof OffscreenCanvas !== 'undefined';
  let blob: Blob;

  try {
    if (useOffscreen) {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('no 2d ctx');
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality });
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) throw new Error('no 2d ctx');
      ctx.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
          'image/jpeg',
          quality
        );
      });
      // Free Safari canvas memory hoarding
      canvas.width = 0;
      canvas.height = 0;
    }
  } catch (e) {
    bitmap.close();
    throw new ImageCompressionError(
      e instanceof Error && e.message.includes('no 2d ctx') ? 'CANVAS_UNAVAILABLE' : 'ENCODE_FAILED',
      'Nu am putut procesa imaginea. Încearcă din nou sau folosește alt browser.'
    );
  } finally {
    bitmap.close?.();
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('FileReader failed'));
    fr.readAsDataURL(blob);
  });

  const base64 = dataUrl.split(',')[1] ?? '';

  return {
    base64,
    dataUrl,
    mimeType: 'image/jpeg',
    sizeBefore,
    sizeAfter: blob.size,
    width,
    height,
  };
}

/**
 * Wraps a compressed image back into a File (e.g. for re-upload to S3 via FormData).
 * The new filename keeps the original stem but always uses .jpg extension.
 */
export function compressedToFile(compressed: CompressedImage, originalFile: File): File {
  const stem = originalFile.name.replace(/\.[^/.]+$/, '');
  const blob = base64ToBlob(compressed.base64, 'image/jpeg');
  return new File([blob], `${stem}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = atob(base64);
  const len = byteString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = byteString.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}
