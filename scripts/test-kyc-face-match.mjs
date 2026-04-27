// Tests KYC face match using real images + the actual /api/kyc/validate endpoint.
// Mimics client-side compression (1600px JPEG q=0.85) before posting.

import sharp from 'sharp';
import { readFile } from 'fs/promises';

const BASE = 'http://localhost:3000';
const CI_PATH      = '/Users/raul/Downloads/20260427_171617-94ec47800a9eada931abddd8df17262c.jpg'; // Stefania CI
const SELFIE_OK    = '/Users/raul/Downloads/20260427_171646-cd6f15f249719b5fd0e5e1979a87df1f.jpg'; // Stefania selfie
const SELFIE_WRONG = '/Users/raul/Downloads/PHOTO-2025-06-17-12-02-20-b524bbc65133ce65e7a9eeae6cd1f360.jpg'; // Alexandra (different person)

async function compress(path) {
  const raw = await readFile(path);
  const out = await sharp(raw)
    .rotate() // honor EXIF orientation
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  return { base64: out.toString('base64'), sizeBefore: raw.length, sizeAfter: out.length };
}

async function callKycValidate({ selfie, ciRef, label }) {
  const t = Date.now();
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
  const ms = Date.now() - t;
  const data = await r.json();
  return { ms, status: r.status, data, label };
}

(async () => {
  console.log('Compressing images...');
  const [ci, selfieOk, selfieWrong] = await Promise.all([
    compress(CI_PATH),
    compress(SELFIE_OK),
    compress(SELFIE_WRONG),
  ]);
  console.log(`CI:           ${(ci.sizeBefore/1024/1024).toFixed(1)}MB → ${(ci.sizeAfter/1024).toFixed(0)}KB`);
  console.log(`Selfie OK:    ${(selfieOk.sizeBefore/1024/1024).toFixed(1)}MB → ${(selfieOk.sizeAfter/1024).toFixed(0)}KB`);
  console.log(`Selfie WRONG: ${(selfieWrong.sizeBefore/1024/1024).toFixed(1)}MB → ${(selfieWrong.sizeAfter/1024).toFixed(0)}KB`);
  console.log();

  // Test 1: Same person (Stefania selfie + Stefania CI) → expect match: true
  console.log('=== TEST 1: Stefania selfie + Stefania CI (expected: MATCH) ===');
  const test1 = await callKycValidate({ selfie: selfieOk.base64, ciRef: ci.base64, label: 'positive' });
  console.log(`Time: ${test1.ms}ms | HTTP: ${test1.status}`);
  const v1 = test1.data?.data?.validation;
  console.log('Result:', JSON.stringify({
    valid: v1?.valid,
    confidence: v1?.confidence,
    faceMatch: v1?.extractedData?.faceMatch,
    faceMatchConfidence: v1?.extractedData?.faceMatchConfidence,
    issues: v1?.issues,
  }, null, 2));
  console.log();

  // Test 2: Different person (Alexandra selfie + Stefania CI) → expect match: false
  console.log('=== TEST 2: Alexandra selfie + Stefania CI (expected: NO MATCH) ===');
  const test2 = await callKycValidate({ selfie: selfieWrong.base64, ciRef: ci.base64, label: 'negative' });
  console.log(`Time: ${test2.ms}ms | HTTP: ${test2.status}`);
  const v2 = test2.data?.data?.validation;
  console.log('Result:', JSON.stringify({
    valid: v2?.valid,
    confidence: v2?.confidence,
    faceMatch: v2?.extractedData?.faceMatch,
    faceMatchConfidence: v2?.extractedData?.faceMatchConfidence,
    issues: v2?.issues,
  }, null, 2));
  console.log();

  // Verdict
  const t1Match = v1?.extractedData?.faceMatch === true;
  const t2NoMatch = v2?.extractedData?.faceMatch === false;
  console.log('=== VERDICT ===');
  console.log(`Test 1 (positive match):  ${t1Match ? '✅ PASS' : '❌ FAIL'} (faceMatch=${v1?.extractedData?.faceMatch})`);
  console.log(`Test 2 (negative match):  ${t2NoMatch ? '✅ PASS' : '❌ FAIL'} (faceMatch=${v2?.extractedData?.faceMatch})`);
  console.log();
  console.log(t1Match && t2NoMatch
    ? 'KYC face match validation works correctly.'
    : 'KYC face match validation has issues — review results above.');
})();
