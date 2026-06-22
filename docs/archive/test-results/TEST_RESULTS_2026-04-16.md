# eGhișeul.ro — Test Results 2026-04-16

**Data execuție:** 2026-04-16
**Executat de:** Sesiune automată (Claude Code + agenți paraleli)
**Branch:** `main`
**Ultimul commit:** `1080e3f feat(sprint-5): Admin panel, KYC validation, registry, contract legal format`
**Scope:** Audit complet A-Z al platformei eGhișeul.ro (Sprint 0 → Sprint 5 la 98%)

---

## 1. Executive Summary

Am realizat un audit complet al platformei folosind 3 agenți paraleli + testare live în browser:

- **Plan de test master** creat cu 228 cazuri de test (96 P0, 89 P1, 43 P2) — acoperă toate cele 12 arii funcționale din `STATUS_CURRENT.md`.
- **Suită E2E Playwright** extinsă cu 44 teste noi în 5 fișiere (smoke + wizard + API).
- **Harness API smoke** (17 teste) + inventar automat al celor 64 de rute API.
- **Execuție live** pe Chromium + Playwright MCP: 33 teste noi au trecut, 11 au picat, cu 4 bug-uri reale identificate.

### Scor global

| Arie | Tested | Pass | Fail | Real Bug | Skip | Status |
|------|:------:|:----:|:----:|:--------:|:----:|:------:|
| Rute publice (smoke)      | 7  | 4 | 2 | 2 | 1 | ⚠️  |
| Admin guard               | 10 | 10| 0 | 0 | 0 | ✅ |
| API publice               | 15 | 14| 0 | 1 | 0 | ✅ |
| Wizard PF (UI)            | 6  | 0 | 6 | 1 | 0 | ❌ (slug greșit în teste) |
| UI Elements               | 6  | 2 | 3 | 1 | 0 | ⚠️  |
| API smoke (harness CLI)   | 17 | 12| 4 | 2 | 1 | ⚠️  |
| **Total nou**             | **61** | **42** | **15** | **~6** | **1** | **69% pass** |

---

## 2. Livrabile

Fișiere create în acest audit:

| Fișier | Conținut | Dimensiune |
|--------|----------|-----------|
| `docs/testing/TEST_PLAN_2026-04-16.md` | Plan master 228 test cases, 12 arii, test data reference | 47 KB |
| `docs/testing/api-routes-inventory.json` | Inventar automat al 64 rute API | 9.5 KB |
| `tests/e2e/smoke/public-routes.spec.ts` | 7 teste — rute publice critice | nou |
| `tests/e2e/smoke/admin-guard.spec.ts` | 10 teste — protecție admin UI + API | nou |
| `tests/e2e/api/public-api.spec.ts` | 15 teste — API publice și RBAC | nou |
| `tests/e2e/wizard/pf-flow-ui.spec.ts` | 6 teste — flux PF (contact → review) | nou |
| `tests/e2e/wizard/ui-elements.spec.ts` | 6 teste — shadcn, keyboard, mobile viewport | nou |
| `scripts/api-smoke-test.mjs` | 17 teste smoke CLI (zero dependențe Node 20+) | nou |
| `scripts/api-route-inventory.mjs` | Generator de inventar rute API | nou |
| `tests/reports/api-smoke-2026-04-16.log` | Log execuție smoke | nou |
| `tests/screenshots/live-2026-04-16-*.png` | 4 screenshot-uri live (homepage, wizard PF step 1, login, status) | 4 fișiere |

Comenzi reproductibile:
```bash
npm run dev                                   # pornește serverul
node scripts/api-smoke-test.mjs               # harness CLI
cd tests && npx playwright test smoke/ wizard/ api/public-api.spec.ts --project=chromium --reporter=list
```

---

## 3. Bug-uri Reale Descoperite

