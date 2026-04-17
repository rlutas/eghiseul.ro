# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: eghiseul.ro

Platforma digitala pentru Romania - servicii publice digitalizate (9 servicii active in DB; 12 planificate in catalog). Rebuild complet din WordPress, arhitectura API-first.

---

## Principiu

> **Documentatia detaliata este in `docs/`.** Acest fisier este un ghid concis cu referinte. NU duplica informatii din docs aici. Regulile de cod, DB si documentatie sunt in `.claude/rules/`.

---

## Navigare Documentatie

| Caut... | Gasesc in... |
|---------|-------------|
| **Status proiect & sprint** | `docs/DEVELOPMENT_MASTER_PLAN.md` |
| **Status curent (ce merge, probleme, testare)** | `docs/STATUS_CURRENT.md` |
| **Index complet docs** | `docs/README.md` |
| **Cum adaug serviciu nou** | `docs/technical/specs/modular-wizard-guide.md` |
| **API endpoints** | `docs/technical/api/` + `docs/README.md` (summary) |
| **Admin panel** | `docs/admin/README.md` |
| **RBAC & permisiuni** | `docs/admin/rbac-permissions.md` |
| **Document generation** | `docs/technical/specs/admin-document-system.md` |
| **Number registry (Barou)** | `docs/technical/specs/number-registry-system.md` |
| **AWB & tracking** | `docs/technical/specs/awb-generation-tracking.md` |
| **Delivery system** | `docs/technical/specs/delivery-system-architecture.md` |
| **Sameday API** | `docs/technical/specs/sameday-api-integration.md` |
| **Fan Courier API** | `docs/technical/specs/fan-courier-integration.md` |
| **Plati & facturare** | `docs/technical/specs/stripe-oblio-payment-invoicing.md` |
| **Security** | `docs/security/README.md` |
| **S3 setup** | `docs/deployment/AWS_S3_SETUP.md` |
| **DB migrations guide** | `docs/deployment/DATABASE_MIGRATIONS.md` |
| **PRD** | `docs/prd/eghiseul-prd.md` |
| **Agenti & orchestrare** | `docs/agents/` |
| **Backlog & features viitoare** | `docs/DEVELOPMENT_MASTER_PLAN.md` (sectiunea BACKLOG) |

---

## Tech Stack

```
Frontend:   Next.js 16+ (TypeScript, Tailwind v4, shadcn/ui)
Backend:    Supabase (PostgreSQL, Auth, Real-time, RLS)
Storage:    AWS S3 (contracts, KYC documents, eu-central-1)
AI/OCR:     Google Gemini 2.5 Flash (document extraction)
AI/KYC:     Google Gemini 2.5 Flash (face matching, validation)
Payments:   Stripe (card, Apple Pay, Google Pay)
Company:    ANAF API (free, official CUI validation)
Courier:    Fan Courier + Sameday (RO domestic)
SMS:        SMSLink.ro
Email:      Resend
Invoicing:  Oblio (e-factura compliant)
Documents:  docxtemplater + pizzip (DOCX generation), mammoth (DOCX-to-HTML preview)
```

---

## Project Structure (Key Paths)

