# Session Log — ID Document Picker Implementation

**Date:** 2026-05-28
**Design doc:** [`docs/plans/2026-05-28-id-document-picker-design.md`](../plans/2026-05-28-id-document-picker-design.md)
**Branch:** main (working directly, single dev)

## Context

Implementăm refactor-ul Step 2 (date personale) pentru a suporta 3 tipuri de
documente: CI vechi, CI nou electronic (eCI/CEI), Pașaport. Bug-ul detectat
acum o oră: OCR-ul pe spatele eCI eșuează cu `"Address information is not
visible"` pentru că eCI **nu** are adresa printată pe spate (e doar în cip).

## Plan împărțit pe 3 PR-uri

| PR | Scope | Status |
|----|-------|--------|
| **1** | Backend OCR pipeline + types + cross-validation + tests | 🔄 In progress |
| 2 | Frontend wizard (picker + scan zones per tip) | ⏳ Queued |
| 3 | Admin display + cross-validation surfaces | ⏳ Queued |

---

## PR 1 — Backend OCR Pipeline

### Step 1 — Decizie: backward compat strategy

**Problemă:** existing `extractFromCIBack` are prompt care **cere adresa**.
Pentru eCI back, adresa nu există fizic → prompt-ul eșuează corect dar
returnează `success: false`, ceea ce blochează submit-ul.

**Opțiuni:**
- A) Modific `extractFromCIBack` să nu mai ceară adresa → break pentru CI vechi back (rarely scanned acum, dar drafts vechi îl folosesc)
- B) Adaug `extractFromCINouBack` separat și păstrez `extractFromCIBack` neschimbat
- C) Adaug parametru `documentType` la `extractFromCIBack` și ramifică prompt-ul

**Decizie:** B — adaug `extractFromCINouBack` separat. Motiv: zero risc pe drafts existente, code path clar, ușor de testat. `extractFromCIBack` rămâne pentru CI vechi (dacă vreodată mai e folosit; în flow-ul nou nu mai e — CI vechi e doar față).

### Step 2 — Tipuri noi

Adaug în `src/lib/services/document-ocr.ts`:

```ts
export type ScanType =
  | 'ci_front'           // CI vechi sau nou — față
  | 'ci_nou_back'        // doar eCI back: data emit + autoritate + MRZ
  | 'passport_opened'    // pașaport deschis (foto + opusă)
  | 'ro_cei_reader_pdf'; // PDF MAI cu domiciliu

export interface ExtractedCINouBack {
  issueDate?: string;      // DD.MM.YYYY
  issuedBy?: string;       // ex. "SPCEP S5 biroul nr.1"
  mrzRaw?: string[];       // 3 linii MRZ
  mrzDocumentNumber?: string;
  mrzCNP?: string;
}

export interface ExtractedROCEIReader extends ExtractedPersonalData {
  isAuthenticated: boolean; // dacă PDF-ul conține "RO CEI Reader a MAI"
}

export interface CrossValidationWarning {
  field: 'documentNumber' | 'cnp' | 'name' | 'birthDate';
  values: Record<string, string | undefined>;
  severity: 'warning';
  message: string;
}
```

### Step 3 — Implementare extractoare

#### 3.1 `extractFromCINouBack` ✅
**Fișier:** `src/lib/services/document-ocr.ts`

Prompt-ul Gemini explicit menționează:
- "Pe spatele cărții electronice de identitate NU EXISTĂ adresa de domiciliu"
- "NU căuta adresa, NU raporta ca eroare lipsa adresei"
- "NU SCRIE ÎN 'issues' 'Address information not visible' sau echivalent"
- "Setează 'success': true dacă ai extras măcar data emiterii SAU MRZ-ul"

Returnează: `issueDate`, `issuedBy`, `mrzRaw[]`, `mrzDocumentNumber`, `mrzCnp`.

Reutilizează `parseGeminiOCRResponse` cu document type `ci_back` (păstrează compat la nivel de parser).

#### 3.2 `extractFromPassportOpened` ✅
**Fișier:** `src/lib/services/document-ocr.ts`

Înlocuiește `extractFromPassport` pentru flow-ul nou. Prompt-ul cere imaginea pașaportului DESCHIS (ambele pagini vizibile), cu MRZ-ul de la baza paginii cu foto vizibil.

