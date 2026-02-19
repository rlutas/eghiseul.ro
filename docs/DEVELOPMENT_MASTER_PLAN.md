# eGhiseul.ro - Development Master Plan

**Version:** 4.6
**Last Updated:** 2026-02-19
**Status:** Sprint 4 In Progress (98%) | Sprint 5 In Progress (98%) | Admin Workflow ✅ | Document Generation ✅ | Multi-Signature ✅ | Contract Preview ✅ | Contract Legal Validity ✅ | Client Downloads ✅ | Extended RBAC ✅ | Number Registry ✅ | Gemini 2.5 Flash ✅ | KYC S3 Upload ✅ | Admin UI Polish ✅ | Review Step Pricing ✅ | Registry Own Page ✅ | User Invite ✅ | Template Placeholders ✅ | CLIENT_DETAILS_BLOCK Legal Format ✅ | KYC Confidence Tracking ✅

---

## PROGRESS SUMMARY

| Phase | Sprint | Status | Completion Date |
|-------|--------|--------|-----------------|
| MVP | Sprint 0: Setup | ✅ Complete | 2025-12-16 |
| MVP | Sprint 1: Auth & Users | ✅ Complete | 2025-12-16 |
| MVP | Sprint 2: Services Core | ✅ Complete | 2025-12-16 |
| MVP | Sprint 3: KYC & Documents | ✅ Complete | 2025-01-05 |
| MVP | Sprint 4: Payments & Contracts | ⏳ In Progress (98%) | - |
| MVP | Sprint 5: Admin Dashboard | ⏳ In Progress (98%) | - |
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
│   OCR:        Google Gemini 2.5 Flash (document extraction)         │
│   KYC:        Google Gemini 2.5 Flash (validation + face match)     │
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
| **User Data Persistence - Implementation** | `docs/technical/specs/user-data-persistence-implementation.md` | ✅ Complete |
| **Order Auto-Save System** | `docs/technical/specs/order-autosave-system.md` | ✅ Complete |
| **AWB Generation & Tracking** | `docs/technical/specs/awb-generation-tracking.md` | ✅ NEW |
| **Admin Panel Architecture** | `docs/admin/architecture.md` | ✅ Updated |
| **Admin RBAC & Permissions** | `docs/admin/rbac-permissions.md` | ✅ NEW |
| **Admin Security Audit** | `docs/admin/security-audit.md` | ✅ NEW |
| **Admin Document System** | `docs/technical/specs/admin-document-system.md` | ✅ Updated (multi-signature) |

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
| ✅ Admin RBAC setup (super_admin + employee) | Complete | Sprint 5 |

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
| `/api/ocr/extract` | POST | Extract data from ID/passport (Gemini 2.5 Flash) |
| `/api/kyc/validate` | GET | KYC validation service health check |
| `/api/kyc/validate` | POST | Validate KYC documents (Gemini 2.5 Flash) |
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
| ✅ Stripe checkout integration | Complete | Stripe PaymentElement |
| ✅ Apple Pay / Google Pay | Complete | Via Stripe PaymentElement |
| ✅ **Bank transfer payment** | Complete | `order-autosave-system.md` |
| ✅ Calcul preț dinamic | Complete | Service options + delivery pricing |
| ✅ **Generare documente DOCX** | Complete | docxtemplater + S3 upload + Google Docs preview |
| ⏳ Oblio facturare | Pending | - |
| ✅ **Order auto-save implementation** | Complete | `order-autosave-system.md` |
| ✅ **User data persistence** | Complete | `user-data-persistence.md` |
| ✅ **Account management tabs** | Complete | Profile, KYC, Addresses, Billing tabs |
| ✅ **KYC selfie with ID** | Complete | IdScanner with selfie_with_id support |
| ✅ **Duplicate prevention** | Complete | Addresses & billing profiles dedup |
| ✅ **Billing Step in Wizard** | Complete | `billing-step.tsx` - PF/PJ selection |
| ✅ **Security: IDOR Fix** | Complete | `docs/admin/security-audit.md` |
| ✅ **Security: Email Bypass Fix** | Complete | register-from-order hardened |
| ✅ **Security: Ownership Verification** | Complete | Draft PATCH requires email match |
| ✅ **KYC Document Persistence** | Complete | Saves to kyc_verifications on account creation |
| ✅ **Dual Profile System (PF + PJ)** | Complete | Company profile alongside personal profile |
| ✅ **Company Documents Wizard Step** | Complete | PJ document upload in order flow (company-documents module) |
| ✅ **Contract Preview in Wizard** | Complete | Live DOCX-to-HTML preview at signature step (`/api/contracts/preview`) |
| ✅ **Signature Image Embedding** | Complete | DrawingML inline images injected into DOCX via `signature-inserter.ts` |
| ✅ **Real Legal Contract Template** | Complete | `contract-complet.docx` (Contract Prestari + Asistenta + Nota Informare) |
| ✅ **Signature Data Flow** | Complete | Signature uploaded to S3 (`signature_s3_key`), falls back to inline `signature_base64` for legacy orders; embedded in generated documents via `getClientSignatureBase64()` |
| ✅ **Multi-Signature Document Generation** | Complete | Client drawn + company/lawyer predefined PNG signatures in generated DOCX |
| ✅ **Admin Signature & Stamp Upload** | Complete | Company signature, lawyer signature, lawyer stamp uploaded as PNG via S3 in admin settings |
| ✅ **DOCX Template Distinct Placeholders** | Complete | SEMNATURA_CLIENT, SEMNATURA_PRESTATOR, SEMNATURA_AVOCAT placeholders in templates |
| ✅ **Smart Signature Insertion** | Complete | DrawingML inline images with per-placeholder sizing (client 240x80pt, company/lawyer 180x60pt) |
| ✅ **Contract Preview API** | Complete | `POST /api/contracts/preview` - generates pre-filled contract HTML from wizard data |
| ✅ **Contract Legal Validity** | Complete | Signature metadata (IP, UA, timestamp, SHA-256 hash, consent), Law 214/2024, eIDAS Art. 25 |
| ✅ **Client Document Downloads** | Complete | Presigned S3 URLs for visible_to_client documents, account + public status pages |
| ✅ **Withdrawal Waiver Consent** | Complete | OUG 34/2014 art. 16 lit. (a) - mandatory checkbox in review step |
| ✅ **KYC S3 Upload at Submission** | Complete | KYC documents uploaded to S3 (not just base64), with presigned URLs |
| ✅ **KYC Thumbnail Previews** | Complete | Wizard shows thumbnail previews of uploaded ID docs |
| ✅ **OCR Street Prefix Fix** | Complete | Removes "Strada" prefix to prevent duplication |
| ✅ **KYC Face Matching Fix** | Complete | `getIDDocument()` type matching + API payload fix |
| ✅ **DocumentType Extension** | Complete | Added `ci_front`/`ci_back` variants |
| ✅ **Review Step Pricing** | Complete | Individual option prices, TVA 21%, full breakdown |
| ✅ **Contract Generator v1.2** | Complete | CI "emis de" in CLIENT_DETAILS_BLOCK, 20+ new placeholders |
| ✅ **CLIENT_DETAILS_BLOCK Legal Format** | Complete | Rewritten with proper Romanian legal identification: PF (legitimat/a cu CI seria, emisa de, CNP, cu domiciliul in Str/Nr/Bl/Sc/Et/Ap/Loc/Jud) + PJ (firma + CUI + reg com + sediu + reprezentata prin cu CI details) |
| ✅ **KYC Confidence Tracking** | Complete | Per-document AI confidence (CI front, CI back, selfie, face match) stored in wizard state via `KYCValidationResults` types, displayed in admin with color coding, warning when < 70% |
| ✅ **Contract Preview Legal Format** | Complete | Contract preview in wizard signature step uses the same legal CLIENT_DETAILS_BLOCK format |

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

#### Sprint 5: Admin Dashboard (Săptămâna 13-14) ⏳ IN PROGRESS (98%)

**Admin Panel Complete (Foundation + RBAC + Workflow + Documents + Settings + Dashboard):**
- **Access:** `/admin` (local: `http://localhost:3000/admin`)
- **Current Admin User:** `serviciiseonethut@gmail.com` (role: `super_admin`)
- **RBAC Implemented:** 7 granular permissions (`orders.view`, `orders.manage`, `payments.verify`, `users.manage`, `settings.manage`, `documents.generate`, `documents.view`)
- **Roles:** `super_admin` (all), `manager` (all), `operator` (orders + docs), `contabil` (orders + payments), `avocat` (orders + docs view), `employee` (configurable JSONB)
- **Admin Docs:** `docs/admin/` (architecture, RBAC, workflow-design, security audit)
- **Key Features:** Dashboard, orders management, AWB generation, document generation, status workflow, user management, settings with company/lawyer data

