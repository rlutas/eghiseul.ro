/**
 * What /submit accepts from `customer_data` as an inline identity document.
 *
 * `customer_data` is client-writable, so the bytes decide, not the declared type.
 * A scanned ID often comes as PDF, so PDF passes for every document except the
 * selfie: the team and the face match compare a photo with the act.
 */

export type InlineDocumentFormat = 'jpg' | 'png' | 'webp' | 'pdf';

const MIN_BYTES = 2048;
const MAX_BYTES = 12 * 1024 * 1024;

const CONTENT_TYPE: Record<InlineDocumentFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

function detectFormat(b: Buffer): InlineDocumentFormat | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (b.subarray(0, 5).toString('ascii') === '%PDF-') return 'pdf';
  return null;
}

/** The stored format and content type, or null when the document must be dropped. */
export function classifyInlineDocument(
  bytes: Buffer,
  isSelfie: boolean,
): { extension: InlineDocumentFormat; contentType: string } | null {
  if (bytes.length < MIN_BYTES || bytes.length > MAX_BYTES) return null;
  const format = detectFormat(bytes);
  if (!format || (format === 'pdf' && isSelfie)) return null;
  return { extension: format, contentType: CONTENT_TYPE[format] };
}
