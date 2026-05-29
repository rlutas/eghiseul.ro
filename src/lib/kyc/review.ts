/**
 * KYC review helpers — pure logic for surfacing identity-verification results
 * in the admin order view.
 *
 * Extracted from `app/admin/orders/[id]/page.tsx` so the "does this order need a
 * human to confirm identity?" decision is unit-testable and shared. Reads the
 * per-document KYC validation that the wizard persisted in
 * `customer_data.personalData.kycValidation` (see
 * `src/lib/kyc/face-match.ts` → `decideSelfieValidation`).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyObj = Record<string, any>;

/** Confidence below this (face match OR overall) gets a human second look. */
export const KYC_LOW_CONFIDENCE = 70;

/**
 * Per-document KYC info pulled from `customer_data`.
 * `{ confidence, valid, faceMatch?, faceMatchConfidence?, needsManualReview?, reviewReason? }`
 * is returned for any document that an AI verification ran on; absent otherwise.
 */
export interface KycPerDoc {
  confidence: number;
  valid: boolean;
  faceMatch?: boolean;
  faceMatchConfidence?: number;
  /** Explicit "operator must confirm identity" flag set by the wizard. */
  needsManualReview?: boolean;
  /** Short machine-readable reason for the manual-review flag. */
  reviewReason?: string;
}

/**
 * Map each KYC document type to its validation info. Prefers the stored
 * `kycValidation` block; falls back to `ocrResults` for ID-document confidence
 * when only OCR ran.
 */
export function extractKycByDocType(customerData: AnyObj | null): Record<string, KycPerDoc> {
  if (!customerData) return {};
  const personal = customerData.personalData || customerData.personal;
  if (!personal) return {};
  const kyc = personal.kycValidation as {
    ciFront?: { valid: boolean; confidence: number };
    ciBack?: { valid: boolean; confidence: number };
    selfie?: {
      valid: boolean;
      confidence: number;
      faceMatch: boolean;
      faceMatchConfidence: number;
      needsManualReview?: boolean;
      reviewReason?: string;
    };
  } | undefined;
  const ocrResults = personal.ocrResults as Array<{
    documentType: string;
    success: boolean;
    confidence: number;
  }> | undefined;

  const ciFront =
    kyc?.ciFront ??
    (() => {
      const o = ocrResults?.find(
        (r) =>
          r.documentType === 'ci_front' || r.documentType === 'ci_vechi' || r.documentType === 'ci_nou_front'
      );
      return o ? { valid: o.success, confidence: o.confidence } : undefined;
    })();
  const ciBack =
    kyc?.ciBack ??
    (() => {
      const o = ocrResults?.find(
        (r) => r.documentType === 'ci_back' || r.documentType === 'ci_nou_back'
      );
      return o ? { valid: o.success, confidence: o.confidence } : undefined;
    })();
  const selfie = kyc?.selfie;

  const out: Record<string, KycPerDoc> = {};
  if (ciFront) {
    out['ci_front'] = { confidence: ciFront.confidence, valid: ciFront.valid };
    out['ci_vechi'] = out['ci_front'];
    out['ci_nou_front'] = out['ci_front'];
  }
  if (ciBack) {
    out['ci_back'] = { confidence: ciBack.confidence, valid: ciBack.valid };
    out['ci_nou_back'] = out['ci_back'];
  }
  if (selfie) {
    out['selfie'] = {
      confidence: selfie.confidence,
      valid: selfie.valid,
      faceMatch: selfie.faceMatch,
      faceMatchConfidence: selfie.faceMatchConfidence,
      needsManualReview: selfie.needsManualReview,
      reviewReason: selfie.reviewReason,
    };
  }
  return out;
}

/** Tailwind classes for a confidence badge. */
export function kycConfidenceClass(c: number): string {
  if (c >= 80) return 'bg-green-100 text-green-700';
  if (c >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

/** True when any document needs a human to confirm identity before proceeding. */
export function needsKycReview(byType: Record<string, KycPerDoc>): boolean {
  for (const k of Object.values(byType)) {
    // Explicit flag set by the wizard's face-match decision (PDF reference,
    // unavailable match, mismatch, etc.) — may not be reflected by confidence
    // alone (e.g. a PDF reference can still report high confidence).
    if (k.needsManualReview) return true;
    if (k.confidence < KYC_LOW_CONFIDENCE) return true;
    if (k.faceMatchConfidence !== undefined && k.faceMatchConfidence < KYC_LOW_CONFIDENCE) return true;
  }
  return false;
}