| Task | Status | Spec Reference |
|------|--------|----------------|
| ✅ **Admin layout with sidebar** | Complete | `docs/admin/architecture.md` |
| ✅ **Admin dashboard (live stats)** | Complete | Stats cards, recent orders, activity feed |
| ✅ **Lista comenzi** | Complete | All orders with filtering |
| ✅ **Detalii comandă** | Complete | Full order details page |
| ✅ **AWB Generation** | Complete | Fan Courier + Sameday AWB |
| ✅ **AWB Label Download** | Complete | PDF download endpoint |
| ✅ **AWB Cancellation** | Complete | Cancel AWB API |
| ✅ **Tracking Timeline** | Complete | Real-time tracking display |
| ✅ **Database Schema (AWB)** | Complete | Migration 022 (tracking columns) |
| ✅ **Tracking Cron Job** | Complete | `/api/cron/update-tracking` |
| ✅ **Admin docs reorganized** | Complete | `docs/admin/` (architecture, RBAC, security) |
| ✅ **RBAC Foundation** | Complete | Migration 023/024, permissions middleware, layout context |
| ✅ **Extended RBAC (5 roles)** | Complete | Migration 025, manager/operator/contabil/avocat roles |
| ✅ **User Management** | Complete | Employees, customers, invitations tabs |
| ✅ **Employee Invite Flow** | Complete | Modal, API, accept page with 8 states |
| ✅ **Settings Pages (6 tabs)** | Complete | Services, couriers, payments, **date firma**, **template-uri documente**, system |
| ✅ **Dashboard Enhancement** | Complete | Live stats API, activity feed API, recent orders |
| ✅ **Status Workflow (manual)** | Complete | Process API with valid transitions, contextual buttons |
| ✅ **Document Generation** | Complete | docxtemplater auto-generates contracts (contract-prestari, contract-asistenta); imputernicire & cereri use admin-uploaded custom DOCX templates from S3 |
| ✅ **Company & Lawyer Settings** | Complete | Admin settings tab with company/lawyer data + counters |
| ✅ **Service Processing Config** | Complete | `processing_config` JSONB on services table |
| ✅ **Order Documents Table** | Complete | Migration 025, order_documents with S3 keys |
| ✅ **Order Options Status** | Complete | Migration 025, order_option_status for extras tracking |
| ✅ **Notifications Table** | Complete | Migration 025, in-app notifications schema |
| ⏳ Statistici avansate (charts) | Pending | Revenue charts with recharts |
| ⏳ **Support notes system** | Pending | `order-autosave-system.md` |
| ⏳ **Continue order on behalf** | Pending | `order-autosave-system.md` |
| ⏳ **Email templates editor** | Pending | Deferred to Sprint 6 |
| ⏳ **Audit logging** | Pending | admin_activity_log table |

**RBAC Implementation** (See: `docs/admin/rbac-permissions.md`):

| Task | Status | Priority |
|------|--------|----------|
| ✅ DB migration: roles constraint + permissions JSONB + `employee_invitations` + `admin_settings` | Complete | HIGH |
| ✅ DB migration: `blocked_at` column on profiles | Complete | HIGH |
| ✅ DB migration 025: Extended roles (manager, operator, contabil, avocat) + workflow tables | Complete | HIGH |
| ✅ Permission middleware with ROLE_DEFAULTS (`src/lib/admin/permissions.ts`) | Complete | HIGH |
| ✅ Client-side hook with role defaults (`src/hooks/use-admin-permissions.tsx`) | Complete | HIGH |
| ✅ Admin layout permission context + filtered nav | Complete | HIGH |
| ✅ All endpoints updated with requirePermission (7 permissions) | Complete | HIGH |
| ✅ User management page (`/admin/users`) - 3 tabs | Complete | HIGH |
| ✅ Employee invite flow (modal + email + accept page) | Complete | MEDIUM |
| ✅ Settings pages (`/admin/settings`) - 5 tabs (added "Date firma") | Complete | MEDIUM |
| ✅ Dashboard stats + activity feed APIs | Complete | MEDIUM |
| ⏳ Audit logging (admin actions) | Pending | MEDIUM |
| ⏳ Rate limiting on invitations | Pending | MEDIUM |

**Admin Workflow System** (See: `docs/admin/workflow-design.md`):

| Task | Status | Priority |
|------|--------|----------|
| ✅ Status flow: paid → processing → documents_generated → submitted → received → ready → shipped → completed | Complete | HIGH |
| ✅ Process API (`/api/admin/orders/[id]/process`) with transition validation | Complete | HIGH |
| ✅ Document generation (`/api/admin/orders/[id]/generate-document`) with docxtemplater | Complete | HIGH |
| ✅ DOCX templates: contract-prestari, contract-asistenta (auto-generated); imputernicire, cerere-eliberare PF/PJ (admin-uploaded custom templates from S3) | Complete | HIGH |
| ✅ Atomic document counters (Number Registry System - `allocate_number` RPC) | Complete | HIGH |
| ✅ ProcessingSection UI with contextual action buttons per status | Complete | HIGH |
| ✅ Document checklist with download buttons in order detail | Complete | MEDIUM |
| ✅ Options status tracking (traducere, apostila completion) | Complete | MEDIUM |
| ✅ **S3 upload for generated documents** | Complete | Documents uploaded to S3 after generation |
| ✅ **Mammoth DOCX-to-HTML preview** | Complete | Server-side DOCX preview without download |
| ✅ **Document regeneration support** | Complete | Re-generate button in admin UI |
| ✅ **Client uploaded docs in admin** | Complete | KYC/company docs visible in admin order detail |
| ✅ **S3 document key reorganization** | Complete | New `generateDocumentKey()` organizes docs under `orders/{friendly_id}/{type}/` |
| ✅ **Document generation error handling** | Complete | S3 upload + DB insert failures return 500 with cleanup; safe insert-before-delete ordering |
| ✅ **Admin document download button** | Complete | "Descarca" button on every document row in processing section |
| ✅ **Preview page enhancements** | Complete | "Descarca DOCX" button in toolbar, info note, `?print=1` auto-print support |
| ✅ **Download access control update** | Complete | Covers both `contracts/` (legacy) and `orders/` (new) S3 prefixes |
| ✅ **Order history in Romanian** | Complete | All timeline events translated to Romanian |
| ✅ **AWB error message fix** | Complete | Proper error formatting for courier API errors |
| ✅ **Multi-signature document generation** | Complete | Client + company + lawyer signatures embedded as DrawingML images |
| ✅ **Admin signature & stamp upload** | Complete | Company sig, lawyer sig, lawyer stamp PNG via S3 in settings |
| ✅ **Distinct DOCX signature placeholders** | Complete | SEMNATURA_CLIENT, SEMNATURA_PRESTATOR, SEMNATURA_AVOCAT in templates |
| ✅ **Smart signature insertion in DOCX** | Complete | DrawingML inline images with per-placeholder sizing |
| ✅ **Custom template upload system** | Complete | Admin uploads custom DOCX templates (imputernicire, cerere-eliberare-pf, cerere-eliberare-pj) via "Template-uri documente" settings tab, stored in S3 `templates/custom/`, referenced in `admin_settings.document_templates` |
| ✅ **Number Registry System (Barou)** | Complete | `number_ranges` + `number_registry` tables, `allocate_number()` RPC, admin "Registru Numere" tab (ranges, journal, manual entry, void, CSV export). Replaced legacy `increment_document_counter`. See `docs/technical/specs/number-registry-system.md` |
| ✅ **Number Registry Grouped View** | Complete | Table rows grouped by order (contract + delegation on same row), CSV export remains flat |
| ✅ **Registry Own Page** | Complete | Moved from settings tab to `/admin/registru` with sidebar navigation, document download icons, CSV document column |
| ✅ **Registry-Document Linking Fix** | Complete | `order_document_id` properly set for reused numbers on document regeneration |
| ✅ **Admin Order Detail Polish** | Complete | Personal data 2-col grid, address 3-col grid, billing PF fix, payment method with Stripe link |
| ✅ **Admin Documents in Pending** | Complete | Documents visible regardless of order status |
| ✅ **Admin extractKycDocKeys Fix** | Complete | Handles array format for KYC document references |
| ✅ **Success/Status Pages Enhanced** | Complete | Dynamic processing time, VAT 21% breakdown |
| ⏳ Auto-generate documents at payment (webhook integration) | Pending | MEDIUM |

