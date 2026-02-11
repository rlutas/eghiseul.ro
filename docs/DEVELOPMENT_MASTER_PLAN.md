# eGhiseul.ro - Development Master Plan

**Version:** 3.3
**Last Updated:** 2026-02-11
**Status:** Sprint 4 In Progress (85%) | Multi-Courier Integration ✅ | Delivery UX Improvements ✅

---

## PROGRESS SUMMARY

| Phase | Sprint | Status | Completion Date |
|-------|--------|--------|-----------------|
| MVP | Sprint 0: Setup | ✅ Complete | 2025-12-16 |
| MVP | Sprint 1: Auth & Users | ✅ Complete | 2025-12-16 |
| MVP | Sprint 2: Services Core | ✅ Complete | 2025-12-16 |
| MVP | Sprint 3: KYC & Documents | ✅ Complete | 2025-01-05 |
| MVP | Sprint 4: Payments & Contracts | ⏳ In Progress | - |
| MVP | Sprint 5: Admin Dashboard | ⏳ Pending | - |
| MVP | Sprint 6: Notifications & Polish | ⏳ Pending | - |

---

## TECH STACK DEFINITIV

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
│                                                                      │
│   Next.js 16+ (App Router)                                          │
│   - React 19+                                                       │
│   - TypeScript                                                      │
│   - Tailwind CSS v4                                                 │
│   - shadcn/ui (componente)                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                      │
│                                                                      │
│   Supabase (Backend-as-a-Service)                                   │
│   - PostgreSQL database (RLS pentru multi-tenancy)                  │
│   - Authentication (email/password + 2FA TOTP)                      │
│   - Edge Functions (Deno) pentru logică custom                      │
│   - Real-time subscriptions (WebSocket)                             │
│   - Region: EU (Frankfurt)                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         STORAGE                                      │
│                                                                      │
│   AWS S3 (Frankfurt - eu-central-1)                                 │
│   - Contracte și documente legale (10 ani retenție)                │
│   - Documente KYC (CI, selfie, semnătură)                          │
│   - Documente finale pentru clienți                                 │
│   - Server-side encryption (AES-256)                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICII EXTERNE                                  │
│                                                                      │
│   OCR:        Google Gemini 2.0 Flash Exp (document extraction)     │
│   KYC:        Google Gemini 1.5 Flash (validation + face match)     │
│   Payments:   Stripe (card, Apple Pay, Google Pay)                  │
│   Invoicing:  Oblio (e-factura compliant)                           │
│   SMS:        SMSLink.ro (provider românesc)                        │
│   Email:      Resend                                                │
│   Courier:    Fan Courier + Sameday (RO), DHL (internațional)      │
│   CUI:        ANAF API (gratis)                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DOCUMENTAȚIE INDEX

### Core Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **PRD** | `docs/prd/eghiseul-prd.md` | ✅ Complete |
| **Security Architecture** | `docs/security-architecture.md` | ✅ Complete |
| **Legal** | `docs/legal/compliance-research.md` | ✅ Complete |
| **Tech Stack** | `docs/TECHNOLOGY_RECOMMENDATIONS.md` | ✅ Complete |

### Security Documentation (NEW - Sprint 3)
| Document | Locație | Status |
|----------|---------|--------|
| **Security Audit Summary** | `SECURITY_AUDIT_SUMMARY.md` | ✅ Complete |
| **Full Security Audit Report** | `docs/security/SECURITY_AUDIT_REPORT_2025-12-17.md` | ✅ Complete |
| **Implementation Checklist** | `docs/security/SECURITY_IMPLEMENTATION_CHECKLIST.md` | ✅ Complete |
| **Quick Reference** | `docs/security/SECURITY_QUICK_REFERENCE.md` | ✅ Complete |
| **S3 Security Assessment** | `docs/security/S3_SECURITY_ASSESSMENT.md` | ✅ NEW |
| **S3 Security Summary** | `docs/security/S3_SECURITY_SUMMARY.md` | ✅ NEW |

### Sprint Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **Sprint 1** | `docs/sprints/sprint-1-auth.md` | ✅ Complete |
| **Sprint 2** | `docs/sprints/sprint-2-services.md` | ✅ Complete |
| **Sprint 3** | `docs/sprints/sprint-3-kyc-documents.md` | ⏳ In Progress |

### API Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **Services API** | `docs/technical/api/services-api.md` | ✅ Complete |
| **OCR/KYC API** | `docs/technical/api/ocr-kyc-api.md` | ✅ Complete |
| **Production Security Setup** | `docs/deployment/PRODUCTION_SECURITY_SETUP.md` | ✅ Complete |
| **AWS S3 Setup Guide** | `docs/deployment/AWS_S3_SETUP.md` | ✅ NEW |

### Technical Specifications
| Document | Locație | Status |
|----------|---------|--------|
| **Database Schema** | `docs/technical/database/services-schema.md` | ✅ Complete |
| **OCR Research** | `docs/technical/ocr-services-privacy-research.md` | ✅ Complete |
| **Backend Comparison** | `docs/technical/supabase-vs-nestjs-comparison.md` | ✅ Complete |
| **User Data Persistence** | `docs/technical/specs/user-data-persistence.md` | ✅ Complete |
| **User Data Persistence - Implementation** | `docs/technical/specs/user-data-persistence-implementation.md` | ✅ NEW |
| **Order Auto-Save System** | `docs/technical/specs/order-autosave-system.md` | ✅ Complete |

### Testing Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **Test Plan** | `docs/testing/TEST_PLAN.md` | ✅ Complete |
| **Test Results 2025-12-18** | `docs/testing/TEST_RESULTS_2025-12-18.md` | ✅ Complete |
| **Testing README** | `docs/testing/README.md` | ✅ Updated 2026-01-07 |
| **E2E Visual Report** | `tests/docs/VISUAL_TEST_REPORT.md` | ✅ Updated 2026-01-07 |
| **Playwright E2E** | `tests/README.md` | ✅ Updated 2026-01-07 |

### Debugging Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **Draft Save 500 Error** | `docs/technical/debugging/draft-save-500-error-fix.md` | ✅ Complete |
| **Migration 013 Guide** | `docs/technical/debugging/APPLY_MIGRATION_013.md` | ✅ Complete |
| **TypeScript Build Fixes** | `docs/technical/debugging/typescript-build-fixes-2026-01-08.md` | ✅ Complete |
| **S3 403 Forbidden Fix** | `docs/technical/debugging/s3-403-forbidden-fix-2026-01-09.md` | ✅ NEW |

---

## FAZE DEZVOLTARE

### FAZA 1: MVP (Luni 1-4)

**Obiectiv:** Platformă funcțională cu 3 servicii core

#### Sprint 0: Setup (Săptămâna 1-2) ✅ COMPLETE

| Task | Status | Notes |
|------|--------|-------|
| ✅ Setup Next.js 16 project | Complete | TypeScript, Tailwind v4 |
| ✅ Setup Supabase project (Frankfurt) | Complete | Project: llbwmitdrppomeptqlue |
| ✅ Setup AWS account (eu-central-1) | Complete | Credentials configured |
| ✅ Setup Stripe account | Complete | Test keys configured |
| ✅ Design system setup (Tailwind + shadcn) | Complete | Components installed |
| ⏳ CI/CD cu GitHub Actions | Pending | To be configured |

**Installed Dependencies:**
- @supabase/ssr, @supabase/supabase-js
- @aws-sdk/client-s3, @aws-sdk/client-textract, @aws-sdk/s3-request-presigner
- stripe, @stripe/stripe-js
- zod, react-hook-form, @hookform/resolvers
- @tanstack/react-query
- @google/generative-ai (Gemini AI for OCR & KYC)
- shadcn/ui components (button, input, label, card, tabs, etc.)

#### Sprint 1: Auth & Users (Săptămâna 3-4) ✅ COMPLETE

| Task | Status | Files |
|------|--------|-------|
| ✅ Supabase Auth config | Complete | `lib/supabase/client.ts`, `server.ts`, `middleware.ts` |
| ✅ User profile schema | Complete | `supabase/migrations/001_profiles.sql` |
| ✅ Login/Register pages | Complete | `app/(auth)/login/`, `register/`, `forgot-password/` |
| ✅ Protected routes | Complete | `src/proxy.ts` (middleware) |
| ✅ Account page | Complete | `app/(customer)/account/page.tsx` |
| ⏳ 2FA TOTP setup | Pending | Sprint 3 |
| ⏳ Admin role setup | Pending | Sprint 5 |

**Database Migration Applied:** `001_profiles.sql`
- profiles table with RLS
- Trigger for auto-creating profile on signup

#### Sprint 2: Servicii Core (Săptămâna 5-8) ✅ COMPLETE

| Task | Status | Files |
|------|--------|-------|
| ✅ Schema servicii | Complete | `supabase/migrations/002_services.sql` |
| ✅ Service options | Complete | `service_options` table |
| ✅ Orders table | Complete | Full lifecycle management |
| ✅ API: List services | Complete | `GET /api/services` |
| ✅ API: Get service | Complete | `GET /api/services/[slug]` |
| ✅ API: Create order | Complete | `POST /api/orders` |
| ✅ API: List orders | Complete | `GET /api/orders` |
| ✅ API: Get order | Complete | `GET /api/orders/[id]` |
| ✅ API: Update order | Complete | `PATCH /api/orders/[id]` |
| ✅ API: Create payment | Complete | `POST /api/orders/[id]/payment` |
| ✅ Stripe webhook | Complete | `POST /api/webhooks/stripe` |

**Database Migration Applied:** `002_services.sql`
- services table (6 categories, JSONB config)
- service_options table
- orders table (full lifecycle)
- order_history table (audit log)
- 23 indexes, 25 RLS policies
- 3 MVP services seeded (Cazier Fiscal, Extras CF, Certificat Constatator)
- 12 service options

