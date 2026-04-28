# eGhiseul.ro - Status Curent

**Data:** 2026-04-27 (ultima update; doc original 2026-02-19)
**Sprint-uri completate:** Sprint 0-6 ✅ (toate live pe main)
**Aliniere cu cazierjudiciaronline.com:** complet (11 faze A-L, vezi `docs/IMPLEMENTATION_COMPLETE_2026-04-16.md`)
**Performance + image compression:** 2026-04-27 ✅ (vezi `docs/session-logs/2026-04-27-performance-image-compression.md`)
**Sprint pendinte:** Notifications efective (email Resend, SMS SMSLink, Oblio invoicing — toate cu credentiale neconfig)

---

## Schimbări recente (2026-04-27)

### Performance dev mode (10x recovery)
- `package.json` — `dev` script forțează `next dev --turbopack` (Next.js 16 default era webpack când nu e specificat explicit)
- `src/app/api/admin/orders/list/route.ts` — `count: 'estimated'` + exclude `status='draft'` din default `'all'` (90 drafts în DB cu unul de 4.8MB customer_data — toate erau încărcate la fiecare admin/orders)
- Rezultat live: PATCH /api/orders/draft 58s → 200-2500ms; admin/orders/list 25-39s → ~3-5s; navigare wizard 1-3s → 200-450ms