**Remaining Admin Features:**
- Revenue charts (recharts)
- Add internal notes to orders
- Continue incomplete orders on behalf of customers
- Audit logging for admin actions
- Auto-generate contracts (contract-prestari, contract-asistenta) at payment confirmation (webhook trigger)

**Recently Completed (Sprint 4/5):**
- ✅ Number Registry System (Barou) -- `number_ranges` + `number_registry` tables, `allocate_number()` RPC with reuse logic, admin "Registru Numere" tab (ranges management, journal, manual entry, void, CSV export), backfilled historical entries
- ✅ Number Registry grouped view -- table rows grouped by order (contract + delegation on same row), CSV export remains flat
- ✅ Gemini model upgrade -- both OCR (`document-ocr.ts`) and KYC (`kyc-validation.ts`) upgraded to `gemini-2.5-flash`
- ✅ KYC face matching fix -- `getIDDocument()` type matching corrected + API payload fix for reference image
- ✅ DocumentType extended with `ci_front`/`ci_back` variants for proper KYC document handling
- ✅ KYC documents upload to S3 at submission -- documents stored in S3 (not just base64 in DB), with presigned URLs
- ✅ KYC step thumbnail previews -- uploaded ID documents show thumbnail previews in the wizard
- ✅ OCR street prefix removal -- prevents "Strada Salcamilor" duplication in address fields
- ✅ Admin order detail UI polish -- personal data in compact 2-col grid, address as separate fields in 3-col grid
- ✅ Admin billing data fix -- PF details now display correctly (not empty)
- ✅ Admin payment method display -- shows "Stripe (card)" with link to Stripe dashboard
- ✅ Admin documents visible in pending status -- no longer requires specific status to view documents
- ✅ Admin `extractKycDocKeys` fixed -- handles array format for KYC document references
- ✅ Review step pricing overhaul -- individual option prices shown, TVA corrected to 21%, full price breakdown
- ✅ Success/status pages enhanced -- dynamic processing time, VAT 21% breakdown display
- ✅ Contract generator v1.2 -- CI "emis de" info added to CLIENT_DETAILS_BLOCK, 20+ new template placeholders
- ✅ Multi-signature document generation (client drawn + company/lawyer predefined PNG)
- ✅ Contract preview in wizard (signature step shows pre-filled contract HTML)
- ✅ Admin signature & stamp upload (company signature, lawyer signature, lawyer stamp via S3)
- ✅ DOCX template with distinct signature placeholders (SEMNATURA_CLIENT, SEMNATURA_PRESTATOR, SEMNATURA_AVOCAT)
- ✅ Smart signature insertion in generated documents (DrawingML inline images with per-placeholder sizing)
- ✅ Contract preview API (`POST /api/contracts/preview`)
- ✅ Contract legal validity system (signature metadata: IP, user agent, server timestamp, SHA-256 document hash, consent state)
- ✅ Client document downloads (presigned S3 URLs, account page + public status page)
- ✅ Consent UI with legal references (Law 214/2024, eIDAS Art. 25, OUG 34/2014 withdrawal waiver)
- ✅ S3 document key reorganization (`generateDocumentKey()` with `orders/{friendly_id}/{type}/` paths)
- ✅ Document generation error handling (S3/DB failure returns 500, orphan cleanup, safe insert-before-delete)
- ✅ Admin document download button ("Descarca" on every document row)
- ✅ Preview page enhancements ("Descarca DOCX" toolbar button, info note, `?print=1` auto-print)
- ✅ Download access control updated for both `contracts/` (legacy) and `orders/` (new) S3 prefixes
- ✅ Registry moved to own page `/admin/registru` -- dedicated sidebar item with BookOpen icon, no longer a tab in settings
- ✅ Registry-document linking fix -- `order_document_id` now properly set for reused numbers (regenerated documents)
- ✅ Registry table document download icons -- FileDown icon next to numbers links to download the associated document
- ✅ CSV export includes "Document" column -- linked filename shown in exported CSV
- ✅ Add User (invite) button -- super_admin can invite new employees from the Users page
- ✅ CLIENT_BIRTH_PLACE and CLIENT_BIRTH_COUNTRY template placeholders -- added to document generator for birth certificate services
- ✅ Date formatting fix -- birth date and CI expiry date no longer show time portion in generated documents
- ✅ TVA 21% unified -- OrderSummaryCard fixed to use 21% consistently across all components
- ✅ Timeline events added -- `order_submitted` and `document_generation_failed` events recorded in order history
- ✅ Status page prices fixed -- amounts displayed with `.toFixed(2)` for consistent decimal formatting
- ✅ File input reset in PersonalDataStep -- file input clears properly after document upload
- ✅ Signature card empty state fixed -- signature step shows proper empty state when no signature drawn
- ✅ CLIENT_DETAILS_BLOCK legal format rewrite -- proper Romanian legal identification format for both PF (CI seria/nr, emisa de, CNP, domiciliu cu Str/Nr/Bl/Sc/Et/Ap/Loc/Jud) and PJ (firma + CUI + Nr. Reg. Com. + sediu + reprezentata prin cu CI details)
- ✅ KYC confidence tracking per document -- `KYCValidationResults` type with per-document confidence (CI front, CI back, selfie + face match), stored in wizard state, displayed in admin order detail with color-coded percentages (green >= 70%, warning < 70%)
- ✅ Contract preview legal format updated -- wizard signature step preview uses same CLIENT_DETAILS_BLOCK format as generated documents

#### Sprint 6: Notifications & Polish (Săptămâna 15-16) ⏳ PENDING

| Task | Status |
|------|--------|
| ⏳ Email templates (order confirmation, status changes, payment receipt) | Pending |
| ⏳ Resend integration | Pending |
| ⏳ SMS notifications (SMSLink.ro) | Pending |
| ⏳ Notificări real-time (WebSocket) | Pending |
| ⏳ Mobile responsive polish | Pending |
| ⏳ Post-order delivery request (client requests delivery after checkout) | Pending |
| ⏳ Stripe-Invoice reconciliation view for accounting | Pending |
| ⏳ Oblio invoicing integration (e-factura) | Pending |
| ⏳ Revenue charts (recharts) in admin dashboard | Pending |
| ⏳ Audit logging for admin actions | Pending |
| ⏳ Date formatting fixes in admin (Romanian locale) | Pending |

---

### BACKLOG / FUTURE FEATURES

Features planned but not yet scheduled for a specific sprint.

#### Post-Order Delivery Request

**Problem:** Currently, if a client chooses "no delivery" (ridicare personala) at checkout, they cannot request delivery later. Clients sometimes change their mind after placing an order and want the document delivered by courier.

**Requirements:**
- Client can request delivery from their account page (`/account/orders/[id]`) or order status page (`/comanda/status`)
- Separate payment flow for the delivery fee (Stripe payment intent for just the courier cost)
- Admin is notified of the delivery add-on request
- AWB generation follows the existing courier flow (Fan Courier / Sameday)
- Order record updated with delivery details (address, courier, AWB)

**Scope:** New API endpoint (`POST /api/orders/[id]/request-delivery`), UI changes on account/status pages, Stripe payment for delivery fee only, admin notification.

#### Stripe-Invoice Reconciliation for Accounting

**Problem:** The accountant (contabila) needs to reconcile Stripe payments with Oblio invoices. Stripe aggregates all daily card payments into a single bank transfer (payout), making it difficult to match each invoice number with its corresponding Stripe transaction.

**Requirements:**
- Each order should store and display the Stripe payment intent ID (or charge ID) alongside the invoice number
- Admin orders list should show a column or expandable detail with the Stripe reference
- Optionally, a dedicated "Reconciliation" view in admin that lists: invoice number, order ID, Stripe payment intent ID, amount, date
- Export to CSV for the accountant to cross-reference with Stripe dashboard / bank statements
- Consider linking to Stripe payout ID to group which invoices were included in which bank transfer

