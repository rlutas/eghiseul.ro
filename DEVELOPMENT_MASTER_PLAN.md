# eGhiseul.ro - Development Master Plan

**Version:** 1.2
**Last Updated:** 2025-12-16
**Status:** In Development - Sprint 3 In Progress

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
│   OCR:        AWS Textract (zero retention, GDPR)                   │
│   KYC:        AWS Rekognition (face matching) → Veriff (Phase 2)    │
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

| Document | Locație | Status |
|----------|---------|--------|
| **PRD** | `docs/prd/eghiseul-prd.md` | ✅ Complete |
| **Security** | `docs/security-architecture.md` | ✅ Complete |
| **Legal** | `docs/legal/compliance-research.md` | ✅ Complete |
| **Tech Stack** | `docs/TECHNOLOGY_RECOMMENDATIONS.md` | ✅ Complete |
| **Sprint 1** | `docs/sprints/sprint-1-auth.md` | ✅ Complete |
| **Sprint 2** | `docs/sprints/sprint-2-services.md` | ✅ Complete |
| **API Docs** | `docs/technical/api/services-api.md` | ✅ Complete |
| **Database** | `docs/technical/database/services-schema.md` | ✅ Complete |
| **OCR Research** | `docs/technical/ocr-services-privacy-research.md` | ✅ Complete |
| **Backend Comparison** | `docs/technical/supabase-vs-nestjs-comparison.md` | ✅ Complete |

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

#### Sprint 3: KYC & Documents (Săptămâna 9-10) ⏳ IN PROGRESS

| Task | Status | Priority |
|------|--------|----------|
| ✅ Service catalog UI | Complete | HIGH |
| ✅ Service detail page | Complete | HIGH |
| ⏳ Order creation flow (6 steps) | Pending | HIGH |
| ⏳ Upload CI (front + back) | Pending | HIGH |
| ⏳ Upload selfie cu document | Pending | HIGH |
| ⏳ Semnătură electronică (canvas) | Pending | MEDIUM |
| ⏳ OCR cu AWS Textract | Pending | MEDIUM |
| ⏳ Validare CNP | Pending | HIGH |

#### Sprint 4: Payments & Contracts (Săptămâna 11-12) ⏳ PENDING

| Task | Status |
|------|--------|
| ⏳ Stripe checkout integration | Pending |
| ⏳ Apple Pay / Google Pay | Pending |
| ⏳ Calcul preț dinamic | Pending |
| ⏳ Generare contract PDF | Pending |
| ⏳ SmartBill facturare | Pending |

#### Sprint 5: Admin Dashboard (Săptămâna 13-14) ⏳ PENDING

| Task | Status |
|------|--------|
| ⏳ Admin layout | Pending |
| ⏳ Lista comenzi | Pending |
| ⏳ Detalii comandă | Pending |
| ⏳ Schimbare status | Pending |
| ⏳ Statistici basic | Pending |

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
│   │   │   └── webhooks/
│   │   │       └── stripe/         # POST /api/webhooks/stripe
│   │   ├── services/               # ✅ Service pages (Sprint 3)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # Service detail page
│   │   │       ├── loading.tsx     # Loading state
│   │   │       └── not-found.tsx   # 404 page
│   │   ├── auth/callback/          # ✅ Auth callback
│   │   └── page.tsx                # ✅ Homepage
│   │
│   ├── components/
│   │   ├── ui/                     # ✅ shadcn components
│   │   ├── forms/                  # ✅ Login, Register forms
│   │   ├── home/                   # ✅ Homepage sections (Sprint 3)
│   │   │   ├── hero.tsx
│   │   │   ├── services.tsx
│   │   │   ├── features.tsx
│   │   │   ├── stats.tsx
│   │   │   └── footer.tsx
│   │   └── services/               # ✅ Service components (Sprint 3)
│   │       ├── service-card.tsx
│   │       └── service-detail.tsx
│   │
│   ├── lib/
│   │   ├── supabase/               # ✅ Supabase clients
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── stripe.ts               # ✅ Stripe client
│   │   ├── validations/            # ✅ Zod schemas
│   │   └── utils/                  # ✅ Utilities
│   │
│   ├── types/
│   │   ├── supabase.ts             # ✅ Database types
│   │   └── services.ts             # ✅ Service types (Sprint 3)
│   │
│   ├── providers/                  # ✅ React providers (Sprint 3)
│   │   └── query-provider.tsx
│   │
│   └── proxy.ts                    # ✅ Auth middleware
│
├── supabase/
│   └── migrations/
│       ├── 001_profiles.sql        # ✅ Applied
│       └── 002_services.sql        # ✅ Applied
│
├── docs/
│   ├── sprints/                    # ✅ Sprint documentation
│   ├── technical/                  # ✅ Technical docs
│   │   ├── api/                    # ✅ API documentation
│   │   └── database/               # ✅ Database schemas
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

### Înainte de Launch

| Check | Status | Notes |
|-------|--------|-------|
| ✅ HTTPS peste tot | Dev ready | Vercel handles in prod |
| ✅ Input validation (Zod) | Complete | Forms, API |
| ✅ SQL injection protected | Complete | Supabase RLS |
| ✅ XSS protection | Complete | React default |
| ✅ Row Level Security | Complete | All tables |
| ⏳ CSP headers configurate | Pending | `next.config.js` |
| ⏳ Rate limiting | Pending | Middleware |
| ⏳ CORS restricționat | Pending | API routes |
| ⏳ Audit logging | Pending | `order_history` table ready |
| ⏳ Encryption at rest (S3) | Pending | AWS config |
| ⏳ 2FA pentru admin | Pending | Sprint 3 |
| ⏳ Backup database | Pending | Supabase config |

---

## NEXT ACTIONS

### Sprint 3 Tasks (Priority Order)

**Completed:**
1. ✅ **Service Catalog UI** - Homepage with service cards
2. ✅ **Service Detail Page** - Individual service pages with dynamic routing

**In Progress:**
3. **Order Creation Flow** - 6-step wizard (Contact → Data → Options → KYC → Delivery → Payment)
4. **KYC Upload Components** - ID card (front + back), selfie with document, signature canvas
5. **OCR Integration** - AWS Textract for document data extraction
6. **CNP Validation** - Romanian personal ID validation
7. **User Dashboard** - Orders list and details

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
```

---

## GITHUB REPOSITORY

**URL:** https://github.com/rlutas/eghiseul.ro

### Recent Commits
- `feat(api): Implement Sprint 2 - Services and Orders API`
- `docs: Update sprint documentation with completion status`
- `feat(auth): Complete Sprint 1 - Authentication system`
- `chore: Initial project setup`

---

**Document Status:** ✅ Updated
**Next Review:** After Sprint 3
**Owner:** Development Team
