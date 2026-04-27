/**
 * Reusable KYC face-match utility.
 *
 * Wraps `/api/kyc/validate` (mode='single', documentType='selfie') with a
 * stable, typed result so all client surfaces (wizard, account page, future
 * admin re-verification) share the same logic, error handling, and threshold.
 *
 * Backed by Gemini 2.5 Flash (kept on the full Flash model, NOT lite — see
 * `src/lib/services/kyc-validation.ts:13` for the rationale: lite produced
 * false negatives on legitimate matches in real-world testing).
 */

export interface FaceMatchInput {
  /** Selfie image as raw base64 (no `data:` prefix). */
  selfieBase64: string;
  selfieMimeType: string;
  /** Reference ID document image (typically CI front) as raw base64. */
  referenceBase64: string;
  referenceMimeType: string;
}

export interface FaceMatchResult {
  /** API call succeeded. False indicates a network/server problem, not a mismatch. */
  ok: boolean;
  /** Whether Gemini judged the faces to match. Defined only when `ok=true`. */
  matched: boolean;
  /** Gemini's confidence in the face match itself, 0–100. */
  faceMatchConfidence: number;
  /** Overall validation confidence (image quality, document presence, etc.), 0–100. */
  validationConfidence: number;
  /**
   * True when the match is strong enough to consider KYC passed:
   * `matched && validationConfidence >= 50`. Border cases (50–70%) should
   * still be reviewed by an admin (see `human review flagging` in STATUS_CURRENT).
   */
  valid: boolean;
  /** Free-form issues / suggestions returned by Gemini. */
  issues: string[];
  /** When `ok=false`, a short error code/message for logging. */
  error?: string;
}

const FAILED: Omit<FaceMatchResult, 'error'> & { error: string } = {
  ok: false,
  matched: false,
  faceMatchConfidence: 0,
  validationConfidence: 0,
  valid: false,
  issues: [],
  error: 'face_match_unavailable',
};

export async function runFaceMatch(input: FaceMatchInput): Promise<FaceMatchResult> {
  try {
    const response = await fetch('/api/kyc/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'single',
        documentType: 'selfie',
        imageBase64: input.selfieBase64,
        mimeType: input.selfieMimeType,
        referenceImageBase64: input.referenceBase64,
        referenceMimeType: input.referenceMimeType,
      }),
    });

    if (!response.ok) {
      return { ...FAILED, error: `http_${response.status}` };
    }

    const data = await response.json();
    const validation = data?.data?.validation;
    const extracted = validation?.extractedData;

    if (!data?.success || extracted?.faceMatch === undefined) {
      return { ...FAILED, error: 'malformed_response' };
    }

    const matched = extracted.faceMatch === true;
    const faceMatchConfidence = Number(extracted.faceMatchConfidence ?? 0);
    const validationConfidence = Number(validation.confidence ?? 0);

    return {
      ok: true,
      matched,
      faceMatchConfidence,
      validationConfidence,
      valid: matched && validationConfidence >= 50,
      issues: Array.isArray(validation.issues) ? validation.issues : [],
    };
  } catch (e) {
    return { ...FAILED, error: e instanceof Error ? e.message : 'unknown' };
  }
}

/**
 * Helper: fetch a stored S3-resident image and return base64 + mimeType,
 * suitable as `referenceBase64`/`referenceMimeType` for `runFaceMatch`.
 *
 * Use when the CI was uploaded in a previous session and only the URL is in
 * memory (typical for the account KYC tab). For the wizard, prefer using the
 * in-memory `base64` field on `UploadedDocumentState` directly.
 */
export async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
    const base64 = dataUrl.split(',')[1] ?? '';
    return { base64, mimeType: blob.type || 'image/jpeg' };
  } catch {
    return null;
  }
}