**Scope:** Store `stripe_payment_intent_id` on orders (already partially done via webhook), expose in admin UI, optional reconciliation page in `/admin/accounting` or `/admin/settings`, CSV export.

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
│   │   │   ├── admin/              # ✅ Admin endpoints (RBAC protected)
│   │   │   │   ├── orders/lookup/  # Order lookup
│   │   │   │   ├── orders/list/    # Orders list
│   │   │   │   ├── orders/[id]/    # AWB gen, label, cancel, verify
│   │   │   │   ├── dashboard/      # Stats + activity APIs
│   │   │   │   ├── users/          # Invite, employees, customers, invitations
│   │   │   │   ├── settings/       # General + services settings
│   │   │   │   ├── invite/accept/  # Public invite acceptance
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
│   │           └── signature/
│   │               ├── SignatureStep.tsx
│   │               └── ContractPreview.tsx
│   │
│   ├── lib/
│   │   ├── supabase/               # ✅ Supabase clients
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── services/               # ✅ External services
│   │   │   ├── document-ocr.ts     # Gemini 2.5 Flash OCR
│   │   │   ├── kyc-validation.ts   # Gemini 2.5 Flash KYC
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
│   ├── admin/                      # ✅ Admin panel documentation (NEW)
│   │   ├── architecture.md         # Admin panel structure & routes
│   │   ├── rbac-permissions.md     # RBAC system & permissions plan
│   │   ├── security-audit.md       # Admin security audit & fixes
│   │   └── README.md               # Admin docs index
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
6. ✅ **Sameday Courier Integration** - Production live
   - Full Sameday API implementation (lockers, parcels, tracking)
   - Production credentials: `edigitalizareAPI` on `api.sameday.ro`
   - 6073 EasyBox lockers available, 21 services, token valid 14 days
   - Multi-provider delivery UI (Fan Courier + Sameday side-by-side)
   - Provider logos and real-time quotes
   - Files: `src/lib/services/courier/sameday.ts`, `src/lib/services/courier/factory.ts`

7. ✅ **Locker Selector Redesign** - Improved UX for FANbox/EasyBox
   - Scrollable card list replacing dropdown
   - Distance display, operating hours, address details
   - Auto-selection on wizard navigation (savedLockerIdRef pattern)
   - Module-level locker cache (10min TTL, instant remount)

8. ✅ **Street-Level Geocoding for Locker Distance Sorting** - Accurate distance calculation
   - Street-level geocoding via Nominatim OpenStreetMap API (free)
   - 3-tier fallback: street → city → GPS
   - Debounced re-sort (1 second) when street field changes
   - Distance improvement: ~400m in small cities, 2-5km in large cities vs city-center sorting
   - Respects Nominatim 1 req/sec rate limit
   - Files: `src/components/orders/steps-modular/delivery-step.tsx`

9. ✅ **Delivery Step State Persistence** - Fixed state loss on navigation
   - isInitialMount ref pattern prevents clearing saved data
   - Preserves selected delivery method and locker across steps
   - Delivery timing info note (documents issued before shipping)

10. ✅ **Fan Courier Fixes**
   - Fixed diacritics issue (stripDiacritics for API calls + client filtering)
   - Fixed FANbox quotes not appearing (locality param was county instead of city)
   - Fixed locker data caching for instant remount

11. ✅ **FANbox 24-Hour Cache** - Performance optimization
   - Module-level server cache (same pattern as Sameday)
   - 24-hour TTL (FANBOX_CACHE_TTL = 86400000ms)
   - Shared across all users, reduces Fan Courier API load
   - First request fetches, subsequent requests use cache
   - Files: `src/lib/services/courier/fancourier.ts`

12. ✅ **Postal Code Auto-Fill** - UX improvement
   - `/api/courier/localities` enriches Fan Courier cities with Sameday postal codes
   - 238/239 localities have postal codes (99.6% coverage)
   - Auto-fills when city selected (after field reset to avoid race conditions)
   - User can override if needed
   - Files: `src/app/api/courier/localities/route.ts`, delivery-step.tsx

13. ✅ **Form Field Reset on Location Change** - Prevents invalid addresses
   - County change resets: city, street, number, building, postalCode + clears errors
   - City change resets: street, number, building + auto-fills postalCode
   - Uses `form.setValue(..., { shouldValidate: false })` to prevent red errors on empty fields
   - Clean UX: no premature validation errors
   - Files: `src/components/orders/steps-modular/delivery-step.tsx`

14. ✅ **Mobile Layout Improvements** - Compact address form
   - Changed grid from `grid-cols-1 sm:grid-cols-2` to always `grid-cols-2`
   - Street + Number on same row: `grid-cols-[1fr_80px] sm:grid-cols-[1fr_100px]`
   - County + City already on same row
   - Building + Postal Code on same row
   - Better mobile screen utilization, reduced scrolling

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
- **OCR API**: `/api/ocr/extract` - Google Gemini 2.5 Flash
- **KYC API**: `/api/kyc/validate` - Google Gemini 2.5 Flash
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
     - `docs/admin/security-audit.md`
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
- Courier System: ✅ Sameday live, ⏳ DHL, UPS, FedEx pending
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

1. ✅ **Sameday Courier Integration (Production Live)**
   - Full implementation of Sameday API v2.0
   - Token-based authentication (14-day validity)
   - Base URL: `https://api.sameday.ro`
   - Account: `edigitalizareAPI` (production)
   - 6073 EasyBox lockers, 21 services available
   - Confirmed service IDs: 7 (24H), 15 (Locker NextDay), 57 (PUDO NextDay)
   - Estimate endpoint returns 405 on this account, falls back to base price quotes (working as designed)
   - Files: `src/lib/services/courier/sameday.ts`

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
Fan Courier API         Sameday API (production live)
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
- ✅ Production live with `edigitalizareAPI` account
- ✅ Auth works, token valid 14 days
- ✅ 6073 EasyBox lockers available
- ✅ 21 services available (24H, Locker NextDay, PUDO, etc.)
- Note: Estimate endpoint returns 405, falls back to base price quotes (working as designed)

**Files Modified:**
- `src/lib/services/courier/sameday.ts` - Sameday API implementation
- `src/lib/services/courier/factory.ts` - Added Sameday provider
- `src/lib/services/courier/fancourier.ts` - Added stripDiacritics fix
- `src/components/orders/steps-modular/delivery-step.tsx` - Multi-provider UI, locker redesign, state persistence
- `docs/technical/specs/delivery-system-architecture.md` - Added Sameday credential request template

**Status When Completed:**
- Sprint 4: 85% complete
- Multi-Courier Integration: ✅ Complete (Fan Courier + Sameday both live)
- Delivery UX: ✅ Complete (locker cards, state persistence, caching)
- Fan Courier: ✅ All fixes applied (diacritics, FANbox quotes)
- Ready for: Oblio invoicing, email notifications

---

### Session: 16 Februarie 2026 - AWB Generation, Admin Panel & Tracking System

**Completed This Session:**

1. ✅ **Address Fields Refactoring**
   - Separated "Bloc / Scara / Etaj / Ap." into 4 individual fields
   - Updated AddressState type, Zod schema, form UI
   - Context sync for seamless wizard integration
   - Files Modified: `src/providers/modular-wizard-provider.tsx`, `src/components/orders/steps-modular/delivery-step.tsx`

2. ✅ **Database Schema Updates (Migration 022)**
   - New columns: `delivery_tracking_events` (JSONB), `delivery_tracking_status`, `delivery_tracking_last_update`
   - Indexes on `courier_provider`, `tracking_number`, `tracking_status`
   - CHECK constraint on tracking status values
   - File: `supabase/migrations/022_add_delivery_tracking.sql`

3. ✅ **AWB Generation API Endpoints**
   - `POST /api/admin/orders/[id]/generate-awb` - Generate AWB (Fan Courier/Sameday)
   - `GET /api/admin/orders/[id]/awb-label` - Download AWB label PDF
   - `POST /api/admin/orders/[id]/cancel-awb` - Cancel AWB
   - `GET /api/orders/[id]/tracking` - Public tracking timeline
   - `POST /api/cron/update-tracking` - Cron job for tracking updates
   - Files: `src/app/api/admin/orders/[id]/*`, `src/app/api/orders/[id]/tracking/`, `src/app/api/cron/update-tracking/`

