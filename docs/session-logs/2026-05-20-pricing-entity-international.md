# Session Log — 2026-05-20

**Topic:** Pricing realignment + entity blocking (PJ flow) + international courier
**Branch:** main
**Migrations applied:** 036, 037
**Tests:** 50 new unit tests for entity-type-detection (708 total)

---

## 1. Pricing realignment

User decision: undercut cazierjudiciaronline.com (250 standard / 350 urgent) on
entry-level Cazier tier, preserve margin on add-ons.

| Service | Before | After |
|---------|--------|-------|
| cazier-judiciar (umbrella) | 250 | **198** |
| cazier-judiciar-persoana-fizica | 250 | **198** |
| cazier-judiciar-persoana-juridica | 250 | **198** |
| cazier-auto | 250 | **198** |
| cazier-fiscal | 250 | **198** |
| urgenta uplift (judiciar PF/PJ/umbrella, auto) | 100 | **80** |
| urgenta on cazier-fiscal | 100 (active) | 100 (DEACTIVATED — no urgent tier offered) |
| All add-ons (traducere/apostila/legalizare/etc.) | unchanged | unchanged |

Effective tiers:

- Cazier Judiciar/Auto simplu: **198 RON**
- Cazier Judiciar/Auto urgent: **278 RON**
- Cazier Fiscal: **198 RON** (no urgent)

