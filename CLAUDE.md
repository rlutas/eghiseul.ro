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

### When to Update Documentation

**ALWAYS update documentation when:**
1. Adding new API endpoints → Update `docs/technical/api/`
2. Changing database schema → Update `docs/technical/database/`
3. Completing sprint tasks → Update `DEVELOPMENT_MASTER_PLAN.md`
4. Adding new features → Create spec in `docs/technical/specs/`
5. Modifying services → Update relevant service doc in `docs/sprints/services/`

### Documentation Update Checklist

```markdown
After completing any feature:
[ ] Update DEVELOPMENT_MASTER_PLAN.md with status
[ ] Document new APIs in docs/technical/api/
[ ] Update sprint docs if applicable
[ ] Add/update TypeScript types in src/types/
[ ] Update this CLAUDE.md if new patterns established
```

### Key Files to Track

| File | Purpose | Update When |
|------|---------|-------------|
| `DEVELOPMENT_MASTER_PLAN.md` | Sprint progress, task tracking | After completing tasks |
| `docs/technical/api/*.md` | API documentation | New/modified endpoints |
| `docs/technical/specs/*.md` | Feature specifications | Planning new features |
| `docs/sprints/sprint-*.md` | Sprint details | During sprint work |
| `src/types/*.ts` | TypeScript interfaces | Schema changes |

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
- **Supports**: CI front, CI back, Passport
- **Extracts**: CNP, name, birth date, full Romanian address (Jud., Str., Nr., Bl., Sc., Et., Ap.)
- **Docs**: `docs/technical/api/ocr-kyc-api.md`

#### KYC Validation System
- **Files**: `src/lib/services/kyc-validation.ts`, `src/app/api/kyc/validate/`
- **Model**: Google Gemini 1.5 Flash
- **Features**: Document validation, face matching, confidence scores
- **Docs**: `docs/technical/api/ocr-kyc-api.md`

#### Order Wizard (6 Steps)
- **Files**: `src/components/orders/`, `src/providers/order-wizard-provider.tsx`
- **Steps**: Contact → Personal Data → Options → KYC → Delivery → Review
- **Features**:
  - ID scanning with auto-fill
  - CNP validation with checksum
  - Electronic signature
  - Smart KYC (reuse documents from Step 2 in Step 4)

### In Progress (Sprint 3+)

- [ ] User data persistence (save for logged users)
- [ ] Account creation offer at order end
- [ ] Order auto-save with order ID
- [ ] Bank transfer payment option
- [ ] S3 document upload
- [ ] User orders dashboard

---

## DOCUMENTATION STRUCTURE

```
docs/
├── technical/
│   ├── api/
│   │   ├── services-api.md         # Services & Orders API
│   │   └── ocr-kyc-api.md          # OCR & KYC AI API (NEW)
│   ├── specs/
│   │   ├── user-data-persistence.md    # User data saving feature
│   │   └── order-autosave-system.md    # Auto-save & support system
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

### Phase 3: KYC & Documents ⏳ IN PROGRESS
**Active agents**: ui-designer, api-documenter, feature-spec-writer, system-designer
**Output**: OCR, KYC validation, order wizard, user data persistence

### Phase 4: Payments & Contracts ⏳ PENDING
**Active agents**: stripe-expert, payment-integration, performance-optimizer
**Output**: Stripe checkout, bank transfers, invoicing, contracts

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
| `/api/orders/[id]/payment` | POST | Create payment intent |
| `/api/ocr/extract` | POST | Extract data from ID |
| `/api/kyc/validate` | POST | Validate KYC documents |

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

**Last Updated:** 2025-12-17
**Version:** 2.0