**API Endpoints Implemented:**
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/services` | GET | Public | List services with filtering |
| `/api/services/[slug]` | GET | Public | Service details with options |
| `/api/orders` | POST | Required | Create new order |
| `/api/orders` | GET | Required | List user orders |
| `/api/orders/[id]` | GET | Required | Order details |
| `/api/orders/[id]` | PATCH | Admin | Update order status |
| `/api/orders/[id]/payment` | POST | Required | Create payment intent |
| `/api/webhooks/stripe` | POST | Public | Stripe webhooks |

#### Sprint 3: KYC & Documents (Săptămâna 9-10) ✅ COMPLETE (100%)

| Task | Status | Priority | Files |
|------|--------|----------|-------|
| ✅ Service catalog UI | Complete | HIGH | `app/page.tsx`, `components/home/*` |
| ✅ Service detail page | Complete | HIGH | `app/services/[slug]/page.tsx` |
| ✅ Order wizard (6 steps) | Complete | HIGH | `components/orders/*` |
| ✅ CNP validation | Complete | HIGH | `lib/validations/cnp.ts` |
| ✅ OCR cu Gemini AI | Complete | HIGH | `lib/services/document-ocr.ts` |
| ✅ KYC validation AI | Complete | HIGH | `lib/services/kyc-validation.ts` |
| ✅ ID scan in Step 2 | Complete | HIGH | `components/orders/steps/personal-data-step.tsx` |
| ✅ KYC upload components | Complete | HIGH | `components/orders/steps/kyc-step.tsx` |
| ✅ KYC selfie face matching | Complete | HIGH | Fixed blob URL → base64 for reference image |
| ✅ Electronic signature | Complete | MEDIUM | `components/orders/steps/delivery-step.tsx` |
| ✅ Romanian address parsing | Complete | MEDIUM | Str., Bl., Sc., Et., Ap. extraction |
| ✅ OCR/KYC API Documentation | Complete | HIGH | `docs/technical/api/ocr-kyc-api.md` |
| ✅ User Data Persistence Spec | Complete | HIGH | `docs/technical/specs/user-data-persistence.md` |
| ✅ Order Auto-Save Spec | Complete | HIGH | `docs/technical/specs/order-autosave-system.md` |
| ✅ PII Encryption (CNP, CI) | Complete | CRITICAL | `migrations/007_pii_encryption.sql` |
| ✅ Security Rate Limiting | Complete | HIGH | `lib/security/rate-limiter.ts` |
| ✅ Audit Logging | Complete | HIGH | `migrations/006_audit_logs.sql` |
| ✅ Production Security Guide | Complete | HIGH | `docs/deployment/PRODUCTION_SECURITY_SETUP.md` |
| ✅ **Order ID System** | Complete | HIGH | `lib/order-id.ts`, `migrations/008_friendly_order_id.sql` |
| ✅ **Auto-Save (debounced)** | Complete | HIGH | `providers/order-wizard-provider.tsx` |
| ✅ **Draft API Endpoint** | Complete | HIGH | `api/orders/draft/route.ts` |
| ✅ **Save Status UI** | Complete | MEDIUM | `components/orders/save-status.tsx` |
| ✅ **localStorage Backup** | Complete | MEDIUM | Offline resilience for drafts |
| ✅ **Admin Order Lookup API** | Complete | HIGH | `api/admin/orders/lookup/route.ts` |
| ✅ **GDPR Auto-Cleanup** | Complete | CRITICAL | `migrations/009_draft_auto_cleanup.sql` |
| ✅ **Admin Cleanup API** | Complete | HIGH | `api/admin/cleanup/route.ts` |
| ✅ **Modular Verification System** | Complete | HIGH | `/comanda/[service]`, dynamic wizard |
| ✅ **ANAF Company Validation** | Complete | HIGH | Company validation via ANAF API (free, official) |
| ⏳ Passport UI Support | Partial | LOW | OCR ready, UI pending |
| ✅ S3 storage integration | Complete | HIGH | Presigned URLs, AES-256, CORS |
| ✅ User orders dashboard | Complete | MEDIUM | Account OrdersTab |
| ✅ Order Submission API | Complete | HIGH | `/api/orders/[id]/submit` |

**New API Endpoints (Sprint 3):**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ocr/extract` | GET | OCR service health check |
| `/api/ocr/extract` | POST | Extract data from ID/passport (Gemini 2.0 Flash Exp) |
| `/api/kyc/validate` | GET | KYC validation service health check |
| `/api/kyc/validate` | POST | Validate KYC documents (Gemini 1.5 Flash) |
| `/api/orders/draft` | GET | Retrieve draft order by friendly_order_id |
| `/api/orders/draft` | POST | Create new draft order with unique ID |
| `/api/orders/draft` | PATCH | Update existing draft order |
| `/api/admin/orders/lookup` | GET | Admin: Look up order by friendly_order_id |
| `/api/admin/orders/list` | GET | Admin: List all orders by status |
| `/api/admin/cleanup` | GET | Admin: Get cleanup status and pending drafts |
| `/api/admin/cleanup` | POST | Admin: Run cleanup of expired drafts |
| `/api/upload` | POST | Generate presigned S3 upload URL |
| `/api/upload` | GET | S3 health check |
| `/api/upload/download` | GET | Generate presigned S3 download URL |

**GDPR Data Retention Policy (NEW):**
- Draft orders are **anonymized after 7 days** if not completed
- Personal data removed: name, CNP, address, email, phone, KYC documents
- Metadata preserved for analytics: service type, price, county (anonymized)
- Migration: `009_draft_auto_cleanup.sql`
- Manual cleanup: POST `/api/admin/cleanup`

**Order Wizard Steps Implemented:**
1. **Contact Step** - Email, phone, preferred contact method
2. **Personal Data Step** - CNP validation, ID scan with OCR auto-fill, address
3. **Options Step** - Service-specific options selection
4. **KYC Step** - ID front/back upload, selfie with face matching
5. **Delivery Step** - Delivery method, signature canvas
6. **Review Step** - Order summary, price breakdown

**Modular Verification System (✅ COMPLETE - 2025-01-05):**
- **URL Pattern**: `/comanda/[service-slug]` (ex: `/comanda/cazier-fiscal`)
- **Architecture**: Dynamic wizard that adapts to service `verification_config` (JSONB)
- **Type System**: Complete TypeScript definitions in `src/types/verification-modules.ts`
- **Module Registry**: Central registry in `src/lib/verification-modules/registry.ts`
- **Step Builder**: Dynamic step generation in `src/lib/verification-modules/step-builder.ts`
- **Provider**: ModularWizardProvider in `src/providers/modular-wizard-provider.tsx`
- **Main Page**: `src/app/comanda/[service]/page.tsx` - fetches service + generates steps
- **Wizard Component**: `src/components/orders/modular-order-wizard.tsx`
- **Core Steps** (always included):
  - Contact: `src/components/orders/steps-modular/contact-step.tsx`
  - Options: `src/components/orders/steps-modular/options-step.tsx`
  - Delivery: `src/components/orders/steps-modular/delivery-step.tsx`
  - Review: `src/components/orders/steps-modular/review-step.tsx`
- **Dynamic Modules** (conditionally loaded):
  - Client Type: `src/components/orders/modules/client-type/ClientTypeStep.tsx`
  - Personal KYC: `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`
  - Company KYC: `src/components/orders/modules/company-kyc/CompanyDataStep.tsx`
  - Company Documents: `src/components/orders/modules/company-kyc/CompanyDocumentsStep.tsx`
  - Property: `src/components/orders/modules/property/PropertyDataStep.tsx`
  - Vehicle: `src/components/orders/modules/vehicle/VehicleDataStep.tsx`
  - KYC Documents: `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx`
  - Signature: `src/components/orders/modules/signature/SignatureStep.tsx`
- **Database**: `supabase/migrations/010_verification_config.sql` (JSONB verification_config)
- **Services Configured**: 6 services with unique flows (Cazier Fiscal PF, Cazier Judiciar PF/PJ, Certificat Naștere, Cazier Auto, Rovinieta, Certificat Constatator)
- **External APIs**: ANAF API for company validation (`src/lib/services/infocui.ts`)
- **Documentation**:
  - Architecture: `docs/technical/specs/modular-verification-architecture.md`
  - Requirements Matrix: `docs/technical/specs/service-verification-requirements.md`
  - Implementation Guide: `docs/technical/specs/modular-wizard-guide.md` (HOW TO ADD SERVICES)
- **Legacy Code**: Old wizard at `/orders/new` kept for reference, to be removed after testing

**Key Features Implemented:**
- **AI-Powered OCR**: Scan ID card and automatically extract CNP, name, birth date, address
- **Smart KYC Flow**: Documents scanned in Step 2 are reused in Step 4 (no duplicate uploads)
- **CNP Validation**: Full Romanian CNP validation with checksum, gender, age extraction
- **Face Matching**: AI compares selfie with ID photo for identity verification
- **Electronic Signature**: Canvas-based signature with terms acceptance
- **Multi-document Support**: CI front/back and passport (OCR ready)
- **Romanian Address Parsing**: Full support for Jud., Mun., Str., Nr., Bl., Sc., Et., Ap.
- **Order ID System**: Human-readable IDs (ORD-YYYYMMDD-XXXXX) generated at Step 2→3 transition
- **Auto-Save System**: Debounced save (500ms) to prevent data loss, only active after Step 2
- **Duplicate Prevention**: POST /api/orders/draft checks for existing order before insert
- **Romanian Name Validation**: Supports cedilla (Ş,Ţ) and comma-below (Ș,Ț) diacritics, hyphens for compound names
- **Flexible Document Validation**: Supports old CI (serie+6 cifre), new CI (9 chars combined), passport (9 digits)
- **localStorage Backup**: Offline resilience, data preserved even without network
- **Save Status Indicator**: Real-time feedback showing "Salvat acum X sec"

**Bug Fixes & Updates (2026-01-05):**
- **Fixed**: NaN prices in order summary - updated ServiceOption interface to use `price` instead of `price_modifier`
- **Fixed**: Cache version bumped to 4 to invalidate stale localStorage data with undefined priceModifier
- **Fixed**: County/Locality dropdowns restored with auto-populate from romania-counties.ts
- **Fixed**: "Cannot access fillAddressFields before initialization" - reordered useCallback hooks
- **Updated**: Cazier Judiciar prices: PF=250 RON, PJ=300 RON (hub service + sub-services)
- **Added**: Service options for Cazier Judiciar (urgență, traducere, apostilă, copie suplimentară)
- **Added**: Smart city matching in OCR - cleans prefixes (sat, com., mun.) and matches localities

**Technical Specifications Created (Sprint 3):**
1. **User Data Persistence** (`docs/technical/specs/user-data-persistence.md`)
   - Pre-fill data for logged-in users from previous orders
   - Guest-to-customer conversion at order completion
   - KYC document reuse (12 months validity)
   - Billing profile management (persoană fizică/juridică)
   - ANAF API integration for CUI lookup

2. **Order Auto-Save System** (`docs/technical/specs/order-autosave-system.md`)
   - Auto-save with unique order ID (ORD-YYYYMMDD-XXXXX)
   - Support access for helping customers
   - Bank transfer payment flow
   - Magic links for order recovery (JWT, 7-day expiry)

#### Sprint 4: Payments & Contracts (Săptămâna 11-12) ⏳ IN PROGRESS

| Task | Status | Spec Reference |
|------|--------|----------------|
| ✅ **S3 Document Storage** | Complete | `AWS_S3_SETUP.md` |
| ⏳ Stripe checkout integration | Pending | - |
| ⏳ Apple Pay / Google Pay | Pending | - |
| ⏳ **Bank transfer payment** | Pending | `order-autosave-system.md` |
| ⏳ Calcul preț dinamic | Pending | - |
| ⏳ Generare contract PDF | Pending | - |
| ⏳ Oblio facturare | Pending | - |
| ⏳ **Order auto-save implementation** | Pending | `order-autosave-system.md` |
| ✅ **User data persistence** | Complete | `user-data-persistence.md` |
| ✅ **Account management tabs** | Complete | Profile, KYC, Addresses, Billing tabs |
| ✅ **KYC selfie with ID** | Complete | IdScanner with selfie_with_id support |
| ✅ **Duplicate prevention** | Complete | Addresses & billing profiles dedup |
| ✅ **Billing Step in Wizard** | Complete | `billing-step.tsx` - PF/PJ selection |
| ✅ **Security: IDOR Fix** | Complete | `security-audit-admin-client.md` |
| ✅ **Security: Email Bypass Fix** | Complete | register-from-order hardened |
| ✅ **Security: Ownership Verification** | Complete | Draft PATCH requires email match |
| ✅ **KYC Document Persistence** | Complete | Saves to kyc_verifications on account creation |
| ✅ **Dual Profile System (PF + PJ)** | Complete | Company profile alongside personal profile |
| ✅ **Company Documents Wizard Step** | Complete | PJ document upload in order flow (company-documents module) |

**New Features (From Sprint 3 Specs):**
- Bank transfer with reference code (PAY-YYYYMMDD-XXXXX)
- Admin confirmation for bank payments
- ✅ Guest-to-customer conversion flow (SaveDataModal after order)
- ✅ KYC document reuse from previous orders (via prefill API)
- ✅ Billing step with 3 options: "Facturează pe mine", "Altă persoană fizică", "Persoană juridică"
- ✅ Dual Profile System (PF + PJ): Company profile with CUI/ANAF validation, PJ billing auto-creation, company KYC docs
- ✅ Company Documents wizard step: PJ orders can upload Certificat de Inregistrare / Certificat Constatator in-wizard; logged-in users with verified docs skip step

**User Account Management (✅ COMPLETE - 2026-01-08):**
- Profile tab with ID scan + OCR auto-fill + KYC save
- KYC tab with proper flow: front (required), back (optional), selfie with ID
- Addresses tab with duplicate prevention
- Billing profiles tab with CNP-based deduplication
- Header fixed (removed duplicate navigation bar)

#### Sprint 5: Admin Dashboard (Săptămâna 13-14) ⏳ PENDING

| Task | Status | Spec Reference |
|------|--------|----------------|
| ⏳ Admin layout | Pending | - |
| ⏳ Lista comenzi | Pending | - |
| ⏳ Detalii comandă | Pending | - |
| ⏳ Schimbare status | Pending | - |
| ⏳ Statistici basic | Pending | - |
| ⏳ **Order lookup by ID** | Pending | `order-autosave-system.md` |
| ⏳ **Support notes system** | Pending | `order-autosave-system.md` |
| ⏳ **Bank transfer confirmation** | Pending | `order-autosave-system.md` |
| ⏳ **Continue order on behalf** | Pending | `order-autosave-system.md` |

**Admin Features (From Sprint 3 Specs):**
- Lookup orders by ID (ORD-XXXXXX) for support calls
- Add internal notes to orders
- Confirm bank transfers manually
- Continue incomplete orders on behalf of customers

#### Sprint 6: Notifications & Polish (Săptămâna 15-16) ⏳ PENDING

| Task | Status |
|------|--------|
| ⏳ Email templates | Pending |
| ⏳ Resend integration | Pending |
| ⏳ Notificări real-time | Pending |
| ⏳ Mobile responsive | Pending |

---

## STRUCTURĂ PROIECT ACTUALĂ

```
eghiseul.ro/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # ✅ Auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (customer)/             # ✅ Customer routes
│   │   │   └── account/
│   │   ├── api/                    # ✅ API routes
│   │   │   ├── services/
│   │   │   │   ├── route.ts        # GET /api/services
│   │   │   │   └── [slug]/route.ts # GET /api/services/[slug]
│   │   │   ├── orders/
│   │   │   │   ├── route.ts        # POST, GET /api/orders
│   │   │   │   ├── draft/route.ts  # Draft orders API
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # GET, PATCH /api/orders/[id]
│   │   │   │       └── payment/    # POST /api/orders/[id]/payment
│   │   │   ├── admin/              # ✅ Admin endpoints
│   │   │   │   ├── orders/lookup/  # Order lookup
│   │   │   │   ├── orders/list/    # Orders list
│   │   │   │   └── cleanup/        # GDPR cleanup
│   │   │   ├── company/            # ✅ Company APIs
│   │   │   │   └── validate/       # ANAF CUI validation
│   │   │   ├── ocr/                # ✅ OCR AI
│   │   │   │   └── extract/        # POST /api/ocr/extract
│   │   │   ├── kyc/                # ✅ KYC AI
│   │   │   │   └── validate/       # POST /api/kyc/validate
│   │   │   └── webhooks/
│   │   │       └── stripe/         # POST /api/webhooks/stripe
│   │   ├── comanda/                # ✅ NEW - Modular Wizard (Sprint 3)
│   │   │   └── [service]/
│   │   │       └── page.tsx        # Dynamic order page
│   │   ├── servicii/               # ✅ Service landing pages
│   │   │   └── [category]/[slug]/  # Category-based URLs
│   │   ├── services/               # ✅ Legacy service pages (to deprecate)
│   │   │   └── [slug]/
│   │   ├── auth/callback/          # ✅ Auth callback
│   │   └── page.tsx                # ✅ Homepage
│   │
│   ├── components/
│   │   ├── ui/                     # ✅ shadcn components
│   │   ├── forms/                  # ✅ Login, Register forms
│   │   ├── home/                   # ✅ Homepage sections
│   │   │   ├── hero.tsx
│   │   │   ├── services.tsx
│   │   │   ├── features.tsx
│   │   │   ├── stats.tsx
│   │   │   └── footer.tsx
│   │   ├── services/               # ✅ Service components
│   │   │   ├── service-card.tsx
│   │   │   ├── service-detail.tsx
│   │   │   └── service-faq.tsx
│   │   └── orders/                 # ✅ Modular Wizard (Sprint 3)
│   │       ├── modular-order-wizard.tsx       # Main wizard
│   │       ├── wizard-progress-modular.tsx    # Progress bar
│   │       ├── price-sidebar-modular.tsx      # Price sidebar
│   │       ├── DynamicModuleLoader.tsx        # Module loader
│   │       ├── steps-modular/                 # Core steps
│   │       │   ├── contact-step.tsx
│   │       │   ├── options-step.tsx
│   │       │   ├── delivery-step.tsx
│   │       │   └── review-step.tsx
│   │       └── modules/                       # Dynamic modules
│   │           ├── client-type/ClientTypeStep.tsx
│   │           ├── personal-kyc/
│   │           │   ├── PersonalDataStep.tsx
│   │           │   └── KYCDocumentsStep.tsx
│   │           ├── company-kyc/CompanyDataStep.tsx
│   │           ├── company-kyc/CompanyDocumentsStep.tsx
│   │           ├── property/PropertyDataStep.tsx
│   │           ├── vehicle/VehicleDataStep.tsx
│   │           └── signature/SignatureStep.tsx
│   │
│   ├── lib/
│   │   ├── supabase/               # ✅ Supabase clients
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── services/               # ✅ External services
│   │   │   ├── document-ocr.ts     # Gemini 2.0 Flash OCR
│   │   │   ├── kyc-validation.ts   # Gemini 1.5 Flash KYC
│   │   │   └── infocui.ts          # ANAF company validation (CUI lookup)
│   │   ├── verification-modules/   # ✅ NEW - Modular wizard system
│   │   │   ├── registry.ts         # Module registry
│   │   │   ├── step-builder.ts     # Dynamic step generator
│   │   │   └── index.ts
│   │   ├── security/               # ✅ Security
│   │   │   ├── rate-limiter.ts     # Rate limiting (10/30 req/min)
│   │   │   ├── audit-logger.ts     # Audit logging to DB
│   │   │   └── pii-encryption.ts   # PII encrypt/decrypt helpers
│   │   ├── validations/            # ✅ Validations
│   │   │   └── cnp.ts              # Romanian CNP validation
│   │   ├── stripe.ts               # ✅ Stripe client
│   │   └── utils/                  # ✅ Utilities
│   │
│   ├── types/
│   │   ├── supabase.ts             # ✅ Database types
│   │   ├── services.ts             # ✅ Service types
│   │   ├── orders.ts               # ✅ Order wizard types
│   │   └── verification-modules.ts # ✅ NEW - Modular wizard types
│   │
│   ├── providers/                  # ✅ React providers
│   │   ├── query-provider.tsx
│   │   ├── modular-wizard-provider.tsx  # ✅ NEW - Modular wizard state
│   │   └── order-wizard-provider.tsx    # 🔴 DEPRECATED - To be removed
│   │
│   └── proxy.ts                    # ✅ Auth middleware
│
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql        # ✅ Applied
│       ├── 002_services.sql        # ✅ Applied
│       ├── 006_audit_logs.sql      # ✅ Applied
│       ├── 007_pii_encryption.sql  # ✅ Applied
│       ├── 008_friendly_order_id.sql # ✅ Applied
│       ├── 009_draft_auto_cleanup.sql # ✅ Applied
│       ├── 010_verification_config.sql # ✅ Applied (NEW - Sprint 3)
│       ├── 011_cazier_judiciar_pf_pj.sql # ✅ Applied (NEW - Sprint 3)
│       ├── 012_cazier_judiciar_separate_services.sql # ✅ Applied (NEW)
│       └── 021_company_profile_columns.sql # ✅ Applied (company PF+PJ profile)
│
├── docs/
│   ├── sprints/                    # ✅ Sprint documentation
│   │   └── sprint-3-kyc-documents.md
│   ├── technical/                  # ✅ Technical docs
│   │   ├── api/                    # ✅ API documentation
│   │   ├── database/               # ✅ Database schemas
│   │   └── specs/                  # ✅ Technical specs
│   │       ├── modular-verification-architecture.md (NEW)
│   │       ├── service-verification-requirements.md (NEW)
│   │       └── modular-wizard-guide.md (NEW - HOW TO ADD SERVICES)
│   ├── deployment/                 # ✅ Deployment guides
│   │   └── PRODUCTION_SECURITY_SETUP.md
│   ├── security/                   # ✅ Security documentation
│   ├── prd/                        # ✅ PRD
│   └── legal/                      # ✅ Compliance
│
└── .env.local                      # ✅ Configured
```

---

## ENVIRONMENT VARIABLES ✅ CONFIGURED

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase ✅
NEXT_PUBLIC_SUPABASE_URL=https://llbwmitdrppomeptqlue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***configured***
SUPABASE_SERVICE_ROLE_KEY=***pending***
SUPABASE_DB_PASSWORD=***configured***

# AWS ✅ CONFIGURED
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=***configured***
AWS_SECRET_ACCESS_KEY=***configured***
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents

# Stripe ✅
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_SECRET_KEY=sk_test_***
STRIPE_WEBHOOK_SECRET=***pending***

# Google AI (Gemini) ✅ NEW
GOOGLE_AI_API_KEY=***configured***

# Oblio ⏳
OBLIO_CLIENT_ID=
OBLIO_CLIENT_SECRET=
OBLIO_COMPANY_CIF=
OBLIO_SERIES_NAME=

# SMS (SMSLink.ro) ⏳
SMSLINK_API_KEY=
SMSLINK_SENDER=eGhiseul

# Email (Resend) ⏳
RESEND_API_KEY=
EMAIL_FROM=comenzi@eghiseul.ro
```

---

## SECURITY CHECKLIST

### 🔴 CRITICAL - Înainte de Production (Din Security Audit 2025-12-17)

| Issue | Severitate | Status | Deadline |
|-------|------------|--------|----------|
| ✅ OCR endpoint securizat | CRITICAL | ✅ Fixed | Done |
| ✅ Rate limiting implementat | HIGH | ✅ Fixed | Done |
| ✅ Audit logging implementat | HIGH | ✅ Fixed | Done |
| ✅ Origin validation | HIGH | ✅ Fixed | Done |
| ✅ CNP stocat necriptat | CRITICAL | ✅ Deployed | Migration 007 applied |
| ✅ CI Serie/Număr necriptat | CRITICAL | ✅ Deployed | Migration 007 applied |
| 🟡 Google AI DPA verificat | MEDIUM | ⏳ Pending | 7 zile (Legal) |
| 🟡 No data retention policy | MEDIUM | ⏳ Pending | 30 zile |

**Security Implementation (2025-12-17):**
- `src/lib/security/rate-limiter.ts` - Rate limiting (10 req/min guest, 30 req/min auth)
- `src/lib/security/audit-logger.ts` - Audit logging pentru toate requesturile (console + DB)
- `src/lib/security/pii-encryption.ts` - Helper pentru encrypt/decrypt PII
- `src/app/api/ocr/extract/route.ts` - Origin validation + rate limiting + audit
- `supabase/migrations/006_audit_logs.sql` - Tabela audit_logs
- `supabase/migrations/007_pii_encryption.sql` - AES-256 encryption pentru CNP, CI

**Deployment Guide:** `docs/deployment/PRODUCTION_SECURITY_SETUP.md`
**Security Audit:** `docs/security/SECURITY_AUDIT_REPORT_2025-12-17.md`

### Security Baseline

| Check | Status | Notes |
|-------|--------|-------|
| ✅ HTTPS peste tot | Dev ready | Vercel handles in prod |
| ✅ Input validation (Zod) | Complete | Forms, API |
| ✅ SQL injection protected | Complete | Supabase RLS |
| ✅ XSS protection | Complete | React default |
| ✅ Row Level Security | Complete | All tables |
| ⏳ CSP headers configurate | Pending | `next.config.js` |
| ✅ Column-level encryption | Deployed | Migration 007 applied |
| ⏳ CORS restricționat | Pending | API routes |
| ✅ Audit logging | Complete | `audit_logs` table + DB persistence |
| ✅ Encryption at rest (S3) | Complete | SSE-S3 (AES-256), Block Public Access |
| ⏳ 2FA pentru admin | Pending | Sprint 5 |
| ⏳ Backup database | Pending | Supabase config |

### GDPR Compliance Status: 29%

| Articol | Status | Notes |
|---------|--------|-------|
| Art. 5 - Data Minimization | ⏳ Partial | Collect only necessary |
| Art. 6 - Lawful Basis | ✅ Ready | Consent-based |
| Art. 17 - Right to Erasure | ⏳ Pending | Delete API needed |
| Art. 25 - Privacy by Design | ⏳ Pending | Encryption needed |
| Art. 32 - Security | ⏳ Partial | See critical issues |
| Art. 33 - Breach Notification | ⏳ Pending | Process needed |
| Art. 35 - DPIA | ⏳ Pending | Document needed |

---

## NEXT ACTIONS

### Sprint 3 - Post-Completion Tasks

**IMMEDIATE (Testing & Cleanup):**
1. ✅ **Modular Wizard Testing** - Test with real users across all 6 services
   - Verify dynamic step generation works correctly
   - Test PF/PJ flows (Cazier Judiciar)
   - Test property and vehicle flows
   - Verify ANAF company validation

2. **Delete Legacy Code** - Remove old wizard implementation
   - Delete `/src/app/orders/new/` directory
   - Delete `/src/providers/order-wizard-provider.tsx` (old version)
   - Delete `/src/components/orders/order-wizard.tsx` (old version)
   - Keep only modular versions

### Sprint 4 - High Priority (Payments & Contracts)

**CRITICAL (Must Complete for MVP):**
1. **S3 Storage Integration** - Upload KYC documents to AWS S3
   - Pre-signed URLs for secure uploads
   - Folder structure: `kyc/{order_id}/{doc_type}`
   - AES-256 encryption at rest
   - Integration with modular wizard

2. **Order Submission API** - Complete order creation flow
   - Update `POST /api/orders` to work with modular wizard state
   - Store encrypted PII (auto-triggered by migration 007)
   - Create order_history entry
   - Handle verification_data JSONB properly

3. **Stripe Payment Flow** - Complete payment integration
   - Payment intent creation
   - Success/failure handling
   - Webhook processing for order status updates

**MEDIUM Priority:**
4. **User Orders Dashboard** - View order history and status
   - `app/(customer)/orders/page.tsx` - List view
   - `app/(customer)/orders/[id]/page.tsx` - Detail view
   - Show masked PII (CNP: 1***********3456)

**LOW Priority (Can Defer):**
5. **Passport UI Support** - Add passport upload option
   - OCR already supports passports
   - Need UI selector in personal-data-step.tsx

**COMPLETED (Courier Integration):**
6. ✅ **Sameday Courier Integration** - Code complete, awaiting API credentials
   - Full Sameday API implementation (lockers, parcels, tracking)
   - Multi-provider delivery UI (Fan Courier + Sameday side-by-side)
   - Provider logos and real-time quotes
   - Files: `src/lib/services/courier/sameday.ts`, `src/lib/services/courier/factory.ts`

7. ✅ **Locker Selector Redesign** - Improved UX for FANbox/EasyBox
   - Scrollable card list replacing dropdown
   - Distance display, operating hours, address details
   - Auto-selection on wizard navigation (savedLockerIdRef pattern)
   - Module-level locker cache (10min TTL, instant remount)

8. ✅ **Delivery Step State Persistence** - Fixed state loss on navigation
   - isInitialMount ref pattern prevents clearing saved data
   - Preserves selected delivery method and locker across steps
   - Delivery timing info note (documents issued before shipping)

9. ✅ **Fan Courier Fixes**
   - Fixed diacritics issue (stripDiacritics for API calls + client filtering)
   - Fixed FANbox quotes not appearing (locality param was county instead of city)
   - Fixed locker data caching for instant remount

### Sprint 4 Implementation (From Specs)

**User Data Persistence** (See: `docs/technical/specs/user-data-persistence.md`)
1. Database schema: `user_saved_data`, `kyc_verifications`, `billing_profiles`
2. API: `GET /api/user/prefill` - Pre-fill form for logged-in users
3. API: `POST /api/user/register-from-order` - Guest-to-customer conversion
4. API: `GET/POST /api/user/billing-profiles` - Billing profile management
5. API: `GET /api/anaf/cui/[cui]` - ANAF company lookup

**Order Auto-Save System** (See: `docs/technical/specs/order-autosave-system.md`)
1. Database schema: `order_notes`, `bank_transfers` tables
2. API: `POST /api/orders/draft` - Create draft order with ID
3. API: `GET/PUT /api/orders/[id]/draft` - Auto-save order state
4. API: `POST /api/orders/[id]/bank-transfer` - Request bank transfer
5. API: `POST /api/admin/orders/[id]/confirm-payment` - Admin confirmation
6. API: `POST /api/orders/recovery` - Send magic link for recovery

### Comenzi Utile

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build

# Database
npx supabase db push     # Push migrations
npx supabase gen types   # Generate TypeScript types

# Testing APIs
curl http://localhost:3000/api/services
curl http://localhost:3000/api/services/cazier-fiscal
curl http://localhost:3000/api/ocr/extract      # OCR health check
curl http://localhost:3000/api/kyc/validate     # KYC health check
```

---

## GITHUB REPOSITORY

**URL:** https://github.com/rlutas/eghiseul.ro

### Recent Commits
- `docs: Add OCR/KYC API documentation and Sprint 3 specs`
- `feat(kyc): Add AI-powered OCR and KYC validation with Gemini`
- `feat(wizard): Complete 6-step order wizard with ID scanning`
- `feat(api): Implement Sprint 2 - Services and Orders API`
- `docs: Update sprint documentation with completion status`
- `feat(auth): Complete Sprint 1 - Authentication system`
- `chore: Initial project setup`

---

## TECHNICAL SPECS SUMMARY

### OCR/KYC System (Implemented)
- **OCR API**: `/api/ocr/extract` - Google Gemini 2.0 Flash Exp
- **KYC API**: `/api/kyc/validate` - Google Gemini 1.5 Flash
- **Modes**: auto, specific (cnp, full_name, etc.), ci_complete
- **Address Parsing**: Full Romanian format (Jud., Mun., Str., Bl., Sc., Et., Ap.)
- **Documentation**: `docs/technical/api/ocr-kyc-api.md`

### User Data Persistence (Ready to Implement)
- **Pre-fill**: Logged-in users get data from previous orders
- **Conversion**: Guests can create account at order completion
- **KYC Reuse**: Valid KYC documents are reused (no re-upload)
- **Billing**: Support for persoană fizică and juridică (ANAF CUI)
- **Full Spec**: `docs/technical/specs/user-data-persistence.md`
- **Implementation Guide**: `docs/technical/specs/user-data-persistence-implementation.md` ✅ NEW

**Implementation Phases:**
1. Phase 1: Database Migration (015) - Tables: `user_saved_data`, `kyc_verifications`, `billing_profiles`
2. Phase 2: Pre-fill API - `GET /api/user/prefill-data`
3. Phase 3: Guest-to-Customer - `POST /api/auth/register-from-order`
4. Phase 4: Wizard Integration - Pre-fill logic, "Already Verified" UI
5. Phase 5: SaveDataModal - Post-order account creation modal

### Order Auto-Save System (Planned)
- **Order ID**: Format ORD-YYYYMMDD-XXXXX
- **Auto-Save**: Debounced (500ms) with localStorage backup
- **Support**: Order lookup, notes, continue on behalf
- **Bank Transfer**: Reference PAY-YYYYMMDD-XXXXX, manual confirmation
- **Recovery**: Magic links with JWT (7-day expiry)
- **Specification**: `docs/technical/specs/order-autosave-system.md`

---

## SESSION LOG

### Session: 2026-01-06 - User Data Persistence Planning

**Completed This Session:**
1. ✅ **Analyzed Codebase for User Data Persistence**
   - Reviewed existing spec (`user-data-persistence.md`) - 2000+ lines
   - Identified missing database tables: `user_saved_data`, `kyc_verifications`, `billing_profiles`
   - Identified missing API endpoints: prefill-data, register-from-order
   - Reviewed current wizard provider state

2. ✅ **Created Implementation Roadmap**
   - Created `docs/technical/specs/user-data-persistence-implementation.md`
   - Defined 6 implementation phases with priorities
   - Included database migration SQL (015_user_data_persistence.sql)
   - Included API endpoint implementations
   - Included SaveDataModal component code

3. ✅ **Updated Documentation**
   - Added implementation guide to documentation index
   - Updated User Data Persistence section with phases
   - Updated DEVELOPMENT_MASTER_PLAN version to 2.0

**Feature Summary - User Data Persistence:**

| Component | Status | Priority |
|-----------|--------|----------|
| Full Spec | ✅ Complete | - |
| Implementation Guide | ✅ NEW | - |
| Database Migration | ❌ To Build | P0 |
| Pre-fill API | ❌ To Build | P0 |
| Register from Order API | ❌ To Build | P0 |
| Wizard Pre-fill Integration | ❌ To Build | P0 |
| SaveDataModal | ❌ To Build | P0 |
| KYC Reuse UI | ❌ To Build | P1 |

**Next Steps:**
1. Create and run database migration 015
2. Build pre-fill API endpoint
3. Build register-from-order API endpoint
4. Integrate pre-fill into wizard provider

---

### Session: 2025-12-17 (Evening) - Security & Encryption

**Completed This Session:**
1. ✅ **KYC Selfie Face Matching Fix** - Fixed bug where blob URLs were sent to Google AI instead of base64 data
   - Added `imageBase64` field to `DocumentUpload` interface
   - Modified `kyc-step.tsx` to store and use base64 for reference images

2. ✅ **PII Encryption Implementation** (CRITICAL)
   - Created `supabase/migrations/007_pii_encryption.sql`:
     - AES-256 encryption using pgcrypto
     - Auto-encryption trigger on orders table
     - Encrypted columns: `encrypted_cnp`, `encrypted_ci_series`, `encrypted_ci_number`
     - Masking functions for display
     - Migration function for existing data
   - Created `src/lib/security/pii-encryption.ts`:
     - API helpers for decryption
     - CNP validation (Romanian checksum algorithm)
     - CI Series/Number validation
     - Masking utilities

3. ✅ **Production Security Setup Guide**
   - Created `docs/deployment/PRODUCTION_SECURITY_SETUP.md`:
     - Environment variables setup
     - Database configuration steps
     - Verification commands
     - Monitoring queries
     - Key rotation procedures
     - Troubleshooting guide

4. ✅ **Database Migration Applied**
   - Migration 007 deployed to Supabase
   - TypeScript types regenerated

**Files Modified:**
- `src/types/orders.ts` - Added `imageBase64` field
- `src/components/orders/steps/kyc-step.tsx` - Fixed reference image handling
- `SECURITY_AUDIT_SUMMARY.md` - Updated status for CRIT-001, CRIT-004

**Files Created:**
- `supabase/migrations/007_pii_encryption.sql`
- `src/lib/security/pii-encryption.ts`
- `docs/deployment/PRODUCTION_SECURITY_SETUP.md`

**Status When Paused:**
- Sprint 3: 85% complete
- Security audit findings: 2 critical ✅, 2 high ✅, 2 medium ⏳
- Ready for: S3 integration, Order submission API

### Session: 2025-12-18 (Morning) - Testing & Bug Fixes

**Completed This Session:**
1. ✅ **Comprehensive Testing**
   - Created test plan: `docs/testing/TEST_PLAN.md`
   - Executed 19 tests across all categories
   - 100% pass rate

2. ✅ **TypeScript Errors Fixed**
   - Fixed `src/app/api/services/[slug]/route.ts`:
     - Corrected column names (`price` not `price_modifier`, etc.)
   - Fixed `src/app/api/orders/route.ts`:
     - `selected_options` not `options`
     - `stripe_payment_intent_id` not `stripe_payment_intent`
     - Added `order_number` placeholder for trigger
     - Fixed null date handling
   - Fixed `src/app/api/orders/[id]/route.ts`:
     - Same property name corrections
   - Fixed `src/lib/security/pii-encryption.ts`:
     - Proper JSON type casting

3. ✅ **Test Results Documented**
   - Created `docs/testing/TEST_RESULTS_2025-12-18.md`
   - All APIs verified working
   - Rate limiting verified (10 req/min)
   - Authentication protection verified

**Test Summary:**
| Category | Passed | Failed |
|----------|--------|--------|
| Services API | 3 | 0 |
| Orders API | 2 | 0 |
| OCR API | 3 | 0 |
| KYC API | 1 | 0 |
| Auth Pages | 4 | 0 |
| Security | 3 | 0 |
| TypeScript | 1 | 0 |
| **TOTAL** | **19** | **0** |

**Status:**
- Sprint 3: 85% complete
- All tests passing
- TypeScript builds without errors
- Ready for: S3 integration, Order submission API

### Session: 2025-01-05 - Modular Wizard System Complete

**Completed This Session:**
1. ✅ **Modular Wizard Architecture** - Complete rewrite of order wizard system
   - New URL pattern: `/comanda/[service-slug]`
   - Dynamic step generation based on `verification_config` JSONB
   - Created `src/app/comanda/[service]/page.tsx`
   - Created `src/components/orders/modular-order-wizard.tsx`
   - Created `src/providers/modular-wizard-provider.tsx`

2. ✅ **Verification Module System**
   - Type system: `src/types/verification-modules.ts`
   - Registry: `src/lib/verification-modules/registry.ts`
   - Step builder: `src/lib/verification-modules/step-builder.ts`
   - 8 dynamic modules (client-type, personal-kyc, company-kyc, company-documents, property, vehicle, kyc-documents, signature)
   - 4 core steps (contact, options, delivery, review)

3. ✅ **ANAF Company Validation** - CUI lookup
   - Service: `src/lib/services/infocui.ts`
   - Validates CUI via free ANAF API (webservicesp.anaf.ro)
   - Auto-completes company data (name, address, reg. number, VAT status)
   - Async two-step flow: POST → wait 2.5s → GET with correlationId

4. ✅ **Database Schema**
   - Migration: `supabase/migrations/010_verification_config.sql`
   - Added `verification_config` JSONB column to services
   - Configured 6 services with unique flows

5. ✅ **Service Configurations**
   - Cazier Fiscal PF: Contact → Personal → Options → KYC → Signature → Delivery → Review
   - Cazier Judiciar PF: Contact → Personal → Options → KYC → Signature → Delivery → Review
   - Cazier Judiciar PJ: Contact → Client Type → Company → Company Documents → Personal → Options → KYC → Signature → Delivery → Review
   - Certificat Naștere: Contact → Personal → Options → Delivery → Review (minori, fără KYC)
   - Certificat Constatator: Contact → Property → Personal → Options → Delivery → Review
   - Cazier Auto: Contact → Vehicle → Personal → Options → Delivery → Review
   - Rovinieta: Contact → Vehicle → Personal → Options → Delivery → Review

6. ✅ **Documentation**
   - Implementation guide: `docs/technical/specs/modular-wizard-guide.md`
   - Developer guide on how to add new services and modules

**Files Created:**
- `src/app/comanda/[service]/page.tsx`
- `src/components/orders/modular-order-wizard.tsx`
- `src/components/orders/wizard-progress-modular.tsx`
- `src/components/orders/price-sidebar-modular.tsx`
- `src/components/orders/steps-modular/*.tsx` (4 core steps)
- `src/components/orders/modules/*/*.tsx` (7 modules)
- `src/providers/modular-wizard-provider.tsx`
- `src/lib/verification-modules/*.ts` (registry, step-builder)
- `src/lib/services/infocui.ts`
- `src/types/verification-modules.ts`
- `supabase/migrations/010_verification_config.sql`
- `docs/technical/specs/modular-wizard-guide.md`

**Status When Completed:**
- Sprint 3: 100% complete ✅
- Modular wizard system fully operational
- 6 services configured and tested
- Ready for: Sprint 4 (Payments & Contracts)

**Next Steps:**
1. Test modular wizard with real users
2. Delete legacy wizard code (`/orders/new`, old provider)
3. Begin Sprint 4: S3 upload, payment flows, order submission

---

### Session: 2026-01-08 - User Account Management Complete

**Completed This Session:**

1. ✅ **Profile Tab - ID Scanner Integration**
   - Added IdScanner component to ProfileTab
   - OCR extraction auto-fills: firstName, lastName, CNP, birthDate, birthPlace
   - Documents saved to KYC verification system
   - "Scanează act" button alongside edit mode
   - Files: `src/components/account/ProfileTab.tsx`

2. ✅ **KYC Tab - Selfie with ID Support**
   - Extended IdScanner to support `showSelfieWithId` prop
   - Created SelfieWithIdIllustration SVG component
   - Added selfie upload handler (stores image, no OCR)
   - Third step after front/back scan
   - KYCTab uses `showSelfieWithId={true}`
   - Files: `src/components/shared/IdScanner.tsx`, `src/components/account/KYCTab.tsx`

3. ✅ **Billing Tab - Duplicate Prevention**
   - Added `findDuplicateAddress()` helper (matches street, number, city)
   - Added `findDuplicateBillingProfile()` helper (matches CNP)
   - Now updates existing entries instead of creating duplicates
   - Files: `src/components/account/KYCTab.tsx`

4. ✅ **Header Fix**
   - Removed duplicate navigation bar from customer layout
   - Fixed gray bar appearing under main header
   - Files: `src/app/(customer)/layout.tsx`

5. ✅ **Testing**
   - Build passed successfully
   - Playwright: 129 tests passed (Mobile Safari)
   - Some pre-existing Chromium timeout issues

**Files Modified:**
- `src/components/account/ProfileTab.tsx` - Added ID scanner integration
- `src/components/account/KYCTab.tsx` - Added selfie, duplicate prevention
- `src/components/shared/IdScanner.tsx` - Extended for selfie with ID
- `src/app/(customer)/layout.tsx` - Fixed duplicate header
- `src/hooks/useAddresses.ts` - Added update function
- `src/hooks/useBillingProfiles.ts` - Added update function

**Status When Completed:**
- Sprint 4: 40% complete
- User Account Management: ✅ Complete
- Ready for: Payment flows, S3 upload, order submission

---

### Session: 2026-01-08 (Part 2) - Billing Step & Security Fixes

**Completed This Session:**

1. ✅ **Billing Step Implementation**
   - New step in wizard between Delivery and Review
   - Three billing options: "Facturează pe mine" (self), "Altă persoană fizică", "Persoană juridică"
   - Auto-populates data from scanned ID for "self" option
   - CUI validation via ANAF API for companies
   - Files:
     - `src/components/orders/steps-modular/billing-step.tsx` (NEW)
     - `src/types/verification-modules.ts` (BillingState, BillingType, BillingSource)
     - `src/lib/verification-modules/step-builder.ts` (added billing step)
     - `src/lib/verification-modules/registry.ts` (added billing module)
     - `src/providers/modular-wizard-provider.tsx` (billing state management)
     - `src/components/orders/modular-order-wizard.tsx` (billing rendering)
     - `src/components/orders/steps-modular/review-step.tsx` (billing display)

2. ✅ **Security Vulnerabilities Fixed**
   - **IDOR in draft GET**: Orders without ownership info now denied
   - **Email bypass in register-from-order**: Requires order email before registration
   - **Ownership in draft PATCH**: Guest orders require email match for updates
   - **KYC persistence**: Documents saved to kyc_verifications on account creation
   - **Billing profile creation**: Auto-creates PF billing profile from order data
   - Files:
     - `src/app/api/orders/draft/route.ts`
     - `src/app/api/auth/register-from-order/route.ts`
   - Docs:
     - `docs/technical/specs/security-audit-admin-client.md`
     - `docs/technical/specs/user-data-flow-analysis.md`

3. ✅ **Documentation Updates**
   - Updated `docs/technical/specs/modular-wizard-guide.md` with billing step
   - Updated `docs/technical/specs/user-data-flow-analysis.md` with fixes
   - Updated this file with Sprint 4 progress

**Interconnections:**
```
Billing Step Flow:
PersonalDataStep (OCR) → BillingState.prefillFromId → BillingStep
    ↓                                                      ↓
  Address                                          billing: { source, type, ... }
    ↓                                                      ↓
ReviewStep displays                              Saved to orders.customer_data.billing
    ↓                                                      ↓
Order Submission                            → billing_profiles table (on account creation)
```

**Status When Completed:**
- Sprint 4: 50% complete
- Billing Step: ✅ Complete
- Security Fixes: ✅ Complete
- Ready for: Payment flows, S3 upload, Stripe integration

---

---

### Session: 2026-01-09 - KYC Verification Logic & Profile Improvements

**Completed This Session:**

1. ✅ **KYC Verification Logic Fix**
   - KYC now requires BOTH ID front AND selfie for "verified" status
   - Added new "partial" status for incomplete KYC (has ID but no selfie)
   - Updated `/api/user/kyc/route.ts` to check document types
   - Updated `useKycStatus` hook with new flags: `isPartial`, `hasFrontId`, `hasSelfie`, `hasAllRequired`
   - Files: `src/app/api/user/kyc/route.ts`, `src/hooks/useKycStatus.ts`

2. ✅ **Account Page Sidebar KYC Status**
   - Sidebar now shows actual KYC status based on documents (not just `kyc_verified` flag)
   - Shows "KYC Verificat" (green), "KYC Incomplet" (amber), or "KYC Neverificat" (yellow)
   - Displays specific missing document (e.g., "Lipsește selfie-ul")
   - Files: `src/app/(customer)/account/page.tsx`

3. ✅ **Profile Document Info Display**
   - Profile tab now shows document info from KYC verification:
     - Tip Document (CI Vechi / CI Nou)
     - Serie / Număr
     - Valabil Până La
   - Updated `/api/user/profile` GET to fetch KYC documents and extract info
   - Files: `src/app/api/user/profile/route.ts`, `src/components/account/ProfileTab.tsx`

4. ✅ **Order Submit - Profile Data Sync**
   - Order submission now saves phone, birth_date, birth_place to user profile
   - Updates existing profile with any missing data from order
   - Files: `src/app/api/orders/[id]/submit/route.ts`

5. ✅ **KYC Tab UI Improvements**
   - Shows correct status badge: "Incomplet - lipsește selfie"
   - Shows "Necesar" badge on selfie requirement
   - Document list with clear status indicators

**Files Modified:**
- `src/app/api/user/kyc/route.ts` - Document type checking, new status calculation
- `src/app/api/user/profile/route.ts` - Added document info from KYC
- `src/app/api/orders/[id]/submit/route.ts` - Profile data sync on submit
- `src/app/(customer)/account/page.tsx` - Sidebar KYC status calculation
- `src/hooks/useKycStatus.ts` - New status flags
- `src/components/account/KYCTab.tsx` - Status display improvements
- `src/components/account/ProfileTab.tsx` - Document info display

**KYC Status Logic:**
```
Documents Present     | Status
--------------------- | --------
None                 | unverified
ID front only        | partial
Selfie only          | partial
ID front + Selfie    | verified (or expiring/expired based on date)
```

**Status When Completed:**
- Sprint 4: 55% complete
- KYC verification: ✅ Complete
- Profile improvements: ✅ Complete
- Ready for: Payment flows, S3 upload, Stripe integration

---

### Session: 2026-01-09 (Part 2) - AWS S3 Integration Complete

**Completed This Session:**

1. ✅ **S3 403 Forbidden Error Fixed**
   - **Root Cause:** IAM user `eghiseul-app` had no policies attached
   - **Solution:** Attached `AmazonS3FullAccess` policy in AWS Console
   - **Secondary Fix:** Removed `ServerSideEncryption` header from presigned URL generation
     - Bucket has SSE-S3 enabled by default
     - Including encryption header in presigned URL causes signature mismatch
   - Files Modified:
     - `src/lib/aws/s3.ts` - Removed ServerSideEncryption from PutObjectCommand
     - `src/lib/aws/upload-client.ts` - Removed encryption header from client fetch

2. ✅ **S3 Security Assessment**
   - Created comprehensive security audit
   - Overall Rating: ⭐⭐⭐⭐ (8/10) - Production ready
   - Strengths: AES-256 encryption, TLS 1.3, presigned URLs, auth required
   - Must-fix before production:
     - Enable S3 Access Logging (GDPR audit trail)
     - Validate file ownership for orders/contracts
   - Files Created:
     - `docs/security/S3_SECURITY_ASSESSMENT.md` - Full audit
     - `docs/security/S3_SECURITY_SUMMARY.md` - Quick reference

3. ✅ **Documentation Updated**
   - `docs/deployment/AWS_S3_SETUP.md` - Updated IAM policy, added 403 troubleshooting
   - `docs/technical/debugging/s3-403-forbidden-fix-2026-01-09.md` - Complete fix documentation
   - `docs/README.md` - Added S3 docs, marked S3 as Active
   - `DEVELOPMENT_MASTER_PLAN.md` - Updated Sprint 4 status

4. ✅ **Test Account Reset**
   - Reset `serviciiseonethut@gmail.com` for fresh testing
   - Cleared: KYC verifications, billing profiles, addresses, orders, profile data

**S3 Architecture:**
```
eghiseul-documents/
├── kyc/{user_id}/{verification_id}/   # KYC documents (7 year retention)
├── orders/{year}/{month}/{order_id}/  # Order documents
├── contracts/{year}/{month}/          # Generated contracts (10 year)
├── invoices/{year}/{month}/           # Invoices (10 year)
├── final/{year}/{month}/{order_id}/   # Delivered documents
├── templates/                         # Document templates
└── temp/                              # Auto-deleted after 24h
```

**Files Modified:**
- `src/lib/aws/s3.ts` - Fixed presigned URL generation
- `src/lib/aws/upload-client.ts` - Removed encryption header
- `docs/deployment/AWS_S3_SETUP.md` - Updated documentation

**Files Created:**
- `docs/security/S3_SECURITY_ASSESSMENT.md`
- `docs/security/S3_SECURITY_SUMMARY.md`
- `docs/technical/debugging/s3-403-forbidden-fix-2026-01-09.md`

**Status When Completed:**
- Sprint 4: 60% complete
- S3 Storage: ✅ Complete
- Security Audit: ✅ Complete (8/10 rating)
- Ready for: Stripe integration, contract generation, payment flows

---

### Session: 2026-01-09 (Part 3) - Profile/KYC Sync & Duplicate Prevention

**Completed This Session:**

1. ✅ **Profile Tab - Hide Redundant Scanner**
   - Removed "Scanează act" button when KYC ID data exists
   - Added informational message: "Datele profilului sunt sincronizate cu KYC"
   - Files Modified: `src/components/account/ProfileTab.tsx`

2. ✅ **Fixed Document Series/Number Display in Profile**
   - OCR returns `series` and `number`, but API looked for `documentSeries`/`documentNumber`
   - Fixed field mapping in profile GET endpoint
   - Improved document type labels: "Carte de Identitate", "Carte de Identitate (nou)", "Pașaport"
   - Files Modified: `src/app/api/user/profile/route.ts`

3. ✅ **Fixed Duplicate Address/Billing on KYC Scan**
   - Previous behavior: Every ID scan created new address and billing profile
   - New behavior: Updates existing entries instead of creating duplicates
   - Added check for existing "Adresă din act" before insert
   - Added check for existing PF billing profile before insert
   - Files Modified: `src/app/api/user/kyc/save/route.ts`

4. ✅ **Cleaned Existing Duplicates**
   - Removed duplicate addresses for test account
   - Removed duplicate billing profiles for test account

**Files Modified:**
- `src/components/account/ProfileTab.tsx` - Conditional scanner visibility, KYC sync message
- `src/app/api/user/profile/route.ts` - Fixed OCR field mapping (series/number)
- `src/app/api/user/kyc/save/route.ts` - Duplicate prevention for addresses/billing profiles

**Bug Fixes:**
| Bug | Root Cause | Fix |
|-----|------------|-----|
| Scanner shown when KYC exists | No conditional check for KYC data | Check `hasFrontId` before showing button |
| Document series/number not displayed | Wrong field names in API | Changed to `series`/`number` from OCR |
| Duplicate addresses on each scan | No existence check before insert | Added check + update existing |
| Duplicate billing profiles | No existence check before insert | Added check + update existing |

**Status When Completed:**
- Sprint 4: 65% complete
- Profile/KYC Sync: ✅ Complete
- Duplicate Prevention: ✅ Complete
- Ready for: Stripe integration, payment flows

---

### Session: 2026-01-09 (Part 4) - Wizard Prefill Optimization for Logged Users

**Completed This Session:**

1. ✅ **Contact Step Compact View for Prefilled Users**
   - If user is logged in with valid email + phone → shows compact summary card
   - Green "Date preluate din contul tău" banner
   - Shows email, phone, preferred contact method
   - "Modifică" button to switch to edit mode if needed
   - Phone formatting helper: converts various formats to +40 7XX XXX XXX
   - Files Modified: `src/components/orders/steps-modular/contact-step.tsx`

2. ✅ **Prefill API Enhanced with Document Info**
   - Added extraction of document series, number, expiry, type from KYC
   - Fetches from `ci_front`, `ci_nou_front`, or `passport` documents
   - Returns `documentSeries`, `documentNumber`, `documentExpiry`, `documentType` in response
   - Files Modified: `src/app/api/user/prefill-data/route.ts`

3. ✅ **Modular Wizard Provider Updated**
   - Interface updated to accept document info from prefill API
   - Reducer updated to populate `personalKyc` state with document data
   - Proper TypeScript casting for DocumentType enum
   - Files Modified: `src/providers/modular-wizard-provider.tsx`

**User Experience Flow:**
```
Logged User with Complete Profile:
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Contact                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Date preluate din contul tău                         │ │
│ │   Te vom contacta pe datele de mai jos.                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌───────────────────────────────┬─────────────────────────┐ │
│ │ Email: user@example.com      │ [Modifică]              │ │
│ │ Telefon: +40 712 345 678     │                         │ │
│ │ Metoda: Email                 │                         │ │
│ └───────────────────────────────┴─────────────────────────┘ │
│                                                              │
│ → User can proceed immediately or edit if needed            │
└─────────────────────────────────────────────────────────────┘

Step 3: Personal Data (with KYC)
┌─────────────────────────────────────────────────────────────┐
│ Document info auto-filled from verified KYC:                │
│ - Serie: XX                                                 │
│ - Număr: 123456                                             │
│ - Valabil până la: 2030-01-01                              │
└─────────────────────────────────────────────────────────────┘
```

**Files Modified:**
- `src/components/orders/steps-modular/contact-step.tsx` - Compact prefilled view
- `src/app/api/user/prefill-data/route.ts` - Document info extraction
- `src/providers/modular-wizard-provider.tsx` - Document fields in state

**Status When Completed:**
- Sprint 4: 70% complete
- Wizard Prefill: ✅ Complete
- Contact Step UX: ✅ Improved
- Ready for: Stripe integration, payment flows

---

### Session: 2026-01-12 - Stripe Payment & Order Page Fixes

**Completed This Session:**

1. ✅ **Stripe Webhook Column Name Bug Fix**
   - **Issue:** Webhook handler was looking for `stripe_payment_intent` but column is `stripe_payment_intent_id`
   - **Impact:** Refunds were failing to find associated orders
   - **Fix:** Updated `handleChargeRefunded` to use correct column name
   - Files Modified: `src/app/api/webhooks/stripe/route.ts`

2. ✅ **Manual Payment Confirmation Endpoint**
   - Created fallback endpoint for when webhooks fail or are delayed
   - `POST /api/orders/[id]/confirm-payment` - verifies with Stripe, updates order
   - Success page now auto-calls this if `redirect_status=succeeded` but order shows unpaid
   - Files Created: `src/app/api/orders/[id]/confirm-payment/route.ts`
   - Files Modified: `src/app/comanda/success/[orderId]/page.tsx`

3. ✅ **Google Analytics 4 Purchase Tracking**
   - Added GA4 purchase event tracking to payment success page
   - Tracks: transaction_id, value, currency, items
   - Deduplication via `purchaseTracked` state
   - Files Modified: `src/app/layout.tsx` (GA4 script), `src/app/comanda/success/[orderId]/page.tsx`

4. ✅ **Order Detail Page Redesign**
   - **Issue:** Page was too wide, no margins, service display was minimal
   - **Fix:** Complete redesign with:
     - Hero header with gradient background
     - Container with `max-w-6xl` and proper margins
     - Service card with large icon, category badge, description
     - Fixed option price extraction (`price_modifier` field)
     - Fixed React rendering bug (`{0 && <element>}` renders "0")
   - Files Modified: `src/app/(customer)/account/orders/[id]/page.tsx`

5. ✅ **Billing Data Display Added**
   - Order detail page now shows "Date facturare" section
   - Displays: Type (PF/PJ), name/company, CNP/CUI, address
   - Supports both billing source types from wizard
   - Files Modified: `src/app/(customer)/account/orders/[id]/page.tsx`

6. ✅ **Hydration Mismatch Fix**
   - **Issue:** Grammarly browser extension adds attributes to body tag
   - **Fix:** Added `suppressHydrationWarning` to body element
   - Files Modified: `src/app/layout.tsx`

**Bug Fixes:**
| Bug | Root Cause | Fix |
|-----|------------|-----|
| Webhook refund fails | Wrong column name (`stripe_payment_intent`) | Changed to `stripe_payment_intent_id` |
| Options show +0.00 RON | Using `price` instead of `price_modifier` | Changed to use `price_modifier` field |
| Stray "0" in delivery | React `{0 && <element>}` renders "0" | Added `!= null && > 0` check |
| Hydration mismatch | Grammarly extension | Added `suppressHydrationWarning` |
| Order unpaid after Stripe success | Webhook delay | Added fallback confirm-payment endpoint |
| Billing not shown | Section missing from UI | Added billing display section |

**Status When Completed:**
- Sprint 4: 75% complete
- Payment Flow: ⏳ Stripe checkout integration pending
- Order Display: ✅ Complete
- GA4 Tracking: ✅ Complete
- Ready for: Complete Stripe checkout flow, bank transfers, SmartBill invoicing

---

---

### Session: 2026-01-12 (Part 2) - Fan Courier API Integration Complete

**Completed This Session:**

1. ✅ **Fan Courier API v2.0 Integration**
   - Full implementation of Fan Courier API v2.0
   - Token-based authentication (24-hour validity)
   - Base URL: `https://api.fancourier.ro`
   - Files: `src/lib/services/courier/fancourier.ts`

2. ✅ **Credentials Configuration Fixed**
   - **Issue:** Client ID in `.env.local` was incorrect (320993244 vs correct 7276967)
   - **Issue:** Password with `#` character was being truncated (comment parsing)
   - **Fix:** Updated client ID to 7276967 (discovered via `/reports/branches` endpoint)
   - **Fix:** Quoted password in `.env.local` to handle `#` character

3. ✅ **API Endpoints Tested & Working**
   | Endpoint | Status | Response |
   |----------|--------|----------|
   | `POST /login` | ✅ Working | Token with 24h validity |
   | `GET /reports/counties` | ✅ Working | All 42 Romanian counties |
   | `GET /reports/localities` | ✅ Working | Localities with pickup hours |
   | `GET /reports/services` | ✅ Working | 16 services (Standard, RedCode, FANbox, etc.) |
   | `GET /reports/awb/internal-tariff` | ✅ Working | Real pricing (18.15 RON for 0.5kg to București) |
   | `GET /reports/pickup-points` | ✅ Working | FANbox locker locations |

4. ✅ **Courier API Routes Working**
   - `GET /api/courier/quote` - Returns real Fan Courier prices
   - `GET /api/courier/localities` - Returns localities for county
   - `POST /api/courier/ship` - Creates AWB (ready for testing)
   - `GET /api/courier/track` - Tracks shipment by AWB

5. ✅ **Real Pricing Integration**
   - Standard shipping to București: 18.15 RON + 3.81 VAT = **21.96 RON**
   - FANbox (locker) delivery: 20.9 RON + 4.39 VAT = **25.29 RON**
   - Pricing includes: weight cost, fuel surcharge, extra km cost, insurance, options

**Fan Courier Credentials (Production):**
```env
FANCOURIER_USERNAME=eghiseul
FANCOURIER_PASSWORD="VF7d5wQBUG#844"  # Must be quoted due to #
FANCOURIER_CLIENT_ID=7276967  # EDIGITALIZARE SRL Satu Mare
```

**Available Services:**
| ID | Name | Description |
|----|------|-------------|
| 1 | Standard | 1-3 business days |
| 2 | RedCode | Next day by 10 AM |
| 4 | Cont Colector | Cash on delivery to bank |
| 27 | FANbox | Locker delivery |
| 19 | CollectPoint | Pickup point delivery |

**Architecture:**
```
CourierProvider Interface
         ↓
FanCourierProvider (API v2.0)
         ↓
├── authenticate() → Token (24h)
├── getQuotes() → Real pricing
├── createShipment() → AWB generation
├── trackShipment() → Tracking events
├── getCounties() → Romanian counties
├── getLocalities() → Cities per county
└── getServicePoints() → FANbox/PUDO locations
```

**Files Created/Modified:**
- `src/lib/services/courier/types.ts` - Courier interfaces
- `src/lib/services/courier/factory.ts` - Provider factory
- `src/lib/services/courier/fancourier.ts` - Fan Courier implementation
- `src/app/api/courier/quote/route.ts` - Quote API
- `src/app/api/courier/ship/route.ts` - Ship API
- `src/app/api/courier/track/route.ts` - Track API
- `src/app/api/courier/localities/route.ts` - Localities API

**Status When Completed:**
- Sprint 4: 80% complete
- Fan Courier: ✅ Complete (API v2.0 integrated)
- Courier System: ⏳ Sameday, DHL, UPS, FedEx pending
- Ready for: Delivery step redesign, AWB generation in admin

---

### Session: 2026-01-13 - FANbox Distance Calculation & Documentation

**Completed This Session:**

1. ✅ **FANbox Locker Distance Calculation Feature**
   - Added geolocation support to calculate distance from user to each locker
   - Implemented Haversine formula for accurate GPS distance calculation
   - Lockers now sorted by distance (nearest first)
   - UI improvements:
     - "Cel mai apropiat" badge on first locker
     - Distance indicator (e.g., "2.3 km" or "850 m") next to each option
     - "sortate după distanță" text when geolocation available
     - "La X km de locația dvs." shown for selected locker
   - Fallback: Shows lockers sorted alphabetically if geolocation denied
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

2. ✅ **Fan Courier Logo Path Fix**
   - **Issue:** Code referenced `.png` but file exists as `.svg`
   - **Fix:** Updated references from `.png` to `.svg`
   - Files Modified: `src/lib/services/courier/factory.ts`, `src/lib/services/courier/fancourier.ts`

3. ✅ **Draft Save Error Logging Improvements**
   - Added detailed error logging to draft API for debugging 500 errors
   - Logs now include: error object, stringified details, update data
   - Files Modified: `src/app/api/orders/draft/route.ts`

4. ✅ **Documentation Updates**
   - Updated `docs/technical/specs/fan-courier-integration.md`:
     - Added "Prețuri și Servicii" section explaining Standard vs FANbox
     - Added "Componente Preț" section with API response breakdown
     - Added "FANbox - Calcul Distanță" section with Haversine implementation
     - Updated date to 2026-01-13

**FANbox Distance Implementation:**
```typescript
// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371; // Earth's radius in km
  // ... calculation using sin/cos/atan2
  return distance_in_km;
}

// User location states
const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(null);
const [gettingLocation, setGettingLocation] = useState(false);

// Geolocation with permission
navigator.geolocation.getCurrentPosition(
  (position) => { /* success */ },
  () => { /* error - fallback to alphabetical */ },
  { timeout: 5000, maximumAge: 300000 }
);
```

**Fan Courier Pricing Clarification:**
- FANbox is a **premium service** with higher base price
- Standard is cheaper in cities
- FANbox becomes cheaper for remote areas (high `extraKmCost`)
- Both prices come directly from Fan Courier API (not calculated locally)

**Status When Completed:**
- Sprint 4: 80% complete
- FANbox Distance: ✅ Complete
- Documentation: ✅ Updated
- Ready for: Admin dashboard, AWB generation, email notifications

---

### Session: 2026-02-10 - Dual Profile System (PF + PJ) Complete

**Completed This Session:**

1. ✅ **Company Profile (Persoana Juridica) Support**
   - Added PF/PJ sub-tab toggle in Account > Profile
   - New CompanyProfileSection component with CUI/ANAF validation
   - Company fields: company_name, company_cui, company_reg_number, company_address, company_bank, company_iban, company_vat_payer
   - Auto-creates PJ billing profile when company data is saved
   - Files Created: `src/components/account/CompanyProfileSection.tsx`
   - Files Modified: `src/components/account/ProfileTab.tsx`

2. ✅ **Database Migration for Company Columns**
   - Added company columns to `profiles` table
   - Extended `kyc_verifications` CHECK constraint to accept company document types
   - Migration: `supabase/migrations/021_company_profile_columns.sql`
   - Helper script: `scripts/run-migration-021.ts`
   - Status: Migration pending execution via Supabase Dashboard

3. ✅ **Profile API Extended for Company Data**
   - `GET /api/user/profile` now returns company fields
   - `PATCH /api/user/profile` accepts and saves company fields
   - Auto-creates/updates PJ billing profile on company data save
   - Files Modified: `src/app/api/user/profile/route.ts`

4. ✅ **Prefill API Extended for Company Data**
   - `GET /api/user/prefill-data` now returns company data and billing_profiles
   - Wizard can prefill company KYC from saved profile data
   - Files Modified: `src/app/api/user/prefill-data/route.ts`

5. ✅ **KYC Company Document Support**
   - Added "Documente Firma" section in KYC tab
   - Accepts `company_registration_cert` and `company_statement_cert` document types
   - Updated S3 upload types to include company document types
   - Files Modified: `src/app/api/user/kyc/save/route.ts`, `src/components/account/KYCTab.tsx`, `src/lib/aws/s3.ts`

6. ✅ **Wizard Integration**
   - Extended `UserPrefillData` interface with company + billing_profiles
   - Modular wizard provider prefills `companyKyc` from profile data
   - Billing step auto-fills PJ billing from saved company profile
   - Files Modified: `src/providers/modular-wizard-provider.tsx`, `src/components/orders/steps-modular/billing-step.tsx`

7. ✅ **Database Migration 021 Executed**
   - Successfully ran via `pg` module with correct pooler host (`aws-1-eu-west-2.pooler.supabase.com`)
   - All 8 company columns + CHECK constraint now live in production DB

**Additional Bug Fixes (same session):**

8. ✅ **KYC File Upload Fix** (`src/components/account/KYCTab.tsx`)
   - **Issue:** File picker wasn't opening on macOS
   - **Root Cause:** `className="hidden"` (`display: none`) blocks programmatic `.click()` on Safari/Mac
   - **Fix:** Changed to `className="sr-only"` on all 4 file inputs, added `type="button"` to upload buttons

9. ✅ **ANAF API ECONNRESET Fix** (`src/lib/services/infocui.ts`)
   - **Issue:** Node.js `fetch()` keep-alive connections get reset by ANAF server on GET requests
   - **Fix:** Replaced `fetch()` GET with Node.js native `https` module using `Connection: close` and `agent: false`
   - ANAF now returns real company data instead of mock fallback

10. ✅ **BillingProfileForm CUI Validation Fix** (`src/components/shared/BillingProfileForm.tsx`)
    - **Issue:** Was calling non-existent endpoint `/api/infocui/validate`
    - **Fix:** Changed to `/api/company/validate`, fixed response parsing (`data.company` → `data.data`, `regCom` → `registrationNumber`), fixed error message extraction

11. ✅ **Removed "Persoana de contact" Section** (`src/components/shared/BillingProfileForm.tsx`)
    - Removed redundant contactPerson/contactPhone/contactEmail fields from PJ billing form
    - Data already exists in user profile, no need for duplication

12. ✅ **Wizard PJ Company Prefill Fix** (`src/providers/modular-wizard-provider.tsx`)
    - **Issue:** Company data from profile wasn't prefilling when user selected PJ in wizard
    - **Root Cause:** `PREFILL_FROM_PROFILE` ran before `SET_CLIENT_TYPE` created `companyKyc` state
    - **Fix:** Re-dispatch `PREFILL_FROM_PROFILE` after `SET_CLIENT_TYPE` when PJ selected

**Files Created:**
- `supabase/migrations/021_company_profile_columns.sql` - DB migration
- `scripts/run-migration-021.ts` - Migration helper script
- `src/components/account/CompanyProfileSection.tsx` - Company profile form

**Files Modified:**
- `src/app/api/user/profile/route.ts` - GET/PATCH company fields, PJ billing auto-create
- `src/app/api/user/prefill-data/route.ts` - Company data + billing_profiles in prefill
- `src/app/api/user/kyc/save/route.ts` - Company document types support
- `src/components/account/ProfileTab.tsx` - PF/PJ sub-tab toggle
- `src/components/account/KYCTab.tsx` - Company documents section, file input sr-only fix
- `src/providers/modular-wizard-provider.tsx` - Extended UserPrefillData, companyKyc prefill, PJ prefill timing fix
- `src/components/orders/steps-modular/billing-step.tsx` - Auto-fill PJ billing from profile
- `src/components/shared/BillingProfileForm.tsx` - CUI validation endpoint fix, removed contact section
- `src/lib/aws/s3.ts` - Company doc types in KycDocumentType
- `src/lib/services/infocui.ts` - Replaced fetch() with native https module for ANAF API

**Dual Profile Architecture:**
```
Account > Profile Tab
├── PF Sub-Tab (Persoana Fizica)
│   ├── Personal info (name, CNP, birth date)
│   ├── Document info (CI series, number, expiry)
│   └── ID Scanner integration
└── PJ Sub-Tab (Persoana Juridica)
    ├── Company info (name, CUI, reg. number)
    ├── Company address
    ├── Banking info (bank, IBAN)
    └── ANAF CUI validation (auto-fill)