4. ✅ **Admin Panel Foundation**
   - **Admin Layout** (`src/app/admin/layout.tsx`)
     - Sidebar navigation with links (Dashboard, Orders, Settings)
     - Protected route with admin role check
   - **Admin Dashboard** (`src/app/admin/page.tsx`)
     - Overview stats cards (Total Orders, Pending, Delivered, Revenue)
     - Quick action buttons
   - **Orders List Page** (`src/app/admin/orders/page.tsx`)
     - All orders with status filtering
     - Order number, customer, service, status, date
     - Click to view details
   - **Order Detail Page** (`src/app/admin/orders/[id]/page.tsx`)
     - Full order information display
     - AWB generation section (provider selection, generate button)
     - AWB label download and cancellation
     - Tracking timeline integration
   - Files: `src/app/admin/*`

5. ✅ **Customer Tracking Timeline Component**
   - Visual timeline with status icons
   - Real-time tracking events from courier APIs
   - Auto-refresh every 5 minutes (when visible)
   - 30-minute server-side cache
   - Delivery estimation display
   - Integrated in:
     - Account orders detail page (`src/app/account/orders/[id]/page.tsx`)
     - Public order status page (`src/app/comenzi/[id]/page.tsx`)
     - Admin order detail page
   - File: `src/components/orders/tracking-timeline.tsx`

6. ✅ **Tracking Cron Job & Automation**
   - Vercel cron configuration (`vercel.json`)
   - Hourly updates for all active shipments
   - CRON_SECRET environment variable for authentication
   - Endpoint: `/api/cron/update-tracking`
   - File: `vercel.json`

7. ✅ **Documentation Updates**
   - **AWB Generation & Tracking** (`docs/technical/specs/awb-generation-tracking.md`)
     - Complete AWB generation flow
     - Tracking system architecture
     - API reference
     - Database schema
     - Cron job details
   - **Admin Panel Architecture** (`docs/admin/architecture.md`)
     - Admin panel structure
     - Routes and permissions
     - Component hierarchy
     - Future enhancements
   - **Admin RBAC & Permissions** (`docs/admin/rbac-permissions.md`)
     - 5 granular permissions system
     - Role definitions (super_admin, employee)
     - employee_invitations table schema
   - **Admin Security Audit** (`docs/admin/security-audit.md`)
     - IDOR fixes, ownership checks
     - Client-side security patterns

**Interconnections:**
```
Order Flow with AWB & Tracking:
Customer completes order → Payment confirmed → Admin notified
    ↓
Admin opens order detail page
    ↓
Selects courier provider (Fan Courier / Sameday)
    ↓
Clicks "Generate AWB" → API creates shipment with courier
    ↓
AWB number saved to database → Label PDF available for download
    ↓
Cron job runs hourly → Fetches tracking updates from courier API
    ↓
Tracking timeline updated in database (delivery_tracking_events)
    ↓
Customer views tracking timeline:
  - Account page (/account/orders/[id])
  - Public status page (/comenzi/[id])
  - Auto-refreshes every 5 min when visible
```

**Files Created:**
- `supabase/migrations/022_add_delivery_tracking.sql`
- `src/app/api/admin/orders/[id]/generate-awb/route.ts`
- `src/app/api/admin/orders/[id]/awb-label/route.ts`
- `src/app/api/admin/orders/[id]/cancel-awb/route.ts`
- `src/app/api/orders/[id]/tracking/route.ts`
- `src/app/api/cron/update-tracking/route.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/orders/[id]/page.tsx`
- `src/components/orders/tracking-timeline.tsx`
- `docs/technical/specs/awb-generation-tracking.md`
- `docs/admin/architecture.md` (moved from `docs/technical/specs/admin-panel-architecture.md`)
- `docs/admin/rbac-permissions.md`
- `docs/admin/security-audit.md` (moved from `docs/technical/specs/security-audit-admin-client.md`)
- `vercel.json` (cron config)

**Files Modified:**
- `CLAUDE.md` - Added new endpoints, admin panel section, tracking info
- `docs/README.md` - Added new documentation references
- `docs/DEVELOPMENT_MASTER_PLAN.md` - Updated Sprint 4/5 progress
- `src/providers/modular-wizard-provider.tsx` - Address field refactoring
- `src/components/orders/steps-modular/delivery-step.tsx` - Separate address fields

**Status When Completed:**
- Sprint 4: 92% complete
- Sprint 5: 40% complete (Admin Panel Foundation)
- AWB Generation & Tracking: ✅ Complete (Both couriers)
- Admin Panel: ✅ Foundation complete (layout, dashboard, orders, AWB)
- Tracking System: ✅ Complete (Timeline, cron, API)
- Ready for: Oblio invoicing, email notifications, advanced admin features

---

### Session: 16 Februarie 2026 - RBAC, User Management, Settings & Dashboard Enhancement

**Completed This Session:**

1. ✅ **RBAC Foundation (Phase 1)**
   - Migration 023: Updated `profiles.role` constraint (super_admin, employee, customer, partner), added `permissions` JSONB column, migrated admin->super_admin, created `employee_invitations` table with RLS, created `admin_settings` table with RLS
   - Migration 024: Added `blocked_at` column to profiles
   - Server-side permission middleware: `src/lib/admin/permissions.ts` (checkPermission, requirePermission, getUserPermissions, requireAdmin, ALL_PERMISSIONS)
   - Client-side permission hook: `src/hooks/use-admin-permissions.tsx` (AdminPermissionProvider, useAdminPermissions)
   - Updated admin layout: role check uses super_admin/employee, fetches permissions, wraps children with AdminPermissionProvider, nav items filtered by permission
   - All 7 existing admin API endpoints updated with requirePermission checks

2. ✅ **User Management (Phase 2)**
   - Employee invite API: `POST /api/admin/users/invite`
   - Invitations list + revoke: `GET/DELETE /api/admin/users/invitations`
   - Employees list + edit + remove: `GET/PATCH/DELETE /api/admin/users/employees`
   - Customers list + detail + block: `GET/PATCH /api/admin/users/customers`
   - Invite accept flow: `GET/POST /api/admin/invite/accept` (public, token-based)
   - Full users management page: `src/app/admin/users/page.tsx` (3 tabs: Employees, Customers, Invitations)
   - Invite acceptance page: `src/app/admin/invite/accept/page.tsx` (8 UI states)

3. ✅ **Settings Pages (Phase 3)**
   - Admin settings API: `GET/PATCH /api/admin/settings`
   - Services settings API: `GET/PATCH /api/admin/settings/services`
   - Settings page: `src/app/admin/settings/page.tsx` (4 tabs: Services, Couriers, Payments, System)
   - Installed shadcn Switch component

4. ✅ **Dashboard Enhancement (Phase 4)**
   - Dashboard stats API: `GET /api/admin/dashboard/stats` (orders today, revenue, pending shipments, pending payments)
   - Activity feed API: `GET /api/admin/dashboard/activity` (recent events from order_history)
   - Updated dashboard page: `src/app/admin/page.tsx` (stats cards, recent orders table, activity feed)

5. ✅ **Documentation Update**
   - Updated `docs/admin/README.md` with full implementation status
   - Updated `docs/admin/rbac-permissions.md` with implementation notes
   - Updated `CLAUDE.md` with all new endpoints, files, and status
   - Updated `docs/DEVELOPMENT_MASTER_PLAN.md` Sprint 5 progress

6. ✅ **Critical Bug Fixes**
   - **Middleware Role Check**: Fixed `src/lib/supabase/middleware.ts` to check `!['super_admin', 'employee'].includes(profile.role)` instead of `profile?.role !== 'admin'` (enables admin access with new RBAC roles)
   - **Admin Orders RLS Bypass**: Updated `src/app/admin/orders/page.tsx` and `src/app/admin/page.tsx` to call API endpoints instead of direct `createClient()` calls (admins can now see all orders, not just their own)
   - **PostgREST JSONB Search**: Fixed `/api/admin/orders/list` nested JSON syntax from `customer_data->>contact->>email` to `customer_data->contact->>email` (email search now works correctly)

