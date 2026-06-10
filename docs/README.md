# Documentație eGhiseul.ro

**Ultima actualizare:** 2026-05-27 (admin parity overhaul + abandoned cart system)
**Status proiect:** Sprint 6 + SEO Pre-Launch Phase. **47 pagini de rebuilt pentru migrare WP→Next.js** (vezi `seo/REBUILD-QUEUE.md`). Page #1 (cazier-judiciar-online) tehnic complete dar **user feedback negativ pe vizual** — necesită revizitare.
**Fișier principal:** [`DEVELOPMENT_MASTER_PLAN.md`](DEVELOPMENT_MASTER_PLAN.md)
**Status curent:** [`STATUS_CURRENT.md`](STATUS_CURRENT.md) — **citeste primul daca revii dupa pauza**
**Plan SEO master:** [`seo/SEO-MASTER-PLAN-2026-05-20.md`](seo/SEO-MASTER-PLAN-2026-05-20.md)
**Rebuild queue (47 pagini):** [`seo/REBUILD-QUEUE.md`](seo/REBUILD-QUEUE.md)
**City pages plan:** [`seo/CITY-PAGES-PLAN.md`](seo/CITY-PAGES-PLAN.md)
**Sesiune curentă (2026-06-10):** mobil + plăți + reluare draft — **citește aici unde am rămas**:
- 🔴 [`session-logs/2026-06-10-duplicate-oblio-invoice-fix.md`](session-logs/2026-06-10-duplicate-oblio-invoice-fix.md) — **incident**: factură Oblio dublată din webhook concurent → șters + lock atomic (migrare 049)
- [`session-logs/2026-06-10-draft-resume-from-server.md`](session-logs/2026-06-10-draft-resume-from-server.md) — reluare comandă din server via `?order=&email=` (cross-device) + sync formular contact
- [`session-logs/2026-06-10-sameday-vat-21-and-phone.md`](session-logs/2026-06-10-sameday-vat-21-and-phone.md) — TVA curieri aliniat la 21% + nr. suport hardcodat (+40 757 708 181)
- [`session-logs/2026-06-10-ui-batch-bundled-kyc-lockers.md`](session-logs/2026-06-10-ui-batch-bundled-kyc-lockers.md) — dropdown țară/limbă la opțiuni bundled, card KYC, lockere CDN-cache
- [`session-logs/2026-06-10-mobile-delivery-checkout-status-polish.md`](session-logs/2026-06-10-mobile-delivery-checkout-status-polish.md) — localitate searchable, checkout buton dublu, success cod dublu, WhatsApp prefill
- [`session-logs/2026-06-10-mobile-wizard-polish.md`](session-logs/2026-06-10-mobile-wizard-polish.md) — termeni sub semnătură, contract compact, iconițe curier
- [`session-logs/2026-06-10-ios-input-zoom-fix.md`](session-logs/2026-06-10-ios-input-zoom-fix.md) — fix zoom iOS la dropdown-uri (font 16px pe mobil)
- [`session-logs/2026-06-10-e2e-playwright-verification.md`](session-logs/2026-06-10-e2e-playwright-verification.md) — refresh suită E2E Playwright

