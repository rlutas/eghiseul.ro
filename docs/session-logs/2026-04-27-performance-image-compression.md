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
