# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: eghiseul.ro

Platformă digitală pentru România, în proces de reconstrucție din WordPress. Obiective principale:
- Rebuild complet al platformei
- Arhitectură API-first pentru parteneriate
- Multiple servicii integrate (12 servicii)
- Scalabilitate pentru expansiune

---

## DOCUMENTATION MAINTENANCE GUIDE

> **Quick Start:** Vezi `docs/README.md` pentru navigarea completă a documentației.

### When to Update Documentation

**ALWAYS update documentation when:**
1. Adding new API endpoints → Update `docs/technical/api/`
2. Changing database schema → Update `docs/technical/database/`
3. Completing sprint tasks → Update `DEVELOPMENT_MASTER_PLAN.md`
4. Adding new features → Create spec in `docs/technical/specs/`
5. Modifying services → Update relevant service doc in `docs/sprints/services/`
6. Fixing security issues → Update `docs/security/SECURITY_AUDIT_SUMMARY.md`

### Documentation Update Checklist

```markdown
After completing any feature:
[ ] Update DEVELOPMENT_MASTER_PLAN.md with status
[ ] Document new APIs in docs/technical/api/
[ ] Update sprint docs if applicable
[ ] Add/update TypeScript types in src/types/
[ ] Update this CLAUDE.md if new patterns established
[ ] Update docs/README.md if new files created
```

### Key Files to Track

| File | Purpose | Update When |
|------|---------|-------------|
| `DEVELOPMENT_MASTER_PLAN.md` | Sprint progress, task tracking | After completing tasks |
| `docs/README.md` | **Documentation index** | When adding new docs |
| `docs/technical/api/*.md` | API documentation | New/modified endpoints |
| `docs/technical/specs/*.md` | Feature specifications | Planning new features |
| `docs/technical/specs/modular-wizard-guide.md` | **Modular wizard usage** | When adding new services |
| `docs/sprints/sprint-*.md` | Sprint details | During sprint work |
| `docs/security/SECURITY_AUDIT_SUMMARY.md` | Security status | After security fixes |
| `src/types/*.ts` | TypeScript interfaces | Schema changes |

### Documentation by Role

| Role | Start Here | Key Docs |
|------|------------|----------|
| **Developer** | `CLAUDE.md` | `docs/technical/api/`, `docs/technical/specs/` |
| **Product** | `docs/prd/eghiseul-prd.md` | `DEVELOPMENT_MASTER_PLAN.md` |
| **Security** | `docs/security/README.md` | `docs/security/SECURITY_AUDIT_SUMMARY.md` |

---

## Tech Stack

```
Frontend:   Next.js 16+ (TypeScript, Tailwind v4, shadcn/ui)
Backend:    Supabase (PostgreSQL, Auth, Real-time, RLS)
Storage:    AWS S3 (contracts, KYC documents, eu-central-1)
AI/OCR:     Google Gemini 2.0 Flash Exp (document extraction)
AI/KYC:     Google Gemini 1.5 Flash (face matching, validation)
Payments:   Stripe (card, Apple Pay, Google Pay)
SMS:        SMSLink.ro (provider românesc)
Email:      Resend
Invoicing:  SmartBill (e-factura compliant)
```

---

## CURRENT IMPLEMENTATION STATUS

### Completed Features (Sprint 0-3)

#### Authentication System
- **Files**: `src/app/(auth)/`, `src/lib/supabase/`
- **Features**: Login, Register, Password Reset, Session Management
- **Database**: `profiles` table with RLS

#### Services & Orders API
- **Files**: `src/app/api/services/`, `src/app/api/orders/`
- **Features**: CRUD for services, orders, payments
- **Database**: `services`, `service_options`, `orders`, `order_history` tables

#### AI-Powered OCR System
- **Files**: `src/lib/services/document-ocr.ts`, `src/app/api/ocr/extract/`
- **Model**: Google Gemini 2.0 Flash Exp
- **Supports**: CI Vechi (old ID), CI Nou (new ID), Passport, Certificat Atestare Domiciliu
- **Extracts**: CNP, name, birth date, full Romanian address (Jud., Str., Nr., Bl., Sc., Et., Ap.), MRZ
- **Features**:
  - Auto-detect document type
  - Expiry validation (special case for birth certificate requests)
  - Cross-validation between ID and address certificate
