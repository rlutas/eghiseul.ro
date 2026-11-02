/// <reference types="vitest/globals" />
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { compressImage, compressedToFile, ImageCompressionError, type CompressedImage } from '@/lib/images/compress';

// Note: full compression flow (createImageBitmap → canvas → toBlob) requires a
// real browser. We cover that path via `tests/integration/kyc-face-match.test.mjs`
// where real images are sent through a real /api/kyc/validate endpoint.
//
// Here we test the pure-logic branches that DON'T need a working canvas:
//   - HEIC pre-flight rejection (by mime type and extension)
//   - compressedToFile helper (File construction)

describe('compressImage — HEIC pre-flight', () => {
  it('rejects file with image/heic mime', async () => {
    const file = new File([new Uint8Array([0xFF, 0xD8])], 'photo.heic', { type: 'image/heic' });
    await expect(compressImage(file)).rejects.toThrow(ImageCompressionError);
    await expect(compressImage(file)).rejects.toMatchObject({ code: 'HEIC_UNSUPPORTED' });
  });

  it('rejects file with image/heif mime', async () => {
    const file = new File([new Uint8Array([0xFF, 0xD8])], 'photo.heif', { type: 'image/heif' });
    await expect(compressImage(file)).rejects.toMatchObject({ code: 'HEIC_UNSUPPORTED' });
  });

  it('rejects file by .heic extension even when mime is empty', async () => {
    // Real-world case: drag-and-drop sometimes loses the mime hint
    const file = new File([new Uint8Array([0xFF, 0xD8])], 'IMG_1234.heic', { type: '' });
    await expect(compressImage(file)).rejects.toMatchObject({ code: 'HEIC_UNSUPPORTED' });
  });

  it('rejects by extension case-insensitively', async () => {
    const file = new File([new Uint8Array([0xFF, 0xD8])], 'PHOTO.HEIC', { type: 'application/octet-stream' });
    await expect(compressImage(file)).rejects.toMatchObject({ code: 'HEIC_UNSUPPORTED' });
  });

  it('throws an Error subclass (so existing catch(Error) handlers work)', async () => {
    const file = new File([new Uint8Array([0xFF, 0xD8])], 'photo.heic', { type: 'image/heic' });
    try {
      await compressImage(file);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(ImageCompressionError);
    }
  });
});

describe('compressedToFile', () => {
  const fakeCompressed: CompressedImage = {
    base64: btoa('fake jpeg bytes'),
    dataUrl: 'data:image/jpeg;base64,' + btoa('fake jpeg bytes'),
    mimeType: 'image/jpeg',
    sizeBefore: 5_242_880,
    sizeAfter: 250_000,
    width: 1600,
    height: 1200,
  };

  it('creates a File with .jpg extension regardless of original', () => {
    const original = new File([], 'IMG_1234.png', { type: 'image/png' });
    const out = compressedToFile(fakeCompressed, original);
    expect(out.name).toBe('IMG_1234.jpg');
    expect(out.type).toBe('image/jpeg');
  });

  it('strips .heic extension and replaces with .jpg', () => {
    const original = new File([], 'photo.heic', { type: 'image/heic' });
    const out = compressedToFile(fakeCompressed, original);
    expect(out.name).toBe('photo.jpg');
  });

  it('preserves filename when no extension present', () => {
    const original = new File([], 'unnamed', { type: 'image/jpeg' });
    const out = compressedToFile(fakeCompressed, original);
    expect(out.name).toBe('unnamed.jpg');
  });

  it('byte length of the new File matches base64 decoded size', () => {
    const original = new File([], 'x.jpg', { type: 'image/jpeg' });
    const out = compressedToFile(fakeCompressed, original);
    const expectedBytes = atob(fakeCompressed.base64).length;
    expect(out.size).toBe(expectedBytes);
  });
});

describe('compressImage — decode fallback (iOS Safari ≤16, raport E-261005-MCFAQ)', () => {
  it('createImageBitmap that rejects the options object no longer ends in DECODE_FAILED', async () => {
    const original = (globalThis as { createImageBitmap?: unknown }).createImageBitmap;
    const calls: unknown[] = [];
    (globalThis as { createImageBitmap?: unknown }).createImageBitmap = async (_f: unknown, opts?: unknown) => {
      calls.push(opts);
      if (opts) throw new TypeError('options not supported');
      return { width: 3000, height: 2000, close() {} };
    };
    try {
      const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'ci.jpg', { type: 'image/jpeg' });
      // jsdom has no 2d canvas, so the run stops AFTER decoding — the point is
      // that decoding succeeded on the second strategy.
      const err = await compressImage(file).catch((e) => e);
      expect(calls).toEqual([{ imageOrientation: 'from-image' }, undefined]);
      expect(err).toBeInstanceOf(ImageCompressionError);
      expect(err.code).not.toBe('DECODE_FAILED');
    } finally {
      (globalThis as { createImageBitmap?: unknown }).createImageBitmap = original;
    }
  });
});
