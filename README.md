# eGhiseul.ro

Platformă digitală pentru documente și servicii guvernamentale pentru cetățenii români.

---

## Quick Start

**Un singur fișier de urmărit:**

```
DEVELOPMENT_MASTER_PLAN.md  ← START HERE
```

Acest fișier conține tot ce trebuie: tech stack, checklist-uri, sprint-uri, și linkuri către toată documentația.

---

## Tech Stack

```
Frontend:   Next.js 14+ (TypeScript, Tailwind, shadcn/ui)
Backend:    Supabase (PostgreSQL, Auth, Real-time)
Storage:    AWS S3 (contracte, documente KYC)
OCR:        GOOGLE GEMINI AI SEND TO AI TO EXTRACT.
Payments:   Stripe
```

---

## Structură Proiect

```
eghiseul.ro/
│
├── README.md                      ← Ești aici
├── DEVELOPMENT_MASTER_PLAN.md     ← Fișierul principal de urmărit
├── CLAUDE.md                      ← Instrucțiuni pentru AI assistant
│
├── docs/                          ← Toată documentația
│   ├── prd/                       ← Product Requirements
│   │   └── eghiseul-prd.md        ← PRD complet
│   │
│   ├── services/                  ← Documentație servicii
│   │   ├── README.md              ← Catalog servicii
│   │   ├── cazier-fiscal.md
│   │   ├── cazier-judiciar.md
│   │   └── ... (12 servicii)
│   │
│   ├── technical/                 ← Decizii tehnice
│   │   └── technology-decisions-summary.md
│   │
│   ├── legal/                     ← Compliance, GDPR
│   │   ├── compliance-research.md
│   │   └── compliance-checklist-quick-ref.md
│   │
│   ├── analysis/                  ← Analize
│   │   ├── feature-completeness-analysis.md
│   │   └── service-flows-analysis.md
│   │
│   ├── security-architecture.md   ← Arhitectură securitate
│   ├── security-implementation-checklist.md
│   └── TECHNOLOGY_RECOMMENDATIONS.md
│
├── app/                           ← Next.js App (de creat)
├── components/                    ← React components (de creat)
├── lib/                           ← Utilities (de creat)
└── supabase/                      ← Migrations (de creat)
```

---

## Documentație Index

| Categorie | Fișier | Descriere |
|-----------|--------|-----------|
| **START** | `DEVELOPMENT_MASTER_PLAN.md` | Checklist-uri, sprint-uri, tot |
| **PRD** | `docs/prd/eghiseul-prd.md` | Cerințe funcționale complete |
| **Servicii** | `docs/services/README.md` | Catalog 12 servicii |
| **Tech** | `docs/TECHNOLOGY_RECOMMENDATIONS.md` | Stack și decizii |
| **Security** | `docs/security-architecture.md` | Arhitectură securitate |
| **Legal** | `docs/legal/compliance-research.md` | GDPR, contracte |

---

## Comenzi Rapide

```bash
# Start development (după setup)
npm run dev

# Supabase local
npx supabase start

# Generate types din Supabase
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Status Proiect

- [x] Documentație completă
- [x] PRD finalizat
- [x] Tech stack decis
- [x] Security architecture
- [x] Legal compliance research
- [ ] **Setup proiect** ← Next step
- [ ] Sprint 1: Auth
- [ ] Sprint 2: Servicii
- [ ] Sprint 3: KYC
- [ ] Sprint 4: Payments
- [ ] Sprint 5: Admin
- [ ] Sprint 6: Launch

---

## Echipă

Pentru întrebări despre proiect, consultă `DEVELOPMENT_MASTER_PLAN.md`.