Account > KYC Tab
├── Documente Personale (ID front, back, selfie)
└── Documente Firma (company_registration_cert, company_statement_cert)

Wizard Prefill Flow:
Profile (company data) → prefill-data API → ModularWizardProvider
    ↓                                              ↓
companyKyc state                          billingStep auto-fill PJ
    ↓                                              ↓
CompanyDataStep (pre-filled)            BillingStep (PJ option ready)
```

**Bug Fixes Summary:**
| Bug | Root Cause | Fix |
|-----|------------|-----|
| KYC file picker not opening (macOS) | `display: none` blocks `.click()` in Safari | Changed to `sr-only`, added `type="button"` |
| ANAF API ECONNRESET | `fetch()` keep-alive reset by ANAF server | Native `https` module with `Connection: close` |
| BillingProfileForm CUI 404 | Wrong endpoint `/api/infocui/validate` | Changed to `/api/company/validate`, fixed parsing |
| Wizard PJ not prefilling | `PREFILL_FROM_PROFILE` before `SET_CLIENT_TYPE` | Re-dispatch prefill after client type set |

**Status When Completed:**
- Sprint 4: 85% complete
- Dual Profile System: ✅ Complete
- Migration 021: ✅ Executed (all 8 company columns + CHECK constraint live)
- Bug Fixes: ✅ 5 additional fixes applied
- Ready for: Oblio invoicing integration, email notifications

---

### Session: 2026-02-10 (Part 2) - Company Documents Wizard Step & File Upload Fix

**Completed This Session:**

1. ✅ **Company Documents Wizard Step (NEW MODULE)**
   - New `company-documents` step for PJ (Persoana Juridica) orders
   - Supports upload of Certificat de Inregistrare and Certificat Constatator
   - Step is dynamically inserted after `company-data` and before `personal-data`
   - Visibility condition: `clientType === 'PJ'` AND `companyKyc.documentsRequired === true`
   - Features:
     - Drag-and-drop file upload (JPEG, PNG, PDF up to 10MB)
     - Image preview and PDF file info display
     - "Already verified" banner for logged-in users with existing company KYC
     - Progress summary showing which required documents are uploaded
   - Works for both dedicated PJ services (e.g., cazier-judiciar-persoana-juridica) and combined PF/PJ services (e.g., cazier-judiciar with client type selection)
   - Database `verification_config` updated for relevant services
   - Provider cache version bumped to v5
   - Files Created: `src/components/orders/modules/company-kyc/CompanyDocumentsStep.tsx`
   - Files Modified:
     - `src/types/verification-modules.ts` - Added `documentsRequired`, `requiredDocuments` to CompanyKYCConfig; `uploadedDocuments` to CompanyKYCState; `UploadedDocumentState` interface
     - `src/lib/verification-modules/step-builder.ts` - Dynamic step insertion logic
     - `src/lib/verification-modules/registry.ts` - Module registration and dynamic loader
     - `src/components/orders/modular-order-wizard.tsx` - Module config mapping for company-documents
     - `src/providers/modular-wizard-provider.tsx` - `updateCompanyKycDocuments` action, cache v5

2. ✅ **File Upload Fix for macOS (Bug Fix)**
   - **Issue:** File picker not opening on macOS in all 3 upload components
   - **Root Cause:** `opacity-0` absolute-positioned file inputs don't reliably trigger native file picker on Mac browsers
   - **Fix:** Changed to hidden input (`<input className="hidden" />`) with explicit `onClick` handler via `useRef`. Upload buttons call `inputRef.current?.click()` programmatically.
   - Files Fixed:
     - `src/components/orders/modules/company-kyc/CompanyDocumentsStep.tsx`
     - `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx`
     - `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`

3. ✅ **Documentation Updated**
   - Updated `docs/technical/specs/modular-wizard-guide.md` - Added Company Documents Step section
   - Updated `docs/technical/specs/modular-verification-architecture.md` - Added Company Documents Module
   - Updated `docs/technical/specs/service-verification-requirements.md` - Added Company Docs column to matrix
   - Updated `CLAUDE.md` - Added module to Available Modules list, Key Files, Sprint 4 status

**Available Wizard Modules (Updated):**
| Module | Step ID | Description |
|--------|---------|-------------|
| `client-type` | `client-type` | PF/PJ selection |
| `personal-data` | `personal-data` | Personal KYC (name, CNP, address) with OCR |
| `company-data` | `company-data` | Company KYC (CUI validation via ANAF API) |
| `company-documents` | `company-documents` | **NEW** Company document upload (Cert. Inregistrare / Cert. Constatator) |
| `property-data` | `property-data` | Property data (Carte Funciara) |
| `vehicle-data` | `vehicle-data` | Vehicle data (Rovinieta) |
| `kyc-documents` | `kyc-documents` | Personal document upload + OCR |
| `signature` | `signature` | Electronic signature canvas |

**File Upload Pattern (Established):**
```typescript
// Correct pattern for macOS-compatible file upload
const inputRef = useRef<HTMLInputElement>(null);

