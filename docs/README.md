# Documentație eGhiseul.ro

**Fișier principal de urmărit:** `../DEVELOPMENT_MASTER_PLAN.md`

---

## Structură Foldere

```
docs/
├── README.md                 ← Ești aici
│
├── prd/                      ← Product Requirements
│   ├── eghiseul-prd.md       ← PRD complet
│   └── eghiseul-prd-printable.md
│
├── services/                 ← Documentație servicii (12)
│   ├── README.md             ← Catalog servicii
│   ├── cazier-fiscal.md
│   ├── cazier-judiciar.md
│   ├── cazier-auto.md
│   ├── certificat-nastere.md
│   ├── certificat-casatorie.md
│   ├── certificat-celibat.md
│   ├── certificat-integritate.md
│   ├── certificat-constatator.md
│   ├── extras-carte-funciara.md
│   ├── extras-multilingv-nastere.md
│   ├── extras-multilingv-casatorie.md
│   ├── rovinieta.md
│   └── _template.md          ← Template pentru serviciu nou
│
├── technical/                ← Decizii tehnice
│   ├── TECHNOLOGY_RECOMMENDATIONS.md  ← Stack complet
│   └── technology-decisions-summary.md
│
├── security/                 ← Security & Compliance
│   ├── README.md             ← Overview securitate
│   ├── security-architecture.md
│   ├── security-implementation-checklist.md
│   └── security-recommendations-summary.md
│
├── legal/                    ← GDPR & Legal
│   ├── compliance-research.md
│   └── compliance-checklist-quick-ref.md
│
├── analysis/                 ← Analize și cercetare
│   ├── feature-completeness-analysis.md
│   ├── service-flows-analysis.md
│   └── smart-flow-v2.md
│
├── design/                   ← Design UI/UX
│   └── design-pagini-eghiseul.md
│
├── business/                 ← Business docs
│   ├── existing-platform.md
│   └── new-features.md
│
├── planning/                 ← Planning
│   └── documentation-roadmap.md
│
├── agents/                   ← Agent collaboration docs
│   └── README.md             ← 60 agenți, faze, workflow
│
└── legacy/                   ← Referință WordPress vechi
    └── wordpress-reference/
        └── functions.php
```

---

## Index Rapid

| Categorie | Fișier | Ce găsești |
|-----------|--------|------------|
| **PRD** | `prd/eghiseul-prd.md` | Cerințe funcționale complete |
| **Servicii** | `services/README.md` | Catalog 12 servicii |
| **Tech Stack** | `technical/TECHNOLOGY_RECOMMENDATIONS.md` | Next.js, Supabase, S3, etc. |
| **Security** | `security/README.md` | Arhitectură securitate |
| **Legal** | `legal/compliance-research.md` | GDPR, contracte |
| **Design** | `design/design-pagini-eghiseul.md` | Wireframes pagini |
| **Agents** | `agents/README.md` | 60 agenți, faze, colaborare |

---

## Top 12 Servicii

| # | Serviciu | Comenzi | Prioritate |
|---|----------|---------|------------|
| 1 | Extras Carte Funciară | 34,816 | MVP |
| 2 | Cazier Fiscal | 33,723 | MVP |
| 3 | Certificat Constatator | 6,201 | MVP |
| 4 | Certificat Naștere | 5,930 | Faza 2 |
| 5 | Cazier Judiciar | ~5,000 | Faza 2 |
| 6 | Certificat Celibat | 4,708 | Faza 2 |
| 7 | Certificat Integritate | 2,201 | Faza 2 |
| 8 | Cazier Auto | 809 | Faza 2 |
| 9 | Certificat Căsătorie | 604 | Faza 2 |
| 10 | Extras Multilingv Naștere | 82 | Faza 2 |
| 11 | Extras Multilingv Căsătorie | 32 | Faza 2 |
| 12 | Rovinieta | TBD | Faza 3 |

---

## Ghid Actualizare

| Când modifici... | Actualizează în... |
|------------------|-------------------|
| Serviciu nou | `services/README.md` + `services/{serviciu}.md` |
| Preț serviciu | `services/{serviciu}.md` |
| Feature nou | `prd/eghiseul-prd.md` |
| Tech stack | `technical/TECHNOLOGY_RECOMMENDATIONS.md` |
| Security | `security/security-architecture.md` |
| GDPR/Legal | `legal/compliance-research.md` |
| Design pagină | `design/design-pagini-eghiseul.md` |
| Agent nou | `.claude/agents/{agent}.md` + `agents/README.md` |

---

**Pentru checklist-uri active și tracking dezvoltare:**
**Vezi `../DEVELOPMENT_MASTER_PLAN.md`**