- **Docs**:
  - `docs/technical/api/ocr-kyc-api.md`
  - `docs/technical/specs/romanian-document-handling.md` (NEW)

#### KYC Validation System
- **Files**: `src/lib/services/kyc-validation.ts`, `src/app/api/kyc/validate/`
- **Model**: Google Gemini 1.5 Flash
- **Features**: Document validation, face matching, confidence scores
- **Docs**: `docs/technical/api/ocr-kyc-api.md`

#### Order Wizard - Modular System (ACTIVE)
- **URL**: `/comanda/[service-slug]` (ex: `/comanda/cazier-fiscal`)
- **Provider**: `src/providers/modular-wizard-provider.tsx`
- **Main Component**: `src/components/orders/modular-order-wizard.tsx`
- **Architecture**: Dynamic step builder based on service `verification_config` (JSONB)
- **Core Steps**: Contact → [Dynamic Modules] → Options → Delivery → Review
- **Available Modules**:
  - `client-type`: PF/PJ selection
  - `personal-data`: Personal KYC (name, CNP, address)
  - `company-data`: Company KYC (CUI validation via InfoCUI)
  - `property-data`: Property data (Carte Funciară)
  - `vehicle-data`: Vehicle data (Rovinieta)
  - `kyc-documents`: Document upload + OCR
  - `signature`: Electronic signature canvas
- **Key Files**:
  - `src/app/comanda/[service]/page.tsx` - Order page
  - `src/lib/verification-modules/step-builder.ts` - Dynamic step generation
  - `src/lib/verification-modules/registry.ts` - Module component mapping
  - `src/components/orders/modules/` - Module implementations
  - `src/components/orders/steps-modular/` - Core steps (contact, options, delivery, review)
- **Docs**: `docs/technical/specs/modular-wizard-guide.md` (HOW TO ADD NEW SERVICES)

#### Legacy Order Wizard (DEPRECATED - to be removed)
- **URL**: `/orders/new?service=xxx`
- **Files**: `src/providers/order-wizard-provider.tsx`, `src/components/orders/order-wizard.tsx`
- **Status**: Kept for reference, will be deleted after testing modular wizard

### Completed (Sprint 3) ✅

- [x] Order auto-save with order ID (ORD-YYYYMMDD-XXXXX format)
- [x] Romanian document handling (CI vechi, CI nou, Passport)
- [x] Certificat Atestare Domiciliu support
- [x] Document expiry validation
- [x] GDPR auto-cleanup (7-day draft anonymization)
- [x] Modular Verification System (dynamic wizard based on service config)
- [x] InfoCUI company validation integration

### In Progress (Sprint 4)

- [ ] S3 document upload (HIGH PRIORITY)
- [x] Order submission API (`/api/orders/[id]/submit`) ✅
- [ ] Stripe payment flow completion
- [x] User data persistence (save for logged users) ✅
- [x] Account creation offer at order end (SaveDataModal for guests) ✅
- [ ] Bank transfer payment option
- [x] User orders dashboard (Account page OrdersTab) ✅
- [x] KYC verification logic (requires ID + selfie for complete) ✅
- [x] Profile document info display (series, number, type, expiry) ✅

---

## DOCUMENTATION STRUCTURE

