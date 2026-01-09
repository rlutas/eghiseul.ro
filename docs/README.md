# Documentație eGhiseul.ro

**Ultima actualizare:** 2026-01-09
**Status proiect:** Sprint 4 (Payments & Contracts) - KYC & Profile Complete
**Fișier principal:** `../DEVELOPMENT_MASTER_PLAN.md`

---

## Navigare Rapidă

| Caut informații despre... | Mergi la... |
|--------------------------|-------------|
| **Ce am de făcut** | [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md) |
| **Cum funcționează API-ul** | [`technical/api/`](technical/api/) |
| **Cum adaug un serviciu nou** | [`technical/specs/modular-wizard-guide.md`](technical/specs/modular-wizard-guide.md) |
| **Ce servicii avem** | [`sprints/services/`](sprints/services/) |
| **Cerințele produsului** | [`prd/eghiseul-prd.md`](prd/eghiseul-prd.md) |
| **Probleme de securitate** | [`security/SECURITY_AUDIT_SUMMARY.md`](security/SECURITY_AUDIT_SUMMARY.md) |
| **Design sistem culori** | [`design/color-system.md`](design/color-system.md) |
| **Cum rulez migrații** | [`../CLAUDE.md`](../CLAUDE.md#database-operations--migrations) |
| **Conformitate GDPR** | [`legal/compliance-research.md`](legal/compliance-research.md) |

---

## Structură Completă

```
docs/
├── README.md                    ← Ești aici (index principal)
│
├── prd/                         ← Product Requirements
│   └── eghiseul-prd.md          ← PRD v2.0 (actualizat Jan 2026)
│
├── technical/                   ← Documentație Tehnică
│   ├── api/
│   │   ├── services-api.md      ← Services, Orders, Draft, Admin APIs
│   │   └── ocr-kyc-api.md       ← OCR (Gemini 2.0) + KYC (Gemini 1.5)
│   ├── specs/
│   │   ├── modular-wizard-guide.md          ← ⭐ CUM ADAUGI SERVICII NOI
│   │   ├── modular-verification-architecture.md
│   │   ├── service-verification-requirements.md
│   │   ├── order-autosave-system.md
│   │   ├── romanian-document-handling.md
│   │   ├── user-data-persistence.md
│   │   ├── user-data-persistence-implementation.md  ← Implementation details
│   │   ├── user-data-flow-analysis.md       ← Data flow gaps & fixes
│   │   ├── security-audit-admin-client.md   ← Security vulnerabilities fixed
│   │   └── draft-error-recovery.md          ← Error handling & auto-recovery
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
│   ├── DATABASE_MIGRATIONS.md   ← Cum rulezi migrații
│   └── PRODUCTION_SECURITY_SETUP.md
│
├── legal/                       ← GDPR & Compliance
│   └── compliance-research.md   ← Cercetare GDPR/ANSPDCP
│
├── testing/                     ← Test Plans
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
| Sprint 4 | 🔄 Active | Payments, S3, Contracts | `DEVELOPMENT_MASTER_PLAN.md` |

---

## Tech Stack Actual

| Layer | Technology | Status |
|-------|------------|--------|
| **Frontend** | Next.js 16+, Tailwind v4, shadcn/ui | ✅ Active |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) | ✅ Active |
| **AI/OCR** | Google Gemini 2.0 Flash Exp | ✅ Integrated |
| **AI/KYC** | Google Gemini 1.5 Flash | ✅ Integrated |
| **Storage** | AWS S3 (eu-central-1) | 🔄 Sprint 4 |
| **Payments** | Stripe | 🔄 Sprint 4 |
| **Company Validation** | InfoCUI.ro | ✅ Integrated |

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

### Protected (Auth Required)
- `POST /api/orders` - Create order
- `GET/PATCH /api/orders/[id]` - Order details/update
- `POST /api/orders/[id]/submit` - Submit draft order
- `POST /api/orders/[id]/payment` - Create payment
- `GET/POST/PATCH /api/orders/draft` - Draft CRUD
- `POST /api/ocr/extract` - OCR extraction
- `POST /api/kyc/validate` - KYC validation
- `POST /api/company/validate` - InfoCUI validation
- `GET /api/user/prefill-data` - User saved data
- `GET/PATCH /api/user/profile` - User profile with document info
- `GET /api/user/kyc` - KYC status (verified/partial/unverified)
- `POST /api/user/kyc/save` - Save KYC document
- `GET/POST /api/user/addresses` - User addresses
- `PATCH/DELETE /api/user/addresses/[id]` - Address update/delete
- `GET/POST /api/user/billing-profiles` - Billing profiles
- `PATCH/DELETE /api/user/billing-profiles/[id]` - Profile update/delete

### Admin
- `GET /api/admin/orders/lookup` - Lookup by order number
- `GET /api/admin/orders/list` - List by status
- `GET/POST /api/admin/cleanup` - GDPR cleanup
- `POST /api/auth/register-from-order` - Convert guest to user

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
| `supabase/migrations/` | DB migrations |

---

**Pentru tracking dezvoltare:** Vezi [`../DEVELOPMENT_MASTER_PLAN.md`](../DEVELOPMENT_MASTER_PLAN.md)

**Ultima actualizare:** 2026-01-09
