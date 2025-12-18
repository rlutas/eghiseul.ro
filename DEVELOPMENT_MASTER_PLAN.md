# eGhiseul.ro - Development Master Plan

**Version:** 1.7
**Last Updated:** 2025-12-18
**Status:** In Development - Sprint 3 (95% Complete) - Order ID, Auto-Save & GDPR Cleanup Implemented

---

## PROGRESS SUMMARY

| Phase | Sprint | Status | Completion Date |
|-------|--------|--------|-----------------|
| MVP | Sprint 0: Setup | ✅ Complete | 2025-12-16 |
| MVP | Sprint 1: Auth & Users | ✅ Complete | 2025-12-16 |
| MVP | Sprint 2: Services Core | ✅ Complete | 2025-12-16 |
| MVP | Sprint 3: KYC & Documents | ⏳ In Progress | - |
| MVP | Sprint 4: Payments & Contracts | ⏳ Pending | - |
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
│   Invoicing:  SmartBill (e-factura compliant)                       │
│   SMS:        SMSLink.ro (provider românesc)                        │
│   Email:      Resend                                                │
│   Courier:    Fan Courier (RO) + DHL (internațional)               │
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
| **Production Security Setup** | `docs/deployment/PRODUCTION_SECURITY_SETUP.md` | ✅ Complete (NEW) |

### Technical Specifications
| Document | Locație | Status |
|----------|---------|--------|
| **Database Schema** | `docs/technical/database/services-schema.md` | ✅ Complete |
| **OCR Research** | `docs/technical/ocr-services-privacy-research.md` | ✅ Complete |
| **Backend Comparison** | `docs/technical/supabase-vs-nestjs-comparison.md` | ✅ Complete |
| **User Data Persistence** | `docs/technical/specs/user-data-persistence.md` | ✅ Complete |
| **Order Auto-Save System** | `docs/technical/specs/order-autosave-system.md` | ✅ Complete |

### Testing Documentation
| Document | Locație | Status |
|----------|---------|--------|
| **Test Plan** | `docs/testing/TEST_PLAN.md` | ✅ Complete (NEW) |
| **Test Results 2025-12-18** | `docs/testing/TEST_RESULTS_2025-12-18.md` | ✅ Complete (NEW) |

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

#### Sprint 3: KYC & Documents (Săptămâna 9-10) ⏳ IN PROGRESS (90%)

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
| ✅ **Order ID System** | **NEW** | HIGH | `lib/order-id.ts`, `migrations/008_friendly_order_id.sql` |
| ✅ **Auto-Save (debounced)** | **NEW** | HIGH | `providers/order-wizard-provider.tsx` |
| ✅ **Draft API Endpoint** | **NEW** | HIGH | `api/orders/draft/route.ts` |
| ✅ **Save Status UI** | **NEW** | MEDIUM | `components/orders/save-status.tsx` |
| ✅ **localStorage Backup** | **NEW** | MEDIUM | Offline resilience for drafts |
| ✅ **Admin Order Lookup API** | **NEW** | HIGH | `api/admin/orders/lookup/route.ts` |
| ✅ **GDPR Auto-Cleanup** | **NEW** | CRITICAL | `migrations/009_draft_auto_cleanup.sql` |
| ✅ **Admin Cleanup API** | **NEW** | HIGH | `api/admin/cleanup/route.ts` |
| ⏳ Passport UI Support | Partial | LOW | OCR ready, UI pending |
| ⏳ S3 storage integration | Pending | HIGH | AWS S3 upload (next priority) |
| ⏳ User orders dashboard | Pending | MEDIUM | `app/(customer)/orders/*` |
| ⏳ Order Submission API | Pending | HIGH | Complete order flow |

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
| `/api/admin/orders/lookup` | GET | Admin: Look up order by friendly_order_id (NEW) |
| `/api/admin/cleanup` | GET | Admin: Get cleanup status and pending drafts (NEW) |
| `/api/admin/cleanup` | POST | Admin: Run cleanup of expired drafts (NEW) |

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
- **localStorage Backup**: Offline resilience, data preserved even without network
- **Save Status Indicator**: Real-time feedback showing "Salvat acum X sec"

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

#### Sprint 4: Payments & Contracts (Săptămâna 11-12) ⏳ PENDING

| Task | Status | Spec Reference |
|------|--------|----------------|
| ⏳ Stripe checkout integration | Pending | - |
| ⏳ Apple Pay / Google Pay | Pending | - |
| ⏳ **Bank transfer payment** | Pending | `order-autosave-system.md` |
| ⏳ Calcul preț dinamic | Pending | - |
| ⏳ Generare contract PDF | Pending | - |
| ⏳ SmartBill facturare | Pending | - |
| ⏳ **Order auto-save implementation** | Pending | `order-autosave-system.md` |
| ⏳ **User data persistence** | Pending | `user-data-persistence.md` |