```
docs/
├── technical/
│   ├── api/
│   │   ├── services-api.md         # Services & Orders API
│   │   └── ocr-kyc-api.md          # OCR & KYC AI API
│   ├── specs/
│   │   ├── user-data-persistence.md       # User data saving feature
│   │   ├── order-autosave-system.md       # Auto-save & support system
│   │   ├── romanian-document-handling.md  # CI/Passport/Certificate handling
│   │   ├── modular-verification-architecture.md  # Modular wizard system
│   │   └── service-verification-requirements.md  # Service requirements matrix
│   ├── debugging/
│   │   ├── draft-save-500-error-fix.md    # Draft save error debugging
│   │   ├── APPLY_MIGRATION_013.md         # Migration guide
│   │   └── typescript-build-fixes-2026-01-08.md  # TypeScript build fixes (NEW)
│   ├── database/
│   │   └── services-schema.md      # Database schema docs
│   └── technology-decisions-summary.md
├── sprints/
│   ├── sprint-0-setup.md
│   ├── sprint-1-auth.md
│   ├── sprint-2-services.md
│   ├── sprint-3-kyc-documents.md
│   └── services/                   # Service-specific docs
├── prd/
│   └── eghiseul-prd.md            # Product Requirements
├── security/
│   └── security-architecture.md
├── legal/
│   └── compliance-research.md
├── design/
│   └── *.md                       # UI/UX designs
└── testing/
    └── *.md                       # Test documentation
```

---

## Agent Categories (60 agents)

### 1. Research & Analysis (7 agents)
| Agent | Purpose |
|-------|---------|
| `research-analyst` | Comprehensive information gathering and synthesis |
| `competitive-analyst` | Competitor intelligence and market positioning |
| `competitor-researcher` | Deep competitor feature research |
| `data-researcher` | Data mining and pattern recognition |
| `market-researcher` | Market sizing, segmentation, trends |
| `trend-analyst` | Emerging patterns and strategic foresight |
| `ux-researcher` | User insights and usability testing |

### 2. Business & Product (7 agents)
| Agent | Purpose |
|-------|---------|
| `business-analyst` | Requirements gathering, process improvement |
| `product-manager` | Product strategy, roadmap, prioritization |
| `project-manager` | Project planning, execution, delivery |
| `scrum-master` | Agile transformation, team facilitation |
| `legal-advisor` | Compliance, contracts, GDPR |
| `feature-prioritizer` | Feature ranking and trade-off analysis |
| `user-story-writer` | User stories with acceptance criteria |

### 3. Architecture & Technical (6 agents)
| Agent | Purpose |
|-------|---------|
| `system-designer` | System architecture and infrastructure |
| `solution-architect` | End-to-end technical solutions |
| `api-designer` | REST/GraphQL API design |
| `database-planner` | Database schemas, queries, optimization |
| `tech-stack-advisor` | Technology evaluation and selection |
| `technology-researcher` | New technologies and trends |

### 4. Development & Code Quality (9 agents)
| Agent | Purpose |
|-------|---------|
| `code-reviewer` | Code review and quality analysis |
| `performance-optimizer` | Performance bottlenecks and optimization |
| `refactoring-expert` | Code restructuring and improvement |
| `security-auditor` | Security vulnerabilities and compliance |
| `test-strategist` | Testing strategy and coverage |
| `jwt-expert` | JWT authentication implementation |
| `stripe-expert` | Stripe payment integration |
| `payment-integration` | Payment systems and flows |
| `best-practice-finder` | Industry standards and proven methods |

### 5. UI/UX Design (10 agents)
| Agent | Purpose |
|-------|---------|
| `ui-designer` | Interface layouts and components |
| `ux-reviewer` | UX evaluation and improvements |
| `wireframe-creator` | Low-fidelity mockups and flows |
| `layout-designer` | Page layouts and grid systems |
| `brand-designer` | Brand identity and guidelines |
| `color-specialist` | Color palettes and accessibility |
| `typography-expert` | Font systems and hierarchies |
| `icon-designer` | Icon systems and visual elements |
| `design-system-builder` | Component libraries and tokens |
| `prompt-engineer` | AI prompts and interactions |

### 6. Documentation & Specs (6 agents)
| Agent | Purpose |
|-------|---------|
| `prd-writer` | Product Requirements Documents |
| `technical-writer` | Technical documentation |
| `documentation-writer` | General documentation |
| `api-documenter` | API documentation and specs |
| `terms-writer` | Terms of service, privacy policies |
| `feature-spec-writer` | Technical feature specifications |

### 7. Content & Marketing (5 agents)
| Agent | Purpose |
|-------|---------|
| `blog-writer` | Blog posts and articles |
| `copywriter` | Marketing copy and messaging |
| `email-writer` | Email campaigns and templates |
| `landing-page-writer` | Landing page content |
| `seo-optimizer` | SEO strategy and optimization |

