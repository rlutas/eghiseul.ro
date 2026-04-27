import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { runFaceMatch, fetchImageAsBase64 } from '@/lib/kyc/face-match';

describe('runFaceMatch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const okResponse = (validationOverrides: Record<string, unknown> = {}, extractedOverrides: Record<string, unknown> = {}) =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          validation: {
            valid: true,
            confidence: 95,
            documentType: 'selfie',
            issues: [],
            extractedData: { faceMatch: true, faceMatchConfidence: 92, ...extractedOverrides },
            ...validationOverrides,
          },
        },
      }),
      { status: 200 },
    );

  const baseInput = {
    selfieBase64: 'AAAA',
    selfieMimeType: 'image/jpeg',
    referenceBase64: 'BBBB',
    referenceMimeType: 'image/jpeg',
  };

  it('returns ok+matched when API confirms a high-confidence match', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(okResponse());

    const result = await runFaceMatch(baseInput);

    expect(result.ok).toBe(true);
    expect(result.matched).toBe(true);
    expect(result.faceMatchConfidence).toBe(92);
    expect(result.validationConfidence).toBe(95);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('marks valid=false when matched but validationConfidence below 50', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(okResponse({ confidence: 30 }));

    const result = await runFaceMatch(baseInput);

    expect(result.ok).toBe(true);
    expect(result.matched).toBe(true);
    expect(result.valid).toBe(false); // critical: low quality blocks even a positive match
  });

  it('marks valid=false when not matched even at high confidence', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      okResponse({}, { faceMatch: false, faceMatchConfidence: 5 }),
    );

    const result = await runFaceMatch(baseInput);

    expect(result.matched).toBe(false);
    expect(result.valid).toBe(false);
  });

  it('returns ok=false with http error code when API returns non-200', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response('rate limit', { status: 429 }));

    const result = await runFaceMatch(baseInput);

    expect(result.ok).toBe(false);
    expect(result.error).toBe('http_429');
    expect(result.valid).toBe(false);
  });

  it('returns ok=false with malformed_response when faceMatch field missing', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: { validation: { valid: true, confidence: 90, extractedData: {} } },
        }),
        { status: 200 },
      ),
    );

    const result = await runFaceMatch(baseInput);

    expect(result.ok).toBe(false);
    expect(result.error).toBe('malformed_response');
  });

  it('returns ok=false when fetch itself throws (network/timeout)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('network down'));

    const result = await runFaceMatch(baseInput);

    expect(result.ok).toBe(false);
    expect(result.error).toBe('network down');
  });

  it('forwards selfie + reference fields to the API in the expected shape', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(okResponse());

    await runFaceMatch(baseInput);

    expect(fetch).toHaveBeenCalledWith(
      '/api/kyc/validate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"mode":"single"'),
      }),
    );
    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body).toMatchObject({
      mode: 'single',
      documentType: 'selfie',
      imageBase64: 'AAAA',
      mimeType: 'image/jpeg',
      referenceImageBase64: 'BBBB',
      referenceMimeType: 'image/jpeg',
    });
  });

  it('coerces non-numeric confidences to numbers (defensive)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: {
            validation: {
              confidence: '85',
              extractedData: { faceMatch: true, faceMatchConfidence: '70' },
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await runFaceMatch(baseInput);

    expect(typeof result.faceMatchConfidence).toBe('number');
    expect(result.faceMatchConfidence).toBe(70);
    expect(result.validationConfidence).toBe(85);
    expect(result.valid).toBe(true);
  });
});

describe('fetchImageAsBase64', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when fetch fails (non-200)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(new Response('nope', { status: 404 }));

    const result = await fetchImageAsBase64('https://example.com/img.jpg');

    expect(result).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('dns'));

    const result = await fetchImageAsBase64('https://example.com/img.jpg');

    expect(result).toBeNull();
  });
});
