# KYC Identity Verification & Face Matching

**Last Updated:** 2026-06-09
**Version:** 1.1
**Status:** Active

> ⚠️ **2026-06-09 — Automatic AI selfie↔ID face-match REMOVED.** It was slow and
> unreliable, so the selfie upload no longer makes a Gemini call. Every selfie is
> now flagged `needsManualReview: true` (reason `manual_review_only`) and the
> team confirms identity in admin. The face-match code (`lib/kyc/face-match.ts`,
> `lib/services/kyc-validation.ts:validateSelfie`, `/api/kyc/validate`) is left in
> the repo but is **no longer called by the wizard**. Sections below describing
> the automatic match are historical. When a photo is wrong, the team requests a
> new one via [`post-order-photo-reupload.md`](./post-order-photo-reupload.md).

How eghiseul.ro confirms that the person submitting an order is the same person
shown on the uploaded ID document (selfie ↔ document face matching), and how
uncertain cases are routed to a human operator.

> Endpoint reference (request/response shapes, curl examples): see
> [`technical/api/ocr-kyc-api.md`](../api/ocr-kyc-api.md).
> Where this sits among other verification modules: see
> [`modular-verification-architecture.md`](./modular-verification-architecture.md).

---

## 1. What it does

When a service requires it (e.g. Cazier Judiciar, Cazier Fiscal — see the
[requirements matrix](./service-verification-requirements.md)), the customer
uploads:

1. An **ID document** with their photo (CI or passport), at **Step 2**.
2. A **selfie holding that document**, at **Step 4**.

The system then asks Gemini whether the face in the selfie matches the photo on
the ID document, stores the result, and flags the order for **manual review**
whenever identity could not be confidently auto-confirmed.

---

## 2. End-to-end flow

```
Step 2 (PersonalDataStep)            Step 4 (KYCDocumentsStep)
┌───────────────────────────┐        ┌─────────────────────────────────────┐
│ DocumentTypePicker         │        │ Upload selfie                       │
│  ci_vechi / ci_nou /       │        │   │                                 │
│  passport                  │        │   ▼                                 │
│        │                   │        │ getIDDocument()                     │
│        ▼                   │        │   → isFaceReferenceDoc(type)        │
│ Upload + OCR               │        │   → finds the face-bearing ID doc   │
│  stored in                 │        │   │                                 │
│  uploadedDocuments[]:      │  ───▶  │   ▼                                 │
│   ci_front / ci_nou_back / │        │ runFaceMatch(selfie, reference)     │
│   passport_opened /        │        │   → POST /api/kyc/validate          │
│   ro_cei_reader_pdf        │        │   → Gemini 2.5 Flash                │
└───────────────────────────┘        │   │                                 │
                                      │   ▼                                 │
                                      │ decideSelfieValidation(result, ref) │
                                      │   → stored on kycValidation.selfie  │
                                      └─────────────────────────────────────┘
                                                     │
                                                     ▼
                                      Admin order view: needsKycReview()
                                      → "Necesită verificare" badge
```

**Files**

| Concern | File |
|---------|------|
| Step 2 ID upload + OCR | `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` |
| Document type picker | `src/components/orders/modules/personal-kyc/DocumentTypePicker.tsx` |
| Step 4 selfie upload + face match trigger | `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` |
| Face-match util + policy | `src/lib/kyc/face-match.ts` |
| KYC endpoint | `src/app/api/kyc/validate/route.ts` |
| Gemini validation | `src/lib/services/kyc-validation.ts` |
| Admin review surfacing | `src/lib/kyc/review.ts` + `src/app/admin/orders/[id]/page.tsx` |
| Stored shape | `src/types/verification-modules.ts` (`KYCValidationResults`) |

---

## 3. Document types — picker label vs stored type

⚠️ **Critical gotcha.** The picker label is NOT what gets stored. The Step 2
picker returns `idDocumentType` (`ci_vechi | ci_nou | passport`), but each scan
zone stores its own `uploadedDocuments[].type`:

