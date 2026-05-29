import { describe, expect, it } from 'vitest';
import {
  isFaceReferenceDoc,
  decideSelfieValidation,
  type FaceMatchResult,
} from '@/lib/kyc/face-match';

/**
 * Regression for the 2026-05-29 report: "uploaded passport as PDF, then a
 * selfie, but the KYC identity check never ran."
 *
 * Cause: the Step 2 picker stores a passport as `passport_opened`, but the
 * Step 4 reference lookup only matched `passport`, so no reference document was
 * found and face matching was skipped entirely (silently).
 *
 * This test reproduces the exact wizard state and asserts the two seams that
 * were broken: (1) the reference lookup must FIND the passport, and (2) the
 * outcome must be RECORDED with a manual-review flag (PDF reference), never
 * dropped.
 */
describe('passport-PDF face-match regression', () => {
  // Shape mirrors PersonalKycState.uploadedDocuments[] after a Step 2 passport
  // PDF upload + a Step 4 selfie.
  const uploadedDocuments = [
    { type: 'passport_opened', mimeType: 'application/pdf', base64: 'UERG' },
    { type: 'selfie', mimeType: 'image/jpeg', base64: 'AAAA' },
  ];

  // Same predicate the wizard's getIDDocument() now uses.
  const findReference = (docs: typeof uploadedDocuments) =>
    docs.find((d) => isFaceReferenceDoc(d.type));

  it('finds the passport_opened PDF as the face reference (was: not found → skipped)', () => {
    const ref = findReference(uploadedDocuments);
    expect(ref).toBeDefined();
    expect(ref?.type).toBe('passport_opened');
  });

  it('records a result and flags manual review when the reference is a PDF', () => {
    const ref = findReference(uploadedDocuments)!;
    const matchResult: FaceMatchResult = {
      ok: true,
      matched: true,
      faceMatchConfidence: 88,
      validationConfidence: 90,
      valid: true,
      issues: [],
    };

    const decision = decideSelfieValidation(matchResult, {
      referenceMimeType: ref.mimeType,
    });

    expect(decision.faceMatch).toBe(true);
    expect(decision.valid).toBe(true);
    expect(decision.needsManualReview).toBe(true);
    expect(decision.reviewReason).toBe('reference_pdf');
  });

  it('still records (not drops) when the face-match service is unavailable', () => {
    const decision = decideSelfieValidation(
      { ok: false, matched: false, faceMatchConfidence: 0, validationConfidence: 0, valid: false, issues: [], error: 'http_503' },
      { referenceMimeType: 'application/pdf' },
    );
    expect(decision.needsManualReview).toBe(true);
    expect(decision.reviewReason).toBe('face_match_unavailable:http_503');
  });
});