### Gemini model: hibrid OCR vs KYC (decizie după testare cu poze reale)
- `src/lib/services/document-ocr.ts:14` → `gemini-2.5-flash-lite` (OCR rapid, 1.9-3.5s, confidence 98%)
- `src/lib/services/kyc-validation.ts:13` → `gemini-2.5-flash` (face match precis, 6-10s, confidence 92-98%)
- **De ce nu lite și pe KYC:** test cu Stefania-Rodica selfie + CI propriu → flash-lite returna fals negativ („nu pot confirma cu certitudine"); flash returnează corect match=true 92%. Test cu Alexandra selfie + Stefania CI → ambele detectează corect mismatch, dar flash dă detalii și pe document type + name mismatch.
- Test rerunnable via `scripts/test-kyc-face-match.mjs` (necesită 3 imagini reale + dev server pe :3000)

### KYC face match — util reutilizabil + paritate wizard ↔ cont
- NOU `src/lib/kyc/face-match.ts` — `runFaceMatch()` + `fetchImageAsBase64()` cu threshold standard `valid = matched && validationConfidence >= 50`
- Wizard (`personal-kyc/KYCDocumentsStep.tsx`) folosește utilul; refactor a redus codul duplicat cu ~20 linii
- **Cont (`account/KYCTab.tsx`) — gap închis:** anterior selfie se salva FĂRĂ face match („For selfie, just save without OCR"). Acum la selfie upload: cache CI front în-sesiune SAU fetch din S3 → `runFaceMatch()` → blochează cu mesaj UI dacă mismatch. Loophole-ul „CI cu A + selfie cu B" e închis.
- Validat: ambele cazuri (match real + mismatch real) trec corect prin `scripts/test-kyc-face-match.mjs`
- Componentă reutilizabilă pentru OCR ID scan: `src/components/shared/IdScanner.tsx` (folosită de ProfileTab cont, cu compresie deja integrată)

### Image compression client-side
- NOU: `src/lib/images/compress.ts` — util cu EXIF orientation (`createImageBitmap` cu `imageOrientation: 'from-image'`), OffscreenCanvas + canvas fallback, target 1600px / JPEG q=0.85
- Aplicat în 4 componente customer-facing (6 puncte FileReader): `IdScanner.tsx`, `personal-kyc/PersonalDataStep.tsx`, `personal-kyc/KYCDocumentsStep.tsx`, `account/KYCTab.tsx`
- KYCTab are fallback gracios la fișier brut dacă compresia eșuează (HEIC, browser vechi)
- Verificat live: CI iPhone 5MB → 207KB pe S3 (95% reducere)
- Fișiere LEGACY (`steps/personal-data-step.tsx`, `steps/kyc-step.tsx`) NEatinse — orfane, planificate pentru ștergere

### Test infrastructure complet (TDD-ready, 568 unit tests + 8 integration live)
- **Vitest 4** + `npm test`, `test:watch`, `test:ui`, `test:unit`, `test:integration`, `test:e2e`, `test:smoke`, `test:all`
- **568 unit tests** acoperă: RBAC permissions (37), CNP validation (50), audit logger GDPR (32), rate limiter (14), Stripe payment intent (18), Stripe webhook security (8), confirm-payment (11), delivery calculator (43), document generator helpers PF/PJ (39), courier utils (71), Oblio invoice (20), KYC face match util (10), KYC validation services (13), image compression (9), admin order processing (19), admin payment verification (13), admin AWB generate (10), admin AWB cancel (8), admin coupon CRUD (17), admin employee invite (21), public coupon validation (21), courier quote (15), cron tracking update (7), customer tracking (8), user addresses CRUD (16), user billing profiles CRUD (13), user profile (8), user KYC save (17)
- **8 integration tests** opt-in cu `RUN_INTEGRATION=1`: KYC face match real Gemini (3) + order submit pipeline real DB (6 — draft → patch → submit → audit trail)
- **2 BUG-URI CRITICAL găsite prin TDD + fix-uite:**
  1. `audit-logger.ts:115` — `imageBase64` field nu era redactat în logs (case bug). GDPR-critical, fix-uit cu comentariu istoric.
  2. `order_history.event_type` CHECK constraint — 6 event_types folosite în cod (`order_submitted`, `payment_rejected`, `payment_verified`, `tracking_update`, `payment_proof_submitted`, `document_generation_failed`) erau rejected silent → audit trail trunchiat. Fix: `supabase/migrations/035_order_history_event_types.sql`. Critical pentru legal/audit.
- **`.github/workflows/test.yml`** — CI pe push/PR (lint + tsc + 245 tests + build production), reports uploaded ca artifact
- **`tests/README.md`** — guide TDD complet cu layout, quick reference, workflow bug fix, gaps prioritizate
- Playwright E2E (13 specs existente) accesibile prin `npm run test:e2e`

### Gap-uri vizibile pentru viitor (în `tests/README.md`)
- 🟠 HIGH: `documents/generator.ts` (DOCX), `services/courier/{sameday,fancourier}.ts`, `lib/oblio/invoice.ts`, order submit integration
- 🟡 MEDIUM: 32 admin endpoint-uri, user CRUD (addresses, billing-profiles), CUI validation
- 🟢 LOW: coupons + cetățean străin (deja există ad-hoc scripts în `scripts/test-*.mjs`)

### Bug NON-CRITICAL identificat (recomandare pentru viitor)
- Success page după Stripe redirect poate primi 404 tranzitoriu de la `/api/orders/[id]` în dev mode (Supabase auth fetch flake), aruncă error înainte să ajungă la fallback `confirm-payment`. Pe local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` rezolvă problema (webhook-ul reală marchează order-ul paid imediat). Robusteață suplimentară: în `src/app/comanda/success/[orderId]/page.tsx:100-130` ar trebui apelat confirm-payment direct când `redirect_status='succeeded'`, indiferent dacă GET-ul a reușit.

---

## Ce Functioneaza (What's Working)

### 1. Sistem de Autentificare & Conturi
- **Login/Register/Forgot Password** - Supabase Auth cu email/password
- **Protected routes** - Middleware redirecteaza la login pentru rute protejate
- **Account pages** - Profile, KYC, Addresses, Billing Profiles tabs
- **Dual profile system** - PF (persoana fizica) + PJ (persoana juridica) cu CUI/ANAF validation
- **Guest-to-customer conversion** - SaveDataModal dupa comanda, cont creat automat

### 2. Catalog Servicii & Landing Pages
- **Homepage** - Hero, services grid, features, stats, footer
- **Service catalog** - 12 servicii documentate (9 active in DB, 3 draft/planificate)
- **Service detail pages** - Detalii, preturi, FAQ per serviciu
- **Category-based URLs** - `/servicii/[category]/[slug]`

### 3. Wizard Modular de Comanda
- **URL pattern:** `/comanda/[service-slug]` (ex: `/comanda/cazier-judiciar-persoana-fizica`)
- **Dynamic step generation** - Steps se adapteaza pe baza `verification_config` JSONB
- **Core steps:** Contact, Options, Delivery, Billing, Review
- **Dynamic modules:** Client Type, Personal KYC, Company KYC, Company Documents, Property, Vehicle, Signature
- **CNP validation** - Full Romanian CNP validation cu checksum, gender, age
- **OCR cu Gemini 2.5 Flash** - Scan CI si extrage CNP, nume, adresa, data nastere
- **KYC Documents** - Upload CI front/back cu thumbnail previews
- **KYC Selfie face matching** - AI compara selfie cu poza din CI (recent fixat)
- **KYC confidence tracking per document** - Each KYC document (CI front, CI back, selfie, face match) stores AI confidence score (0-100%)
- **KYC confidence in admin** - Admin order detail shows "Verificare KYC" card with per-document confidence percentages and color coding (green >= 70%, yellow 50-69%, red < 50%)
- **Human review flagging** - When any KYC confidence score is below 70%, admin UI shows warning indicator for manual review
- **Electronic signature** - Canvas-based signature cu terms acceptance
- **Contract preview** - Live DOCX-to-HTML preview in signature step
- **Auto-save** - Debounced save (500ms), localStorage backup
- **Order ID** - Human-readable IDs (ORD-YYYYMMDD-XXXXX)
- **Romanian address parsing** - Str., Bl., Sc., Et., Ap. extraction
- **OCR street prefix fix** - "Strada" prefix removed to prevent duplication
- **ANAF company validation** - CUI lookup via official API (free)
- **Review step pricing** - Individual option prices, TVA 21% breakdown, total calculation

### 4. Plati (Payments)
- **Stripe PaymentElement** - Card payments (Visa, Mastercard, etc.)
- **Apple Pay / Google Pay** - Via Stripe PaymentElement
- **Bank transfer** - Reference code (PAY-YYYYMMDD-XXXXX), admin manual confirmation
- **Stripe webhooks** - Auto status update on payment success
- **Success/status pages** - Dynamic processing time, VAT 21% breakdown

### 5. Storage (AWS S3)
- **Region:** eu-central-1, Bucket: eghiseul-documents
- **Presigned URLs** - Secure upload/download without exposing credentials
- **KYC documents** - Upload to S3 at submission (not just base64 in DB)
- **Contracts & documents** - Stored under `orders/{friendly_id}/{type}/`
- **Signatures** - Client signatures uploaded to S3
- **Templates** - Admin-uploaded custom DOCX templates in `templates/custom/`
- **Encryption** - SSE-S3 (AES-256), Block Public Access enabled

### 6. Courier Integration
- **Fan Courier API v2.0** - Quotes, localities, FANbox lockers, AWB generation, tracking
- **Sameday API v3.1** - EasyBox lockers (6073), AWB generation, tracking
- **Multi-provider UI** - Side-by-side comparison with logos and pricing
- **Locker selector** - Scrollable card list with distance display, operating hours
- **Street-level geocoding** - Nominatim OpenStreetMap for accurate locker distance sorting
- **Postal code auto-fill** - 99.6% coverage from Fan Courier + Sameday data
- **FANbox 24-hour cache** - Module-level server cache for performance
- **AWB generation** - From admin panel for both couriers
- **AWB label download** - PDF download endpoint
- **AWB cancellation** - Cancel AWB from admin
- **Tracking timeline** - Real-time tracking display for customer + admin
- **Tracking cron job** - `/api/cron/update-tracking` updates all active shipments

### 7. Document Generation
- **docxtemplater** - DOCX generation with placeholder replacement
- **Auto-generated at submit:** `contract-prestari`, `contract-asistenta`
- **Admin-generated (custom templates):** `imputernicire`, `cerere-eliberare-pf`, `cerere-eliberare-pj`
- **Multi-signature embedding** - Client (drawn) + company + lawyer signatures as DrawingML inline images
- **Signature sizing** - Per-placeholder (client 240x80pt, company/lawyer 180x60pt)
- **Contract v1.2** - CI "emis de" info, 20+ template placeholders
- **CLIENT_DETAILS_BLOCK legal format** - Proper Romanian legal identification format:
  - PF: "NUME, legitimat/a cu CI seria XX nr. XXXXXX, emisa de..., CNP XXXXXXXXXXXXX, cu domiciliul in Str..., Nr..., Localitatea..., Jud..."
  - PJ: firma + CUI + Nr. Reg. Com. + sediu + "reprezentata prin..." cu CI/CNP details ale reprezentantului
- **Contract preview uses updated format** - Live DOCX-to-HTML preview in signature step renders the same legal CLIENT_DETAILS_BLOCK
- **DOCX-to-HTML preview** - Mammoth server-side rendering
- **Document regeneration** - Re-generate button in admin UI
- **S3 upload** - All generated documents uploaded to S3

### 8. Contract Legal Validity
- **Signature metadata** - IP, user agent, server timestamp, SHA-256 document hash
- **Consent tracking** - Law 214/2024, eIDAS Art. 25, OUG 34/2014
- **Withdrawal waiver** - OUG 34/2014 art. 16 lit. (a) mandatory checkbox

### 9. Admin Panel (`/admin`)
- **Dashboard** - Live stats cards, recent orders, activity feed
- **Orders management** - List by status, search, filter, order detail page
- **Order detail** - Personal data (2-col grid), address (3-col grid), billing (PF/PJ), payment info with Stripe link
- **Status workflow** - `paid` -> `processing` -> `documents_generated` -> `submitted_to_institution` -> `document_received` -> `extras_in_progress`/`document_ready` -> `shipped` -> `completed`
- **Processing section** - Contextual action buttons per status
- **Document generation** - Generate/regenerate DOCX, preview, download
- **Documents visible in pending** - No status restriction for viewing documents
- **KYC documents in admin** - Client uploaded CI/selfie visible in order detail
- **AWB management** - Generate, download label, cancel
- **User management** - Employees, customers, invitations tabs
- **Employee invite flow** - Modal, API, accept page with 8 states
- **Settings** - 6 tabs: Services, Couriers, Payments, Date Firma, Template-uri Documente, System
- **Company & Lawyer settings** - Company/lawyer data + signature/stamp PNG upload
- **Custom template upload** - Admin uploads DOCX templates via S3
- **RBAC** - 5 roles (super_admin, manager, operator, contabil, avocat), 7 permissions

### 10. Number Registry (Barou)
- **Number ranges management** - Create/edit ranges for contracts and delegations
- **Registry journal** - All allocations with grouped view (contract + delegation per order on same row)
- **Atomic allocation** - `allocate_number()` RPC with reuse logic
- **Manual entry** - Add entries manually for external documents
- **Void entries** - Mark numbers as void/anulat
- **CSV export** - Flat export for accounting, includes "Document" column with linked filename
- **Backfilled historical entries** - 9 entries from existing order_documents
- **Own page** - Registry now at `/admin/registru` (dedicated sidebar item, no longer settings tab)
- **Document download icons** - FileDown icon in registry table links to download associated document
- **Registry-document linking** - `order_document_id` properly set for reused numbers on regeneration

### 11. Security
- **Rate limiting** - 10 req/min guest, 30 req/min authenticated
- **Audit logging** - Console + DB persistence
- **PII encryption** - AES-256 for CNP, CI serie/numar (migration 007)
- **Row Level Security** - All Supabase tables
- **Input validation** - Zod schemas on all forms and API endpoints
- **RBAC on all admin endpoints** - `requirePermission()` middleware
- **S3 encryption at rest** - SSE-S3 (AES-256), Block Public Access
- **IDOR protection** - Ownership verification on all user endpoints
- **GDPR auto-cleanup** - Draft orders anonymized after 7 days

### 12. Customer-Facing Pages
- **Order status page** (`/comanda/status`) - Public lookup by order number + email
- **Account orders** (`/account/orders/[id]`) - Detailed order view with document downloads
- **Client document downloads** - Presigned S3 URLs for `visible_to_client` documents

---

## Probleme Cunoscute / Necesita Testare (Known Issues / Needs Testing)

### Necesita Testare Reala (New/Fixed - Untested with Real Data)

| Item | Stare | Detalii |
|------|-------|---------|
| **KYC S3 Upload** | New | Documents now upload to S3 at submission instead of just base64 in DB. Needs testing with actual document uploads through the full wizard flow. |
| **KYC Face Matching** | Fixed | `getIDDocument()` type matching and API payload corrected. Needs testing with a real selfie + ID card to verify Gemini comparison works end-to-end. |
| **KYC Thumbnail Previews** | New | Wizard shows thumbnails of uploaded ID documents. Verify rendering on different screen sizes and document orientations. |
| **Registry Own Page** | New | Registry moved from settings tab to `/admin/registru` with sidebar icon. Verify navigation, page load, and all registry features still work. |
| **Registry Document Download** | New | FileDown icon in registry table next to numbers downloads the linked document. Verify icons appear for entries with linked documents and download works. |
| **Registry-Document Linking** | Fixed | `order_document_id` now set correctly for reused numbers when regenerating documents. Verify by regenerating a document and checking registry entry links to correct doc. |
| **CSV Export Document Column** | New | CSV export now includes "Document" column with linked filename. Verify CSV has correct filenames and format. |
| **CLIENT_DETAILS_BLOCK Legal Format** | Enhanced | Rewritten with proper Romanian legal format: PF shows "legitimat/a cu CI seria..., emisa de..., CNP..., cu domiciliul in..." and PJ shows company details + representative with CI. Verify format in generated contracts section 1.2 for both PF and PJ orders. |
| **KYC Confidence Tracking** | New | Each KYC document stores AI confidence (0-100%). Admin order detail shows "Verificare KYC" card with color-coded percentages. Verify confidence appears for CI front, CI back, selfie, and face match. Verify < 70% shows warning. |
| **Contract Preview Legal Format** | Enhanced | Contract preview in wizard signature step now renders the same legal CLIENT_DETAILS_BLOCK format. Verify preview matches generated document format. |
| **Contract v1.2 Content** | Enhanced | CI "emis de" info added, 20+ new placeholders including CLIENT_BIRTH_PLACE and CLIENT_BIRTH_COUNTRY. Verify all placeholders render correctly for PF and PJ orders. |
| **Date Formatting in Docs** | Fixed | Birth date and CI expiry date no longer show time portion in generated documents. Verify dates display as DD.MM.YYYY without HH:MM:SS. |
| **TVA 21% Unified** | Fixed | TVA changed from 19% to 21% and unified across all components including OrderSummaryCard. Verify calculations are consistent everywhere. |
| **Timeline Events** | New | `order_submitted` and `document_generation_failed` events now recorded. Verify events appear in order history after submission and on generation failures. |
| **Status Page Prices** | Fixed | Amounts now display with `.toFixed(2)` for consistent decimal formatting. Verify no floating point artifacts on status page. |
| **OCR Street Prefix Removal** | Fixed | "Strada" prefix stripped to prevent "Strada Salcamilor" duplication. Test with various address formats (Str., Strada, Aleea, Bulevardul). |
| **Admin Billing PF Display** | Fixed | PF billing data was showing empty. Verify it now correctly shows name, CNP, address for PF billing. |
| **Admin Payment Stripe Link** | New | Payment method shows "Stripe (card)" with dashboard link. Verify link opens correct Stripe payment intent page. |
| **User Invite Button** | New | super_admin sees "Adauga Utilizator" button on Users page. Verify invite modal opens, invitation is sent, and accept flow works. |
| **File Input Reset** | Fixed | File input in PersonalDataStep clears after document upload. Verify re-uploading a different document works without page reload. |
| **Signature Card Empty State** | Fixed | Signature step shows proper empty state when no signature drawn. Verify empty state displays and clears correctly. |

### Probleme Cunoscute (Known Issues)

| Item | Severitate | Detalii |
|------|------------|---------|
| **Date formatting in admin** | LOW | Romanian date locale not consistently applied in all admin views. Birth date/expiry fixed in documents, but some admin list views may still need Romanian locale. |
| **Passport UI support** | LOW | OCR backend supports passports, but UI selector in personal-data-step.tsx is not built. |
| **Legacy wizard code** | LOW | Old wizard at `/orders/new` and `order-wizard-provider.tsx` still present. Should be removed. |
| **Google AI DPA** | MEDIUM | Google Gemini Data Processing Agreement not verified for GDPR compliance. |
| **CSP headers** | MEDIUM | Content Security Policy headers not yet configured in `next.config.js`. |
| **CORS restrictions** | MEDIUM | API routes not explicitly CORS-restricted. |
| **2FA for admin** | MEDIUM | TOTP 2FA not yet implemented for admin accounts. |
| **Database backup config** | MEDIUM | Supabase automatic backups not explicitly verified. |

---

## Ce Nu Este Inca Implementat (Backlog / Not Yet Implemented)

### Sprint 6 - Notifications & Polish (Next Up)

| Feature | Prioritate | Detalii |
|---------|-----------|---------|
| **Email notifications** | HIGH | Resend integration. Order confirmation, status change alerts, payment receipt. No email templates exist yet. |
| **SMS notifications** | HIGH | SMSLink.ro integration. Status change SMS to customer phone. API key configured but no implementation. |
| **Oblio invoicing** | HIGH | e-factura compliant invoicing. API credentials not yet configured. Critical for Romanian legal compliance. |
| **Post-order delivery request** | MEDIUM | Client requests courier delivery after choosing "ridicare personala" at checkout. Requires separate Stripe payment for delivery fee. See backlog in `DEVELOPMENT_MASTER_PLAN.md`. |
| **Stripe-Invoice reconciliation** | MEDIUM | Admin view to match Stripe payment intents with Oblio invoices. CSV export for accountant. `stripe_payment_intent_id` partially stored via webhook. |
| **Revenue charts** | MEDIUM | Admin dashboard charts with recharts library. Monthly revenue, orders by service, payment methods breakdown. |
| **Audit logging for admin** | MEDIUM | Log all admin actions (status changes, document generation, user management) to `admin_activity_log` table. |
| **Real-time notifications** | LOW | WebSocket-based in-app notifications. Schema exists (`notifications` table in migration 025) but no UI. |
| **Mobile responsive polish** | LOW | General responsive improvements across all pages. |
| **Date formatting (Romanian locale)** | LOW | Consistent Romanian date formatting in admin panel. |

### Future / Unscheduled

| Feature | Detalii |
|---------|---------|
| **Support notes system** | Internal notes on orders for admin team. |
| **Continue order on behalf** | Admin continues incomplete customer order. |
| **Email templates editor** | Admin editable email templates. |
| **Auto-generate docs at payment** | Webhook triggers document generation automatically on payment success. |
| **CI/CD pipeline** | GitHub Actions for automated testing and deployment. |
| **2FA TOTP for admin** | Two-factor authentication for admin accounts. |
| **Passport UI selector** | UI component for passport upload (OCR backend ready). |
| **Data retention policy** | Formal GDPR data retention documentation. |
| **DPIA (Data Protection Impact Assessment)** | Required GDPR document for processing PII at scale. |
| **Right to Erasure API** | GDPR Art. 17 - customer data deletion endpoint. |
| **Additional services** | 8 remaining services in draft status need full configuration. |
| **Rate limiting on invitations** | Prevent invitation spam. |

---

## Checklist Testare Manuala (Manual Testing Checklist)

### 1. Flux Complet Comanda PF (Personal Fizica)

**Pre-requisite:** Service "Cazier Judiciar PF" active in DB.

```
[ ] 1.1  Navigate to /comanda/cazier-judiciar-persoana-fizica
[ ] 1.2  CONTACT STEP: Enter email, phone, select contact method
         - Verify validation (email format, phone format)
[ ] 1.3  CLIENT TYPE STEP: Select "Persoana Fizica"
[ ] 1.4  PERSONAL DATA STEP:
         - Upload CI (front) -> verify OCR auto-fills CNP, name, address
         - Verify OCR street prefix removal (no "Strada Strada..." duplication)
         - Verify Romanian diacritics handled (Ș, Ț, Î, Â, Ă)
         - Manually correct any OCR errors
         - Verify CNP validation (checksum, length)
[ ] 1.5  KYC DOCUMENTS STEP:
         - Upload CI front (should be pre-filled from personal data step)
         - Upload CI back
         - Verify thumbnail previews display for both
         - Take selfie -> verify face matching result
         - Verify face matching compares against CI photo
[ ] 1.6  OPTIONS STEP:
         - Select service options (urgenta, traducere, apostila)
         - Verify prices update in sidebar
[ ] 1.7  SIGNATURE STEP:
         - View contract preview (DOCX-to-HTML)
         - Draw signature on canvas
         - Accept terms and conditions
         - Verify consent checkboxes (legal references)
[ ] 1.8  DELIVERY STEP:
         - Test "Ridicare personala" (no delivery)
         - Test "Curier la adresa" -> verify address form, postal code auto-fill
         - Test "EasyBox/FANbox" -> verify locker list, distance display
         - Change county -> verify city/street reset
         - Verify delivery prices in sidebar
[ ] 1.9  BILLING STEP:
         - Test "Factureza pe mine" (same person)
         - Test "Alta persoana fizica" (different PF)
         - Test "Persoana juridica" (company with CUI validation)
[ ] 1.10 REVIEW STEP:
         - Verify all data correct (contact, personal, options, delivery, billing)
         - Verify individual option prices displayed
         - Verify TVA 21% calculation correct
         - Verify total = subtotal + TVA + delivery
         - Accept withdrawal waiver checkbox
         - Proceed to payment
[ ] 1.11 PAYMENT:
         - Test Stripe card payment (use test card 4242...)
         - Verify redirect to success page
         - Verify success page shows dynamic processing time
         - Verify success page shows VAT 21% breakdown
[ ] 1.12 POST-PAYMENT:
         - Verify order appears in /account/orders
         - Verify order detail page (/account/orders/[id])
         - Verify KYC documents uploaded to S3 (not just base64)
         - Verify contracts auto-generated (contract-prestari, contract-asistenta)
```

### 2. Admin Vizualizare Comanda

**Pre-requisite:** Admin account with `super_admin` role, at least one paid order.

```
[ ] 2.1  Login as admin, navigate to /admin
[ ] 2.2  DASHBOARD:
         - Verify stats cards (total orders, revenue, pending, today)
         - Verify recent orders list
         - Verify activity feed
[ ] 2.3  ORDERS LIST (/admin/orders):
         - Verify orders appear with correct status badges
         - Test status filter tabs
         - Test search by order number
[ ] 2.4  ORDER DETAIL (/admin/orders/[id]):
         - PERSONAL DATA: Verify 2-col grid layout, all fields populated
         - ADDRESS: Verify 3-col grid layout with separate fields
         - BILLING: Verify PF details show (name, CNP, address) or PJ details (company, CUI)
         - PAYMENT: Verify method shows "Stripe (card)" with Stripe dashboard link
         - OPTIONS: Verify selected options with individual statuses
[ ] 2.5  DOCUMENTS SECTION:
         - Verify documents visible even in pending/paid status
         - Verify auto-generated contracts listed (contract-prestari, contract-asistenta)
         - Test "Descarca" button for each document
         - Test "Preview" button (DOCX-to-HTML)
         - Test "Genereaza" button for custom templates (imputernicire, cerere)
[ ] 2.6  KYC DOCUMENTS:
         - Verify client CI front/back visible
         - Verify selfie visible
         - Verify images load from S3 (presigned URLs)
[ ] 2.7  STATUS WORKFLOW:
         - Test transitioning: paid -> processing -> documents_generated
         - Verify contextual buttons change per status
         - Verify invalid transitions blocked
[ ] 2.8  AWB GENERATION (if delivery order):
         - Test generate AWB (Fan Courier or Sameday)
         - Test download AWB label PDF
         - Test cancel AWB
```

### 3. KYC Document Preview (Wizard + Admin)

```
[ ] 3.1  WIZARD: Upload CI front in personal data step
         - Verify thumbnail shows after upload
         - Verify OCR processes and auto-fills fields
[ ] 3.2  WIZARD: Upload CI back in KYC step
         - Verify thumbnail shows after upload
[ ] 3.3  WIZARD: Take selfie
         - Verify face matching runs against CI photo
         - Verify result feedback (match/no match)
[ ] 3.4  ADMIN: Open order with KYC documents
         - Verify CI front image loads from S3
         - Verify CI back image loads from S3
         - Verify selfie image loads from S3
         - Verify images are not broken/404
```

### 4. Registry Page in Admin

```
[ ] 4.1  Navigate to /admin/registru (own page, sidebar item with BookOpen icon)
[ ] 4.2  RANGES:
         - Verify existing number ranges display
         - Test creating a new range (e.g., contracte 101-200)
         - Test editing a range
[ ] 4.3  JOURNAL (GROUPED VIEW):
         - Verify entries display grouped by order
         - Verify contract + delegation on same row for same order
         - Verify ungrouped entries (manual, standalone) display correctly
[ ] 4.4  MANUAL ENTRY:
         - Test adding a manual registry entry
         - Verify it appears in the journal
[ ] 4.5  VOID:
         - Test voiding an entry
         - Verify "Anulat" status displays
[ ] 4.6  DOCUMENT ICONS:
         - Verify FileDown icon appears next to numbers that have linked documents
         - Test clicking FileDown icon downloads the correct document
         - Verify entries without linked documents show no icon
[ ] 4.7  CSV EXPORT:
         - Test "Export CSV" button
         - Verify CSV is flat (not grouped)
         - Verify all fields present (number, type, order, date, status)
         - Verify "Document" column shows filename for linked documents
```

### 5. Contract Content Verification

```
[ ] 5.1  Create a PF order through the wizard and submit
[ ] 5.2  In admin, generate "contract-prestari" document
         - Verify CLIENT_DETAILS_BLOCK populated (name, CNP, CI serie/nr, emis de, adresa)
         - Verify CI "emis de" field present and correct
         - Verify service-specific content correct
         - Verify client signature embedded
         - Verify company signature embedded
         - Verify lawyer signature embedded
[ ] 5.3  Generate "contract-asistenta" document
         - Verify same client details
         - Verify different contract content
[ ] 5.4  Generate "imputernicire" (if custom template uploaded)
         - Verify template placeholders replaced
         - Verify Number Registry allocation (number assigned)
[ ] 5.5  Preview contract in wizard (signature step)
         - Verify HTML rendering matches template content
         - Verify client details pre-filled
         - Verify pricing information present
```

### 6. Review Step Pricing & TVA

```
[ ] 6.1  Start order for "Cazier Judiciar PF" (base price 250 RON)
[ ] 6.2  Select options:
         - Urgenta (+50 RON)
         - Traducere (+80 RON)
         - Apostila (+100 RON)
[ ] 6.3  Select delivery method:
         - Curier la adresa (check delivery price)
[ ] 6.4  At review step verify:
         - Base service price: 250 RON
         - Each option listed with individual price
         - Subtotal calculated correctly (250 + 50 + 80 + 100 = 480 RON)
         - Delivery fee shown separately
         - TVA 21% calculated on subtotal + delivery
         - Grand total = (subtotal + delivery) * 1.21
[ ] 6.5  After payment, verify success page shows same breakdown with TVA 21%
[ ] 6.6  On order status page (/comanda/status), verify TVA 21% displayed
```

---

## Informatii Tehnice Rapide

### Environment Variables Status

| Variable | Status |
|----------|--------|
| Supabase (URL, Anon Key, Service Role) | Configured |
| AWS S3 (Region, Keys, Bucket) | Configured |
| Stripe (Publishable, Secret, Webhook) | Configured |
| Google AI (Gemini) | Configured |
| Fan Courier (Username, Password, Client ID) | Configured |
| Sameday (Username, Password) | Configured |
| Oblio (Client ID, Secret, CIF, Series) | **NOT CONFIGURED** |
| SMSLink (API Key) | **NOT CONFIGURED** |
| Resend (API Key) | **NOT CONFIGURED** |
| CRON_SECRET | Configured |

### Database Migrations Applied

27 migrations total (001 through 027), all applied. Latest: `027_number_registry.sql`.

### Key File References

| Area | File |
|------|------|
| Main wizard | `src/components/orders/modular-order-wizard.tsx` |
| Wizard state | `src/providers/modular-wizard-provider.tsx` |
| OCR (Gemini 2.5 Flash) | `src/lib/services/document-ocr.ts` |
| KYC (Gemini 2.5 Flash) | `src/lib/services/kyc-validation.ts` |
| Document generator | `src/lib/documents/generator.ts` |
| Signature inserter | `src/lib/documents/signature-inserter.ts` |
| S3 operations | `src/lib/aws/s3.ts` |
| Fan Courier client | `src/lib/services/courier/fancourier.ts` |
| Sameday client | `src/lib/services/courier/sameday.ts` |
| RBAC server | `src/lib/admin/permissions.ts` |
| RBAC client | `src/hooks/use-admin-permissions.tsx` |
| Admin order detail | `src/app/admin/orders/[id]/page.tsx` |
| Admin registry page | `src/app/admin/registru/page.tsx` |
| KYC types (confidence) | `src/types/verification-modules.ts` |
| Admin settings | `src/app/admin/settings/page.tsx` |
| Review step | `src/components/orders/steps-modular/review-step.tsx` |
| Delivery step | `src/components/orders/steps-modular/delivery-step.tsx` |
| Billing step | `src/components/orders/steps-modular/billing-step.tsx` |

---

**Document generat:** 2026-02-19
**Referinta completa:** `docs/DEVELOPMENT_MASTER_PLAN.md`
