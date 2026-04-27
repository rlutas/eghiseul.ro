// @ts-check
import { describe, expect, it, beforeAll } from 'vitest';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Integration test for the full KYC face-match path:
//   browser-side compression → POST /api/kyc/validate → Gemini 2.5 Flash → response
//
// Opt-in only: set RUN_INTEGRATION=1 (and have dev server on :3000 + real
// Gemini API key in .env.local). Otherwise this test is skipped.
//
// Test images are kept out of the repo (PII). Provide them via env vars:
//   KYC_TEST_CI       absolute path to a Romanian CI front photo
//   KYC_TEST_SELFIE_OK   selfie of the same person holding the CI
//   KYC_TEST_SELFIE_WRONG  selfie of a clearly different person
//
// Defaults point to the operator's local Downloads folder used during
// 2026-04-27 verification — adjust per environment.

const SHOULD_RUN = process.env.RUN_INTEGRATION === '1';
const BASE = (process.env.TEST_BASE_URL && process.env.TEST_BASE_URL.trim()) || 'http://localhost:3000';
const CI_PATH = process.env.KYC_TEST_CI ||
  '/Users/raul/Downloads/20260427_171617-94ec47800a9eada931abddd8df17262c.jpg';
const SELFIE_OK = process.env.KYC_TEST_SELFIE_OK ||
  '/Users/raul/Downloads/20260427_171646-cd6f15f249719b5fd0e5e1979a87df1f.jpg';
const SELFIE_WRONG = process.env.KYC_TEST_SELFIE_WRONG ||
  '/Users/raul/Downloads/PHOTO-2025-06-17-12-02-20-b524bbc65133ce65e7a9eeae6cd1f360.jpg';

async function compress(path) {
  const raw = await readFile(path);
  const out = await sharp(raw)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return out.toString('base64');
}

async function callKycValidate({ selfie, ciRef }) {
  const r = await fetch(`${BASE}/api/kyc/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'single',
      documentType: 'selfie',
      imageBase64: selfie,
      mimeType: 'image/jpeg',
      referenceImageBase64: ciRef,
      referenceMimeType: 'image/jpeg',
    }),
  });
  return { status: r.status, data: await r.json() };
}

describe.runIf(SHOULD_RUN)('KYC face match (integration, real Gemini)', () => {
  let ciB64;
  let okB64;
  let wrongB64;

  beforeAll(async () => {
    if (!existsSync(CI_PATH) || !existsSync(SELFIE_OK) || !existsSync(SELFIE_WRONG)) {
      throw new Error(
        `Test images missing. Set KYC_TEST_CI / KYC_TEST_SELFIE_OK / KYC_TEST_SELFIE_WRONG ` +
        `or place files at the default Downloads paths.`
      );
    }
    [ciB64, okB64, wrongB64] = await Promise.all([
      compress(CI_PATH),
      compress(SELFIE_OK),
      compress(SELFIE_WRONG),
    ]);
  }, 30_000);

  it('matches the same person and reports valid=true', async () => {
    const { status, data } = await callKycValidate({ selfie: okB64, ciRef: ciB64 });
    const v = data?.data?.validation;

    expect(status).toBe(200);
    expect(v?.extractedData?.faceMatch).toBe(true);
    expect(v?.extractedData?.faceMatchConfidence).toBeGreaterThanOrEqual(70);
    expect(v?.confidence).toBeGreaterThanOrEqual(50);
  }, 30_000);

  it('rejects a different person with faceMatch=false', async () => {
    // Note: Gemini's faceMatchConfidence semantics vary by run — sometimes it
    // reports confidence in the *match* (low when rejecting), sometimes
    // confidence in the *determination* (high when rejecting). The reliable
    // signal is the boolean faceMatch, plus that valid is computed as
    // (matched && confidence>=50) elsewhere → an impostor is always rejected.
    const { status, data } = await callKycValidate({ selfie: wrongB64, ciRef: ciB64 });
    const v = data?.data?.validation;

    expect(status).toBe(200);
    expect(v?.extractedData?.faceMatch).toBe(false);
    // valid must be false either way (matched=false short-circuits)
    expect(v?.valid).toBe(false);
  }, 30_000);
});

describe.skipIf(SHOULD_RUN)('KYC face match (integration, real Gemini)', () => {
  it.skip('requires RUN_INTEGRATION=1 + dev server + test images', () => {});
});
