import { describe, it, expect, vi } from 'vitest';
import { ImageCompressionError } from '@/lib/images/compress';
import { prepareImageForUpload, ORIGINAL_FALLBACK_MAX_BYTES, canSendOriginal } from '@/lib/images/prepare-upload';

function file(size: number, type: string, name = 'poza.jpg'): File {
  return new File([new Uint8Array(size)], name, { type });
}

function deps(err: ImageCompressionError | null) {
  return {
    compress: vi.fn(async () => {
      if (err) throw err;
      return { base64: 'QUJD', dataUrl: 'data:image/jpeg;base64,QUJD', mimeType: 'image/jpeg' as const, sizeBefore: 10, sizeAfter: 3, width: 1, height: 1 };
    }),
    readAsDataUrl: vi.fn(async (f: File) => `data:${f.type};base64,T1JJRw==`),
    report: vi.fn(),
  };
}

describe('prepareImageForUpload', () => {
  it('returns the compressed image when compression works', async () => {
    const d = deps(null);
    const out = await prepareImageForUpload(file(1000, 'image/jpeg'), {}, {}, d);
    expect(out.fallback).toBeNull();
    expect(out.base64).toBe('QUJD');
    expect(d.report).not.toHaveBeenCalled();
  });

  it('sends the original JPEG when decoding fails and reports it', async () => {
    const d = deps(new ImageCompressionError('DECODE_FAILED', 'Imaginea nu a putut fi decodificată. Încearcă altă poză.'));
    const out = await prepareImageForUpload(
      file(2 * 1024 * 1024, 'image/jpeg'),
      { docType: 'selfie', step: 'kyc-documents', serviceSlug: 'cazier-judiciar', orderRef: 'E-261102-TEST1' },
      {},
      d
    );
    expect(out.fallback).toBe('original');
    expect(out.mimeType).toBe('image/jpeg');
    expect(out.base64).toBe('T1JJRw==');
    expect(out.dataUrl).toBe('data:image/jpeg;base64,T1JJRw==');
    expect(d.report).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'image_decode',
        code: 'DECODE_FAILED',
        step: 'kyc-documents',
        orderRef: 'E-261102-TEST1',
        meta: { mime: 'image/jpeg', sizeBucket: '1-3MB', docType: 'selfie', fallback: 'original' },
      })
    );
  });

  it('also falls back for PNG on canvas/encode failures', async () => {
    for (const code of ['CANVAS_UNAVAILABLE', 'ENCODE_FAILED'] as const) {
      const d = deps(new ImageCompressionError(code, 'x'));
      const out = await prepareImageForUpload(file(5000, 'image/png', 'a.png'), {}, {}, d);
      expect(out.fallback).toBe('original');
      expect(out.mimeType).toBe('image/png');
      expect(d.report.mock.calls[0][0].kind).toBe('image_compress');
    }
  });

  it('keeps the error for files above the cap (Vercel 4.5 MB body)', async () => {
    const d = deps(new ImageCompressionError('DECODE_FAILED', 'nope'));
    await expect(prepareImageForUpload(file(ORIGINAL_FALLBACK_MAX_BYTES + 1, 'image/jpeg'), {}, {}, d)).rejects.toThrow('nope');
    expect(d.readAsDataUrl).not.toHaveBeenCalled();
    expect(d.report.mock.calls[0][0].meta.fallback).toBe('too_large');
    // 2.5 MB original → base64 ≈ 3.4 MB, under the 4.5 MB request limit.
    expect(Math.ceil(ORIGINAL_FALLBACK_MAX_BYTES / 3) * 4).toBeLessThan(4.5 * 1024 * 1024 - 600 * 1024);
  });

  it('keeps HEIC and empty-file errors as they are', async () => {
    const heic = deps(new ImageCompressionError('HEIC_UNSUPPORTED', 'HEIC'));
    await expect(prepareImageForUpload(file(1000, 'image/heic', 'a.heic'), {}, {}, heic)).rejects.toThrow('HEIC');
    expect(heic.report.mock.calls[0][0]).toMatchObject({ kind: 'image_compress', code: 'HEIC_UNSUPPORTED' });
    const empty = deps(new ImageCompressionError('EMPTY_FILE', 'gol'));
    await expect(prepareImageForUpload(file(0, 'image/jpeg'), {}, {}, empty)).rejects.toThrow('gol');
    expect(empty.readAsDataUrl).not.toHaveBeenCalled();
  });

  it('does not fall back for other mime types', () => {
    expect(canSendOriginal(file(1000, 'image/webp'), 'DECODE_FAILED')).toBe(false);
    expect(canSendOriginal(file(1000, 'image/jpeg'), 'DECODE_FAILED')).toBe(true);
  });
});
