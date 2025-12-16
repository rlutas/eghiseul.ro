# eghiseul.ro - Documentation Roadmap

## Project Overview

Rebuild complet al platformei eghiseul.ro din WordPress într-o arhitectură modernă.

**Tech Stack**: Next.js + Node.js (TypeScript)
**Audiență**: Multi-segment (B2C, B2B, Instituții publice)
**Model**: API-first pentru integrări cu parteneri

## Documente necesare (în ordinea creării)

### Faza 1: Business & Strategy
| Document | Agent | Locație | Status |
|----------|-------|---------|--------|
| Business Requirements | business-analyst | `docs/business/business-requirements.md` | ⏳ |
| Market Analysis | market-researcher | `docs/business/market-analysis.md` | ⏳ |
| Competitive Analysis | competitive-analyst | `docs/business/competitive-analysis.md` | ⏳ |
| Legal & Compliance | legal-advisor | `docs/business/legal-compliance.md` | ⏳ |

### Faza 2: Product Definition
| Document | Agent | Locație | Status |
|----------|-------|---------|--------|
| Main PRD | prd-writer | `docs/prd/eghiseul-prd.md` | ✅ |
| PRD Printable | - | `docs/prd/eghiseul-prd-printable.md` | ✅ |
| Service Analysis | - | `docs/analysis/service-flows-analysis.md` | ✅ |
| Mermaid Diagrams | - | `docs/analysis/diagrams/` | ✅ |
| User Personas | ux-researcher | `docs/prd/user-personas.md` | ⏳ |
| Feature Specifications | feature-spec-writer | `docs/prd/features/` | ⏳ |

### Faza 3: Technical Architecture
| Document | Agent | Locație | Status |
|----------|-------|---------|--------|
| System Architecture | system-designer | `docs/technical/architecture.md` | ⏳ |
| API Design | api-designer | `docs/technical/api-design.md` | ⏳ |
| Database Schema | database-planner | `docs/technical/database-schema.md` | ⏳ |
| Tech Stack Evaluation | tech-stack-advisor | `docs/technical/tech-stack.md` | ⏳ |

### Faza 4: Planning & Execution
| Document | Agent | Locație | Status |
|----------|-------|---------|--------|
| Project Plan | project-manager | `docs/planning/project-plan.md` | ⏳ |
| Sprint Planning | scrum-master | `docs/planning/sprints/` | ⏳ |

## Servicii identificate (de detaliat în PRD)

### Servicii Guvernamentale
- Taxe și impozite locale
- Formulare oficiale
- Programări la instituții
- Eliberare documente

### Servicii Utilitare
- Plăți facturi
- Abonamente servicii
- Notificări și alerte

### Servicii Business
- Înregistrări firme
- Licențe și autorizații
- Servicii API pentru parteneri

## API Strategy

Toate serviciile vor fi expuse prin API REST pentru:
- Aplicații mobile native
- Integrări B2B cu parteneri
- White-label solutions pentru instituții

## Next Steps

1. **Imediat**: Definire servicii complete și business requirements
2. **Apoi**: PRD principal cu toate funcționalitățile
3. **Ulterior**: Arhitectură tehnică și API design