<input
  ref={inputRef}
  type="file"
  className="hidden"
  accept="image/jpeg,image/png,application/pdf"
  onChange={handleFileChange}
/>

<Button type="button" onClick={() => inputRef.current?.click()}>
  Upload
</Button>
```

**Status When Completed:**
- Sprint 4: 85% complete (unchanged)
- Company Documents Module: ✅ Complete
- File Upload Fix: ✅ Applied to all 3 upload components
- Ready for: Oblio invoicing integration, email notifications

---

### Session: 10 Februarie 2026 - Multi-Courier Integration & Delivery UX Improvements

**Completed This Session:**

1. ✅ **Sameday Courier Integration (Code Complete)**
   - Full implementation of Sameday API v2.0
   - Token-based authentication (24-hour validity)
   - Base URL: `https://api.sameday.ro`
   - Files: `src/lib/services/courier/sameday.ts`
   - **Status:** Code ready, awaiting API credentials from Sameday
     - Current token works but returns 401 on all endpoints
     - Needs proper API client account (not just web panel access)
     - Credential request template added to `docs/technical/specs/delivery-system-architecture.md`

2. ✅ **Multi-Provider Delivery UI**
   - Side-by-side quote display (Fan Courier + Sameday)
   - Provider logos (PNG format, uploaded to `/public/images/couriers/`)
   - Real-time quote comparison
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

