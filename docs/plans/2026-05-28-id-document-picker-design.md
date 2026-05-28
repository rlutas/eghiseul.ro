# Design — Document Type Picker + 3-way Scan Flow + RO CEI Reader PDF

**Status:** Draft — Aprobat de user, ready pentru implementation plan
**Data:** 2026-05-28
**Autor:** Sesiune Claude + Raul
**Pentru:** Step 2 (date personale) — în prezent doar cazier-judiciar PF, va fi reaplicat la alte servicii cazier ulterior

---

## 1. Problemă

Step 2 actual presupune că orice utilizator are același tip de carte de identitate (CI vechi cu adresa pe spate). În realitate, în România sunt mai multe variante în circulație simultan:

- **CI vechi** (plastic 2009-2024, fără cip) — toate datele inclusiv adresa
- **CI nou electronic** (CEI/eCI, 2021 pilot Cluj, 2025+ național) — cu cip, **adresa nu mai este printată**, e doar pe cip
- **Pașaport** — fără adresă vreodată

Adițional există carton vechi (1997-2009) și pașaportul pentru cetățenii români.

**Bug concret detectat:** OCR-ul pe spatele eCI returnează `success: false, confidence: 0` cu mesaj `"Address information is not visible on the provided image"`, deși a extras corect data emiterii și autoritatea. Prompt-ul Gemini cere mereu adresa, iar pe eCI back **adresa nu există fizic**.

**Constrângere legală:** pentru cererea de cazier judiciar către MJ, adresa de domiciliu este obligatorie (regulament eIDAS + OUG 41/2016). Trebuie să o avem din vreundeva pentru toate tipurile de document.

---

## 2. Background — tipurile de CI românești

