import { describe, expect, it } from 'vitest';
import {
  extractKycByDocType,
  needsKycReview,
  kycConfidenceClass,
  KYC_LOW_CONFIDENCE,
} from '@/lib/kyc/review';

describe('extractKycByDocType', () => {
  it('returns empty for null / missing personal data', () => {
    expect(extractKycByDocType(null)).toEqual({});
    expect(extractKycByDocType({})).toEqual({});
    expect(extractKycByDocType({ personalData: null })).toEqual({});
  });

  it('maps selfie validation including the manual-review flag', () => {
    const out = extractKycByDocType({
      personalData: {
        kycValidation: {
          selfie: {
            valid: true,
            confidence: 95,
            faceMatch: true,
            faceMatchConfidence: 92,
            needsManualReview: true,
            reviewReason: 'reference_pdf',
          },
        },
      },
    });
    expect(out.selfie).toEqual({
      confidence: 95,
      valid: true,
      faceMatch: true,
      faceMatchConfidence: 92,
      needsManualReview: true,
      reviewReason: 'reference_pdf',
    });
  });

  it('falls back to ocrResults for CI front confidence when kycValidation absent', () => {
    const out = extractKycByDocType({
      personal: {
        ocrResults: [{ documentType: 'ci_nou_front', success: true, confidence: 88 }],
      },
    });
    expect(out.ci_front).toEqual({ confidence: 88, valid: true });
    // aliases share the same record
    expect(out.ci_vechi).toBe(out.ci_front);
    expect(out.ci_nou_front).toBe(out.ci_front);
  });
});

describe('needsKycReview', () => {
  const clean = {
    selfie: { confidence: 95, valid: true, faceMatch: true, faceMatchConfidence: 92 },
    ci_front: { confidence: 90, valid: true },
  };

  it('does not flag a clean high-confidence set', () => {
    expect(needsKycReview(clean)).toBe(false);
  });

  it('flags when the explicit needsManualReview flag is set — even at high confidence', () => {
    // Regression: a PDF passport reference can pass on confidence yet still
    // require a human to confirm identity.
    expect(
      needsKycReview({
        selfie: {
          confidence: 95,
          valid: true,
          faceMatch: true,
          faceMatchConfidence: 92,
          needsManualReview: true,
          reviewReason: 'reference_pdf',
        },
      }),
    ).toBe(true);
  });

  it('flags on low overall confidence', () => {
    expect(needsKycReview({ ci_front: { confidence: 50, valid: false } })).toBe(true);
  });

  it('flags on low face-match confidence', () => {
    expect(
      needsKycReview({
        selfie: { confidence: 90, valid: true, faceMatch: true, faceMatchConfidence: 40 },
      }),
    ).toBe(true);
  });

  it('uses 70 as the low-confidence floor', () => {
    expect(KYC_LOW_CONFIDENCE).toBe(70);
    expect(needsKycReview({ x: { confidence: 69, valid: true } })).toBe(true);
    expect(needsKycReview({ x: { confidence: 70, valid: true } })).toBe(false);
  });
});

describe('kycConfidenceClass', () => {
  it('greens at >=80, yellows at >=60, reds below', () => {
    expect(kycConfidenceClass(85)).toContain('green');
    expect(kycConfidenceClass(65)).toContain('yellow');
    expect(kycConfidenceClass(40)).toContain('red');
  });
});