### 8. Data & Analytics (5 agents)
| Agent | Purpose |
|-------|---------|
| `analytics-setup` | Analytics implementation |
| `dashboard-planner` | Dashboard design and metrics |
| `data-visualizer` | Charts and data presentation |
| `report-generator` | Business reports and summaries |
| `sql-expert` | SQL queries and optimization |

### 9. DevOps & Operations (2 agents)
| Agent | Purpose |
|-------|---------|
| `deployment-troubleshooter` | Deployment issues and CI/CD |
| `error-investigator` | Error analysis and debugging |

### 10. Orchestration (3 agents)
| Agent | Purpose |
|-------|---------|
| `agent-organizer` | Multi-agent coordination and task decomposition |
| `context-manager` | Shared state and information sync |
| `team-communicator` | Team updates and communication |

---

## Development Phases

### Phase 0: Planning & Research ✅ COMPLETE
**Output**: PRD, tech stack decisions, compliance research, architecture docs

### Phase 1: Foundation Setup ✅ COMPLETE
**Output**: Database schema, API specs, auth system, security architecture

### Phase 2: Core Development ✅ COMPLETE
**Output**: Auth, Services API, Orders API

### Phase 3: KYC & Documents ✅ COMPLETE
**Completed agents**: ui-designer, api-documenter, feature-spec-writer, system-designer
**Output**: OCR, KYC validation, modular wizard system, InfoCUI integration, security hardening

### Phase 4: Payments & Contracts ⏳ IN PROGRESS
**Active agents**: stripe-expert, payment-integration, performance-optimizer
**Output**: S3 upload, order submission, Stripe checkout, bank transfers, invoicing, contracts
**Started**: 2025-01-05

### Phase 5: Admin Dashboard ⏳ PENDING
**Active agents**: ui-designer, dashboard-planner
**Output**: Admin panel, order management, statistics

---

## Quick Reference

| Task | Agent(s) to Use | Output Location |
|------|-----------------|-----------------|
| New PRD | `prd-writer` | `docs/prd/` |
| API design | `api-designer` → `api-documenter` | `docs/technical/api/` |
| Feature spec | `feature-spec-writer` | `docs/technical/specs/` |
| Database schema | `database-planner` → `sql-expert` | `docs/technical/database/` |
| Security review | `security-auditor` | `docs/security/` |
| UI components | `ui-designer` | `docs/design/` |
| Code quality | `code-reviewer` | Review comments |

---

## API Endpoints Summary

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/services` | GET | List all services |
| `/api/services/[slug]` | GET | Service details |
| `/api/ocr/extract` | GET | OCR health check |
| `/api/kyc/validate` | GET | KYC health check |

### Protected Endpoints (Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders` | GET, POST | List/Create orders |
| `/api/orders/[id]` | GET, PATCH | Order details/update |
| `/api/orders/[id]/submit` | POST | Submit draft order (draft → pending) |
| `/api/orders/[id]/payment` | POST | Create payment intent |
| `/api/orders/draft` | GET, POST, PATCH | Draft order CRUD |
| `/api/ocr/extract` | POST | Extract data from ID |
| `/api/kyc/validate` | POST | Validate KYC documents |
| `/api/user/profile` | GET, PATCH | User profile with document info |
| `/api/user/kyc` | GET | KYC status (verified/partial/unverified) |
| `/api/user/kyc/save` | POST | Save KYC document |
| `/api/user/addresses` | GET, POST | User addresses CRUD |
| `/api/user/addresses/[id]` | PATCH, DELETE | Address update/delete |
| `/api/user/billing-profiles` | GET, POST | Billing profiles CRUD |
| `/api/user/billing-profiles/[id]` | PATCH, DELETE | Profile update/delete |

### Admin Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/orders/lookup` | GET | Lookup order by ID |
| `/api/admin/orders/list` | GET | List orders by status |
| `/api/admin/cleanup` | GET, POST | GDPR cleanup status/run |