**New Features (From Sprint 3 Specs):**
- Bank transfer with reference code (PAY-YYYYMMDD-XXXXX)
- Admin confirmation for bank payments
- Guest-to-customer conversion flow
- KYC document reuse from previous orders

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
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts    # GET, PATCH /api/orders/[id]
│   │   │   │       └── payment/    # POST /api/orders/[id]/payment
│   │   │   ├── ocr/                # ✅ NEW - Sprint 3
│   │   │   │   └── extract/        # POST /api/ocr/extract
│   │   │   ├── kyc/                # ✅ NEW - Sprint 3
│   │   │   │   └── validate/       # POST /api/kyc/validate
│   │   │   └── webhooks/
│   │   │       └── stripe/         # POST /api/webhooks/stripe
│   │   ├── services/               # ✅ Service pages (Sprint 3)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Service detail page
│   │   │       ├── comanda/        # Order wizard page
│   │   │       ├── loading.tsx     # Loading state
│   │   │       └── not-found.tsx   # 404 page
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
│   │   └── orders/                 # ✅ NEW - Sprint 3
│   │       ├── order-wizard.tsx
│   │       ├── wizard-progress.tsx
│   │       └── steps/
│   │           ├── contact-step.tsx
│   │           ├── personal-data-step.tsx   # With OCR scan
│   │           ├── options-step.tsx
│   │           ├── kyc-step.tsx             # AI validation
│   │           ├── delivery-step.tsx        # Signature canvas
│   │           └── review-step.tsx
│   │
│   ├── lib/
│   │   ├── supabase/               # ✅ Supabase clients
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── services/               # ✅ Sprint 3
│   │   │   ├── document-ocr.ts     # Gemini 2.0 Flash OCR
│   │   │   └── kyc-validation.ts   # Gemini 1.5 Flash KYC
│   │   ├── security/               # ✅ NEW - Security (Sprint 3)
│   │   │   ├── rate-limiter.ts     # Rate limiting (10/30 req/min)
│   │   │   ├── audit-logger.ts     # Audit logging to DB
│   │   │   └── pii-encryption.ts   # PII encrypt/decrypt helpers
│   │   ├── validations/            # ✅ Sprint 3
│   │   │   └── cnp.ts              # Romanian CNP validation
│   │   ├── stripe.ts               # ✅ Stripe client
│   │   └── utils/                  # ✅ Utilities
│   │
│   ├── types/
│   │   ├── supabase.ts             # ✅ Database types
│   │   ├── services.ts             # ✅ Service types
│   │   └── orders.ts               # ✅ NEW - Order wizard types
│   │
│   ├── providers/                  # ✅ React providers
│   │   ├── query-provider.tsx
│   │   └── order-wizard-provider.tsx  # ✅ NEW - Wizard state
│   │
│   └── proxy.ts                    # ✅ Auth middleware
│
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql        # ✅ Applied
│       ├── 002_services.sql        # ✅ Applied
│       ├── 006_audit_logs.sql      # ✅ Applied (NEW - Sprint 3)
│       └── 007_pii_encryption.sql  # ✅ Applied (NEW - Sprint 3)
│
├── docs/
│   ├── sprints/                    # ✅ Sprint documentation
│   │   └── sprint-3-kyc-documents.md  # ✅ NEW
│   ├── technical/                  # ✅ Technical docs
│   │   ├── api/                    # ✅ API documentation
│   │   ├── database/               # ✅ Database schemas
│   │   └── specs/                  # ✅ Technical specs (NEW)
│   ├── deployment/                 # ✅ NEW - Deployment guides
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

# AWS ✅
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=***pending***
AWS_SECRET_ACCESS_KEY=***pending***
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents

# Stripe ✅
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_***
STRIPE_SECRET_KEY=sk_test_***
STRIPE_WEBHOOK_SECRET=***pending***

# Google AI (Gemini) ✅ NEW
GOOGLE_AI_API_KEY=***configured***

# SmartBill ⏳
SMARTBILL_API_KEY=
SMARTBILL_EMAIL=

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
| ⏳ Encryption at rest (S3) | Pending | AWS config |
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

### Sprint 3 Remaining Tasks (When Resuming)

**HIGH Priority (Must Complete Before Sprint 4):**
1. **S3 Storage Integration** - Upload KYC documents to AWS S3
   - Pre-signed URLs for secure uploads
   - Folder structure: `kyc/{order_id}/{doc_type}`
   - AES-256 encryption at rest

2. **Order Submission API** - Complete order creation flow
   - `POST /api/orders` with full customer_data
   - Store encrypted PII (auto-triggered by migration 007)
   - Create order_history entry

**MEDIUM Priority:**
3. **User Orders Dashboard** - View order history and status
   - `app/(customer)/orders/page.tsx` - List view
   - `app/(customer)/orders/[id]/page.tsx` - Detail view
   - Show masked PII (CNP: 1***********3456)

**LOW Priority (Can Defer to Sprint 4):**
4. **Passport UI Support** - Add passport upload option
   - OCR already supports passports
   - Need UI selector in personal-data-step.tsx

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

### User Data Persistence (Planned)
- **Pre-fill**: Logged-in users get data from previous orders
- **Conversion**: Guests can create account at order completion
- **KYC Reuse**: Valid KYC documents (12 months) are reused
- **Billing**: Support for persoană fizică and juridică (ANAF CUI)
- **Specification**: `docs/technical/specs/user-data-persistence.md`

### Order Auto-Save System (Planned)
- **Order ID**: Format ORD-YYYYMMDD-XXXXX
- **Auto-Save**: Debounced (500ms) with localStorage backup
- **Support**: Order lookup, notes, continue on behalf
- **Bank Transfer**: Reference PAY-YYYYMMDD-XXXXX, manual confirmation
- **Recovery**: Magic links with JWT (7-day expiry)
- **Specification**: `docs/technical/specs/order-autosave-system.md`

---

## SESSION LOG

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

---

**Document Status:** ✅ Updated (v1.6)
**Last Modified:** 2025-12-18
**Next Review:** When resuming Sprint 3
**Owner:** Development Team