**Files Created:**
- `supabase/migrations/023_rbac_permissions.sql`
- `supabase/migrations/024_blocked_at.sql`
- `src/lib/admin/permissions.ts`
- `src/hooks/use-admin-permissions.tsx`
- `src/app/api/admin/users/invite/route.ts`
- `src/app/api/admin/users/invitations/route.ts`
- `src/app/api/admin/users/invitations/[id]/route.ts`
- `src/app/api/admin/users/employees/route.ts`
- `src/app/api/admin/users/employees/[id]/route.ts`
- `src/app/api/admin/users/customers/route.ts`
- `src/app/api/admin/users/customers/[id]/route.ts`
- `src/app/api/admin/invite/accept/route.ts`
- `src/app/api/admin/settings/route.ts`
- `src/app/api/admin/settings/services/route.ts`
- `src/app/api/admin/dashboard/stats/route.ts`
- `src/app/api/admin/dashboard/activity/route.ts`
- `src/app/admin/users/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/invite/accept/page.tsx`

**Files Modified:**
- `src/app/admin/layout.tsx` - RBAC role check, permission context, filtered nav
- `src/app/admin/page.tsx` - Dashboard with live stats, recent orders, activity feed (BUG FIX: now calls API instead of direct DB)
- `src/app/admin/orders/page.tsx` - BUG FIX: now calls `/api/admin/orders/list` instead of direct DB
- `src/lib/supabase/middleware.ts` - BUG FIX: role check updated for super_admin/employee
- `src/app/api/admin/orders/list/route.ts` - BUG FIX: corrected PostgREST JSONB nested path syntax
- All 7 existing admin API routes - Added requirePermission() checks
- `CLAUDE.md` - Updated admin section, endpoints, Sprint status
- `docs/admin/README.md` - Full implementation status update + bug fixes section
- `docs/admin/rbac-permissions.md` - Added implementation notes + bug fixes section
- `docs/DEVELOPMENT_MASTER_PLAN.md` - Sprint 5 progress, session log, bug fixes

**Status When Completed:**
- Sprint 4: 92% complete
- Sprint 5: 85% complete (RBAC + User Management + Settings + Dashboard)
- RBAC: ✅ Complete (5 permissions, server + client enforcement)
- User Management: ✅ Complete (employees, customers, invitations)
- Settings: ✅ Complete (services, couriers, payments, system)
- Dashboard: ✅ Complete (stats, activity feed, recent orders)
- Remaining: Charts (recharts), notes system, audit logging, email templates

---

### Session: 17 Februarie 2026 - Contract Preview + Signature Embedding

**Completed This Session:**

1. ✅ **Real Legal Contract Template**
   - Replaced placeholder DOCX templates with actual legal contract template
   - New template: `contract-complet.docx` (combined Contract Prestari Servicii + Contract Asistenta Juridica + Nota de Informare)
   - Stored in `src/templates/shared/` and `src/templates/cazier-judiciar/`
   - Fixed Zapier remnant placeholders, replaced hardcoded lawyer data with dynamic placeholders
   - New placeholders: `LAWYER_CABINET`, `LAWYER_NAME`, `LAWYER_ADDRESS`, `LAWYER_CIF`, `LAWYER_FEE`, `LAWYER_JUDET`, `JUDETFIRMA`

2. ✅ **Signature Image Embedding in DOCX**
   - New library: `src/lib/documents/signature-inserter.ts`
   - Post-processes rendered DOCX ZIP to inject PNG signature images via DrawingML inline images
   - Replaces `SIGNATURE_PLACEHOLDER` text runs with actual signature images (240pt x 80pt)
   - `generateDocument()` now accepts `options.signatureBase64` parameter
   - Works by: adding PNG to word/media/, adding image relationship, replacing text with DrawingML XML, updating Content_Types

3. ✅ **Contract Preview API**
   - New endpoint: `POST /api/contracts/preview` (`src/app/api/contracts/preview/route.ts`)
   - Takes wizard state data (contact, personal, company, billing, prices)
   - Fetches company/lawyer settings from `admin_settings` table
   - Generates `contract-complet` DOCX, converts to HTML via mammoth
   - No auth required (guests need it too)
   - Returns `{ success: true, html: string }`

4. ✅ **Contract Preview in Signature Step**
   - New component: `src/components/orders/modules/signature/ContractPreview.tsx`
   - Collapsible, scrollable (500px max-height) contract preview with professional styling
   - Integrated above signature canvas in SignatureStep
   - Terms text updated to "Am citit si accept contractele de mai sus"

5. ✅ **Signature Data Flow at Submission**
   - `modular-order-wizard.tsx`: sends `signature_base64` in submit request body
   - `submit/route.ts`: uploads signature to S3 via `uploadOrderSignature()`, stores `signature_s3_key` in `customer_data` (falls back to inline `signature_base64` if S3 fails)
   - `generate-document/route.ts` + `auto-generate.ts`: uses `getClientSignatureBase64(cd)` helper from `s3.ts` to retrieve signature (S3 first, legacy base64 fallback)

6. ✅ **Multi-Signature Document Generation**
   - DOCX templates now have 3 distinct signature placeholders: `SEMNATURA_CLIENT`, `SEMNATURA_PRESTATOR`, `SEMNATURA_AVOCAT`
   - `signature-inserter.ts` handles per-placeholder sizing (client: 240x80pt, company/lawyer: 180x60pt)
   - Admin settings page allows uploading company signature, lawyer signature, and lawyer stamp as PNG via S3
   - `generate-document/route.ts` fetches all 3 signatures (client from order, company/lawyer from admin_settings) and passes to generator
   - Lawyer stamp overlaid on lawyer signature area for authentic document appearance

**Files Created:**
- `src/templates/shared/contract-complet.docx`
- `src/templates/cazier-judiciar/contract-complet.docx`
- `src/lib/documents/signature-inserter.ts`
- `src/app/api/contracts/preview/route.ts`
- `src/components/orders/modules/signature/ContractPreview.tsx`

**Files Modified:**
- `src/lib/documents/generator.ts` - Added `GenerateDocumentOptions` interface, `signatureBase64` support, signature placeholder + post-processing
- `src/components/orders/modules/signature/SignatureStep.tsx` - Integrated ContractPreview component, updated terms text
- `src/components/orders/modular-order-wizard.tsx` - Sends `signature_base64` in submit payload
- `src/app/api/orders/[id]/submit/route.ts` - Saves `signature_base64` into `customer_data`
- `src/app/api/admin/orders/[id]/generate-document/route.ts` - Reads `signature_base64` from order, passes to generator
- `CLAUDE.md` - Added new endpoint, signature system docs, Sprint 4 status
- `docs/README.md` - Added contract preview references
- `docs/DEVELOPMENT_MASTER_PLAN.md` - Sprint 4 tasks, session log

**Status When Completed:**
- Sprint 4: 95% complete (contract preview + multi-signature fully working)
- Sprint 5: 95% complete (admin workflow + document generation + multi-signature)
- Contract Preview: ✅ Complete (live DOCX-to-HTML in wizard)
- Signature Embedding: ✅ Complete (DrawingML inline images in DOCX - client, company, lawyer + stamp)
- Multi-Signature: ✅ Complete (3 distinct placeholders, admin upload, per-placeholder sizing)
- Remaining Sprint 4: Oblio invoicing, email notifications

### Session: 2026-02-17 (Contract Legal Validity + Client Document Downloads)

**What Was Done:**
1. **Contract Legal Validity System** - Server-side signature metadata capture (IP address, user agent, server timestamp, SHA-256 document hash), consent state persistence in `customer_data.signature_metadata`, audit log via `logAudit()`
2. **Client Document Downloads** - New API endpoint `GET /api/orders/[id]/documents/[docId]/download` for presigned S3 URLs. Updated `GET /api/orders/[id]` and `GET /api/orders/status` to include `documents` array (visible_to_client only). Updated `/api/upload/download` to allow contract access for order owners.
3. **Consent UI Updates** - SignatureStep references Law 214/2024 and eIDAS Art. 25. Review step has 3rd mandatory checkbox for withdrawal waiver (OUG 34/2014 art. 16 lit. a). ConsentState type added to `types/verification-modules.ts`.
4. **Client Pages Updated** - Account order detail shows documents section with download buttons. Public order status shows document list with login-to-download note.

**Files Created:**
- `src/app/api/orders/[id]/documents/[docId]/download/route.ts`

