import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import {
  runFaceMatch,
  fetchImageAsBase64,
  isFaceReferenceDoc,
  decideSelfieValidation,
  type FaceMatchResult,
} from '@/lib/kyc/face-match';

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

describe('isFaceReferenceDoc', () => {
  // Regression: a passport picked in Step 2 is stored as `passport_opened`
  // (PersonalDataStep:1278), NOT `passport`. The old getIDDocument lookup
  // searched only for `passport`, so face matching silently never ran for
  // passport holders. These types all carry the holder's face photo.
  it.each([
    'ci_front',
    'ci_vechi',
    'ci_nou_front',
    'passport',
    'passport_opened',
  ])('treats %s as a usable face reference', (type) => {
    expect(isFaceReferenceDoc(type)).toBe(true);
  });

  it.each([
    'selfie',
    'certificat_domiciliu',
    'residence_permit',
    'ci_back',
    'ci_nou_back',
    'ro_cei_reader_pdf', // chip key:value PDF — no reliable face photo
    '',
    'unknown',
  ])('rejects %s as a face reference', (type) => {
    expect(isFaceReferenceDoc(type)).toBe(false);
  });
});

describe('decideSelfieValidation', () => {
  const okResult: FaceMatchResult = {
    ok: true,
    matched: true,
    faceMatchConfidence: 92,
    validationConfidence: 95,
    valid: true,
    issues: [],
  };

  it('passes clean image match without manual review', () => {
    const d = decideSelfieValidation(okResult, { referenceMimeType: 'image/jpeg' });
    expect(d.valid).toBe(true);
    expect(d.faceMatch).toBe(true);
    expect(d.faceMatchConfidence).toBe(92);
    expect(d.confidence).toBe(95);
    expect(d.needsManualReview).toBe(false);
    expect(d.reviewReason).toBeUndefined();
  });

  it('flags manual review when the reference document is a PDF (even on a clean match)', () => {
    const d = decideSelfieValidation(okResult, { referenceMimeType: 'application/pdf' });
    expect(d.valid).toBe(true);
    expect(d.needsManualReview).toBe(true);
    expect(d.reviewReason).toBe('reference_pdf');
  });

  it('flags manual review on borderline confidence (<70)', () => {
    const d = decideSelfieValidation(
      { ...okResult, faceMatchConfidence: 62, validationConfidence: 80 },
      { referenceMimeType: 'image/jpeg' },
    );
    expect(d.needsManualReview).toBe(true);
    expect(d.reviewReason).toBe('borderline_confidence');
  });

  it('flags manual review and marks invalid when faces do not match', () => {
    const d = decideSelfieValidation(
      { ...okResult, matched: false, valid: false, faceMatchConfidence: 8 },
      { referenceMimeType: 'image/jpeg' },
    );
    expect(d.valid).toBe(false);
    expect(d.faceMatch).toBe(false);
    expect(d.needsManualReview).toBe(true);
    expect(d.reviewReason).toBe('no_match');
  });

  it('flags manual review on low quality (matched but valid=false)', () => {
    const d = decideSelfieValidation(
      { ...okResult, matched: true, valid: false, validationConfidence: 30 },
      { referenceMimeType: 'image/jpeg' },
    );
    expect(d.valid).toBe(false);
    expect(d.needsManualReview).toBe(true);
    expect(d.reviewReason).toBe('low_quality');
  });

  it('never drops silently: an unavailable face match is recorded for manual review', () => {
    const failed: FaceMatchResult = {
      ok: false,
      matched: false,
      faceMatchConfidence: 0,
      validationConfidence: 0,
      valid: false,
      issues: [],
      error: 'http_429',
    };
    const d = decideSelfieValidation(failed, { referenceMimeType: 'image/jpeg' });
    expect(d.valid).toBe(false);
    expect(d.needsManualReview).toBe(true);
    expect(d.reviewReason).toBe('face_match_unavailable:http_429');
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