Extrage: `cnp` (dacă pașaport românesc), `lastName`, `firstName`, `gender`, `nationality`, `number`, `issueDate`, `expiryDate`, `issuedBy`, `mrz.line1/line2`.

Suportă atât pașapoarte românești cât și străine (alt cod cetățenie ISO 3 litere).

NU caută adresă — explicit menționat în prompt.

#### 3.3 `extractFromROCEIReaderPDF` ✅
**Fișier:** `src/lib/services/document-ocr.ts`

Acceptă PDF direct (base64) — Gemini 2.5 Flash Lite suportă PDF nativ via
`inlineData: { mimeType: 'application/pdf', data: base64 }`.

Prompt-ul descrie exact formatul PDF-ului oficial (rânduri `Nume de familie:`, `Prenume:`, etc.) și include verificare anti-forgery basic: caută string-ul exact "RO CEI Reader a MAI" în footer și returnează `isAuthenticated: true/false`.

Returnează datele complete inclusiv `address.{county,city,sector,streetType,street,number,building,staircase,floor,apartment,fullAddress}`.

Prompt-ul are exemple pentru ambele formate (urban + rural + București cu sector).

#### 3.4 `crossValidateExtractedData` ✅
**Fișier:** `src/lib/services/document-ocr.ts`

Pure function. Acceptă obiect cu scan-uri opționale:
```ts
{ ci_front?, ci_nou_back?, ro_cei_reader_pdf? }
```

Returnează `CrossValidationWarning[]`. Câmpurile comparate:
- `documentNumber` (front vs back MRZ vs PDF)
- `cnp` (front vs back MRZ vs PDF)
- `name` (front vs PDF) — comparație case-insensitive cu normalizare diacritice (ș→s, ț→t)
- `birthDate` (front vs PDF) — comparație strictă DD.MM.YYYY

Toate warnings au `severity: 'warning'` (niciodată 'error'). Admin decide.

### Step 4 — Tests ✅

**`tests/unit/lib/services/document-ocr-cross-validate.test.ts`** (15 tests):
- No scans / partial scans (no warnings)
- Document number mismatch (front vs back, front vs PDF, agreement)
- CNP mismatch (front vs back MRZ, front vs PDF, agreement)
- Name comparison cu diacritic normalization (IONEȘCU vs IONESCU = match)
- Birth date comparison
- Multiple simultaneous warnings
- Severity always = 'warning'

**`tests/unit/lib/services/document-ocr-new-extractors.test.ts`** (8 tests):
- eCI back: success=true cu issueDate + MRZ + adresa null (regression test pentru bug-ul detectat)
- eCI back: surfaces real legibility issues
- Passport opened: full data extraction
- Passport străin fără CNP
- Passport NU are address field
- RO CEI Reader PDF: extragere completă cu adresă București cu sector
- RO CEI Reader PDF: flag pentru `isAuthenticated: false`
- RO CEI Reader PDF: format rural (sat + comună)

### Step 5 — Verificare finală ✅

```
npx vitest run
✓ 951 tests passing (+23 noi: 15 cross-validate + 8 extractor parser)
✓ 0 failures
npx tsc --noEmit
✓ Type-check curat
npx eslint <files>
✓ Lint curat pe fișierele noi
```

### Modificate pe disc

| Fișier | Schimbare |
|--------|-----------|
| `src/lib/services/document-ocr.ts` | +4 funcții noi (`extractFromCINouBack`, `extractFromPassportOpened`, `extractFromROCEIReaderPDF`, `crossValidateExtractedData`), +3 tipuri (`ScanType`, `ExtractedCINouBack`, `ExtractedROCEIReader`, `CrossValidationWarning`), +400 linii ~ |
| `tests/unit/lib/services/document-ocr-cross-validate.test.ts` | NOU — 15 teste |
| `tests/unit/lib/services/document-ocr-new-extractors.test.ts` | NOU — 8 teste |

### Step 6 — Commit + push

Commit `90155cd` pe `main` cu mesaj cuprinzător. Suite teste: 951 passing.

---

## PR 2 — Frontend wizard

### Step 1 — Extindere API OCR pentru noile tipuri

**Fișier:** `src/app/api/ocr/extract/route.ts`

Adăugat în lista de tipuri acceptate (mode='specific'):
- `ci_nou_back` → `extractFromCINouBack`
- `passport_opened` → `extractFromPassportOpened`
- `ro_cei_reader_pdf` → `extractFromROCEIReaderPDF` (PDF nativ)

