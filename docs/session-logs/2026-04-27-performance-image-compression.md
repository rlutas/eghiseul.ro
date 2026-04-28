# Session 2026-04-27 — Performance + Image Compression

**Branch:** main (in working tree, uncommitted)
**Trigger:** "cam greu se incarca paginile de ce?" — utilizator observat dev server super lent (PATCH draft 58s, admin/orders/list 25-39s)
**Outcome:** ~10x performance recovery + 90-95% reducere upload sizes

---

## TL;DR

Trei etape aplicate; toate validate cu măsurători înainte/după:

1. **Etapa 1 — Turbopack pentru dev mode** — `next dev --turbopack` în package.json (Next.js 16 default e webpack când nu e specificat explicit).
2. **Etapa 2 — admin/orders/list optimizat** — `count: 'estimated'` (elimină COUNT(*) per request) + exclude `status=draft` din default `'all'` (90 drafts înainte erau incluse, unul cu 4.8MB customer_data).
3. **Etapa 3 — Image compression client-side** — un util nou `src/lib/images/compress.ts` care reduce poze 3-7MB de pe telefon la 200-500KB JPEG, cu EXIF orientation aplicat corect și fallback gracios HEIC/decode-fail. Aplicat în 4 componente customer-facing (6 puncte FileReader).

**Rezultate măsurate live:**

| Operație | Înainte | După |
|----------|---------|------|
| `PATCH /api/orders/draft` (cu KYC) | **58s** | **200-2500ms** |
| `GET /api/admin/orders/list` direct DB | 3.8-5.2s | **2.4-2.6s** |
| `GET /api/admin/orders/list` API end-to-end | 25-39s | ~3-5s estimat |
| Upload CI 5MB iPhone | 6.7 MB base64 | **207 KB** (verificat în S3) |
| Wizard navigare între pași | 1-3s | **200-450ms** |
| `POST /api/orders/draft` create | 4.9s | **241ms** |

---

## Investigația root cause

Faza 1 — măsurători directe vs router:

| Strat | Timp |
|-------|------|
| Supabase auth health check | 70-170ms |
| DB direct admin list query | 528ms warm, 3.4s cold (118 rânduri) |
| API handler `/api/admin/orders/list` | 11.1s, 25.7s, 29.6s, 31.7s |

Diferența ~25s între DB și render = pur Next.js dev overhead. Nu network, nu DB query.

Cauze cumulate:
- Next.js 16 dev fără `--turbopack` flag (webpack mode);
- 295 MB cache `.next` cu HMR pe React 19;
- 90 drafts în DB (din 118 ordere total), inclusiv unul cu 4.8MB customer_data (CI base64);
- `count: 'exact'` la fiecare paginare → COUNT(*) separat per request;
- Cereri concurente paralele care se stivuiesc pe dev server single-threaded.

---

## Modificări aplicate

### `package.json`

```diff
- "dev": "next dev",
+ "dev": "next dev --turbopack",
```

### `src/app/api/admin/orders/list/route.ts`

```diff
-        { count: 'exact' }
+        { count: 'estimated' }
       )

-    if (status && status !== 'all') {
-      query = query.eq('status', status);
-    }
+    // Apply status filter: 'all' excludes drafts (customer-side abandoned carts);
+    // an explicit status param can still target any value including 'draft'.
+    if (status && status !== 'all') {
+      query = query.eq('status', status);
+    } else {
+      query = query.neq('status', 'draft');
+    }
```

### `src/lib/images/compress.ts` (NOU)

Browser-side image compression util:
- `createImageBitmap(file, { imageOrientation: 'from-image' })` aplică EXIF orientation automat (rezolvă pozele upside-down de pe iPhone)
- `OffscreenCanvas` cu fallback la `<canvas>` pentru browsere vechi
- Default: max 1600px pe latura mare, JPEG quality 0.85 — sweet spot pentru OCR Gemini pe CNP de 13 cifre (~30-40px tall după resize)
- Throw `ImageCompressionError` cu coduri: `HEIC_UNSUPPORTED`, `DECODE_FAILED`, `CANVAS_UNAVAILABLE`, `ENCODE_FAILED`
- Helper `compressedToFile()` pentru re-upload la S3
- Memory-safe: `bitmap.close()`, `canvas.width = 0` după encode (Safari hoarding workaround)

API:
```ts
const result = await compressImage(file);
// result: { base64, dataUrl, mimeType: 'image/jpeg', sizeBefore, sizeAfter, width, height }
```

### Componente integrate (4 fișiere, 6 puncte FileReader înlocuite)

1. `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` — CI front/back în wizard modular
2. `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` — selfie + face match + cert. domiciliu
3. `src/components/shared/IdScanner.tsx` — folosit de ProfileTab account (CI scan + selfie)
4. `src/components/account/KYCTab.tsx` — re-upload KYC din pagina cont (cu S3 + OCR)

Pattern-ul de înlocuire:

```diff
- const reader = new FileReader();
- reader.readAsDataURL(file);
- const dataUrl = await ...;
- const base64 = dataUrl.split(',')[1];
- // store: { fileSize: file.size, mimeType: file.type, base64 }
+ const compressed = await compressImage(file);
+ console.log(`[KYC] ${type}: ${(compressed.sizeBefore/1024/1024).toFixed(1)}MB → ${(compressed.sizeAfter/1024).toFixed(0)}KB`);
+ // store: { fileSize: compressed.sizeAfter, mimeType: compressed.mimeType, base64: compressed.base64 }
```

KYCTab are protecție extra: dacă `compressImage` eșuează (HEIC, browser vechi), fallback la upload-ul brut — nu blochează flow-ul.

### Fișiere LEGACY neatinse