### Webhooks
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/stripe` | POST | Stripe payment webhooks |

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # Run ESLint

# Database
npx supabase db push     # Push migrations
npx supabase gen types typescript --local > src/types/supabase.ts

# Testing APIs
curl http://localhost:3000/api/services
curl http://localhost:3000/api/ocr/extract      # Health check
curl http://localhost:3000/api/kyc/validate     # Health check
```

---

## Database Operations & Migrations

### CRITICAL RULE: NEVER ASK USER TO RUN MIGRATIONS MANUALLY

Claude Code MUST run all database migrations and operations itself. NEVER tell the user to:
- Run SQL manually in Supabase dashboard
- Execute migration files themselves
- Use psql or any database client

All database operations are done via Supabase REST API with the service role key.

### Supabase Connection Details

```
URL:  https://llbwmitdrppomeptqlue.supabase.co
Key:  Read from .env.local → SUPABASE_SERVICE_ROLE_KEY
```

The service role key is stored in `.env.local` - read it using the Read tool before making database calls.

### Step-by-Step: Running a Migration

1. **Read the migration SQL file** (e.g., `supabase/migrations/014_xxx.sql`)
2. **Read the service role key** from `.env.local`
3. **Break down the SQL** into individual REST API calls
4. **Execute each operation** via curl

### Common Operations

**1. Get service ID by slug (for foreign keys):**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/services?slug=eq.cazier-judiciar-persoana-fizica&select=id" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
# Returns: [{"id":"uuid-here"}]
```

**2. Insert service_options:**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/service_options" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -X POST \
  -d '[{
    "service_id": "UUID_FROM_STEP_1",
    "code": "URGENTA",
    "name": "Procesare Urgentă",
    "description": "Obținere în 2 zile lucrătoare în loc de 5 zile.",
    "price": 99.00,
    "is_active": true,
    "is_required": false,
    "display_order": 1
  }]'
```

**3. Update existing record:**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/services?slug=eq.cazier-fiscal" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -X PATCH \
  -d '{"price": 150.00}'
```

**4. Upsert (insert or update on conflict):**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/service_options" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates,return=representation" \
  -X POST \
  -d '[{"service_id": "...", "code": "URGENTA", "name": "Updated Name", ...}]'
```

**5. Delete records:**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/TABLE?id=eq.UUID" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \
  -X DELETE
```

**6. Read all data from table:**
```bash
curl -s "https://llbwmitdrppomeptqlue.supabase.co/rest/v1/services?select=*" \
  -H "apikey: SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

### Table Schemas (Quick Reference)

**services:**
- `id` (uuid), `slug` (text), `name` (text), `category` (text), `price` (numeric)
- `description` (text), `features` (jsonb), `verification_config` (jsonb)

**service_options:**
- `id` (uuid), `service_id` (uuid FK), `code` (text), `name` (text)
- `description` (text), `price` (numeric), `is_active` (bool), `is_required` (bool), `display_order` (int)
- UNIQUE constraint on (service_id, code)

**orders:**
- `id` (uuid), `order_number` (text), `service_id` (uuid FK), `user_id` (uuid FK)
- `status` (text), `form_data` (jsonb), `documents` (jsonb)

### Important Notes

1. **Service role key bypasses RLS** - it has full database access
2. **Always use Prefer: return=representation** for INSERT/PATCH to see results
3. **For ON CONFLICT** (upsert), use `Prefer: resolution=merge-duplicates`
4. **REST API converts column names** - use snake_case (e.g., `is_active`, not `isActive`)
5. **JSON arrays for batch inserts** - wrap single objects in `[{...}]`

### Migration File Convention

Migration files in `supabase/migrations/` follow the pattern:
- `001_initial_schema.sql`
- `010_verification_config.sql`
- `014_cazier_judiciar_options.sql`

When creating new migrations, increment the number and save the file even if running via REST API (for documentation).

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_AI_API_KEY=           # For OCR & KYC
STRIPE_SECRET_KEY=

# Optional (for full functionality)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_DOCUMENTS=
RESEND_API_KEY=
SMARTBILL_API_KEY=
SMSLINK_API_KEY=
```

---

**Last Updated:** 2026-01-09
**Version:** 2.6