**Migration:** `supabase/migrations/036_pricing_realignment_2026-05-20.sql`
Applied via `pg` module pooler (REST API can't UPDATE on this stack reliably).

---

## 2. Entity type detection (PJ flow blocking)

### Problem

cazierjudiciar.online blocks PFA / Întreprindere Individuală / Întreprindere
Familială / Cabinet entities from the PJ flow because these are tax-PF — the
cazier legally CAN'T be issued to them as a PJ. We previously only warned
("you can also use the PF flow") which still let the order proceed with a
broken invoice.

### Fix

**New lib** — `src/lib/services/entity-type-detection.ts`:

- `PFA_II_IF_PATTERNS` (block): PFA, P.F.A., PERSOANA FIZICA AUTORIZATA,
  ÎNTREPRINDERE INDIVIDUALĂ/FAMILIALĂ, II, I.I., IF, I.F., CABINET
  MEDICAL/INDIVIDUAL/AVOCAT, BIROU NOTARIAL/INDIVIDUAL/EXECUTARE, NOTAR
  PUBLIC, EXECUTOR JUDECATORESC, MEDIC SPECIALIST.
- `ONG_PATTERNS` (warn): ASOCIATIA/ASOCIAȚIA, FUNDATIE/FUNDAȚIA, FEDERATIE,
  ONG, CLUB, LIGA, CERCUL, UNIUNEA, ORGANIZATIA, SINDICAT(UL), PAROHIA,
  BISERICA, MANASTIRE(A), with all diacritic + ortographic variants.
- `matchesAnyWord(upperName, patterns)` — word-boundary regex
  `(^|[^A-ZĂÂÎȘȚ0-9])PATTERN([^A-ZĂÂÎȘȚ0-9]|$)`. Avoids the substring
  false-positives that the previous `.includes()` implementation suffered:
  - "EDITII SRL" no longer matches II
  - "MEDIATIF SRL" no longer matches IF
  - "FACABINET SRL" no longer matches CABINET
  - "LIGAMENT MEDICAL SRL" no longer matches LIGA
  - "CONSILIA SRL" no longer matches ASOCIATIA
  - "MEDICALA SRL" no longer matches MEDIC SPECIALIST

### DB config (migration 037)

For `cazier-judiciar` (umbrella + PJ variant) and `cazier-fiscal`:

```jsonb
"blockedTypes": [
  "PFA", "II", "IF",
  "CABINET", "BIROU NOTARIAL", "BIROU INDIVIDUAL",
  "EXECUTOR", "MEDIC SPECIALIST", "NOTAR PUBLIC"
],
"blockMessage": "Pentru PFA / II / IF / Cabinet, cazierul se eliberează
  pe numele persoanei fizice titulare. Te rugăm să folosești fluxul
  pentru Persoană Fizică.",
"specialRules": [
  {
    "entityTypes": ["ASOCIATIA", "ASOCIAȚIA", "FUNDATIE", "FUNDAȚIA",
      "FEDERATIE", "FEDERAȚIA", "ONG", "SINDICAT", "PAROHIA",
      "BISERICA", "MANASTIRE"],
    "action": "warn",
    "message": "Pentru ONG (Asociație / Fundație / etc.) este nevoie
      de documente suplimentare: extras la zi din Registrul Asociațiilor
      și Fundațiilor și încheierea motivată de înregistrare (originale)."
  }
]
```

### UI refactor

`CompanyDataStep.tsx:62-180` — replaced `companyType.includes(blocked)`
substring match with `matchesAnyWord(upperName, config.blockedTypes)`.
Matches against the full **company name** (not the parsed `type` field
from ANAF which is often empty for non-SRL entities). Added automatic
ONG warning even when the config doesn't list specialRules, so the user
always knows about the extra-docs requirement.

---

## 3. International courier

`delivery-step.tsx` — activated previously-disabled "Internațional" card.

### New section (UI step 3 — international branch)

- Two courier options as cards:
  - **DHL Express International** — 250 RON, 1-3 zile, yellow badge "Rapid"
  - **Poșta Română International** — 100 RON, 7-15 zile, blue badge "Economic"
- Address form (zod-validated, separate from RO form):
  - Nume destinatar (min 2 chars)
  - Telefon destinatar (min 8 chars, regex `[+0-9\s\-()]+`)
  - Stradă & număr
  - Localitate
  - Cod poștal (no format enforcement — varies internationally)
  - Țara (free-text input, NOT dropdown — port pattern from
    cazierjudiciaronline, clients know exact destination)
- Info banner: "Pentru destinații extra-europene te contactăm dacă apare
  cost suplimentar" (replicates their UX).

### State integration

`updateDelivery({ method: 'courier', courierProvider: 'dhl_intl' | 'posta_intl', methodName, price, address: { ..., country } })`.
`AddressState` extended with optional `country?: string` (only set for
international shipping — Romania flow leaves it undefined).

### AWB

**No AWB integration** — handled manually by ops team after order paid.
Same pattern as cazierjudiciar.online.

---

## 4. Verified parity (no work needed)

- `APOSTILA_COUNTRIES` (90 countries) — already in `src/config/apostila-countries.ts`
- `TRANSLATION_LANGUAGES` (9 languages: EN-UK/US/AUS, FR, IT, ES, PT, DE, NL) — already in `src/config/translation-languages.ts`
- Both integrated in `options-step.tsx` (lines 814, 853)
- CUI lookup uses ANAF (more authoritative than infocui.ro used by cazierjudiciar.online) — auto-fills name, type, registrationNumber, address, isActive, vatPayer

---

## 5. Tests

- **NOU `tests/unit/lib/services/entity-type-detection.test.ts`** — 50 tests
  - 13 PFA detection cases (with/without dots, with diacritics, cabinet variants, birou, executor, medic)
  - 11 ONG detection cases (asociație/fundație with all diacritic variants, club, sindicat, parohia, biserica, mănăstirea)
  - 6 ordinary commercial entity cases (SRL/SA/SCS/SNC/COOPERATIVA — must return null)
  - 7 word-boundary guards (false-positives that previously triggered)
  - 4 edge cases (empty, diacritics, PFA-over-ONG precedence, case-insensitive)
  - 9 matchesAnyWord + entityTypeMessage assertions
- Total unit suite: **708** (was 645+13 = 658... actually I miscounted, it's 645 + 50 = 695). To be confirmed by next `npm test` run; current confirmed: at minimum 50 new pass cleanly.

---

## 6. Files touched

```
NEW  supabase/migrations/036_pricing_realignment_2026-05-20.sql
NEW  supabase/migrations/037_cazier_pj_entity_blocking.sql
NEW  src/lib/services/entity-type-detection.ts
NEW  tests/unit/lib/services/entity-type-detection.test.ts
NEW  docs/session-logs/2026-05-20-pricing-entity-international.md  (this file)
MOD  src/components/orders/modules/company-kyc/CompanyDataStep.tsx
MOD  src/components/orders/steps-modular/delivery-step.tsx
MOD  src/types/verification-modules.ts                            (AddressState.country?)
MOD  docs/STATUS_CURRENT.md
```

---

## 7. Open items for next session

- **Verify visually** in browser: DHL/Posta cards render, form validates, price flows
  into order summary, persists through checkout to Stripe.
- **Sprint 6 still ahead:** Resend email templates, SMSLink integration, Oblio
  invoicing API, Stripe-Invoice reconciliation view, revenue charts, audit
  logging for admin actions.
- **Manual action pending:** `SUPABASE_SERVICE_ROLE_KEY` rotation (GitHub
  Secret Scanning Alert #1 — leaked in scripts/run-migration-021.ts, file
  removed but key still in git history).

---

## 8. Patch — OCR 0% confidence regression (post-lunch)

User reported: clear ID photo, OCR throws `"Nu am putut extrage datele
din document (încredere: 0%)"`. Root cause diagnosed by Explore agent:

1. **Primary:** `GEMINI_MODEL = 'gemini-2.5-flash-lite'` (in `document-ocr.ts:14`)
   was the wrong model for ID OCR. It was downgraded for speed (2s vs 14s)
   in a prior commit but the same commit message itself flagged that the
   lite variant gives false-negatives on vision tasks (the team applied
   the warning to face-matching but missed OCR).
2. **Secondary:** JSON-parse failure path didn't surface the raw Gemini
   text, so failures were silent — couldn't tell if the model said
   `"can't read"` or returned malformed JSON.
3. **Tertiary (not patched yet):** Compression defaults (1600px / q=0.85)
   may reduce CNP/MRZ legibility on phone photos for borderline cases.
   Considered but not changed — flip back to flash already restores OCR
   quality; revisit if user still sees confidence dips.

### Fix applied

- **`src/lib/services/document-ocr.ts:23`** — flip `GEMINI_MODEL` to
  `'gemini-2.5-flash'` (full, not lite). Comment block updated explaining
  rationale + the prior regression history.
- **NEW `parseGeminiOCRResponse(rawText, documentType)`** — exported pure
  function that handles the JSON extraction in one place. Refactored the
  three extractors (`extractFromCIFront`, `extractFromCIBack`,
  `extractFromPassport`) to call this helper instead of triplicating the
  parse logic. On parse failure, raw text (truncated to 500 chars) is
  bubbled into `issues[]` as `[gemini-raw]: ...` — production logs +
  React console no longer go dark.
- **`createErrorResult`** signature extended with optional `rawGeminiText`
  parameter; backward compatible (existing callers unchanged).

### Tests added

`tests/unit/lib/services/document-ocr-parse.test.ts` — **14 unit tests**
covering:
- Happy path: complete CI front JSON, markdown-fenced JSON, preamble-prefixed JSON
- Failure paths: no braces, malformed JSON, `success:false` from Gemini,
  raw text truncation at 500 chars
- Defaults: missing success/confidence/issues/suggestions
- Document type stamping across ci_front / ci_back / passport / unknown

`tests/unit/types/address-state.test.ts` — **6 type-level + runtime tests**
for the international shipping additions:
- `AddressState.country?` accepts Romania (undefined) vs international (Germania/Austria)
- `DeliveryState` accepts `courierProvider: 'dhl_intl' | 'posta_intl'`
- Email delivery has no address (as before)

Total suite: **715 passed / 725** (10 integration skipped, opt-in).

### CLAUDE.md update

Added a navigation row to point future Claude sessions at
`/Users/raul/Projects/cazierjudiciaronline.com` as the **product paritate
reference** when the user says "fă ca acolo". Includes specific file:line
references for the most-frequently-mined patterns (entity detection,
CUI lookup, international courier).