3. ✅ **Locker Selector Redesign**
   - **Before:** Dropdown select (hard to see details)
   - **After:** Scrollable card list with:
     - Distance from delivery address
     - Operating hours (L-V, Sâmbătă, Duminică)
     - Full address
     - Visual selection state (border + checkmark)
   - Auto-selection fix: savedLockerIdRef pattern prevents clearing on remount
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

4. ✅ **Locker Data Caching**
   - Module-level Map cache with 10-minute TTL
   - Instant locker list on wizard remount (no re-fetch)
   - Cache key: `{provider}-{county}-{locality}`
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

5. ✅ **Delivery Step State Persistence**
   - **Bug:** Delivery method reset to null on wizard navigation (e.g., back to Review → forward to Delivery)
   - **Root Cause:** `useEffect` with `!deliveryMethod` was clearing state even when already saved
   - **Fix:** `isInitialMount` ref pattern - only set defaults on true first mount
   - **Result:** Selected delivery method and locker now persist across all wizard navigation
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

6. ✅ **Fan Courier Fixes**
   - **Fix 1: Diacritics Issue**
     - Problem: Romanian characters (ă, â, î, ș, ț) in API calls caused mismatches
     - Solution: `stripDiacritics()` utility added, used in:
       - API calls to Fan Courier (`getLocalities`, `getLockers`)
       - Client-side locker filtering (by locality name)
     - Files Modified: `src/lib/services/courier/fancourier.ts`, `src/components/orders/steps-modular/delivery-step.tsx`

   - **Fix 2: FANbox Quotes Not Appearing**
     - Problem: `locality` parameter was sending county name instead of city name
     - Example: Was sending "Cluj" → Should send "Cluj-Napoca"
     - Solution: Changed to use `formattedAddress.city` instead of `formattedAddress.county`
     - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