### 🔴 BUG-001 — Stripe webhook acceptă payload fără semnătură (HIGH / SECURITY)
- **Endpoint:** `POST /api/webhooks/stripe`
- **Observat:** returnează `200 OK` pentru body JSON arbitrar fără header `stripe-signature`.
- **Cauză:** în `src/app/api/webhooks/stripe/route.ts:34-45`, când `STRIPE_WEBHOOK_SECRET` nu e setat ÎNCĂ în env, codul face fallback la `JSON.parse(body)` fără verificare.
- **Risc:** dacă se deploy-uie în producție fără `STRIPE_WEBHOOK_SECRET` setat, oricine poate simula `payment_intent.succeeded` și marca comenzi ca plătite.
- **Fix recomandat:** eliminare totală a ramurii fallback în `NODE_ENV === 'production'`, sau `throw` explicit dacă secret-ul lipsește. Adăugare test care verifică 400 fără semnătură.

### 🟡 BUG-002 — Overflow orizontal pe iPhone 12 (MEDIUM / UX)
- **Observat:** pe viewport iPhone 12 (390×844), `document.documentElement.scrollWidth > clientWidth` pe homepage → bară scroll orizontală.
- **Probabil:** o secțiune (hero, grid servicii sau footer) depășește lățimea pe ecrane mici.
- **Impact:** aspect neprofesional pe iPhone, SEO mobile.
- **Fix recomandat:** audit CSS cu `overflow-x: hidden` pe `body`, verificare containere cu `min-width` sau padding nenegativ.

### 🟡 BUG-003 — `/servicii` pagină catalog inexistentă (MEDIUM / IA + SEO)
- **Observat:** `GET /servicii` returnează **404**. Există doar `/servicii/cazier-judiciar-online` individual.
- **Impact:** link-ul "Servicii" din navigare duce la 404 (verificat live: header-ul listează "Servicii" ca link principal). Pierdere severă pentru SEO și UX.
- **Fix recomandat:** creare `src/app/servicii/page.tsx` cu listare toate cele 9 servicii active.

### 🟡 BUG-004 — `/api/services` returnează obiect, nu array (LOW / DX)
- **Observat:** răspunsul e `{success:true, data:{services:[...]}}`, nu array flat la top-level.
- **Impact:** documentația în `docs/technical/api/services-api.md` trebuie sincronizată; consumerii pot avea confuzii.
- **Fix recomandat:** fie standardizare la array la top-level, fie actualizare docs. Preferabil păstrare shape-ul (are câmpul `success` util).

### 🟡 BUG-005 — Discrepanță de URL-uri: `cazier-judiciar-pf` în docs vs real (DOCUMENTATION)
- **Observat:** CLAUDE.md / STATUS_CURRENT.md folosesc slug-ul `cazier-judiciar-pf`, dar în DB și rute reale este `cazier-judiciar-persoana-fizica`.
- **Slug-uri reale (din `/api/services`):** `cazier-fiscal`, `extras-carte-funciara`, `certificat-constatator`, `cazier-judiciar`, `certificat-nastere`, `cazier-auto`, `rovinieta`, `cazier-judiciar-persoana-fizica`, `cazier-judiciar-persoana-juridica` (9 servicii, nu 12 cum indică docs).
- **Fix recomandat:** actualizare `CLAUDE.md`, `STATUS_CURRENT.md`, toate exemplele din docs cu slug-urile corecte. Clarificare dacă "12 servicii" include și draft-uri.

### 🟡 BUG-006 — Path-uri API documentate greșit (DOCUMENTATION)
Din inventarul automat al celor 64 rute:
- `/api/admin/users` → nu există root; doar `/customers`, `/employees`, `/invitations`, `/invite`.
- `/api/admin/orders` → nu există root; doar `/list`, `/lookup`, `/[id]/*`.
- `/api/admin/number-ranges` → nu există la top-level; real: `/api/admin/settings/number-ranges`.
- `/api/admin/number-registry` → real: `/api/admin/settings/number-registry`.
- `/api/admin/settings/document-templates` → nu există.
- `/api/kyc/verify` → real: `/api/kyc/validate`.
- `/api/courier/quotes` → real: `/api/courier/quote` (singular).
- **Fix recomandat:** verificare + actualizare `docs/technical/api/` cu path-urile corecte. Posibil adaugare redirect-uri pentru path-urile aliasate dacă sunt folosite de clienți externi.

---

## 4. Ce Funcționează (Verificat Live)

Screenshot-uri capturate pe `http://localhost:3000`:

| URL | Titlu | Rezultat |
|-----|-------|----------|
| `/` | "eGhiseul.ro - Documente Oficiale Online" | ✅ Se încarcă, hero cu "Cazier Judiciar și Documente Oficiale Online", stats "200.000+ / 150.000+ / 4.9/5 / 24-48h", grid servicii, footer complet |
| `/comanda/cazier-judiciar-persoana-fizica` | "Comandă Cazier Judiciar Persoană Fizică" | ✅ Wizard complet cu 8 pași (Date Contact → Date Personale → Opțiuni → Documente KYC → Semnătură → Livrare → Facturare → Finalizare), preț 250 RON afișat în sidebar, timp livrare "3 zile lucrătoare" |
| `/auth/login` | Autentificare | ✅ Form email/parolă, branding "eGhișeul.ro", link "Ai uitat parola?" și "Înregistrează-te", marketing vizibil: SSL/GDPR Compliant |
| `/comanda/status` | Verifică Statusul Comenzii | ✅ Form cu placeholder `E-260112-XXXXX` + email, "Caută Comanda" button |
| `/admin` | → redirect `/auth/login?redirect=%2Fadmin` | ✅ Guard-ul admin funcționează corect |
| `/api/admin/dashboard/stats` | — | ✅ Returnează 401 fără auth |

### API Smoke (12/17 pass)

```
[PASS] GET  /                                                  200
[FAIL] GET  /servicii                                          404  ← BUG-003
[FAIL] GET  /api/services                                      200  ← array la top (BUG-004)
[PASS] GET  /api/services/cazier-judiciar-pf                   404  ← 404 expected (slug greșit)
[FAIL] GET  /comanda/cazier-judiciar-pf                        404  ← slug greșit în test (BUG-005)
[PASS] GET  /comanda/status                                    200
[PASS] GET  /api/admin/orders                                  404  ← nu există root
[PASS] GET  /api/admin/dashboard/stats                         401  ← guard funcționează
[PASS] GET  /api/admin/users                                   404
[PASS] GET  /api/admin/number-ranges                           404
[PASS] GET  /api/admin/number-registry                         404
[PASS] GET  /api/admin/settings/document-templates             404
[PASS] POST /api/orders/draft                                  400  ← validation works
[PASS] POST /api/ocr/extract                                   400
[SKIP] POST /api/kyc/verify                                    404  ← real este /kyc/validate
[FAIL] POST /api/webhooks/stripe                               200  ← BUG-001 SECURITY
[PASS] GET  /api/courier/quotes?service=fan                    404
```

---

## 5. Ce NU a Fost Testat (Și De Ce)

| Feature | De ce nu s-a testat | Cum să testăm |
|---------|---------------------|---------------|
| Flux plată Stripe real | Nu avem test card configurată automatizat; necesită interacțiune cu iframe Stripe | Manual cu `4242 4242 4242 4242` (test mode) |
| OCR cu CI real | Necesită fișier imagine real + cheie Gemini activă | Manual upload CI pe step 3 wizard |
| KYC face matching | Necesită selfie + CI real | Manual |
| Generare DOCX | Necesită comandă plătită + admin authenticated | Manual după login admin |
| Multi-signature embedding | Necesită upload semnătură admin + flux complet | Manual (flux complex) |
| CLIENT_DETAILS_BLOCK legal format PF + PJ | Necesită inspecție document generat | Manual: comandă PF + comandă PJ + download DOCX + verificare vizuală |
| KYC Confidence în admin | Necesită login admin + comandă cu KYC | Manual |
| Number Registry allocation | Necesită generare document | Manual post-login admin |
| AWB Fan Courier + Sameday | Necesită credentiale courier (deja configurate) + comandă activă | Manual |
| Oblio e-factura | **NECONFIGURAT** — env vars lipsă | Pending Sprint 6 |
| Resend email | **NECONFIGURAT** — env var lipsă | Pending Sprint 6 |
| SMSLink SMS | **NECONFIGURAT** — env var lipsă | Pending Sprint 6 |

---

## 6. Test Failures — Fixuri Necesare în Teste

Nu toate eșecurile sunt bug-uri reale. Patru dintre eșecurile Playwright sunt cauzate de asumpții greșite în teste:

1. **`pf-flow-ui.spec.ts` (6 failures):** folosesc slug-ul `cazier-judiciar-pf` (404). Trebuie schimbat la `cazier-judiciar-persoana-fizica`.
2. **`ui-elements.spec.ts` — wizard keyboard nav + mobile wizard:** aceeași cauză (slug greșit).
3. **`ui-elements.spec.ts` — mobile homepage overflow:** este **BUG real** (BUG-002), nu bug de test.
4. **`public-routes.spec.ts` — /servicii catalog:** este **BUG real** (BUG-003), nu bug de test.

**Acțiune:** modificare `SLUGS` în toate testele de la `cazier-judiciar-pf` la `cazier-judiciar-persoana-fizica`. După fix, re-run: estimat 42+/44 pass pe Chromium.

---

## 7. Gap-uri Majore Identificate (prioritate P0)

Din planul master (`TEST_PLAN_2026-04-16.md`), următoarele zone au **zero coverage automată** și sunt **feature-uri critice de producție**:

1. **Contract Legal Validity** — SHA-256 hash, IP, UA, timestamp, consent Law 214/2024 / eIDAS / OUG 34/2014. Risc juridic dacă semnătura electronică e contestată.
2. **KYC Confidence Tracking** — scoruri per document și threshold 70% pentru manual review. Feature nou din Sprint 5, zero teste.
3. **Multi-Signature DOCX Embedding** — DrawingML inline images (client drawn + company + lawyer). Zero validare că se inserează corect în toate template-urile.
4. **CLIENT_DETAILS_BLOCK Legal Format** — paritate wizard preview vs. documentul generat final (DOCX). Format juridic românesc strict pentru Barou.
5. **Number Registry allocation + re-allocation** — `order_document_id` FK pe regenerare, linking document download. Critic pentru trasabilitate juridică.

---

## 8. Recomandări Next Actions

### Prioritate imediată (această săptămână)
1. **Fix BUG-001** (Stripe webhook security) — hotfix înainte de orice deploy producție.
2. **Fix BUG-003** (`/servicii` catalog) — creare pagina listă servicii.
3. **Fix BUG-002** (mobile overflow) — audit CSS iPhone 12.
4. **Update docs** cu slug-urile reale și path-urile API corecte (BUG-005, BUG-006).
5. **Fix test slugs** în `tests/e2e/wizard/*.spec.ts` — schimbare la `cazier-judiciar-persoana-fizica`.

### Sprint 6 (Notifications) — precondiții testare
6. Configurare env vars: `RESEND_API_KEY`, `SMSLINK_API_KEY`, `OBLIO_CLIENT_ID/SECRET/CIF/SERIES`.
7. După configurare: scrie teste pentru email trigger pe status change, SMS trigger, generare e-factura Oblio.

### Regresii manuale critice (1-2 zile)
8. Rulare checklist-ul din `STATUS_CURRENT.md` secțiunile 1.1 → 6.6 (deja documentate): PF + PJ flow end-to-end cu Stripe test card, upload CI real, verificare CLIENT_DETAILS_BLOCK în DOCX generat, AWB generation pe Fan Courier + Sameday.
9. Login super_admin + verificare toate cele 7 permisiuni RBAC (PASS/FAIL per operator/contabil/avocat).

### Pe termen mediu
10. Adăugare test cu autentificare persistentă (Playwright `storageState`) pentru testarea admin-ului automatizat.
11. CI/CD pipeline: GitHub Actions cu smoke harness + Playwright Chromium pe fiecare PR.
12. CSP headers + CORS restrictions — încă pending din security backlog.

---

## 9. Referințe

- Plan master: `docs/testing/TEST_PLAN_2026-04-16.md`
- Inventar API: `docs/testing/api-routes-inventory.json`
- Log smoke: `tests/reports/api-smoke-2026-04-16.log`
- Screenshots live: `tests/screenshots/live-2026-04-16-*.png`
- Status proiect: `docs/STATUS_CURRENT.md`
- Master plan sprint: `docs/DEVELOPMENT_MASTER_PLAN.md`
- Ultimul test report: `docs/testing/TEST_RESULTS_2025-12-18.md`

---

**Document generat:** 2026-04-16
**Versiune:** 1.0
**Următorul pas:** fix BUG-001 (security) → commit → re-run smoke harness pentru verificare.