| Picker choice | Scan zones → stored `type` | Carries a face photo? |
|---------------|----------------------------|-----------------------|
| Buletin / CI vechi | `ci_front` | ✅ yes |
| CI nou electronic | `ci_front`, `ci_nou_back`, `ro_cei_reader_pdf` | `ci_front` ✅; `ro_cei_reader_pdf` ❌ (chip key:value, no usable photo) |
| Pașaport | `passport_opened` | ✅ yes |
| Foreign citizen (Step 4) | `passport` | ✅ yes |

The face-match **reference** must be a document that actually contains the
holder's photo. That set is defined once, and tested, in `face-match.ts`:

```ts
export const FACE_REFERENCE_DOC_TYPES = [
  'ci_front', 'ci_vechi', 'ci_nou_front', 'passport', 'passport_opened',
] as const;
export function isFaceReferenceDoc(type): boolean { ... }
```

> **Regression history:** a passport is stored as `passport_opened`, but the
> Step 4 lookup historically searched only for `passport`. The reference was
> never found, so face matching was silently skipped for every passport holder.
> Fixed 2026-05-29 — see [session log](../../session-logs/2026-05-29-kyc-face-match-passport-fix.md).
> Locked by `tests/unit/lib/kyc/passport-face-match-regression.test.ts`.

---

## 4. When the face match runs

In `KYCDocumentsStep.tsx`, on selfie upload:

- Trigger is **`type === 'selfie'`** — the selfie card only renders when a
  selfie is required (Romanian via `config.selfieRequired`, foreign via the
  passport flow), so its presence is the correct trigger. (Do **not** gate on
  `config.selfieRequired` alone — that misses foreign citizens.)
- A face-bearing reference must exist (`getIDDocument()` → `isFaceReferenceDoc`).
- If no reference is found, the selfie validation is still written with
  `needsManualReview: true`, `reviewReason: 'no_reference_document'` — never
  skipped silently.

---

## 5. The decision: `decideSelfieValidation`

Single source of truth for what gets stored and when a human is needed
(`src/lib/kyc/face-match.ts`). It **always returns a result** — there is no
silent-drop path.

| Condition | `valid` | `needsManualReview` | `reviewReason` |
|-----------|:-------:|:-------------------:|----------------|
| Clean image match, conf ≥ 70 | true | false | — |
| Reference is a **PDF** (passport/CEI scan) | true | **true** | `reference_pdf` |
| Borderline confidence (< 70 on either axis) | true | **true** | `borderline_confidence` |
| Matched but low quality (`valid=false`) | false | **true** | `low_quality` |
| Faces do not match | false | **true** | `no_match` |
| Face match unavailable (network/server error) | false | **true** | `face_match_unavailable:<err>` |

**Confidence floor:** `70` (`MANUAL_REVIEW_CONFIDENCE_FLOOR`). Two axes:
`faceMatchConfidence` (how sure the faces match) and `validationConfidence`
(image quality / document presence).

**PDF references** are sent to Gemini as-is (it reads PDFs) and flagged for
review rather than rejected, because passport/CEI PDFs render less reliably for
facial comparison than a plain photo. (Decision: 2026-05-29.)

---

## 6. Stored shape

`customer_data.personalData.kycValidation.selfie`
(`KYCValidationResults` in `src/types/verification-modules.ts`):

```ts
selfie?: {
  valid: boolean;               // auto-passed?
  confidence: number;           // 0–100 overall validation
  faceMatch: boolean;           // Gemini face verdict
  faceMatchConfidence: number;  // 0–100
  needsManualReview?: boolean;  // operator must confirm identity
  reviewReason?: string;        // machine-readable reason (table above)
}
```

The signature/consent audit trail (IP, UA, timestamp, document hash) is separate
— see `customer_data.signature_metadata` and the CLAUDE.md "Contract Legal
Validity" note.

---

## 7. Admin surfacing

`src/lib/kyc/review.ts` (pure, tested):

- `extractKycByDocType(customer_data)` — flattens `kycValidation` (with
  `ocrResults` fallback for CI confidence) into a per-doc-type map.