Conform [carteadeidentitate.gov.ro](https://carteadeidentitate.gov.ro) și [Wikipedia](https://ro.wikipedia.org/wiki/Carte_de_identitate_rom%C3%A2neasc%C4%83):

| Variantă | Material | Perioadă | Cip | Adresa printată? | Verso are date? |
|----------|----------|----------|-----|------------------|------------------|
| Buletin de identitate (BI) | Hârtie roz | pre-1997 | nu | pe pagini interne | n/a |
| CI carton | Carton | 1997-2009 | nu | spate (uneori) | da |
| CI plastic v1 | Plastic | 2009-2018 | nu | **spate** + cod bare | da |
| CI plastic v2 | Plastic | 2018-2024 | nu | **spate** + MRZ | da |
| CIS (simplă) | Plastic | 2021+ | nu | **spate** + MRZ | da |
| CEI (electronică) | Plastic | 2021 Cluj, 2025+ național | **da** (NFC + contact) | **doar pe cip** | doar admin (data emit. + SPCEP + MRZ) |
| Pașaport simplu | Livret | continuu | da (biometric) | niciodată | n/a |

**Decizie produs (validată cu user):** pentru simplitate UX, grupăm CIS + variantele plastic 2009-2024 ca "CI vechi" (fără cip), separăm CEI ca "CI nou electronic" (cu cip). Pașaport separat. 3 categorii vizibile pentru client.

**RO CEI Reader (sursa adresei pentru eCI):**
- Aplicație oficială MAI (Ministerul Afacerilor Interne)
- Disponibilă pe Google Play și App Store, gratuit
- Userul apropie telefonul de cip (NFC) → app generează PDF cu toate datele inclusiv `Domiciliu:` + foto
- PDF-ul are footer `"Acest document este generat cu acordul utilizatorului prin intermediul aplicației RO CEI Reader a MAI"` — folosit ca anti-forgery basic
- Format text predictibil (key: value pe linii separate) → OCR foarte precis

---

## 3. Goals + Non-Goals

### Goals
- Client UX simplu: pick tip act → upload corespunzător → continuă
- Acomodare 100% din variantele de CI în circulație (vechi + eCI + pașaport)
- Rezolvare bug OCR pe spate eCI
- Sursa de adevăr pentru adresă: PDF RO CEI Reader (pentru eCI) sau Step 4 livrare (pentru CI vechi + pașaport)
- Cross-validation între față/spate/PDF la nivel admin (warning, nu block)

### Non-Goals
- NU validăm semnătura digitală a PDF-ului RO CEI Reader (nu există API public pentru asta)
- NU detectăm tipul de document automat din OCR (userul alege manual; OCR-ul confirmă)
- NU îmbunătățim flow-ul pentru cetățeni străini în această fază (rămâne ca azi: manual + KYC docs la Step 4)
- NU rescriem complet OCR-ul existent — adăugăm noi extractoare și fix-uim ci_back

---

## 4. Decision tree

Userul vede picker-ul cu 3 carduri (după ce a apăsat "Scanează actul" în mode picker existent):

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Buletin / CI vechi │  CI nou electronic  │      Pașaport       │
│     (fără cip)      │     (cu cip)        │                     │
│                     │                     │                     │
│   📇 [icon]         │   💳 [icon cu cip]  │   📘 [icon]         │
│                     │                     │                     │
│  Plastic 2009-2024  │  Cu cip auriu pe    │  Livret cu pagini   │
│  sau carton vechi   │  spate (eCI/CEI)    │                     │
│                     │                     │                     │
│  Scan: doar față    │  Scan: față + spate │  Scan: pașaport    │
│                     │  + PDF dovadă       │  deschis           │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

| Tip | Documente cerute | Sursa adresei |
|-----|-------------------|----------------|
| `ci_vechi` | `ci_front` | Step 4 livrare |
| `ci_nou` | `ci_front` + `ci_nou_back` + `ro_cei_reader_pdf` | PDF RO CEI Reader |
| `passport` | `passport_opened` | Step 4 livrare |

---

## 5. UI design

### 5.1 Mode picker (existent)
Rămâne neschimbat: `Scan vs Manual`. Manual mode bypassează picker-ul de tip document — toate câmpurile vizibile + dropdown explicit „Tip act" pentru consistență de date.

### 5.2 Document type picker (nou)
Component nou `<DocumentTypePicker>` între mode picker și scan zones. Render condiționat: `mode === 'scan' && !idDocumentType`.

State persistat în `personalKyc.idDocumentType`. Detecție smart: dacă `personalKyc.scans[*].extracted.documentType` deja există, presetăm picker-ul.

### 5.3 Scan zones (per tip ales)

**CI vechi:**
```
┌─────────────────────────────────────────────┐
│  CI față (singura cu date)                  │
│  [scan zone — square]                       │
│  📇 Așază buletinul cu fața în sus...      │
└─────────────────────────────────────────────┘
```

**CI nou electronic:**
```
┌──────────────────────┬──────────────────────┐
│  CI nou față         │  CI nou spate        │
│  [scan zone]         │  [scan zone]         │
│  Foto + date + CNP   │  Data emit. + SPCEP  │
└──────────────────────┴──────────────────────┘
┌─────────────────────────────────────────────┐
│  Dovadă domiciliu (RO CEI Reader PDF)       │
│  [upload zone — PDF only]                   │
│                                             │
│  📱 De unde iei PDF-ul:                     │
│     1. Instalează "RO CEI Reader" (gratis,  │
│        MAI) pe telefon                      │
│     2. Apropie telefonul de cip-ul de pe    │
│        spatele CI                           │
│     3. Aplicația generează PDF-ul → îl urci │
│                                             │
│  [📲 Android] [📲 iOS] (linkuri store)     │
└─────────────────────────────────────────────┘
```

**Pașaport:**
```
┌─────────────────────────────────────────────┐
│  Pașaport deschis (ambele pagini)           │
│  [scan zone landscape mare]                 │
│  📘 Deschide la pagina cu foto + opusă...  │
└─────────────────────────────────────────────┘
```

### 5.4 După scan reușit (toate tipurile)

În scan mode, după ce TOATE documentele cerute sunt scanate, afișăm card-ul verde "Date extrase" existent (same as today) cu summary: nume, prenume, CNP. Toate inputs ascunse — operator corectează din admin dacă e cazul.

---

## 6. OCR pipeline

### 6.1 Tipuri noi
```ts
// src/lib/services/document-ocr.ts
export type ScanType =
  | 'ci_front'           // valid pentru CI vechi + CI nou
  | 'ci_nou_back'        // doar pentru eCI: data emit + autoritate + MRZ, NO adresă
  | 'passport_opened'    // pașaport deschis (foto + pagină opusă)
  | 'ro_cei_reader_pdf'; // PDF de la app MAI cu domiciliu

// Backward compat: 'ci_back' rămâne ca deprecated alias pentru ci_nou_back
// (există drafts existente cu ci_back în state — nu le migrăm)
```

### 6.2 Extractoare

**`extractFromCIFront(image)`** — neschimbat
Returnează: `nume, prenume, sex, cetățenie, CNP, dataNașterii, loculNașterii, nrDocument, dataExpirării, foto`

**`extractFromCINouBack(image)`** — NOU
Prompt Gemini știe că **pe spatele eCI nu există adresă** — nu trebuie să marcheze fail dacă e null.
Returnează: `dataEmiterii, autoritateEmitentă (SPCEP), mrzRaw, mrzDocumentNumber, mrzCNP, foto`
- Parsare MRZ: 3 rânduri ICAO 9303-3 — primul rând conține tipul + țara + nr document
- `mrzCNP` extras din rândul 2

**`extractFromPassportOpened(image)`** — NOU (înlocuiește `extractFromPassport`)
Gemini extrage din pagina cu foto + verifică MRZ vizibil în partea de jos.
Returnează: `nume, prenume, sex, cetățenie, nrPașaport, dataNașterii, dataEmiterii, dataExpirării, foto, mrzRaw`

**`extractFromROCEIReaderPDF(pdfBuffer)`** — NOU
Folosește **Gemini 2.5 Flash cu input nativ PDF** (Gemini suportă PDF direct via `inlineData: { mimeType: 'application/pdf', data: base64 }`).
Verifică în content stringul `"RO CEI Reader a MAI"` ca anti-forgery basic.
Returnează: `nume, prenume, CNP, sex, dataNașterii, loculNașterii, nrDocument, dataEmiterii, autoritate, domiciliu (parsat în county/city/sector/street/number/building/staircase/floor/apartment), foto`

Parserul de adresă: parsing regex pe formatul oficial:
```
"Mun.Bucureşti Sec.5 Bd.Schitu Măgureanu nr.3 sc.A et.3 ap.21"
↓
{
  county: "București",
  city: "București",
  sector: "5",
  streetType: "Bd.",
  street: "Schitu Măgureanu",
  number: "3",
  staircase: "A",
  floor: "3",
  apartment: "21"
}
```
Cu fallback la `fullAddress` string brut dacă regex eșuează.

### 6.3 Cross-validation
Funcție nouă `crossValidateExtractedData(scans)` returnează `Array<CrossValidationWarning>`:

```ts
type CrossValidationWarning = {
  field: 'documentNumber' | 'cnp' | 'name' | 'birthDate';
  values: { ci_front?: string; ci_nou_back?: string; ro_cei_reader_pdf?: string };
  severity: 'warning';  // niciodată 'error' — admin decide
};
```

Reguli:
- `ci_front.nrDocument === ci_nou_back.mrzDocumentNumber` (verifică MRZ pe spate)
- `ci_front.CNP === ro_cei_reader_pdf.CNP`
- `ci_front.lastName + firstName === ro_cei_reader_pdf.lastName + firstName` (după normalizare)
- `ci_front.birthDate === ro_cei_reader_pdf.birthDate`

---

## 7. State shape

```ts
// state.personalKyc — append + restructure
{
  // ... existing fields (cnp, firstName, lastName, etc.) — populated by OCR silently

  idDocumentType: 'ci_vechi' | 'ci_nou' | 'passport' | null,

  scans: {
    ci_front?: {
      url: string;            // S3 URL
      scannedAt: string;      // ISO timestamp
      ocrConfidence: number;  // 0..1
      extracted: ExtractedCIFront;
    };
    ci_nou_back?: { url; scannedAt; ocrConfidence; extracted: ExtractedCINouBack };
    passport_opened?: { url; scannedAt; ocrConfidence; extracted: ExtractedPassport };
    ro_cei_reader_pdf?: { url; uploadedAt; ocrConfidence; extracted: ExtractedROCEI };
  };

  crossValidationWarnings?: CrossValidationWarning[];

  adminVerifiedAt?: string;      // ISO timestamp — admin marked as verified
  adminVerifiedBy?: string;      // admin user id
}
```

**Backward compat:** drafts existente au câmpuri vechi (`ocrResults[]`, `uploadedDocuments[]`). Lăsăm să coexiste. Wizard-ul detectează: dacă există `idDocumentType`, folosește `scans` nou; altfel, folosește vechi (legacy mode pentru drafts pre-refactor).

---

## 8. Validation rules

**Block "Continuă" până sunt complete:**

| `idDocumentType` | Required |
|------------------|----------|
| `null` | "Alege tipul actului tău" |
| `ci_vechi` | `scans.ci_front` cu `ocrConfidence > 0.3` + CNP + firstName + lastName extrase |
| `ci_nou` | `scans.ci_front` + `scans.ci_nou_back` + `scans.ro_cei_reader_pdf`, toate cu `ocrConfidence > 0.3` + CNP + adresa în PDF |
| `passport` | `scans.passport_opened` + nrPașaport + firstName + lastName extrase |

**OCR cu confidence < 0.5:** warning galben "Datele extrase au confidence scăzut", dar NU blocăm. Manual mode rămâne fallback.

**Fallback manual:** counter `scanFailureCount` în state. La 2 eșecuri OCR consecutive, apare buton "Am încercat să scanez, dar nu merge — completez manual". Click → `mode='manual'`, păstrează `idDocumentType`.

---

## 9. Admin display

### 9.1 Secțiunea "Documente identitate" în `/admin/orders/[id]`

Înlocuiește secțiunea actuală cu thumbnails CI face/back.

```
╔═════════════════════════════════════════════════════╗
║  Documente identitate                               ║
║                                                     ║
║  Tip act:  [CI nou electronic ▼]    (admin edit)   ║
║                                                     ║
║  ┌─────────┐ ┌─────────┐ ┌─────────────────────┐  ║
║  │ Față    │ │ Spate   │ │ RO CEI Reader PDF   │  ║
║  │ [img]   │ │ [img]   │ │ 📄 [PDF preview]    │  ║
║  │ 95% ✓   │ │ 87% ✓   │ │ 98% ✓               │  ║
║  └─────────┘ └─────────┘ └─────────────────────┘  ║
║                                                     ║
║  ⚠️ Avertismente cross-validation:                  ║
║   • Nr. document din PDF (MB1139128) ≠ scanat pe   ║
║     față (MB1139127). Verifică manual.             ║
║                                                     ║
║  [Re-rulează OCR] [Marchează verificat]            ║
╚═════════════════════════════════════════════════════╝
```

### 9.2 Acțiuni admin

- **Re-rulează OCR** → re-trimite documentele la Gemini, update-ează `extracted`. Util când prompt-ul Gemini s-a îmbunătățit între timp sau OCR-ul inițial a eșuat parțial.
- **Marchează verificat** → setează `adminVerifiedAt` + `adminVerifiedBy`. Cross-validation warnings rămân vizibile dar afișează badge "verificat de [admin] la [dată]".
- **Cere clientului să urce: [doc]** → dacă admin schimbă tipul (ex. de la `ci_vechi` la `ci_nou`), apare buton care trimite email client cu instrucțiuni să urce documentele lipsă.

### 9.3 Lista de comenzi `/admin/orders`

Adăugăm coloană mică **📎** cu badge `1/3` (lipsește 2 documente). Click → link direct la secțiunea documente.

---

## 10. Implementation plan

Refactor în 3 PR-uri ca să rămână mergeable separat:

### PR 1 — Backend (OCR pipeline + types) [zile 1-2]
- [ ] `src/lib/services/document-ocr.ts`: adaugă `extractFromCINouBack`, `extractFromPassportOpened`, `extractFromROCEIReaderPDF`
- [ ] Fix prompt în `extractFromCIBack` (sau marcăm ca deprecated)
- [ ] Adaugă `crossValidateExtractedData()`
- [ ] Parser regex pentru adresa din PDF RO CEI Reader
- [ ] Teste: 1 fixture per scan type (`tests/fixtures/ocr/*.png`, `tests/fixtures/ocr/ro-cei-reader-sample.pdf`)
- [ ] Unit tests pe crossValidate

### PR 2 — Frontend wizard [zile 3-4]
- [ ] `DocumentTypePicker` component nou
- [ ] Conditional scan zones în `PersonalDataStep.tsx` per `idDocumentType`
- [ ] State shape migration (lazy: detect legacy → still works; new flow uses `scans`)
- [ ] Validation rules pe submit
- [ ] Fallback manual button după 2 eșecuri
- [ ] Linkuri Google Play + App Store pentru RO CEI Reader
- [ ] Tests: 1 test per document type flow

### PR 3 — Admin display [zi 5]
- [ ] Secțiunea "Documente identitate" în order detail
- [ ] Render cross-validation warnings
- [ ] Buton Re-rulează OCR (re-fetch Gemini)
- [ ] Buton Marchează verificat (audit timeline event)
- [ ] Coloană 📎 în lista de comenzi
- [ ] Email template "documente lipsă — urcă PDF RO CEI Reader"

### Migration strategy
- **DB:** zero migration. State shape e în `customer_data` JSONB. Câmpurile noi se adaugă incremental — drafts vechi continuă să funcționeze (legacy mode în wizard).
- **Drafts existente:** rămân pe ocrResults[] legacy. La submit folosesc valoare default `idDocumentType='ci_vechi'` (cel mai probabil scenariu pentru drafts pre-refactor).
- **Comenzi deja submitted:** zero impact — afișează secțiunea legacy în admin.

### Migration verification_config
Migration nouă pentru servicii cazier (cazier-judiciar, cazier-fiscal, cazier-auto, integritate):
```sql
-- 046_id_document_picker_config.sql
UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{personalKyc,supportedDocumentTypes}',
  '["ci_vechi","ci_nou","passport"]'::jsonb
)
WHERE slug IN ('cazier-judiciar', 'cazier-fiscal', 'cazier-auto', 'integritate-comportamentala');
```

(Pentru servicii care nu acceptă pașaport — ex. cazier-fiscal restricționat la rezidenți — putem exclude din array.)

---

## 11. Testing strategy

### Unit tests
- `tests/unit/lib/services/document-ocr.test.ts`
  - extractFromCIFront: 3 fixtures (CI vechi + eCI + edge case low-quality)
  - extractFromCINouBack: 1 fixture eCI back, verifies `success: true` even with `address: null`
  - extractFromPassportOpened: 1 fixture pașaport RO + 1 fixture pașaport străin
  - extractFromROCEIReaderPDF: 1 fixture PDF + 1 fixture PDF "fraudulos" (fără string MAI) → trebuie respins
- `tests/unit/lib/services/cross-validate.test.ts`
  - Match → 0 warnings
  - Mismatch nr document → 1 warning
  - Mismatch CNP → 1 warning
  - Multiple mismatches → multiple warnings

### Integration tests
- `tests/integration/wizard-document-flow.test.tsx`
  - CI vechi: pick + scan front → validate complete
  - CI nou: pick + 2 scans + PDF → validate complete
  - Pașaport: pick + 1 scan → validate complete
  - Fallback manual după 2 eșecuri OCR

### E2E manual (înainte de prod)
- [ ] Comandă cu CI vechi real (telefon Android, scan flow complet)
- [ ] Comandă cu eCI + PDF RO CEI Reader real
- [ ] Comandă cu pașaport
- [ ] Admin order detail: verificare warnings cross-validation pe comanda eCI

---

## 12. Open questions

1. **Pașaport străin la cazier-judiciar PF cu cetățenie română dublă?** Cazul edge: cetățean român cu pașaport din altă țară. Probabil rămâne pe flux "foreign" existent (manual + KYC step 4). Decidem la PR 2.

2. **CI nou pierdut/expirat — userul nu poate genera PDF RO CEI Reader?** Fallback: admin manual fills address from delivery + flag "address from delivery, not verified". Decizie produs viitoare.

3. **Validare semnătură digitală PDF MAI?** MAI nu publică API. Verificarea string-ului "RO CEI Reader a MAI" e best-effort. Decizia: best-effort acceptable pentru phase 1.

4. **Re-aplicare la celelalte servicii cazier (fiscal, auto, integritate)?** Yes, dar într-un PR separat după ce flow-ul e validat pe cazier-judiciar.

---

## 13. Anti-fraud considerations

- **PDF forge:** anyone can edit PDF text. String check "RO CEI Reader a MAI" e basic. Adițional verificăm că CNP din PDF match cu CNP din CI front (cross-validation). Operator vede warning dacă match-ul lipsește.
- **CI photo swap:** clientul ar putea pune foto din CI a altcuiva și PDF de la el. Cross-validation pe nume+CNP+dată naștere prinde mismatch-ul.
- **Risc rezidual:** un atacator cu CI furat + PDF de la victimă + foto bună poate trece. Mitigare: KYC face-match la Step 4 (existent). Nu schimbăm acolo nimic.

---

## Aprobări

- [x] User confirmat: 3 tipuri document, picker UI, doar PDF RO CEI Reader strict, pașaport fără dovadă adresă
- [ ] User confirm: implementation plan (3 PR-uri, ordinea propusă)
- [ ] Dev start: pregătit pentru `writing-plans` skill → implementation plan detaliat
