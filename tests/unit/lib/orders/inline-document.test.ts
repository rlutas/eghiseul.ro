import { describe, it, expect } from 'vitest';
import { classifyInlineDocument } from '@/lib/orders/inline-document';

const withHeader = (header: number[] | string, size = 4096) => {
  const start = typeof header === 'string' ? Buffer.from(header, 'ascii') : Buffer.from(header);
  return Buffer.concat([start, Buffer.alloc(size - start.length)]);
};
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47];

describe('classifyInlineDocument', () => {
  it('keeps a scanned ID sent as PDF, with the right extension and type', () => {
    expect(classifyInlineDocument(withHeader('%PDF-1.7'), false)).toEqual({
      extension: 'pdf',
      contentType: 'application/pdf',
    });
  });

  it('refuses a PDF as selfie', () => {
    expect(classifyInlineDocument(withHeader('%PDF-1.7'), true)).toBeNull();
  });

  it('keeps photos for any document, whatever the client declared', () => {
    expect(classifyInlineDocument(withHeader(JPEG), true)?.extension).toBe('jpg');
    expect(classifyInlineDocument(withHeader(PNG), false)?.contentType).toBe('image/png');
    const webp = withHeader('RIFF0000WEBP');
    expect(classifyInlineDocument(webp, false)?.extension).toBe('webp');
  });

  it('refuses unknown bytes and absurd sizes', () => {
    expect(classifyInlineDocument(withHeader('<html></html>'), false)).toBeNull();
    expect(classifyInlineDocument(withHeader('%PDF-1.7', 100), false)).toBeNull();
    expect(classifyInlineDocument(withHeader('%PDF-1.7', 13 * 1024 * 1024), false)).toBeNull();
  });
});