- `needsKycReview(byType)` — returns `true` when **any** doc has
  `needsManualReview`, OR confidence `< 70`, OR faceMatchConfidence `< 70`.
- `kycConfidenceClass(c)` — badge colour (green ≥ 80, yellow ≥ 60, red below).

The admin order detail page (`admin/orders/[id]/page.tsx`) calls these to show
the per-document confidence badges and the "Necesită verificare" indicator.

---

## 8. Gemini model

KYC face matching uses **`gemini-2.5-flash`** (full Flash, NOT lite) — flash-lite
produced false negatives on legitimate matches in real-world testing. Rationale
in `src/lib/services/kyc-validation.ts`. (OCR uses `gemini-2.5-flash-lite` for
speed — different concern.)

---

## 8b. Numele din MRZ — prefixul tip-act + țară

Linia 1 din MRZ începe cu tipul actului + codul țării: `IDROU` la carte de identitate,
`P<ROU` la pașaport. Modelul îl scrie frecvent lipit de numele de familie („PEROUPOPA",
„IDROUCOMAN"), iar numele contaminat ajunge în contracte, împuterniciri și **facturi**.

Două apărări în `src/lib/services/document-ocr.ts`:

1. `recoverNamesFromMrz()` — reconstruiește separarea nume/prenume din MRZ (ancora e `<<`),
   tăind prefixul. Strip-ul e **either-or** (IDROU **sau** P<XXX), nu secvențial: secvențial,
   regexul de pașaport mai mânca P+3 litere din nume reale („PARASCHIV" → „SCHIV").
2. `stripMrzCountryPrefix()` — plasa de siguranță când MRZ-ul lipsește sau nu se parsează;
   restrânsă la combinațiile tip-act+țară, ca „Roua"/„Peruzzi"/„Idriceanu" să rămână intacte.

⚠️ **Două capcane, ambele întâlnite real:**

- **Pașapoartele cu tip act „PE"** au MRZ care CHIAR începe cu `PEROU` (PE = tip act,
  ROU = țara) — deci „PEROU" nu e mereu un `P<ROU` prost citit.
- Modelul poate întoarce linia 1 **reconstruită din propria citire greșită**: prefixul canonic
  pus PESTE numele deja contaminat (`P<ROU` + `PEROUxxx`). De aceea prefixul se taie
  **repetat**, cât timp rămâne un nume, iar `correctNamesFromMrz()` trece numele final încă o
  dată prin `stripMrzCountryPrefix()` — altfel rescrierea din MRZ anulează curățarea făcută
  deja la parsare (`sanitizeNameFields` în `parseGeminiOCRResponse`).

Când apare iar un nume ciudat: verifică `documentType` (pașaport vs CI), dacă modelul a
returnat MRZ-ul, și compară cu poza din S3 (`kyc/<orderId>/passport_opened.jpg`) — pagina de
date e sursa de adevăr. Istoric complet: changelog-urile din 28.07, 05.08 și 06.08.2026.

---

## 9. Tests

| File | Covers |
|------|--------|
| `tests/unit/lib/kyc/face-match.test.ts` | `runFaceMatch`, `isFaceReferenceDoc`, `decideSelfieValidation` (29 cases) |
| `tests/unit/lib/kyc/review.test.ts` | `extractKycByDocType`, `needsKycReview`, `kycConfidenceClass` (9 cases) |
| `tests/unit/lib/kyc/passport-face-match-regression.test.ts` | The passport-PDF report end-to-end (lookup + decision) |
| `tests/unit/lib/services/kyc-validation.test.ts` | Gemini validation prompt/parse |
| `tests/unit/lib/services/document-ocr-passport-name-prefix.test.ts` | Prefixul MRZ în nume (§8b), inclusiv MRZ-ul reconstruit greșit |
| `tests/integration/kyc-face-match.test.mjs` | Full path against a live dev server (opt-in: `RUN_INTEGRATION=1`) |

Run: `npx vitest run tests/unit/lib/kyc/`