**Files Modified:**
- `src/app/api/orders/[id]/submit/route.ts` - Added `getAuditContext()`, signature metadata (IP, UA, timestamp, document hash, consent), audit logging
- `src/app/api/orders/[id]/route.ts` - Returns `documents` array from order_documents (visible_to_client=true)
- `src/app/api/orders/status/route.ts` - Returns `documents` array in public status response
- `src/app/api/upload/download/route.ts` - Allows contract access for order owners via order_documents check
- `src/components/orders/modules/signature/SignatureStep.tsx` - Updated consent text with Law 214/2024 and eIDAS Art. 25 references
- `src/components/orders/steps-modular/review-step.tsx` - Added withdrawal waiver checkbox (OUG 34/2014)
- `src/components/orders/modular-order-wizard.tsx` - Sends consent data in submission body
- `src/providers/modular-wizard-provider.tsx` - Added ConsentState, updateConsent action
- `src/types/verification-modules.ts` - Added ConsentState type
- `src/app/(customer)/account/orders/[id]/page.tsx` - Documents section with download buttons
- `src/app/comanda/status/page.tsx` - Document list with login-to-download note
- `CLAUDE.md` - Added new endpoint, legal validity docs, Sprint 4 status
- `docs/DEVELOPMENT_MASTER_PLAN.md` - Sprint 4 tasks, session log
- `docs/technical/specs/admin-document-system.md` - Added client document access section

**Status When Completed:**
- Sprint 4: 97% complete (legal validity + client downloads working)
- Sprint 5: 95% complete (unchanged)
- Contract Legal Validity: ✅ Complete (IP, UA, timestamp, SHA-256 hash, consent metadata)
- Client Document Downloads: ✅ Complete (presigned S3 URLs, account + public pages)
- Remaining Sprint 4: Oblio invoicing, email notifications

### Session: 2026-02-17 (S3 Key Reorganization + Error Handling + Admin Download/Preview)

**What Was Done:**
1. **S3 Document Key Reorganization** - New `generateDocumentKey(friendlyOrderId, docType, fileName)` function in `s3.ts` organizes documents under `orders/{friendly_order_id}/{subfolder}/{filename}` with subfolders: `contracte/`, `imputerniciri/`, `cereri/`, `documente/` (fallback). Old `generateContractKey()` kept but marked `@deprecated`.
2. **Generate-Document Error Handling** - S3 upload failure now returns HTTP 500 (was silently continuing). DB insert result is checked, returns 500 and cleans up orphan S3 object on failure. Cleanup order fixed: insert new row FIRST, then delete old rows (prevents data loss on failure). Added `cerere_eliberare_pf` and `cerere_eliberare_pj` to `visible_to_client` list.
3. **Auto-Generate Error Handling** - DB insert error checking added to `auto-generate.ts`. Throws error and cleans up S3 object on failure. Uses `generateDocumentKey()` for new S3 paths.
4. **Download Access Control** - `upload/download` route access check now covers both `contracts/` (legacy) and `orders/` (new) S3 prefixes.
5. **Admin UI Download Button** - Added "Descarca" (Download) button to every document row in the ProcessingSection. Fetches presigned URL and triggers browser download of original DOCX.
6. **Preview Page Enhancements** - Added "Descarca DOCX" button in toolbar for downloading the original file. Added info note that preview is HTML approximation, use download for full formatting. Added `?print=1` query parameter support for auto-print on page load.

**Files Modified:**
- `src/lib/aws/s3.ts` - Added `generateDocumentKey()`, marked `generateContractKey()` as `@deprecated`
- `src/app/api/admin/orders/[id]/generate-document/route.ts` - Error handling (S3 500, DB 500 + S3 cleanup, safe insert-before-delete), `generateDocumentKey()`, expanded `visible_to_client` list
- `src/lib/documents/auto-generate.ts` - DB insert error checking, S3 cleanup on failure, `generateDocumentKey()`
- `src/app/api/upload/download/route.ts` - Access check covers `contracts/` and `orders/` prefixes
- `src/app/admin/orders/[id]/page.tsx` - Added "Descarca" button to document rows
- `src/app/api/admin/orders/[id]/preview-document/route.ts` - "Descarca DOCX" toolbar button, info note, `?print=1` auto-print

**Status When Completed:**
- Sprint 4: 97% complete (unchanged)
- Sprint 5: 95% complete (document system hardened + admin UX improvements)
- S3 Key Reorganization: ✅ Complete (new paths under `orders/{friendly_id}/`)
- Document Error Handling: ✅ Complete (S3/DB failures return 500, orphan cleanup)
- Admin Download/Preview: ✅ Complete (download button + enhanced preview page)

**Known Issues / Next Steps:**
- `cerere-eliberare-pj.docx` template overflows to 2 pages (should fit on 1 page). The DOCX template itself needs formatting adjustments (margins, font size, or spacing). File: `src/templates/cazier-judiciar/cerere-eliberare-pj.docx`. To be fixed in the next session by editing the template directly.

### Session: 2026-02-18 (Template Fixes + Contract Placeholder Improvements)

**What Was Done:**
1. **Template Fixes** - Fixed `imputernicire.docx` (added missing `{{NUMECLIENT}}` placeholder, made bold). Fixed `cerere-eliberare-pj.docx` page overflow (reduced bottom margin from ~5cm to ~1.8cm, compacted spacing). Applied same margin fix preventively to `cerere-eliberare-pf.docx`.
2. **CLIENT_DETAILS_BLOCK** - New dynamic placeholder `{{CLIENT_DETAILS_BLOCK}}` in `contract-prestari.docx` (Section 1.2) and `contract-asistenta.docx` (Party 2). Shows full formatted client details: PJ (company name, CUI, Nr. Reg. Com., address, email, phone) or PF (full name, CNP, CI seria/nr, address, email, phone). Replaces the old simple `{{NUMECLIENT}}, CNP/CUI, EMAIL` pattern.
3. **TERMEN_LIVRARE** - New dynamic placeholder `{{TERMEN_LIVRARE}}` in `contract-prestari.docx` (Section VII). Replaces hardcoded delivery terms with per-service dynamic values using `estimated_days` and `urgent_days` from the services table.
4. **Generator Enhancements** - Added `buildClientDetailsBlock()` and `buildDeliveryTerms()` helper functions in `generator.ts`. Added `estimated_days`, `urgent_days`, and `urgent_available` fields to DocumentContext. Updated services query in `generate-document/route.ts` and `auto-generate.ts` to include delivery term fields.
5. **PJ Name Fixes** - `NUMECLIENT` for PJ orders now correctly uses company name (not personal account name). Admin orders list `getCustomerName()` now shows company name for PJ orders (was showing N/A).

**Files Modified:**
- `src/templates/cazier-judiciar/imputernicire.docx` - Added `{{NUMECLIENT}}` placeholder (bold)
- `src/templates/shared/imputernicire.docx` - Same fix (kept in sync)
- `src/templates/cazier-judiciar/cerere-eliberare-pj.docx` - Fixed page overflow (margin reduction)
- `src/templates/shared/cerere-eliberare-pj.docx` - Same fix (kept in sync)
- `src/templates/cazier-judiciar/cerere-eliberare-pf.docx` - Preventive margin fix
- `src/templates/shared/cerere-eliberare-pf.docx` - Same fix (kept in sync)
- `src/templates/cazier-judiciar/contract-prestari.docx` - `{{CLIENT_DETAILS_BLOCK}}` in Section 1.2, `{{TERMEN_LIVRARE}}` in Section VII
- `src/templates/shared/contract-prestari.docx` - Same changes (kept in sync)
- `src/templates/cazier-judiciar/contract-asistenta.docx` - `{{CLIENT_DETAILS_BLOCK}}` for Party 2
- `src/templates/shared/contract-asistenta.docx` - Same changes (kept in sync)
- `src/lib/documents/generator.ts` - Added `buildClientDetailsBlock()`, `buildDeliveryTerms()`, extended DocumentContext with delivery fields, PJ NUMECLIENT fix
- `src/app/api/admin/orders/[id]/generate-document/route.ts` - Updated services select to include `estimated_days, urgent_days, urgent_available`
- `src/lib/documents/auto-generate.ts` - Same service fields update
- `src/app/api/admin/orders/list/route.ts` - `getCustomerName()` shows company name for PJ orders
- `docs/technical/specs/admin-document-system.md` - Updated placeholders, removed cerere-pj overflow known issue

**Status When Completed:**
- Sprint 4: 97% complete (unchanged)
- Sprint 5: 95% complete (template quality + document accuracy improvements)
- Template Fixes: ✅ Complete (imputernicire, cerere-pf, cerere-pj)
- CLIENT_DETAILS_BLOCK: ✅ Complete (contract-prestari + contract-asistenta)
- TERMEN_LIVRARE: ✅ Complete (contract-prestari, dynamic per-service)
- Remaining Sprint 4: Oblio invoicing, email notifications