**Sesiune (2026-06-09):** wizard + KYC polish:
- [`session-logs/2026-06-09-post-order-selfie-reupload.md`](session-logs/2026-06-09-post-order-selfie-reupload.md) — **NOU**: re-upload selfie după comandă prin link securizat (admin) → vezi [`technical/specs/post-order-photo-reupload.md`](technical/specs/post-order-photo-reupload.md)
- [`session-logs/2026-06-09-remove-ai-selfie-face-match.md`](session-logs/2026-06-09-remove-ai-selfie-face-match.md) — eliminat face-match AI la selfie (verificare manuală)
- [`session-logs/2026-06-09-bundled-options-dependency-chain.md`](session-logs/2026-06-09-bundled-options-dependency-chain.md) — dependențe apostilă/traducere/legalizare la serviciile secundare
- [`session-logs/2026-06-09-step1-citizenship-single-checkbox.md`](session-logs/2026-06-09-step1-citizenship-single-checkbox.md) — o singură bifă „cetățean străin" la pasul 1
- [`session-logs/2026-06-09-wizard-optimistic-navigation.md`](session-logs/2026-06-09-wizard-optimistic-navigation.md) — navigare optimistă (butonul „Continuă" nu mai așteaptă salvarea)
- [`session-logs/2026-06-09-ci-front-idrou-name-fix.md`](session-logs/2026-06-09-ci-front-idrou-name-fix.md) — fix nume „IDROU" din MRZ la CI față
- [`session-logs/2026-06-09-kyc-step2-reupload-button.md`](session-logs/2026-06-09-kyc-step2-reupload-button.md) — buton „Poză greșită? Reîncarcă" la scanare CI

**Sesiune (2026-05-27 PM):** [`session-logs/2026-05-27-admin-parity-overhaul.md`](session-logs/2026-05-27-admin-parity-overhaul.md) — admin shell port, coșuri abandonate, dashboard extins
**Sesiune (2026-05-27 AM):** [`session-logs/2026-05-27-step2-simplification.md`](session-logs/2026-05-27-step2-simplification.md) — Step 2 redesign, contract DOCX, delivery calculator
**Parity matrix sister project:** [`admin/PARITY-MATRIX.md`](admin/PARITY-MATRIX.md) — feature-by-feature vs cazierjudiciaronline.com
**Handbook coșuri abandonate:** [`admin/abandoned-carts.md`](admin/abandoned-carts.md)
**Handbook Modifică comandă:** [`admin/modify-order.md`](admin/modify-order.md)
**Handbook Storno + Reemite Oblio:** [`admin/storno-reemite.md`](admin/storno-reemite.md)
**Handbook Auto-Finalize cron (curier):** [`admin/auto-finalize-cron.md`](admin/auto-finalize-cron.md)
**Gap docs secundare (Cazier+Integritate):** [`admin/secondary-service-documents.md`](admin/secondary-service-documents.md)
**🚀 DEPLOY CHECKLIST:** [`deployment/DEPLOY-CHECKLIST.md`](deployment/DEPLOY-CHECKLIST.md) — **citește înainte de cutover**
**▲ VERCEL DEPLOY + STRIPE WEBHOOK:** [`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md) — env vars, webhook, cum testezi plata
**🔐 Security incident 2026-05-28:** [`security/INCIDENT-2026-05-28-aws-key-leak.md`](security/INCIDENT-2026-05-28-aws-key-leak.md) — AWS key rotation + Quarantine policy detach
**🛠️ Polish PM 2026-05-28:** [`session-logs/2026-05-28-pm-polish-and-fixes.md`](session-logs/2026-05-28-pm-polish-and-fixes.md) — Smoke-test fix-uri (CUI v9, birthDate, Sync Stripe, skip-link, rounding)
**Sesiune anterioară (2026-05-20):** [`session-logs/2026-05-20-seo-cazier-judiciar-rebuild.md`](session-logs/2026-05-20-seo-cazier-judiciar-rebuild.md)
**Sesiune anterioară (2026-04-29):** [`session-logs/2026-04-29-wizard-redesign.md`](session-logs/2026-04-29-wizard-redesign.md)
**Testing guide:** [`testing/COMPREHENSIVE_GUIDE.md`](testing/COMPREHENSIVE_GUIDE.md)

---

## ✅ SESIUNE 2026-04-29 — Wizard redesign (Step 1+2 merge, summary unificat)

**Step 1 (Contact) merged cu Tip Client** · eliminat step separat; adăugat citizenship toggle (PF only — Romanian / Foreign cu EU vs non-EU sub-pick) + purpose dropdown cu 219 motive prioritizate (cazier-judiciar/fiscal/auto/integritate); PhoneInput cu country picker. Eliminat `preferredContact`.

**Step 2 (Date Personale)** · mode picker Scan vs Manual, CNP live preview (`summarizeCNP`), country list filtered EU/non-EU, Adresa România required pentru străini, OCR progress fake-anim 40→68%.

**Summary unificat** · `OrderSummaryCard.tsx` rescris ca single source of truth (sidebar wizard + checkout + status). `lib/orders/normalize.ts` canonical option shape. `breakdown.couponCode` + `apiOrder.options` în API.

**Bug fixes** · `crypto.randomUUID` fallback pentru HTTP/mobile (`lib/random-id.ts`); CNP UTC drift (off-by-one); motiv dropdown clipping (React Portal); emojis → lucide. CNP-derived auto-fill birthDate + județ.

**Stripe + Oblio** · per-line metadata pe PaymentIntent (`line_N_name/price/code` + `couponCode` + `discountAmount`); description rich; Oblio TVA 19→21%.

**DB persistence** · `customer_data.contact.{citizenship, foreignType, purpose}` (zero migration — JSONB existent). Admin order detail afișează Cetățenie + Motivul.

**Cleanup** · eliminate 2 opțiuni deprecate (`verificare_expert`, `copii_suplimentare`) din UI + auto-clean drafts vechi.

---

## ✅ SESIUNE 2026-04-27/28 — Performance + KYC Security + Test Infrastructure

**Etapa 1 — Turbopack dev mode** · `next dev --turbopack` în `package.json`. PATCH `/api/orders/draft` 58s → 200-2500ms.

**Etapa 2 — Admin list optimization** · `count='estimated'` (no `COUNT(*)` cost) + exclude `status=draft` din default. GET admin/orders/list 25-39s → 3-5s.

**Etapa 3 — Image compression client-side** · `src/lib/images/compress.ts` (EXIF orientation, target 1600px, q=0.85, fallback canvas). 5MB CI → 207 KB. Aplicat în `IdScanner`, `PersonalDataStep`, `KYCDocumentsStep`, `KYCTab`.

**Etapa 4 — Gemini model hibrid** · OCR: `gemini-2.5-flash-lite` (~1.9s, 98% confidence). KYC face-match: `gemini-2.5-flash` (~6-10s, acurat) — flash-lite dădea fals negativ.

**Etapa 5 — KYC util reutilizabil** · `src/lib/kyc/face-match.ts` cu `runFaceMatch()`. **Security gap închis:** `KYCTab.tsx` (account page) acum face face-match la selfie upload (anterior salvea direct fără validare).

**Etapa 6 — Test infrastructure** · 596 unit tests (Vitest 4) + 8 integration (real Gemini/DB) + 13 E2E (Playwright) + 17 smoke. CI: lint + tsc + tests + build, verde pe `main`.

**Etapa 7 — TDD bug hunting** · 2 GDPR-critical bugs găsite și fixate cu test-first: audit-logger PII redaction (`'imageBase64'` lowercase mismatch) + `order_history` CHECK constraint missing event_types (migration 035).

**Etapa 8 — Next.js 16 migration** · `src/middleware.ts` → `src/proxy.ts` (convenția Next.js 16, elimină warning-ul deprecated).

**⚠️ ALERT pendent:** Rotire `SUPABASE_SERVICE_ROLE_KEY` — cheia leaked în history (commit Feb 11), fișier șters dar cheia rămâne în git history. Manual pe https://supabase.com/dashboard → Vercel → `.env.local`.

---

## ✅ SESIUNE 18-19 Februarie 2026

> **Pentru detalii complete, citeste [`SESSION_RECAP.md`](SESSION_RECAP.md)**

**Ce s-a facut recent (19 Februarie 2026):**
1. ✅ CLIENT_DETAILS_BLOCK rescris cu format legal complet (PF: CI seria, CNP, domiciliu; PJ: firma + CUI + reprezentant cu CI)
2. ✅ KYC confidence tracking per document (CI front, CI back, selfie, face match) cu display in admin
3. ✅ Human review flagging cand confidence < 70%
4. ✅ Contract preview foloseste acelasi format legal

**Sesiune 3 (18 Feb):**
1. ✅ Registry moved to own page `/admin/registru` (dedicated sidebar item, no longer tab in settings)
2. ✅ Registry-document linking bug fixed: `order_document_id` now properly set for reused numbers
3. ✅ Registry table shows document download icons (FileDown) next to numbers
4. ✅ CSV export includes "Document" column with linked filename
5. ✅ Add User (invite) button for super_admin on Users page
6. ✅ CLIENT_BIRTH_PLACE and CLIENT_BIRTH_COUNTRY template placeholders added
7. ✅ Date formatting fixed: birth date/expiry no longer show time portion
8. ✅ TVA 21% unified across all components (OrderSummaryCard fixed)
9. ✅ Timeline events added: `order_submitted`, `document_generation_failed`
10. ✅ Status page prices fixed with `.toFixed(2)` formatting
11. ✅ File input reset in PersonalDataStep after upload
12. ✅ Signature card empty state fixed

**Sesiune 2 (18 Feb):**
1. ✅ KYC face matching fix: `getIDDocument()` type matching + API payload fix for reference image
2. ✅ DocumentType extended with `ci_front`/`ci_back` variants
3. ✅ KYC documents now upload to S3 at submission (not just base64 in DB)
4. ✅ KYC step shows thumbnail previews of uploaded ID documents
5. ✅ OCR street prefix removal (no more "Strada Salcamilor" duplication)
6. ✅ Admin order detail: personal data in compact 2-col grid, address as separate fields in 3-col grid
7. ✅ Admin billing data now shows PF details (not just empty)
8. ✅ Admin payment method shows "Stripe (card)" with Stripe dashboard link
9. ✅ Admin documents visible in pending status
10. ✅ Admin `extractKycDocKeys` fixed for array format
11. ✅ Review step: individual option prices shown, TVA corrected to 21%, full breakdown
12. ✅ Success/status pages: dynamic processing time, VAT 21% breakdown
13. ✅ Contract generator v1.2: CI "emis de" info in CLIENT_DETAILS_BLOCK, 20+ new placeholders
14. ✅ Number registry: table now grouped by order (contract + delegation on same row)
15. ✅ Number registry: CSV export remains flat

**Sesiune 1 (18 Feb):**
1. ✅ Number Registry System - complete (tables, RPC functions, API endpoints, admin UI tab)
2. ✅ Replaced legacy `increment_document_counter` with `allocate_number` (atomic, with reuse logic)
3. ✅ Gemini model upgrade: both OCR and KYC upgraded to `gemini-2.5-flash`
4. ✅ Multi-signature document generation (client drawn + company/lawyer predefined PNG)
5. ✅ Contract preview in wizard (signature step shows pre-filled contract HTML)
6. ✅ Contract legal validity system (IP, UA, timestamp, SHA-256 hash, consent)
7. ✅ Client document downloads (presigned S3 URLs)
8. ✅ Template fixes (imputernicire, cerere-pf, cerere-pj, CLIENT_DETAILS_BLOCK, TERMEN_LIVRARE)

**De făcut (remaining - Sprint 6):**
- [ ] Oblio invoicing integration (e-factura)
- [ ] Email notifications (Resend) for status changes
- [ ] SMS notifications (SMSLink.ro)
- [ ] Revenue charts (recharts) in admin dashboard
- [ ] Audit logging for admin actions
- [ ] Post-order delivery request
- [ ] Stripe-Invoice reconciliation for accounting
- [ ] Date formatting fixes in admin (Romanian locale)

---

## Navigare Rapidă

| Caut informații despre... | Mergi la... |
|--------------------------|-------------|
| **Recap sesiune (citeste prima data!)** | [`SESSION_RECAP.md`](SESSION_RECAP.md) |
| **Status curent (ce merge, ce nu)** | [`STATUS_CURRENT.md`](STATUS_CURRENT.md) |
| **Ce am de făcut** | [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md) |
| **Cum funcționează API-ul** | [`technical/api/`](technical/api/) |
| **Cum adaug un serviciu nou** | [`technical/specs/modular-wizard-guide.md`](technical/specs/modular-wizard-guide.md) |
| **KYC: Verificare Identitate & Face Match** | [`technical/specs/kyc-identity-verification.md`](technical/specs/kyc-identity-verification.md) |
| **Re-upload poză după comandă (selfie)** | [`technical/specs/post-order-photo-reupload.md`](technical/specs/post-order-photo-reupload.md) |
| **Plăți & Facturare (Stripe + Oblio)** | [`technical/specs/stripe-oblio-payment-invoicing.md`](technical/specs/stripe-oblio-payment-invoicing.md) |
| **Livrări & Curierat (Overview)** | [`technical/specs/delivery-system-architecture.md`](technical/specs/delivery-system-architecture.md) |
| **Sameday API (EasyBox, AWB)** | [`technical/specs/sameday-api-integration.md`](technical/specs/sameday-api-integration.md) |
| **AWB Generation & Tracking** | [`technical/specs/awb-generation-tracking.md`](technical/specs/awb-generation-tracking.md) |
| **Admin Panel (Overview)** | [`admin/README.md`](admin/README.md) |
| **Admin Panel Architecture** | [`admin/architecture.md`](admin/architecture.md) |
| **Admin Workflow Design** | [`admin/workflow-design.md`](admin/workflow-design.md) |
| **Document Generation System** | [`technical/specs/admin-document-system.md`](technical/specs/admin-document-system.md) |
| **Number Registry (Barou)** | [`technical/specs/number-registry-system.md`](technical/specs/number-registry-system.md) |
| **Contract Preview (Wizard)** | [`src/app/api/contracts/preview/route.ts`](../src/app/api/contracts/preview/route.ts) |
| **RBAC & Permissions** | [`admin/rbac-permissions.md`](admin/rbac-permissions.md) |
| **Security Audit** | [`admin/security-audit.md`](admin/security-audit.md) |
| **Ce servicii avem** | [`sprints/services/`](sprints/services/) |
| **Cerințele produsului** | [`prd/eghiseul-prd.md`](prd/eghiseul-prd.md) |
| **Probleme de securitate** | [`security/SECURITY_AUDIT_SUMMARY.md`](security/SECURITY_AUDIT_SUMMARY.md) |
| **Design sistem culori** | [`design/color-system.md`](design/color-system.md) |
| **Cum rulez migrații** | [`../CLAUDE.md`](../CLAUDE.md#database-operations--migrations) |
| **Conformitate GDPR** | [`legal/compliance-research.md`](legal/compliance-research.md) |
| **Backlog / Features viitoare** | [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md#backlog--future-features) |

---

## Admin Panel

Documentația completă pentru panoul de administrare, inclusiv arhitectura, RBAC, și securitatea.

| Document | Scop |
|----------|------|
| [`admin/README.md`](admin/README.md) | Admin Panel Overview & Index |
| [`admin/architecture.md`](admin/architecture.md) | Admin Panel Architecture Spec |
| [`admin/rbac-permissions.md`](admin/rbac-permissions.md) | RBAC & Permissions System |
| [`admin/security-audit.md`](admin/security-audit.md) | Security Audit |
| [`admin/workflow-design.md`](admin/workflow-design.md) | Order Processing Workflow (status flow, DOCX templates, document generation, multi-signature) |

---

## Structură Completă

```
docs/
├── README.md                    ← Ești aici (index principal)
├── SESSION_RECAP.md             ← ⭐ CITESTE ASTA PRIMA DATA (recap sesiune 18-19 Feb)
├── STATUS_CURRENT.md            ← Status curent: ce merge, probleme, backlog, testing checklist
│
├── admin/                       ← Admin Panel
│   ├── README.md                ← Admin Panel Overview & Index
│   ├── architecture.md          ← Admin Panel Architecture Spec
│   ├── rbac-permissions.md      ← RBAC & Permissions System
│   ├── security-audit.md        ← Security Audit
│   └── workflow-design.md       ← Order Processing Workflow Design
│
├── prd/                         ← Product Requirements
│   └── eghiseul-prd.md          ← PRD v2.0 (actualizat Jan 2026)
│
├── technical/                   ← Documentație Tehnică
│   ├── api/
│   │   ├── services-api.md      ← Services, Orders, Draft, Admin APIs
│   │   └── ocr-kyc-api.md       ← OCR + KYC (both Gemini 2.5 Flash)
│   ├── specs/
│   │   ├── modular-wizard-guide.md          ← ⭐ CUM ADAUGI SERVICII NOI
│   │   ├── stripe-oblio-payment-invoicing.md ← ⭐ PLĂȚI + FACTURARE (NEW)
│   │   ├── delivery-system-architecture.md   ← ⭐ DELIVERY SYSTEM (Courier integration)
│   │   ├── modular-verification-architecture.md
│   │   ├── service-verification-requirements.md
│   │   ├── order-autosave-system.md
│   │   ├── romanian-document-handling.md
│   │   ├── user-data-persistence.md
│   │   ├── user-data-persistence-implementation.md  ← Implementation details
│   │   ├── user-data-flow-analysis.md       ← Data flow gaps & fixes
│   │   ├── security-audit-admin-client.md   ← (Moved → admin/security-audit.md)
│   │   ├── draft-error-recovery.md          ← Error handling & auto-recovery
│   │   ├── fan-courier-integration.md       ← ⭐ FAN COURIER API
│   │   ├── sameday-api-integration.md      ← ⭐ SAMEDAY API (EasyBox, AWB, Tracking)
│   │   ├── dual-profile-system.md           ← Dual Profile System (PF + PJ company support)
│   │   ├── awb-generation-tracking.md       ← ⭐ AWB GENERATION & TRACKING
│   │   ├── admin-document-system.md         ← ⭐ DOCUMENT GENERATION SYSTEM (multi-signature)
│   │   ├── number-registry-system.md       ← ⭐ NUMBER REGISTRY (Barou ranges, journal, allocations)
│   │   └── admin-panel-architecture.md      ← (Moved → admin/architecture.md)
│   ├── database/
│   │   └── database-schema-sprint2.md       ← Schema + Sprint 3-4 addendum
│   └── technology-decisions-summary.md
│
├── sprints/                     ← Sprint Documentation
│   ├── sprint-0-setup.md        ← ✅ Complete
│   ├── sprint-1-auth.md         ← ✅ Complete
│   ├── sprint-2-services.md     ← ✅ Complete
│   ├── sprint-3-kyc-documents.md← ✅ Complete (+ Implementation Log)
│   └── services/                ← 12 servicii documentate
│       ├── README.md            ← Catalog servicii
│       ├── cazier-fiscal.md     ← ✅ Complete
│       ├── cazier-judiciar.md   ← ✅ Complete (+ analiză competitori)
│       ├── extras-carte-funciara.md ← ✅ Complete
│       ├── certificat-constatator.md ← ✅ Complete
│       └── [alte 8 servicii]    ← 📝 Draft
│
├── security/                    ← Securitate & Audit
│   ├── README.md                ← ⭐ INDEX SECURITATE
│   ├── SECURITY_AUDIT_SUMMARY.md← Status vulnerabilități
│   ├── SECURITY_QUICK_REFERENCE.md ← Quick fixes pentru devs
│   ├── SECURITY_IMPLEMENTATION_CHECKLIST.md ← Task list
│   ├── SECURITY_AUDIT_REPORT_2025-12-17.md ← Audit complet
│   ├── S3_SECURITY_ASSESSMENT.md ← ⭐ AWS S3 Security Audit
│   ├── S3_SECURITY_SUMMARY.md   ← Quick reference S3
│   ├── security-architecture.md ← Arhitectură detaliată
│   └── security-recommendations-summary.md
│
├── design/                      ← Design System
│   ├── README.md                ← Index design
│   ├── color-system.md          ← ⭐ Sistem culori master
│   ├── component-color-guide.md ← Exemple componente
│   ├── sprint-3-homepage-design.md
│   └── SERVICES-PAGE-DESIGN.md
│
├── deployment/                  ← Deployment & DevOps
│   ├── AWS_S3_SETUP.md          ← ⭐ Ghid complet S3
│   ├── DATABASE_MIGRATIONS.md   ← Cum rulezi migrații
│   └── PRODUCTION_SECURITY_SETUP.md
│
├── legal/                       ← GDPR & Compliance
│   └── compliance-research.md   ← Cercetare GDPR/ANSPDCP
│
├── testing/                     ← Test Plans + Guide
│   ├── COMPREHENSIVE_GUIDE.md   ← ⭐ Ghid complet testare (Vitest + Playwright + smoke), TDD workflow, CI flow
│   ├── TEST_PLAN.md
│   └── MODULAR_VERIFICATION_TEST_PLAN.md
│
├── seo/                         ← SEO Strategy
│   ├── CAZIER-FISCAL-SEO-AUDIT.md
│   └── CONTENT-IMPLEMENTATION-GUIDE.md
│
├── analysis/                    ← Flow Analysis
│   └── feature-completeness-analysis.md
│
├── business/                    ← Business Docs
│   └── existing-platform.md     ← Reference WordPress
│
├── fancourier/                  ← Fan Courier API Documentation
│   ├── RO_FANCourier_API_130825.pdf
│   └── API FANCourier RO.postman_collection.json
│
├── sameday/                     ← Sameday Courier API Documentation
│   └── descarca-documentatia-api.pdf
│
├── archive/                     ← Documente arhivate
│   ├── README.md
│   └── smart-flow-v2-not-implemented.md
│
└── agents/                      ← Agent Collaboration
    └── README.md                ← 60 agents, workflows
```

---

## Documente Cheie per Rol

### Pentru Dezvoltatori

| Document | Scop | Când îl folosești |
|----------|------|-------------------|
| [`../CLAUDE.md`](../CLAUDE.md) | Ghid principal Claude Code | Mereu - reguli, comenzi, patterns |
| [`technical/specs/modular-wizard-guide.md`](technical/specs/modular-wizard-guide.md) | Sistem wizard modular | Când adaugi servicii noi |
| [`technical/api/services-api.md`](technical/api/services-api.md) | API Documentation | Când lucrezi cu endpoints |
| [`technical/api/ocr-kyc-api.md`](technical/api/ocr-kyc-api.md) | OCR & KYC APIs | Când lucrezi cu documente/AI |
| [`technical/specs/delivery-system-architecture.md`](technical/specs/delivery-system-architecture.md) | Delivery System | Arhitectură sistem livrări |
| [`technical/specs/fan-courier-integration.md`](technical/specs/fan-courier-integration.md) | Fan Courier API | Când lucrezi cu livrări Fan Courier |
| [`technical/specs/sameday-api-integration.md`](technical/specs/sameday-api-integration.md) | Sameday API | Cand lucrezi cu livrari Sameday / EasyBox |
| [`technical/specs/admin-document-system.md`](technical/specs/admin-document-system.md) | Document Generation | Cand lucrezi cu generarea documentelor admin |
| [`technical/specs/number-registry-system.md`](technical/specs/number-registry-system.md) | Number Registry (Barou) | Cand lucrezi cu numere contracte/imputerniciri Barou |
| `src/lib/documents/signature-inserter.ts` | Signature Embedding | Cand lucrezi cu semnatura electronica in DOCX (multi-signature: client, company, lawyer) |
| `src/app/api/contracts/preview/route.ts` | Contract Preview API | Cand lucrezi cu preview-ul contractului in wizard |
| [`security/SECURITY_QUICK_REFERENCE.md`](security/SECURITY_QUICK_REFERENCE.md) | Securitate rapid | Code patterns sigure |

### Pentru Product / Management

| Document | Scop | Când îl folosești |
|----------|------|-------------------|
| [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md) | Status sprinturi | Tracking progres |
| [`prd/eghiseul-prd.md`](prd/eghiseul-prd.md) | Product Requirements | Cerințe și roadmap |
| [`sprints/services/`](sprints/services/) | Catalog servicii | Detalii per serviciu |
| [`security/SECURITY_AUDIT_SUMMARY.md`](security/SECURITY_AUDIT_SUMMARY.md) | Status securitate | Ce vulnerabilități sunt fixate |

### Pentru Security / Compliance

| Document | Scop | Când îl folosești |
|----------|------|-------------------|
| [`security/README.md`](security/README.md) | Index securitate | Start here |
| [`security/SECURITY_AUDIT_REPORT_2025-12-17.md`](security/SECURITY_AUDIT_REPORT_2025-12-17.md) | Audit complet | Detalii vulnerabilități |
| [`security/security-architecture.md`](security/security-architecture.md) | Arhitectură | Threat model, encryption |
| [`legal/compliance-research.md`](legal/compliance-research.md) | GDPR | Cercetare conformitate |

---

## Status Sprinturi

| Sprint | Status | Descriere | Docs |
|--------|--------|-----------|------|
| Sprint 0 | ✅ Complete | Setup, planning, research | [`sprint-0-setup.md`](sprints/sprint-0-setup.md) |
| Sprint 1 | ✅ Complete | Authentication system | [`sprint-1-auth.md`](sprints/sprint-1-auth.md) |
| Sprint 2 | ✅ Complete | Services & Orders API | [`sprint-2-services.md`](sprints/sprint-2-services.md) |
| Sprint 3 | ✅ Complete | KYC, OCR, Modular Wizard | [`sprint-3-kyc-documents.md`](sprints/sprint-3-kyc-documents.md) |
| Sprint 4 | 🔄 Active (98%) | Payments, S3, Contracts, Document Generation, Multi-Signature, KYC S3 Upload, Review Pricing | `DEVELOPMENT_MASTER_PLAN.md` |
| Sprint 5 | 🔄 Active (98%) | Admin Dashboard, RBAC, Workflow, Document System, Number Registry, Admin UI Polish | `DEVELOPMENT_MASTER_PLAN.md` |
| Sprint 6 | ⏳ Pending | Notifications, Polish, Post-Order Delivery, Stripe Reconciliation, Oblio | `DEVELOPMENT_MASTER_PLAN.md` |

---

## Tech Stack Actual

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 16+, Tailwind v4, shadcn/ui | ✅ Active |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) | ✅ Active |
| **AI/OCR** | Google Gemini 2.5 Flash | ✅ Integrated |
| **AI/KYC** | Google Gemini 2.5 Flash | ✅ Integrated |
| **Storage** | AWS S3 (eu-central-1) | ✅ Active |
| **Payments** | Stripe | 🔄 Sprint 4 |
| **Courier (RO)** | Fan Courier API v2.0 | ✅ Integrated |
| **Courier (RO)** | Sameday API v3.1 (EasyBox) | ✅ Integrated |
| **Company Validation** | ANAF API (free, official) | ✅ Integrated |

---

## Top 12 Servicii

| # | Serviciu | Documentație | Status |
|---|----------|--------------|--------|
| 1 | Extras Carte Funciară | [`extras-carte-funciara.md`](sprints/services/extras-carte-funciara.md) | ✅ Complete |
| 2 | Cazier Fiscal | [`cazier-fiscal.md`](sprints/services/cazier-fiscal.md) | ✅ Complete |
| 3 | Certificat Constatator | [`certificat-constatator.md`](sprints/services/certificat-constatator.md) | ✅ Complete |
| 4 | Cazier Judiciar PF/PJ | [`cazier-judiciar.md`](sprints/services/cazier-judiciar.md) | ✅ Complete |
| 5 | Certificat Naștere | [`certificat-nastere.md`](sprints/services/certificat-nastere.md) | 📝 Draft |
| 6 | Cazier Auto | [`cazier-auto.md`](sprints/services/cazier-auto.md) | 📝 Draft |
| 7 | Rovinieta | [`rovinieta.md`](sprints/services/rovinieta.md) | 📝 Draft |
| 8 | Certificat Celibat | [`certificat-celibat.md`](sprints/services/certificat-celibat.md) | 📝 Draft |
| 9 | Certificat Integritate | [`certificat-integritate.md`](sprints/services/certificat-integritate.md) | 📝 Draft |
| 10 | Certificat Căsătorie | [`certificat-casatorie.md`](sprints/services/certificat-casatorie.md) | 📝 Draft |
| 11 | Extras Multilingv Naștere | [`extras-multilingv-nastere.md`](sprints/services/extras-multilingv-nastere.md) | 📝 Draft |
| 12 | Extras Multilingv Căsătorie | [`extras-multilingv-casatorie.md`](sprints/services/extras-multilingv-casatorie.md) | 📝 Draft |

---

## Ghid Actualizare Documentație

### Când să actualizezi

| Când modifici... | Actualizează în... |
|------------------|-------------------|
| API endpoint | `technical/api/*.md` |
| Feature nou | `technical/specs/*.md` + `../CLAUDE.md` |
| Sprint completat | `sprints/sprint-X.md` + `../DEVELOPMENT_MASTER_PLAN.md` |
| Serviciu nou | `sprints/services/{serviciu}.md` |
| Database schema | `technical/database-schema-sprint2.md` |
| Security fix | `security/SECURITY_AUDIT_SUMMARY.md` |
| Design system | `design/color-system.md` |

### Checklist după fiecare feature

```markdown
[ ] Update DEVELOPMENT_MASTER_PLAN.md cu status
[ ] Document new APIs in docs/technical/api/
[ ] Update sprint docs dacă e relevant
[ ] Add/update TypeScript types în src/types/
[ ] Update CLAUDE.md dacă stabilești patterns noi
```

---

## API Endpoints Summary

### Public
- `GET /api/services` - List services
- `GET /api/services/[slug]` - Service details
- `GET /api/ocr/extract` - OCR health check
- `GET /api/kyc/validate` - KYC health check

### Public (No Auth)
- `POST /api/contracts/preview` - Generate contract preview HTML from wizard data

### Protected (Auth Required)
- `POST /api/orders` - Create order
- `GET/PATCH /api/orders/[id]` - Order details/update
- `POST /api/orders/[id]/submit` - Submit draft order
- `POST /api/orders/[id]/payment` - Create payment
- `GET/POST/PATCH /api/orders/draft` - Draft CRUD
- `POST /api/ocr/extract` - OCR extraction
- `POST /api/kyc/validate` - KYC validation
- `POST /api/company/validate` - ANAF API company validation
- `GET /api/courier/quote` - Courier price quotes (Fan Courier)
- `GET /api/courier/pickup-points` - FANbox lockers list
- `GET /api/user/prefill-data` - User saved data
- `GET/PATCH /api/user/profile` - User profile with document info
- `GET /api/user/kyc` - KYC status (verified/partial/unverified)
- `POST /api/user/kyc/save` - Save KYC document
- `GET/POST /api/user/addresses` - User addresses
- `PATCH/DELETE /api/user/addresses/[id]` - Address update/delete
- `GET/POST /api/user/billing-profiles` - Billing profiles
- `PATCH/DELETE /api/user/billing-profiles/[id]` - Profile update/delete
- `POST /api/upload` - Get presigned S3 upload URL
- `GET /api/upload` - S3 health check
- `GET /api/upload/download` - Get presigned S3 download URL

### Admin
- `GET /api/admin/orders/lookup` - Lookup by order number
- `GET /api/admin/orders/list` - List by status
- `GET /api/admin/orders/[id]` - Order detail with documents & option statuses
- `POST /api/admin/orders/[id]/verify-payment` - Verify bank transfer payment
- `POST /api/admin/orders/[id]/process` - Transition order status (validated state machine)
- `POST /api/admin/orders/[id]/generate-document` - Generate DOCX (contract, imputernicire, cerere)
- `POST /api/admin/orders/[id]/generate-awb` - Generate AWB for order
- `GET /api/admin/orders/[id]/awb-label` - Download AWB label PDF
- `POST /api/admin/orders/[id]/cancel-awb` - Cancel AWB
- `GET/PATCH /api/admin/settings` - Admin settings (company_data, lawyer_data, document_counters)
- `GET/POST /api/admin/cleanup` - GDPR cleanup
- `POST /api/admin/orders/[id]/request-reupload` - Generate + email a secure link for the customer to re-upload their selfie ([spec](technical/specs/post-order-photo-reupload.md))
- `POST /api/auth/register-from-order` - Convert guest to user

### Public (No Auth) — Re-upload
- `GET /api/reupload/[token]` - Re-upload link info (doc type, status)
- `POST /api/reupload/[token]` - Customer submits the new photo (token-gated, single-use)

### Tracking
- `GET /api/orders/[id]/tracking` - Get order tracking timeline
- `POST /api/cron/update-tracking` - Cron: Update all active shipments

---

## Fișiere Importante Codebase

| Fișier | Scop |
|--------|------|
| `src/providers/modular-wizard-provider.tsx` | State wizard |
| `src/components/orders/steps-modular/billing-step.tsx` | Billing PF/PJ |
| `src/lib/verification-modules/step-builder.ts` | Dynamic steps |
| `src/lib/services/document-ocr.ts` | Gemini OCR |
| `src/lib/services/kyc-validation.ts` | Gemini KYC |
| `src/lib/security/rate-limiter.ts` | Rate limiting |
| `src/lib/security/audit-logger.ts` | Audit logging |
| `src/lib/services/courier/fancourier.ts` | Fan Courier API v2.0 |
| `src/lib/services/courier/sameday.ts` | Sameday API v3.1 (EasyBox, AWB) |
| `src/components/orders/steps-modular/delivery-step.tsx` | Delivery selection UI |
| `src/components/orders/tracking-timeline.tsx` | Tracking timeline component |
| `src/app/admin/layout.tsx` | Admin layout with sidebar |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail with AWB + ProcessingSection |
| `src/lib/documents/generator.ts` | Document generation (docxtemplater + multi-signature embedding) |
| `src/lib/documents/signature-inserter.ts` | Multi-signature PNG injection into DOCX via DrawingML (client, company, lawyer + stamp) |
| `src/components/orders/modules/signature/ContractPreview.tsx` | Live contract preview in wizard |
| `src/app/api/contracts/preview/route.ts` | Contract preview API (DOCX-to-HTML) |
| `src/templates/cazier-judiciar/*.docx` | DOCX templates for cazier judiciar |
| `src/app/api/admin/orders/[id]/process/route.ts` | Status transition API |
| `src/app/api/admin/orders/[id]/generate-document/route.ts` | Document generation API |
| `src/lib/aws/s3.ts` | S3 operations (generateContractKey, uploadFile) |
| `src/templates/shared/*.docx` | Shared DOCX templates |
| `supabase/migrations/` | DB migrations |

---

**Pentru tracking dezvoltare:** Vezi [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md)

**Ultima actualizare:** 2026-02-19