```
src/
├── app/
│   ├── (auth)/                    # Auth pages (login, register, reset)
│   ├── (customer)/account/        # Customer account pages
│   ├── admin/                     # Admin panel (layout, dashboard, orders, users, settings)
│   ├── comanda/                   # Order wizard + status page
│   └── api/
│       ├── services/              # Public services API
│       ├── orders/                # Order CRUD, submit, payment, tracking, documents
│       ├── admin/                 # Admin endpoints (orders, users, settings, dashboard)
│       ├── courier/               # Courier API (quotes, localities, pickup-points, track, ship)
│       ├── upload/                # S3 presigned URL generation
│       ├── contracts/preview/     # Contract preview (DOCX-to-HTML)
│       ├── webhooks/stripe/       # Stripe webhooks
│       ├── ocr/ + kyc/            # AI document processing
│       └── cron/                  # Scheduled jobs (tracking updates)
├── components/
│   ├── orders/
│   │   ├── modular-order-wizard.tsx   # Main wizard component
│   │   ├── modules/                   # Dynamic wizard modules
│   │   │   ├── signature/             # Signature canvas + contract preview
│   │   │   └── company-kyc/           # PJ document upload
│   │   └── steps-modular/             # Core steps (contact, options, delivery, billing, review)
│   └── ui/                            # shadcn/ui components
├── lib/
│   ├── admin/permissions.ts           # RBAC server-side (checkPermission, requirePermission)
│   ├── aws/s3.ts                      # S3 operations
│   ├── documents/                     # Document generation + signature embedding
│   │   ├── generator.ts              # docxtemplater + multi-signature
│   │   ├── signature-inserter.ts     # DrawingML inline image injection
│   │   └── auto-generate.ts          # Auto-gen contracts at submission
│   ├── services/courier/             # Fan Courier + Sameday API clients
│   ├── services/document-ocr.ts      # Gemini OCR
│   └── supabase/                     # Supabase client (server, admin, middleware)
├── providers/
│   └── modular-wizard-provider.tsx    # Wizard state management
├── hooks/
│   └── use-admin-permissions.tsx      # RBAC client-side
├── templates/                         # DOCX templates (shared/ + cazier-judiciar/)
└── types/
    └── supabase.ts                    # Generated DB types
```

---

## Reguli & Conventii

### Database Operations
Vezi `.claude/rules/database.md` pentru reguli detaliate. Ghid complet: `docs/deployment/DATABASE_MIGRATIONS.md`

### Admin Panel

- URL: `/admin/*` (rute protejate)
- Necesita `role = 'super_admin'` sau `'employee'` in tabela `profiles`
- RBAC: 5 roluri (super_admin, manager, operator, contabil, avocat)
- 7 permisiuni: `orders.view`, `orders.manage`, `payments.verify`, `users.manage`, `settings.manage`, `documents.generate`, `documents.view`
- Server: `src/lib/admin/permissions.ts` | Client: `src/hooks/use-admin-permissions.tsx`
- Detalii: `docs/admin/rbac-permissions.md`

### Document Generation

- Auto-generated la submit: `contract-prestari`, `contract-asistenta`
- Custom templates (uploadate de admin): `imputernicire`, `cerere-eliberare-pf`, `cerere-eliberare-pj`
- Multi-signature: client (drawn in wizard) + company + lawyer (predefined PNG din S3)
- Signature embedding: DrawingML inline images via `signature-inserter.ts`
- Detalii: `docs/technical/specs/admin-document-system.md`

### Order Status Workflow
```
paid → processing → documents_generated → submitted_to_institution → document_received → extras_in_progress/document_ready → shipped → completed
```
Tranzitii valide enforce-uite server-side in `/api/admin/orders/[id]/process`.

### Contract Legal Validity
- Server-side audit: IP, user agent, server timestamp, SHA-256 document hash
- Consent: Law 214/2024, eIDAS Art. 25, OUG 34/2014
- Metadata salvat in `customer_data.signature_metadata`

### S3 Storage
- Region: eu-central-1, Bucket: eghiseul-documents
- Folders: `kyc/`, `orders/`, `contracts/`, `signatures/`, `templates/custom/`, `invoices/`, `temp/`
- Detalii: `docs/deployment/AWS_S3_SETUP.md`

---

## Common Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
```

---

## Environment Variables

```env
# Core
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_AI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# AWS S3
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents

# Courier
FANCOURIER_USERNAME=
FANCOURIER_PASSWORD=          # Quote if contains special chars
FANCOURIER_CLIENT_ID=
SAMEDAY_USERNAME=
SAMEDAY_PASSWORD=             # Quote if contains special chars
SAMEDAY_USE_DEMO=false

# Invoicing
OBLIO_CLIENT_ID=
OBLIO_CLIENT_SECRET=
OBLIO_COMPANY_CIF=
OBLIO_SERIES_NAME=EGH

# Other
CRON_SECRET=
RESEND_API_KEY=
SMSLINK_API_KEY=
```

---

**Last Updated:** 2026-02-17
**Version:** 5.0 (lean - rules in .claude/rules/, details in docs/)