### Session: 2026-02-18 (Cerere-PJ Lawyer Fix + Admin Invite Role Selector)

**What Was Done:**
1. **Cerere-eliberare-pj Template Lawyer Section Fix** - Updated both `cazier-judiciar/` and `shared/` cerere-eliberare-pj DOCX templates: replaced `{{LAWYER_NAME}}` with `{{LAWYER_LASTNAME}}` and `{{LAWYER_FIRSTNAME}}` for proper name splitting; changed "actul de identitate seria" to "CI seria"; replaced hardcoded CNP digits with `{{LAWYER_CNP}}` placeholder. In `generator.ts`, `LAWYER_LASTNAME` and `LAWYER_FIRSTNAME` are derived by splitting `lawyer_name` on first space. Added `LAWYER_CI_SERIES`, `LAWYER_CI_NUMBER`, and `LAWYER_CNP` placeholders to the generator.
2. **Role Selector in Admin Invite Flow** - Added `role` column (default: 'employee') to `employee_invitations` table via migration 026. Invite API (`/api/admin/users/invite`) accepts optional `role` parameter. Accept endpoint uses the invited role when updating the profile. UI invite modal has a role dropdown selector (employee, avocat, manager, operator, contabil). Edit permissions modal allows changing employee role. RoleBadge shows all 6 admin roles with distinct colors. Employees list endpoint fetches all admin roles. Added `documents.generate` and `documents.view` permissions to the UI permission config. Delete/edit endpoints work with all admin roles.

**Files Created:**
- `supabase/migrations/026_invitation_role_column.sql`

**Files Modified:**
- `src/templates/cazier-judiciar/cerere-eliberare-pj.docx` - Lawyer section: LAWYER_LASTNAME, LAWYER_FIRSTNAME, LAWYER_CNP, "CI seria"
- `src/templates/shared/cerere-eliberare-pj.docx` - Same fix (kept in sync)
- `src/lib/documents/generator.ts` - Added LAWYER_LASTNAME, LAWYER_FIRSTNAME (split from lawyer_name), LAWYER_CI_SERIES, LAWYER_CI_NUMBER, LAWYER_CNP placeholders
- `src/app/api/admin/users/invite/route.ts` - Accepts optional `role` parameter
- `src/app/api/admin/invite/accept/route.ts` - Uses invited role when updating profile
- `src/app/admin/users/page.tsx` - Role dropdown in invite modal, role editing in permissions modal, RoleBadge with 6 distinct colors, documents.generate + documents.view permissions in UI config
- `src/app/api/admin/users/employees/route.ts` - Fetches all admin roles (not just employee/super_admin)
- `src/app/api/admin/users/employees/[id]/route.ts` - Works with all admin roles
- `docs/admin/rbac-permissions.md` - Updated roles table, invite flow, role badge colors, migration 026
- `docs/technical/specs/admin-document-system.md` - Updated lawyer placeholders, LawyerData type, resolved issues

**Status When Completed:**
- Sprint 4: 97% complete (unchanged)
- Sprint 5: 95% complete (RBAC role selector + template accuracy improvements)
- Cerere-PJ Lawyer Fix: ✅ Complete (dynamic LAWYER_LASTNAME, LAWYER_FIRSTNAME, LAWYER_CNP)
- Admin Invite Role Selector: ✅ Complete (6 roles with badges, migration 026)
- Remaining Sprint 4: Oblio invoicing, email notifications

### Session: 2026-02-18 (Number Registry System + Gemini 2.5 Flash Upgrade)

**What Was Done:**
1. **Number Registry System (Barou)** - Full implementation (10 commits): `number_ranges` and `number_registry` tables, `allocate_number()` RPC function (atomic, with reuse logic for voided numbers), `find_existing_number()`, `void_number()` functions. Admin UI "Registru Numere" tab with ranges management, registry journal, manual entry, void functionality, and CSV export. Replaced legacy `increment_document_counter` RPC. Fixed imputernicire `document_number` bug (was storing contract number instead of imputernicire number). `contract-prestari` no longer consumes a Barou number. Backfilled 9 historical registry entries from existing `order_documents`.
2. **Gemini Model Upgrade** - Both OCR and KYC services upgraded from deprecated models to `gemini-2.5-flash`: `document-ocr.ts` changed from `gemini-2.0-flash-exp`, `kyc-validation.ts` changed from `gemini-1.5-flash`. Single unified model for all AI operations.

**Files Created:**
- `src/app/api/admin/settings/number-ranges/route.ts` - Number ranges CRUD API
- `src/app/api/admin/settings/number-registry/[id]/route.ts` - Registry entry management API
- `docs/technical/specs/number-registry-system.md` - Full specification

**Files Modified:**
- `src/lib/services/document-ocr.ts` - Gemini model: `gemini-2.0-flash-exp` -> `gemini-2.5-flash`
- `src/lib/services/kyc-validation.ts` - Gemini model: `gemini-1.5-flash` -> `gemini-2.5-flash`
- `src/app/api/admin/orders/[id]/generate-document/route.ts` - Uses `allocate_number()` instead of `increment_document_counter`
- `src/app/admin/settings/page.tsx` - Added "Registru Numere" tab
- `CLAUDE.md` - Updated tech stack (Gemini 2.5 Flash for both OCR and KYC)

**Status When Completed:**
- Sprint 4: 97% complete (unchanged)
- Sprint 5: 97% complete (Number Registry + Gemini upgrade)
- Number Registry: ✅ Complete (tables, RPC, admin UI, backfill)
- Gemini Upgrade: ✅ Complete (both OCR and KYC on gemini-2.5-flash)
- Remaining Sprint 4: Oblio invoicing, email notifications

---

### Session: 2026-02-19 (CLIENT_DETAILS_BLOCK Legal Format + KYC Confidence Tracking)

**What Was Done:**
1. **CLIENT_DETAILS_BLOCK Legal Format Rewrite** - Rewrote `buildClientDetailsBlock()` in `generator.ts` with proper Romanian legal identification format. PF format: "NUME, legitimat/a cu CI seria XX nr. XXXXXX, emisa de..., CNP XXXXXXXXXXXXX, cu domiciliul in Str..., Nr..., Bl..., Sc..., Et..., Ap..., Localitatea..., Jud...". PJ format: company name + CUI + Nr. Reg. Com. + sediu + "reprezentata prin REPREZENTANT, legitimat/a cu CI seria..., emisa de..., CNP...". Both contract-prestari (section 1.2) and contract-asistenta (party 2) use this format.
2. **KYC Confidence Tracking** - Added `KYCValidationResults` and `KYCDocumentValidation` types in `verification-modules.ts` with per-document AI confidence scores (0-100%). CI front, CI back, selfie, and face match each have their own confidence. Stored in wizard state (`kycValidation` field on `PersonalKYCModuleData`). Admin order detail shows "Verificare KYC" card with color-coded confidence percentages (green >= 70%, yellow 50-69%, red < 50%) and warning indicator when confidence < 70% flagging for human review.
3. **Contract Preview Legal Format** - Updated contract preview API and wizard signature step to use the same legal CLIENT_DETAILS_BLOCK format, ensuring preview matches generated documents.

**Files Modified:**
- `src/lib/documents/generator.ts` - `buildClientDetailsBlock()` rewritten with legal format (PF + PJ)
- `src/types/verification-modules.ts` - `KYCValidationResults`, `KYCDocumentValidation` types with confidence fields
- `src/app/admin/orders/[id]/page.tsx` - KYC confidence card with color coding and warning
- `src/providers/modular-wizard-provider.tsx` - `kycValidation` state field
- `src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx` - Stores confidence per document
- `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx` - OCR confidence tracking

**Status When Completed:**
- Sprint 4: 98% complete (unchanged - remaining: Oblio invoicing)
- Sprint 5: 98% complete (unchanged - remaining: charts, audit logging)
- CLIENT_DETAILS_BLOCK Legal Format: Complete (PF + PJ)
- KYC Confidence Tracking: Complete (types, wizard state, admin display)
- Session recap document created: `docs/SESSION_RECAP.md`

---

**Document Status:** Updated (v4.6)
**Last Modified:** 2026-02-19
**Next Review:** After Sprint 5 completion (charts, audit logging)
**Owner:** Development Team