Tipurile legacy `ci_front`, `ci_back`, `passport` rămân operaționale pentru
drafts vechi (zero migration).

### Step 2 — State shape extension

**Fișier:** `src/types/verification-modules.ts`

Adăugat în `PersonalKYCState`:
```ts
idDocumentType: 'ci_vechi' | 'ci_nou' | 'passport' | null;
```

Distinct de `documentType` (OCR-detected). Acesta e alegerea explicită a
utilizatorului din picker — driver pentru ce scan zones se afișează.

**Fișier:** `src/providers/modular-wizard-provider.tsx`

`createInitialPersonalKYCState` setează `idDocumentType: null` (default
= picker se afișează).

### Step 3 — `<DocumentTypePicker>` component

**Fișier nou:** `src/components/orders/modules/personal-kyc/DocumentTypePicker.tsx`

3 carduri cu Lucide icons (IdCard, CreditCard, BookOpen), accesibile prin
keyboard (toate sunt `<button type="button">`). Cardul CI nou are badge
"Recent" pentru a ghida userii spre flow-ul cel mai probabil corect.

### Step 4 — Refactor `PersonalDataStep.tsx`

**Modificări structurale:**

1. **Refs noi** pentru cele 3 noi zone de upload:
   - `ciNouBackInputRef`, `passportOpenedInputRef`, `roCeiPdfInputRef`

2. **State slots noi:**
   - `ciNouBackScan`, `passportOpenedScan`, `roCeiPdfScan` (toate folosind
     `ScanState` existent)
   - `scanFailureCount` — pentru fallback la manual după 2 eșecuri

3. **`handleFileSelect` extins** să accepte toate 5 ScanType variants.
   Dispatch prin `setStateMap` lookup în loc de ternary cascade.

4. **`resetScan` extins** la fel.

5. **`renderScanCard` generalizat** să accepte oricare tip; ref-ul corect
   prin lookup. Pentru `ro_cei_reader_pdf` schimbă `accept` pe input la
   doar `application/pdf`. Pentru passport_opened + PDF folosește
   icoane generice (nu illustration card).

6. **Scan section refactor major** — înlocuită complet:
   - Picker se afișează dacă `mode==='scan' && !idDocumentType && !isForeignCitizen`
   - După pick, scan zones diferite per tip:
     - `ci_vechi`: doar `ci_front`
     - `ci_nou`: `ci_front` + `ci_nou_back` + info card cu instrucțiuni RO CEI Reader + `ro_cei_reader_pdf`
     - `passport`: doar `passport_opened`
   - Buton "Schimbă tipul actului" șterge scanările și revine la picker
   - Buton "Completez manual" rămâne ca fallback
   - După 2 eșecuri OCR, banner amber prominent "Vrei să completezi manual?"

### Step 5 — Tests

**Fișier nou:** `tests/unit/components/document-type-picker-types.test.ts` (4 tests):
- IdDocumentType union exactă (`'ci_vechi' | 'ci_nou' | 'passport'`)
- Acceptare valori valide
- Export function valid
- Component signature accept props

**De ce NU full render tests:** proiectul nu are `@testing-library/react`
instalat și Vitest e configurat pe `environment: node`, nu jsdom. Render
tests ar fi necesitat setup separat. Pentru PR-ul ăsta, type-check +
build + smoke test manual sunt suficiente pentru validare.

### Step 6 — Verificare

```
npx tsc --noEmit      → curat
npx vitest run        → 955 tests passing (+4 noi)
npm run build         → ✓ Compiled successfully in 3.2s, 83 pagini SSG
```

### Modificate pe disc

| Fișier | Schimbare |
|--------|-----------|
| `src/app/api/ocr/extract/route.ts` | +6 case-uri pentru ScanType noi |
| `src/types/verification-modules.ts` | + câmp `idDocumentType` |
| `src/providers/modular-wizard-provider.tsx` | init `idDocumentType: null` |
| `src/components/orders/modules/personal-kyc/DocumentTypePicker.tsx` | NOU — 3-card picker |
| `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` | +3 refs, +3 state slots, extins handler+resetScan+renderScanCard, scan section refactor major |
| `tests/unit/components/document-type-picker-types.test.ts` | NOU — 4 type-contract tests |
| `docs/session-logs/2026-05-28-id-document-picker-implementation.md` | append PR 2 |

### Step 7 — Commit + push

(Continuă imediat după...)