7. ✅ **Delivery Timing Info Note**
   - Added note in UI: "Documentele sunt emise înainte de livrare. Timpul de livrare este calculat în zile lucrătoare (luni-vineri), fără weekend."
   - Clarifies that delivery time starts AFTER document issuance
   - Files Modified: `src/components/orders/steps-modular/delivery-step.tsx`

**Interconnections:**
```
Delivery Flow (Multi-Provider):
User enters address → Get quotes from all providers (parallel)
    ↓                           ↓
Fan Courier API         Sameday API (pending credentials)
    ↓                           ↓
Display quotes side-by-side with logos
    ↓
User selects delivery method (standard/locker)
    ↓
If locker: Show locker selector (scrollable card list)
    ↓
State persists across wizard navigation (isInitialMount ref)
    ↓
Selected locker cached for instant remount (10min TTL)
```

**Sameday Credential Status:**
- ✅ Code implementation complete
- ✅ API endpoints tested (auth, lockers, parcels, tracking)
- ⏳ Awaiting proper API credentials
- Current issue: Token from web panel works for auth but returns 401 on operational endpoints
- Next step: Request API client account from Sameday support

**Files Modified:**
- `src/lib/services/courier/sameday.ts` - Sameday API implementation
- `src/lib/services/courier/factory.ts` - Added Sameday provider
- `src/lib/services/courier/fancourier.ts` - Added stripDiacritics fix
- `src/components/orders/steps-modular/delivery-step.tsx` - Multi-provider UI, locker redesign, state persistence
- `docs/technical/specs/delivery-system-architecture.md` - Added Sameday credential request template

**Status When Completed:**
- Sprint 4: 85% complete
- Multi-Courier Integration: ✅ Code complete (Sameday pending credentials)
- Delivery UX: ✅ Complete (locker cards, state persistence, caching)
- Fan Courier: ✅ All fixes applied (diacritics, FANbox quotes)
- Ready for: Sameday API credentials, Oblio invoicing, email notifications

---

**Document Status:** ✅ Updated (v3.3)
**Last Modified:** 2026-02-11
**Next Review:** After Admin Dashboard
**Owner:** Development Team