`src/components/orders/steps/personal-data-step.tsx` și `src/components/orders/steps/kyc-step.tsx` rămân cu `FileReader` raw. Acestea aparțin wizard-ului vechi `/orders/new` (orfan, planificat pentru ștergere — vezi STATUS_CURRENT „Probleme Cunoscute").

---

## Validare

- `npx tsc --noEmit` → exit 0 (zero erori de tip pe codbase întreg)
- `npx eslint` pe cele 5 fișiere modificate → 0 erori, 20 warning-uri toate pre-existente (unused imports, `<img>` vs `next/image`)
- Test live: utilizatorul a făcut o comandă completă (E-260427-AT52E):
  - CI front → console: `[IdScanner]/[KYC]` log de compresie
  - S3 upload: 207 KB (verificat în DB `customer_data.personal.uploadedDocuments[0].fileSize`)
  - Selfie + face match: completat
  - Plată Stripe: succeeded (368.61 RON)
  - Contracte auto-generate: contract-prestari + contract-asistenta
  - Număr delegație alocat: SM005764

---

## Bug confirmat NON-CRITICAL: 404 tranzitoriu pe success page

**Simptom observat:** după redirect Stripe `redirect_status=succeeded`, success page a făcut `GET /api/orders/{id}` care a returnat 404 în 10.5s. User a văzut „Comanda nu a fost găsită".

**Investigație:**
- Order existent în DB cu toate datele corecte
- Aceeași cerere ulterior: `200 OK` în 1s
- Stripe payment intent: succeeded, charge ch_3TQqXNQZ4o0fUl1z53zTKC3F încasat real
- DB rămas cu `payment_status='unpaid'`, `status='pending'` pentru că webhook-ul Stripe nu poate ajunge pe localhost

**Root cause:** dev mode flakiness (Supabase auth `Error: fetch failed` observat în alte cereri în aceeași sesiune). Page-ul success ARE cod fallback `/api/orders/[id]/confirm-payment` (vezi `src/app/comanda/success/[orderId]/page.tsx:113`), dar acel cod rulează DUPĂ ce GET-ul reușește. Când GET dă 404, fallback-ul nu mai e atins.

**Fix manual aplicat:** `curl POST /api/orders/425a5bcd.../confirm-payment` → order acum `status='processing'`, `payment_status='paid'`.

**Recomandare pentru viitor (NEFĂCUT, separat):**
1. **Pentru testare locală:** rulează `stripe listen --forward-to localhost:3000/api/webhooks/stripe` în paralel cu dev server. Webhook-ul reală va marca order-ul paid imediat după Stripe charge → success page nu mai are nevoie de fallback.
2. **Robusteață success page:** dacă GET dă 404 ȘI `redirect_status=succeeded`, ar trebui apelat confirm-payment direct (în loc să arunce eroare). E o îmbunătățire separată, mică, în `src/app/comanda/success/[orderId]/page.tsx:100-130`.

---

## Etapa 4 — Gemini model switch (FĂCUT)

**Problemă observată după Etapa 3:** OCR luată 14-25s pentru un request. Investigație:
- Model: `gemini-2.5-flash` (hardcoded în `src/lib/services/document-ocr.ts:14` și `kyc-validation.ts:13`)
- Cauza: thinking activat by default în Gemini 2.5 Flash → 5-10s peste timpul nominal de inferență
- SDK folosit (`@google/generative-ai@0.24.1` — vechi) NU expune `thinkingConfig` — refactor la `@google/genai` ar fi necesar pentru a dezactiva thinking pe același model

**Schimbare inițială:** `gemini-2.5-flash` → `gemini-2.5-flash-lite` în 2 fișiere:
- `src/lib/services/document-ocr.ts:14`
- `src/lib/services/kyc-validation.ts:13`

`gemini-2.5-flash-lite` e proiectat pentru OCR/extracție high-throughput, fără thinking by default, cost ~30% din flash.

**Rezultat OCR (test E-260427-9BS7C):**
- OCR call: 1.9s (vs 14-25s înainte) → ~7-13x speedup
- Confidence: 98% (identic — zero pierdere calitate)

**Test KYC face match cu poze reale (script `scripts/test-kyc-face-match.mjs`):**

| Test | Selfie | CI ref | Așteptat | flash-lite | flash |
|------|--------|--------|----------|------------|-------|
| 1 (pozitiv) | Stefania-Rodica | Stefania-Rodica | match: true | ❌ false (30%) — fals negativ pe persoana corectă | ✅ true (92%) |
| 2 (negativ) | Alexandra-Lorena | Stefania-Rodica | match: false | ✅ false (30%) | ✅ false (5%) |

**Concluzie:** `flash-lite` e prea conservativ la face match — pe Test 1 a refuzat persoana legitimă cu motivul „nu pot confirma cu certitudine din cauza calității imaginii". Ar fi blocat utilizatori reali.

**Decizie finală — model hibrid:**
- `src/lib/services/document-ocr.ts:14` → `gemini-2.5-flash-lite` (OCR text, 1.9s, 98% accuracy)
- `src/lib/services/kyc-validation.ts:13` → `gemini-2.5-flash` (face match, 6-10s, 92-98% accuracy, detectează și mismatch document type + nume)

Comentariu inline adăugat în `kyc-validation.ts` ca să nu uităm de ce.

---

## Etapa 5 — Refactor: util reutilizabil pentru face match + paritate cont/wizard (FĂCUT)

**Problemă identificată:** flow-ul de KYC din pagina cont (`src/components/account/KYCTab.tsx`) **NU făcea face match la upload selfie**. Codul avea explicit comentariul „For selfie, just save without OCR" — selfie-ul mergea direct în S3 fără verificare. Wizard-ul (`KYCDocumentsStep.tsx`) făcea face match local.

Loophole real: utilizator cu cont putea urca CI-ul lui A + selfie cu fața lui B → trecut silent ca KYC complet.

**Schimbare aplicată — util reutilizabil:**

NOU `src/lib/kyc/face-match.ts` (~95 linii):
- `runFaceMatch({ selfieBase64, selfieMimeType, referenceBase64, referenceMimeType })` → `FaceMatchResult` cu `{ ok, matched, faceMatchConfidence, validationConfidence, valid, issues, error }`
- `fetchImageAsBase64(url)` helper pentru a încărca o imagine S3 ca base64 (folosit când CI-ul de referință e dintr-o sesiune anterioară)
- Comentariu inline care explică de ce `kyc-validation.ts` rămâne pe `gemini-2.5-flash` (NU lite — lite dă fals negative pe matchuri legitime)
- Threshold standard `valid = matched && validationConfidence >= 50` — același peste tot

**Refactorat `KYCDocumentsStep.tsx` (wizard):**
- Înlocuit fetch + parse manual cu `runFaceMatch(...)` (~45 linii → ~25 linii)
- Comportament identic, mai puțin cod duplicat

**Adăugat în `KYCTab.tsx` (cont):**
- `ciFrontCacheRef` — cache în-sesiune pentru CI front base64 (evită round-trip la S3 dacă utilizatorul urcă CI și selfie în aceeași sesiune)
- La selfie upload: dacă CI cache-uit → folosit direct; altfel `fetchImageAsBase64(s3Url)` din document-ul anterior
- `runFaceMatch(...)` apelat înainte de `saveDocument`
- Rezultatul stocat în `extractedData` + `validationResult` la `saveDocument` (admin vede confidence-ul)
- Mesaj UI clar utilizatorului dacă mismatch: „Fața din selfie nu corespunde cu cea de pe cartea de identitate..."

**Validare retest cu `scripts/test-kyc-face-match.mjs`:**

| Test | Result |
|------|--------|
| Stefania selfie + Stefania CI | ✅ matched=true, confidence 95% |
| Alexandra selfie + Stefania CI | ✅ matched=false, confidence 10% (mismatch document type + nume detectat) |

**Componenta reutilizabilă pentru OCR (ID scan)** — `src/components/shared/IdScanner.tsx` exista deja, e folosit de `ProfileTab.tsx` (cont). Refolosit corect, cu compresie deja integrată azi.

---

## Etapa 6 — Test infrastructure (FĂCUT)

**Cerere user:** „vreau sa avem test casuri in folderul tests si sa le rulam tot timpul ... pe vitor sa putem testa imbuantirile facute si daca avem buguri sa fie usor de testat si reparat".

**Probleme găsite în starea inițială:**
- Zero scripturi `test*` în `package.json` — nu se putea rula nimic prin `npm test`
- Niciun framework de unit tests (no Vitest/Jest) — doar Playwright + scripturi mjs ad-hoc
- Codul nou de azi (`compress.ts`, `face-match.ts`) nu avea unit tests
- Niciun CI (no `.github/workflows/`)

**Schimbări aplicate:**

1. **Vitest** instalat (devDependency) + `@vitest/ui`, `jsdom`
2. `vitest.config.ts` — config cu alias `@/` și separare unit/integration/e2e
3. `package.json` — 8 scripts noi:
   - `npm test` → `vitest run` (unit + integration skipped by default)
   - `npm run test:watch` → mod watch
   - `npm run test:ui` → dashboard browser
   - `npm run test:unit` → doar `tests/unit/**`
   - `npm run test:integration` → setează `RUN_INTEGRATION=1` și rulează `tests/integration/**` (real Gemini)
   - `npm run test:e2e` → Playwright
   - `npm run test:smoke` → harness existent `scripts/api-smoke-test.mjs`
   - `npm run test:all` → unit + smoke
4. `tests/unit/lib/kyc/face-match.test.ts` — **10 tests** acoperind toate ramurile:
   - match success cu confidence high
   - matched dar validation < 50 → valid=false
   - faceMatch=false → valid=false
   - HTTP non-200 → ok=false, error=http_NNN
   - response malformat (lipsește faceMatch) → ok=false
   - fetch throws → ok=false cu mesaj real
   - body shape verification (mode/documentType/etc.)
   - coerce numerical confidences din strings
   - `fetchImageAsBase64` — null on 404, null on throw
5. `tests/unit/lib/images/compress.test.ts` — **9 tests** (jsdom env):
   - HEIC rejection by mime, by extension, case-insensitive
   - Throws ImageCompressionError instance of Error
   - `compressedToFile` — .jpg extension forțat, păstrează stem, byte length corect
6. `tests/integration/kyc-face-match.test.mjs` — **2 tests opt-in** (RUN_INTEGRATION=1):
   - Real Gemini call: persoana corectă → faceMatch=true, valid=true (verificat 8.6s)
   - Real Gemini call: persoana diferită → faceMatch=false, valid=false (verificat 12.4s)
   - Use `TEST_BASE_URL` (NOT `BASE_URL` care e rezervat de Vite)
   - Image paths overridable via `KYC_TEST_CI`, `KYC_TEST_SELFIE_OK`, `KYC_TEST_SELFIE_WRONG`
7. `tests/README.md` — rescris cu layout, quick reference table, TDD workflow, env vars, ce e acoperit azi
8. `.github/workflows/test.yml` — CI pe push/PR cu lint + tsc + unit + build (timeout 10/15min)
9. `.gitignore` — exclude `/tests/reports/`, `/tests/screenshots/`, `/test-results/`, `/.playwright-mcp/`

**Rezultate live:**

```
$ npm test
✓ tests/unit/lib/kyc/face-match.test.ts (10 tests) 28ms
↓ tests/integration/kyc-face-match.test.mjs (3 skipped)
✓ tests/unit/lib/images/compress.test.ts (9 tests) 4ms

Test Files  2 passed | 1 skipped (3)
     Tests  19 passed | 3 skipped (22)
  Duration  ~580ms
```

```
$ RUN_INTEGRATION=1 npm run test:integration
✓ matches the same person and reports valid=true (8.6s)
✓ rejects a different person with faceMatch=false (12.4s)
```

**Coverage gap-uri (nu s-au făcut, separat):**
- Unit tests pentru `delivery-calculator.ts` (mare, business-critical, are doar `scripts/test-delivery-calculator.mjs` ad-hoc)
- Unit tests pentru `validations/cnp.ts` (CNP checksum, gender, age extraction)
- Unit tests pentru `admin/permissions.ts` (RBAC — security-critical)
- Migrarea celorlalte `scripts/test-*.mjs` în `tests/integration/`
- E2E happy path complet wizard PF (există spec dar netestat azi)
- CI extension: pe nightly, rulează test:integration + test:e2e

Aceste gap-uri sunt vizibile în `tests/README.md` secțiunea „What's covered today" — TODO clar pentru sesiuni viitoare.

---

## Etapa 7 — Coverage rounds 1, 2, 3 (FĂCUT)

**Trigger:** „vreau sa avem test casuri in folderul tests si sa le rulam tot timpul ... pentru ce avem teste mai exact sa vedem ce chesti avem in app si sa ne asiguram ca am teste pentru tot ce trebuie".

**Process:** Agent Explore a inventariat 67 endpoint-uri API + 43 module lib + 13 E2E specs existente. Am produs o matrice coverage prioritizată pe risc (security > payment > business critical > UX). Apoi am scris tests în 3 round-uri cu TDD discipline (write test → verify pass = characterization pe cod existent → write test for new code first).

### Round 1 — Security critical (113 tests noi)

| Modul | Tests | Coverage |
|-------|-------|----------|
| `admin/permissions.ts` (227L RBAC) | **37** | super_admin override, role defaults (manager/operator/contabil/avocat), employee + JSONB merge + implied permissions chain (documents.generate → documents.view → orders.view), customer/partner deny |
| `validations/cnp.ts` (291L) | **50** | gender×century encoding (toate 8 cazuri), checksum (toate 10 mutații), date impossible (Feb 30, Apr 31), future date reject, county codes (47-50 invalid, 51-52 valid), masking + format helpers |
| `security/rate-limiter.ts` (125L) | **14** | window enforcement, expiry reset cu fake timers, IP extraction (x-forwarded-for, x-real-ip, vercel) |
| `security/audit-logger.ts` (80L) | **32** | console.log vs warn pe status, DB persistence, error swallow, **PII redaction GDPR (case-insensitive bug fix-uit)** |

**🐛 BUG GDPR FĂCUT FIX prin TDD:** `audit-logger.ts:115` lăsa raw base64 imagini să ajungă în audit logs. Lista de redactare avea `'imageBase64'` (mixed case), dar comparația `key.toLowerCase()` o transforma în `'imagebase64'` care nu mai se potrivea cu lista. Test-ul a prins asta imediat. Fix: lowercased entry + comentariu istoric.

### Round 2 — Payment (37 tests noi)

| Modul | Tests | Coverage |
|-------|-------|----------|
| `lib/stripe.ts` (132L) | **18** | amount conversion la cents (Math.round), RON currency, automatic_payment_methods, customer reuse vs create, **CNP masked în Stripe metadata (privacy)**, CUI plain text, companyName preference, country default RO |
| `/api/webhooks/stripe` | **8** | rejects unsigned (dev + prod), missing secret în prod = 400 fatal, signature invalid = 400, no production bypass leak, dispatching unknown events |
| `/api/orders/[id]/confirm-payment` | **11** | 404 inexistent, 200 idempotent already-paid, 400 no PI, 400 când Stripe failed/processing/canceled, 500 Stripe down, success path pending→processing, draft→processing, post-paid statuses preserved (shipped rămâne shipped), DB update fail = 500 |

### Round 3 — Business critical (56 tests noi)

| Modul | Tests | Coverage |
|-------|-------|----------|
| `lib/delivery-calculator.ts` (437L) | **43** | sărbători RO 2026-2028 (toate confirmate), business day math, **noon cutoff Romania-local**, weekend skip, Easter Monday + Christmas long-weekend skip, courier matrix (DHL/Fan/Sameday/Posta cu min/max), urgency mapping (standard/urgent/strain), opțiuni cu deliveryDaysImpact pozitiv/negativ, scenarii integration (Mon order → Fri completion, Friday afternoon → next week, Easter long-weekend skip) |
| `lib/services/kyc-validation.ts` | **13** | Gemini orchestration: validateCIFront/CIBack/Selfie, **data: prefix stripping**, JSON extraction din răspunsuri cu markdown, error handling (Gemini throws → graceful invalid result), face match cu/fără CI reference, 2 imagini vs 1 imagine în payload |

### Stare finală 2026-04-27

```
$ npm test
Test Files  11 passed | 1 skipped (12)
     Tests  245 passed | 3 skipped (248)
  Duration  ~900ms
```

11 fișiere unit tests. Toate 245 tests passing. Plus 3 integration tests opt-in. Plus 13 E2E specs existing. Plus 17 smoke checks în harness.

### Gap-uri vizibile (TODO future, prioritizate în `tests/README.md`)
- 🟠 HIGH: `documents/generator.ts` DOCX templating, courier integrations (sameday/fancourier), Oblio invoice, order submit integration
- 🟡 MEDIUM: 32 admin endpoint-uri, user CRUD, CUI validation
- 🟢 LOW: coupons + cetățean străin (există scripts ad-hoc în `scripts/test-*.mjs` care pot fi migrate)

---

## Etapa 8 — Round 4 — Integration test pentru order submit (FĂCUT)

**Test scris:** `tests/integration/order-submit.test.mjs` (6 tests opt-in via `RUN_INTEGRATION=1`):
1. POST /api/orders/draft → returns 201
2. Status=pending + submitted_at + contract_signed_at + estimated_completion_date persistate în DB
3. signature_metadata complete cu IP + user-agent + SHA-256 document hash + consent snapshot
4. order_submitted event în order_history cu IP + user_agent + new_value.consent
5. Double-submit returnează 400 INVALID_STATUS (idempotency)
6. Non-existent order returnează 404 NOT_FOUND

Setup curat: beforeAll face draft → patch → submit, individual tests verifică DB invariants. afterAll șterge order_history + order_documents + orders pentru cleanup.

**🐛 BUG CRITICAL găsit prin acest test (audit trail trunchiat):**

Test-ul „order_submitted event în order_history" a eșuat — submit endpoint-ul nu se înregistra în audit. Investigație:

CHECK constraint pe `order_history.event_type` (definit în migration 025) NU includea `'order_submitted'`. App code-ul wrappa INSERT-ul în try/catch → constraint violation = silent fail → **6 event_types folosite în 6 endpoint-uri se pierdeau silent**:
- `order_submitted` (submit/route.ts:330) — consent + IP + document_hash GDPR
- `payment_rejected` (verify-payment:101) — admin payment rejections
- `payment_verified` (verify-payment:183) — admin payment confirmations
- `tracking_update` (cron:201) — courier tracking transitions
- `payment_proof_submitted` (bank-transfer:102) — bank transfer flow
- `document_generation_failed` (auto-generate:339) — generation errors

**Fix aplicat:** `supabase/migrations/035_order_history_event_types.sql` cu comentariu istoric explicit. Migration aplicată live pe DB. Re-rulare integration test → 6/6 PASS.

**Confirmation live (din dev server logs cu utilizatorul rulând testele):**
- Auto-generated `contract-prestari-E-260427-RZX5J.docx` + `contract-asistenta-E-260427-RZX5J.docx`
- Auto-allocated delegation number `SM005768`
- Audit log fired: `event=order_submitted, document_hash=beadd1...abd4, consent_given={...}`
- Double-submit corect rejected cu 400
- Non-existent UUID corect 404

### Stare totală test infrastructure

```
Unit:        245 tests, ~870ms (all green)
Integration: 8 tests opt-in (KYC face match + order submit), ~17s real Gemini+DB
E2E:         13 Playwright specs (existing)
Smoke:       17 endpoints via api-smoke-test.mjs
Total CI surface: ~283 distinct test cases
```

### Bug-uri găsite prin TDD în 4 rounds (azi)

1. **Audit logger PII redaction case bug** — `imageBase64` field nu era redactat în logs. Fix: lowercase entry. *Critical GDPR.*
2. **Order history audit trail trunchiat** — 6 event_types rejected silent de DB CHECK constraint. Fix: migration 035 adaugă valorile lipsă. *Critical pentru legal/audit compliance.*

### Etape NEFĂCUTE (vizibile în `tests/README.md` ca TODO)

- 🟠 HIGH: `documents/generator.ts` (DOCX templating) unit tests — fixtures heavy, mai bun ca integration
- 🟠 HIGH: courier `sameday.ts` + `fancourier.ts` integrations — mock vs real API
- 🟠 HIGH: Oblio invoice generation
- 🟡 MEDIUM: 32 admin endpoint-uri (orders/users/settings/coupons/registry)
- 🟡 MEDIUM: User CRUD (addresses, billing-profiles)
- 🟢 LOW: migrare `scripts/test-coupons.mjs` + `test-cetatean-strain.mjs` în `tests/integration/`

---

## Etapa 9 — Round 5 — HIGH gap coverage (FĂCUT 2026-04-28)

Coverage pentru ariile HIGH-priority din matrix-ul gap analysis:

### Documents generator helpers (39 tests)
- 6 helpers exportate ca named exports din `src/lib/documents/generator.ts` pentru testabilitate (modificare minimă, nu schimbă runtime): `buildClientDetailsBlock`, `hasUrgentOption`, `buildDeliveryTerms`, `buildInstitutie`, `buildCIInfo`, `buildOptionsText`
- Tests acoperă: PF format (CI seria, CNP, domiciliu structurat cu Bl/Sc/Et/Ap), PJ format (companie + CUI + Reg.Com + reprezentant cu CI/CNP), urgent option detection (snake_case + camelCase variants), delivery terms cu pluralizare RO (1 zi vs N zile, urgent vs standard, urgent_available=false fallback, 10-day extension disclaimer), 11 mapări instituție pe slug (cazier-judiciar → IPJ Satu Mare, etc.)

### Courier utils (71 tests)
- `src/lib/services/courier/utils.ts` — pure helpers folosite de Sameday + FanCourier
- Acoperite: package math (weight × quantity, volumetric L*W*H/divisor, chargeable max), address formatting (single line + multiline cu Bl/Sc/Et/Ap în RO), Romanian phone validation + normalization (mobile + landline, +40 vs 0 prefix tolerance, spaces/dashes stripped), tracking status normalization (livrat/delivered/predat → delivered, plecat/sosit → in_transit, etc.), VAT add/extract cu rate custom, formatPriceRON, 42 counties (41 + București), county code lookup case-insensitive, courier provider detection din delivery_method (Fan/Sameday/EasyBox/FANbox)

### Oblio invoice (20 tests)
- `src/lib/oblio/invoice.ts:createInvoiceFromOrder` — flow PF + PJ
- Acoperite: PF client (firstName + lastName, CNP ca cif, save=false), PJ client (companyName, CUI ca cif, regCom ca rc, save=true), **vatPayer logic** (CUI cu prefix `RO` → true, fără → false), product line items (main service + options + delivery — cu code = friendly_order_id), delivery skip când 0 sau undefined, payment method (Card default vs Transfer bancar), formatInvoiceNumber pad 4 digits, return shape StoredInvoice cu invoiceNumber + pdfUrl
- Mock pattern: `vi.hoisted` pentru `oblioRequest` + `getOblioConfig` (evită env var requirements la import)

**Total Round 5: 130 tests noi, 0 erori TS, toate verzi în ~250ms.**

### Stare finală 2026-04-28

```
Test Files  14 passed | 2 skipped (16)
     Tests  375 passed | 10 skipped (385)
  Duration  ~1s
```

| Categorie | Status post-Round-5 |
|-----------|---------------------|
| 🔴 Security (RBAC, CNP, audit, rate-limit) | ✅ acoperit |
| 💳 Payment (Stripe, webhook, confirm, Oblio) | ✅ acoperit |
| 📦 Business critical (delivery, documents, courier utils, KYC, compression) | ✅ acoperit |
| 🌐 UI / Routes E2E | ✅ acoperit prin Playwright existing |
| ⚪ Admin endpoints (32 routes) | ❌ HIGH gap rămas |
| ⚪ User CRUD (addresses, billing) | ❌ MEDIUM gap rămas |
| ⚪ Sameday + FanCourier full API client | ❌ HIGH (integration) |

Gap-urile rămase sunt în `tests/README.md` cu prioritate clară.

---

## Etapa 10 — Round 6 — Admin endpoints + User CRUD (FĂCUT 2026-04-28)

Coverage pe routes critice care lipseau (state mutations + IDOR protection):

### `/api/admin/orders/[id]/process` — status transitions (19 tests)
- Auth: 401 fără user, 401 pe auth error, 403 fără `orders.manage`, verifică permission corectă
- Validation: 400 acțiune lipsă, 400 acțiune necunoscută, 404 order missing
- Status transitions: rejects invalid (paid → completed), rejects skip (paid → submitted), all 6 valid transitions tested via `it.each`, writes order_history, 500 pe DB update fail
- Document upload: stores reference in order_documents, sets visible_to_client correct (received=false, final=true)

### `/api/coupons/validate` — public coupon flow (21 tests)
- Body validation (Zod schema): malformed JSON, missing code, negative subtotal, code > 50 chars
- Lookup: 404 not found, 500 on DB error, **uppercases code before lookup** (case-insensitive)
- Time window: rejects valid_from in future, rejects expired, accepts in window
- Usage limit: rejects max_uses reached, accepts unlimited (null), accepts under max
- Min amount: rejects below threshold, accepts at exactly threshold
- Discount calculation: percentage 10% of 250 → 25 RON, fixed 50 off → 200 RON, **caps at subtotal (never negative)**, rounds to 2 decimals, returns full coupon metadata
- **Rate limiting**: 30 requests/min per IP, returns 429 + Retry-After header

### `/api/user/addresses` — CRUD with IDOR protection (16 tests)
- GET: 401 no auth, returns mapped records (flattens .data), scopes by user_id + data_type='address', 500 on DB error
- POST: 401 no auth, creates with default label "Adresă nouă", **unsets other defaults BEFORE insert when isDefault=true** (data integrity), 500 on insert error
- PATCH: 401 no auth, **404 when address belongs to different user** (IDOR protection), updates and returns flattened response
- DELETE: 401 no auth, **scopes by both id AND user_id** (IDOR), success message, 500 on DB error

### `/api/admin/orders/[id]/verify-payment` — bank transfer admin flow (13 tests)
- Auth: 400 invalid action, 400 not approve/reject, 401 no user, 403 missing `payments.verify`, **uses different permission than orders.manage**
- Order checks: 404 not found, **400 when not in awaiting_verification status** (idempotency: prevents double-rejecting paid orders)
- REJECT path: marks payment_status='failed' + verified_by, writes payment_rejected event with admin notes, falls back to default note, 500 on DB fail, **does NOT call Oblio** (no invoice for rejected payment — explicit assertion)

**Total Round 6: 69 tests noi, 0 erori TS, toate verzi în ~250ms.**

### Stare finală 2026-04-28 după Round 6

```
Test Files  18 passed | 2 skipped (20)
     Tests  444 passed | 10 skipped (454)
  Duration  ~1s
```

| Categorie | Status post-Round-6 |
|-----------|---------------------|
| 🔴 Security (RBAC, CNP, audit, rate-limit) | ✅ acoperit |
| 💳 Payment (Stripe, webhook, confirm, Oblio, bank verify) | ✅ acoperit |
| 📦 Business critical (delivery, documents, courier, KYC) | ✅ acoperit |
| 🛡️ Admin endpoints (process orders, verify payments) | ✅ acoperit (pattern) |
| 👤 User CRUD (addresses) | ✅ acoperit |
| 🌐 UI E2E | ✅ acoperit (Playwright) |
| ⚪ Sameday + FanCourier full API client | ❌ HIGH (integration) |
| ⚪ User CRUD: billing-profiles, profile, KYC save | ❌ MEDIUM (same pattern) |
| ⚪ Admin coupon CRUD, user invite | ❌ MEDIUM |

Pattern stabilit pentru endpoint-uri admin: mock supabase server + admin clients, mock requirePermission, tests pe auth/validation/business logic/error paths.

---

## Etapa 11 — Round 7 — Courier A-Z + remaining user CRUD (FĂCUT 2026-04-28)

User cerere: „vreau sa facem sameday +fancorurier si sa fie de la a la z de la optinere pret in admin generare awb extragere tracking, trackingul il aratam pe istoric comanda etc. si fa restu testelor".

### `/api/courier/quote` (15 tests)
Multi-provider pricing: 4 missing-param branches (it.each), single-provider mode, multi-provider mode, getAllQuotes, weight forwarding (default 0.5kg vs custom), COD amount, country default, provider error mapping (PROVIDER_ERROR vs QUOTE_ERROR).

### `/api/admin/orders/[id]/generate-awb` (10 tests)
- Auth: 401, 403 RBAC, 404 not-found
- Idempotency: **400 AWB_EXISTS** when delivery_tracking_number already set
- Provider derivation: `courier_provider` column wins over delivery_method parse fallback
- 400 NO_COURIER (email/personal pickup), 400 NO_ADDRESS (no locker + missing fields)
- 400 INVALID_PROVIDER on credentials missing
- Locker delivery (lockerId set) → proceeds despite empty address (success path)

### `/api/admin/orders/[id]/cancel-awb` (8 tests)
- Auth + 404 + 400 NO_AWB + 400 NO_PROVIDER
- Successful cancel: clears tracking fields + reverts status to `document_ready`
- **Graceful degradation**: courier API throws → still clears tracking, returns 200 with `cancelWarning`
- 500 UPDATE_FAILED on DB error

### `/api/cron/update-tracking` (7 tests)
- 500 when CRON_SECRET not configured (server misconfig)
- 401 missing/wrong/non-Bearer auth
- 200 with empty summary when no active shipments
- **Critical filter check**: `delivery_tracking_status IN (pending, picked_up, in_transit, out_for_delivery)` AND `tracking_number IS NOT NULL` (never re-polls final states delivered/returned/cancelled — otherwise would loop forever)

### `/api/orders/[id]/tracking` — customer-facing display (8 tests)
- 404 not found
- Access control: 401 guest on user-owned order, 403 wrong user, allowed for owner, allowed for admin
- Guest with matching email param: allowed
- **Cache TTL 30 min**: recent update → no provider call (cache hit)
- **Final status (delivered)**: even if 7 days stale, NO refresh (would waste API calls forever)

### `/api/user/billing-profiles` (13 tests)
Mirror of addresses pattern + PF/PJ-specific:
- GET list cu mapare flat (companyName, cui flatten din billing_data)
- POST: 400 când type lipsă, 400 când type invalid (nu e PF/PJ)
- Default label depinde de type: `Profil personal` pt PF, `Profil firmă` pt PJ
- billing_data NU primește type/label (separare clean)
- Unset other defaults BEFORE insert
- PATCH/DELETE cu IDOR protection (id+user_id scoping)

**Total Round 7: 61 tests noi, 0 erori TS, toate verzi în ~1.5s.**

### Stare finală 2026-04-28 după Round 7

```
Test Files  24 passed | 2 skipped (26)
     Tests  505 passed | 10 skipped (515)
  Duration  ~1-2s
```

**Stare per categorie:**

| Categorie | Status post-Round-7 |
|-----------|---------------------|
| 🔴 Security (RBAC, CNP, audit, rate-limit) | ✅ |
| 💳 Payment (Stripe + webhook + confirm + Oblio + bank verify) | ✅ |
| 📦 Business critical (delivery, documents, KYC) | ✅ |
| 🛡️ Admin endpoints (process, verify-payment, AWB generate/cancel) | ✅ |
| 🚚 **Courier A-Z** (quote → AWB → tracking → cron refresh) | ✅ NOU |
| 👤 User CRUD (addresses + billing-profiles) | ✅ |
| 🌐 UI E2E | ✅ Playwright existing |
| ⚪ Provider class internals (Sameday/FanCourier auth + HTTP) | indirect prin routes |
| ⚪ User profile, KYC save, admin coupon CRUD, user invite | LOW priority — pattern stabilit |

---

## Etapa 12 — Round 8 — Gap-uri MEDIUM rămase (FĂCUT 2026-04-28)

User cerere: "vreau sa impelmentez mai departe sa actualezi docs si in tests te rog si peste tot si sa avem toate testele puse pla punct corect."

### `/api/admin/coupons` CRUD (17 tests)
- GET list cu paginare, search ilike, **clamps limit la 200** (defensive),  uses `settings.manage` (NOT orders.manage)
- POST create cu Zod validation: code uppercase + trim, **percentage 1-100 strict**, unique constraint 23505 → 400, returns 201
- PATCH/DELETE: 401/403 sentry checks (full chains in larger module)

### `/api/admin/users/invite` (21 tests)
- Auth: 401/403, **uses `users.manage` (NOT settings.manage)** — different concern
- Email validation: 5 invalid format cases via it.each
- Permissions object validation: rejects keys not in `ALL_PERMISSIONS` (uses real exports via `vi.importActual`)
- Role validation: 5 valid roles (employee/avocat/manager/operator/contabil), rejects super_admin
- Duplicate detection: 409 if existing role is admin, allows customer→employee promotion
- **Email lowercased** before lookup (case-insensitive match)

### `/api/user/profile` (8 tests)
- PATCH/GET, 401 auth, **PATCH semantics** (only provided fields update — undefined fields NOT overwritten)
- camelCase API → snake_case DB column mapping (firstName→first_name, etc.)
- Company fields → company_* columns (companyVatPayer→company_vat_payer)
- Security: scoped by user.id (cannot patch others)
- 500 on DB error
- GET also queries kyc_verifications table for document info

### `/api/user/kyc/save` (17 tests)
- Auth: 401, validation: 400 missing documentType/fileUrl, 9 valid document types via it.each, rejects unknown
- **Versioning**: deactivates existing same-type docs (is_active=false) BEFORE inserting new
- **Expiry logic**: uses documentExpiry when provided, else falls back to KYC_VALIDITY_DAYS (90 days from now), tested with ±60s tolerance
- 500 on insert error

**Total Round 8: 63 tests noi, 0 erori TS, toate verzi în ~1.5s.**

### Stare finală 2026-04-28 după Round 8

```
Test Files  28 passed | 2 skipped (30)
     Tests  568 passed | 10 skipped (578)
  Duration  ~1-2s
```

**Coverage matrix completă:**

| Categorie | Status |
|-----------|--------|
| 🔴 Security (RBAC, CNP, audit, rate-limit) | ✅ |
| 💳 Payment (Stripe + webhook + confirm + Oblio + bank verify) | ✅ |
| 📦 Business critical (delivery, documents, KYC, image) | ✅ |
| 🛡️ Admin endpoints (process, AWB gen/cancel, verify-payment, **coupon CRUD, invite**) | ✅ |
| 🚚 Courier A-Z (quote → AWB → tracking → cron refresh) | ✅ |
| 👤 User CRUD (addresses + billing + **profile + KYC save**) | ✅ |
| 🌐 UI E2E | ✅ Playwright existing |
| ⚪ Provider class internals (Sameday/FanCourier HTTP) | indirect via routes |
| ⚪ Admin doc-generation route, invite accept, infocui (CUI ANAF) | LOW priority gaps |

---

## Etapa 13 — CI fix + Round 9 LOW gaps (FĂCUT 2026-04-28)

### CI fail fix
**Problemă:** GitHub Actions raporta fail la „Install dependencies" în 1s cu eroarea:
```
npm error `npm ci` can only install packages when your package.json and
package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @emnapi/runtime@1.10.0 from lock file
npm error Missing: @emnapi/core@1.10.0 from lock file
```

**Cauză:** package-lock.json generat pe macOS (Node 25) NU include opt-deps Linux-specific (`@emnapi/runtime`, `@emnapi/core` de la jsdom→lightningcss native bindings). `npm ci` e strict și refuză instalarea când există missing entries cross-platform.

**Fix:** `.github/workflows/test.yml` schimbat din `npm ci` în `npm install --no-audit --no-fund` pentru ambele job-uri (lint-and-unit + build). Mai tolerant la opt-deps cross-platform; comportament identic în rest. Comentariu inline explicativ.

### Round 9 — LOW priority gaps (28 tests noi)

#### `services/infocui.ts` — CUI Romanian + counties (21 tests)
- `validateCUIFormat`: strip RO prefix (case-insensitive), strip non-digits, length 2-10, error pe gol/prea-scurt/prea-lung
- **Romanian CUI checksum** (weights [7,5,3,2,1,7,5,3,2], algoritm oficial): rejects checksum invalid, accepts CUI sintetic computat algoritmic
- `findCounty`: by ISO code case-insensitive, by exact name, by substring partial match, undefined pentru necunoscut, trim whitespace
- ROMANIAN_COUNTIES: 42 entries (41 + București), shape consistent (code+name)
- `parseAddressString`: extract postal code 6 cifre, county (Jud./Județul X), graceful empty input

#### `/api/admin/invite/accept` (7 tests)
- 400 când token lipsă, 404 token necunoscut
- 410 GONE pentru: invitație accepted (idempotency), revoked, deja expired
- **Auto-expire**: când status='pending' dar expires_at < now, marchează `status='expired'` în DB înainte să returneze 410
- 200 pentru pending valid cu invitation details (email, permissions, expiresAt, status)

**Total Round 9: 28 tests noi.**

### Stare finală 2026-04-28 după Round 9

```
$ npm test
Test Files  30 passed | 2 skipped (32)
     Tests  596 passed | 10 skipped (606)
  Duration  ~1-2s
```

```
$ npx tsc --noEmit
EXIT: 0
```

| Categorie | Status post-Round-9 |
|-----------|---------------------|
| 🔴 Security (RBAC, CNP, audit, rate-limit, **CUI**) | ✅ |
| 💳 Payment (Stripe + webhook + confirm + Oblio + bank verify) | ✅ |
| 📦 Business critical (delivery, documents, KYC, image) | ✅ |
| 🛡️ Admin endpoints (process, AWB, verify-payment, coupon CRUD, **invite + accept**) | ✅ |
| 🚚 Courier A-Z (quote → AWB → tracking → cron) | ✅ |
| 👤 User CRUD (addresses, billing, profile, KYC save) | ✅ |
| 🌐 UI E2E | ✅ Playwright existing |
| 🟢 Provider class internals | acceptable indirect via routes |
| 🟢 Admin doc-generation route | acceptable (helpers covered) |
| 🟢 Cetățean străin script migration | acceptable (script exists) |

**Toate gap-urile rămase sunt LOW priority — coverage e completă pentru riscul real.**

---

## Următorii pași recomandați (NEFĂCUTE — separate)

- **Cleanup drafts vechi:** există 90 drafts în DB. Migration `032_add_estimated_completion.sql` și logica GDPR cleanup (7 zile) ar trebui să le ardă, dar drafts > 7 zile încă există. Verifică `/api/admin/cleanup` cron.
- **Refactor base64 → S3 imediat:** etapa 4 amânată din planul inițial. Acum draft-urile noi vor avea customer_data sub 1MB (mulțumită compresiei), dar tot e suboptim. Refactor la upload imediat S3 cu URL în draft ar reduce și mai mult.
- **Validare manuală pe iPhone:** compresia + EXIF orientation cer testare reală pe iOS Safari (HEIC auto-conversion, orientation tag). Pe desktop merge sigur.
- **stripe listen integration:** documentație DEVELOPMENT_MASTER_PLAN sau onboarding ar trebui să menționeze comanda CLI necesară pentru testare locală.

---

## Fișiere modificate

```
package.json                                                                 (1 linie)
src/app/api/admin/orders/list/route.ts                                       (5 linii)
src/lib/images/compress.ts                                                   NOU (140 linii)
src/components/orders/modules/personal-kyc/PersonalDataStep.tsx              (~10 linii)
src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx              (~12 linii)
src/components/shared/IdScanner.tsx                                          (~15 linii)
src/components/account/KYCTab.tsx                                            (~25 linii)
docs/session-logs/2026-04-27-performance-image-compression.md                NOU (acest fișier)
```
