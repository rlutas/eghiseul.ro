# KYC face-match fix — passport reference never matched + silent failures

**Date:** 2026-05-29
**Area:** Personal KYC / selfie face matching

## Symptom (user report)

Uploaded passport as **PDF** at Step 2, then a selfie-with-document at Step 4.
The identity face-match check **never ran** — no result, no error shown.

## Root cause

The Step 2 document picker stores a passport with `uploadedDocuments[].type =
'passport_opened'` (`PersonalDataStep.tsx:1278`), but the Step 4 face-match
reference lookup `getIDDocument()` searched only for `'passport'`
(`KYCDocumentsStep.tsx:165-172`). The reference document was therefore never
found → `idDoc` was `undefined` → the whole face-match block was skipped
silently. Face matching had been broken for **every passport holder**, not just
PDFs.

Two related defects in the same block:

1. **Wrong trigger gate** — face match was gated on `config.selfieRequired`
   alone, but foreign citizens are required to submit a selfie via the
   `isForeign` path. On a service with `selfieRequired:false` a foreign
   citizen's selfie would never be matched.
2. **Silent failure** — when `runFaceMatch` returned `ok:false` (network/server
   error) the result was dropped with a `console.warn`; nothing was recorded, so
   an operator had no signal that identity was never verified.

## Fix

- New, tested helpers in `src/lib/kyc/face-match.ts`:
  - `FACE_REFERENCE_DOC_TYPES` / `isFaceReferenceDoc()` — the document types that
    actually carry a face photo, **including `passport_opened`**. (`ro_cei_reader_pdf`
    is excluded — it's chip key:value data; the new CI face photo is `ci_front`.)
  - `decideSelfieValidation(result, { referenceMimeType })` — single source of
    truth for the stored selfie validation + manual-review policy. Flags
    `needsManualReview` (with a `reviewReason`) when: face match unavailable,
    no match, low quality, **PDF reference**, or borderline confidence (<70).
- `KYCDocumentsStep.tsx`: `getIDDocument()` uses `isFaceReferenceDoc`; trigger is
  now `type === 'selfie'` (selfie card only renders when required); a selfie
  validation is **always** written via `decideSelfieValidation` — no silent drop.
- `verification-modules.ts`: `selfie` validation type gains optional
  `needsManualReview` / `reviewReason`.
- Admin order page (`admin/orders/[id]/page.tsx`): `needsKycReview()` now honors
  the explicit `needsManualReview` flag (a PDF reference can pass on confidence
  yet still need a human look).

## Decision

PDF passport references are sent to Gemini as-is (it reads PDFs) **and** the
order is flagged for manual review, rather than forcing a separate photo upload.

## Verification

- `tests/unit/lib/kyc/face-match.test.ts` — +19 cases (29 total), all pass.
- `tsc --noEmit` clean; ESLint clean on changed files.

## Follow-up (not done)

- Surface `reviewReason` text in the admin KYC card (currently only the boolean
  drives the review indicator).
- Consider an integration/e2e pass through the real wizard for a PDF passport.
