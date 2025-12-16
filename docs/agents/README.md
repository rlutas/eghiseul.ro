# Agent Collaboration Documentation

## Overview

eGhiseul.ro utilizează **60 de agenți specializați** organizați în 10 categorii pentru a automatiza și optimiza procesul de dezvoltare.

## Quick Reference

| Categorie | Agenți | Folosit în Fază |
|-----------|--------|-----------------|
| Research & Analysis | 7 | 0, 1 |
| Business & Product | 7 | 0, 1, 4 |
| Architecture & Technical | 6 | 0, 1 |
| Development & Code Quality | 9 | 2, 3, 4 |
| UI/UX Design | 10 | 1, 2 |
| Documentation & Specs | 6 | 0, 4 |
| Content & Marketing | 5 | 3, 4 |
| Data & Analytics | 5 | 2, 3 |
| DevOps & Operations | 2 | 3, 4 |
| Orchestration | 3 | toate |

## Development Phases

```
┌──────────────────────────────────────────────────────────────────┐
│                    PHASE 0: PLANNING (DONE)                      │
│  research-analyst, market-researcher, competitive-analyst,       │
│  legal-advisor, system-designer, prd-writer                      │
├──────────────────────────────────────────────────────────────────┤
│                    PHASE 1: FOUNDATION (NEXT)                    │
│  system-designer, database-planner, api-designer, security-auditor│
├──────────────────────────────────────────────────────────────────┤
│                    PHASE 2: DEVELOPMENT                          │
│  ui-designer, code-reviewer, test-strategist, ux-reviewer        │
├──────────────────────────────────────────────────────────────────┤
│                    PHASE 3: INTEGRATION                          │
│  stripe-expert, payment-integration, performance-optimizer       │
├──────────────────────────────────────────────────────────────────┤
│                    PHASE 4: LAUNCH                               │
│  security-auditor, technical-writer, deployment-troubleshooter   │
└──────────────────────────────────────────────────────────────────┘
```

## Agent Categories

### 1. Research & Analysis (7)

| Agent | Scop | Output |
|-------|------|--------|
| `research-analyst` | Sinteză informații | `docs/analysis/` |
| `competitive-analyst` | Analiza competitorilor | `docs/business/` |
| `competitor-researcher` | Comparație features | `docs/business/` |
| `data-researcher` | Pattern mining | `docs/analysis/` |
| `market-researcher` | Dimensiune piață | `docs/business/` |
| `trend-analyst` | Tendințe emergente | `docs/analysis/` |
| `ux-researcher` | Insights utilizatori | `docs/analysis/` |

### 2. Business & Product (7)

| Agent | Scop | Output |
|-------|------|--------|
| `business-analyst` | Cerințe, procese | `docs/business/` |
| `product-manager` | Strategie, roadmap | `docs/planning/` |
| `project-manager` | Planificare, riscuri | `docs/planning/` |
| `scrum-master` | Sprinturi, retrospective | `docs/planning/` |
| `legal-advisor` | GDPR, contracte | `docs/legal/` |
| `feature-prioritizer` | Prioritizare features | `docs/planning/` |
| `user-story-writer` | User stories | `docs/prd/` |

### 3. Architecture & Technical (6)

| Agent | Scop | Output |
|-------|------|--------|
| `system-designer` | Arhitectură sistem | `docs/technical/` |
| `solution-architect` | Soluții end-to-end | `docs/technical/` |
| `api-designer` | Design REST/GraphQL | `docs/technical/api/` |
| `database-planner` | Scheme, indexuri | `docs/technical/` |
| `tech-stack-advisor` | Evaluare tehnologii | `docs/technical/` |
| `technology-researcher` | Research tech nou | `docs/technical/` |

### 4. Development & Code Quality (9)

| Agent | Scop | Output |
|-------|------|--------|
| `code-reviewer` | Review cod | Comentarii |
| `performance-optimizer` | Optimizare | `docs/technical/` |
| `refactoring-expert` | Restructurare cod | Implementare |
| `security-auditor` | Vulnerabilități | `docs/security/` |
| `test-strategist` | Strategie testare | `docs/technical/` |
| `jwt-expert` | Implementare JWT | Implementare |
| `stripe-expert` | Integrare Stripe | Implementare |
| `payment-integration` | Fluxuri plăți | `docs/technical/` |
| `best-practice-finder` | Standarde industrie | `docs/technical/` |

### 5. UI/UX Design (10)

| Agent | Scop | Output |
|-------|------|--------|
| `ui-designer` | Layout-uri, componente | `docs/design/` |
| `ux-reviewer` | Evaluare UX | `docs/design/` |
| `wireframe-creator` | Mockups | `docs/design/` |
| `layout-designer` | Grids, layout-uri | `docs/design/` |
| `brand-designer` | Identitate brand | `docs/design/` |
| `color-specialist` | Palete culori | `docs/design/` |
| `typography-expert` | Sisteme font | `docs/design/` |
| `icon-designer` | Icoane | `docs/design/` |
| `design-system-builder` | Design system | `docs/design/` |
| `prompt-engineer` | Prompturi AI | `docs/technical/` |

### 6. Documentation & Specs (6)

| Agent | Scop | Output |
|-------|------|--------|
| `prd-writer` | PRD-uri | `docs/prd/` |
| `technical-writer` | Documentație tech | `docs/technical/` |
| `documentation-writer` | Documentație generală | `docs/` |
| `api-documenter` | Specs API | `docs/technical/api/` |
| `terms-writer` | T&C, Privacy | `docs/legal/` |
| `feature-spec-writer` | Spec features | `docs/technical/` |

### 7. Content & Marketing (5)

| Agent | Scop | Output |
|-------|------|--------|
| `blog-writer` | Articole blog | `content/blog/` |
| `copywriter` | Copy marketing | `content/` |
| `email-writer` | Template-uri email | `content/emails/` |
| `landing-page-writer` | Landing pages | `content/` |
| `seo-optimizer` | Strategie SEO | `docs/technical/` |

### 8. Data & Analytics (5)

| Agent | Scop | Output |
|-------|------|--------|
| `analytics-setup` | Implementare analytics | `docs/technical/` |
| `dashboard-planner` | Design dashboards | `docs/design/` |
| `data-visualizer` | Vizualizări | `docs/design/` |
| `report-generator` | Rapoarte business | `docs/business/` |
| `sql-expert` | Query-uri SQL | Implementare |

### 9. DevOps & Operations (2)

| Agent | Scop | Output |
|-------|------|--------|
| `deployment-troubleshooter` | CI/CD, deploy | Implementare |
| `error-investigator` | Debug, analiză erori | Implementare |

### 10. Orchestration (3)

| Agent | Scop | Output |
|-------|------|--------|
| `agent-organizer` | Coordonare multi-agent | Coordonare |
| `context-manager` | State management | Coordonare |
| `team-communicator` | Updates echipă | `docs/planning/` |

## Workflow Patterns

### Sequential Chain
```
research-analyst → product-manager → prd-writer
system-designer → api-designer → database-planner
ui-designer → ux-reviewer → code-reviewer
```

### Parallel Team
```
[market-researcher, competitive-analyst, trend-analyst] → aggregate
[ui-designer, api-designer, database-planner] → integrate
[security-auditor, performance-optimizer, test-strategist] → quality
```

## Files Reference

| Document | Locație | Scop |
|----------|---------|------|
| Development Plan | `DEVELOPMENT_MASTER_PLAN.md` | Sprint tracking |
| PRD | `docs/prd/eghiseul-prd.md` | Cerințe produs |
| Tech Stack | `docs/technical/technology-decisions-summary.md` | Decizii tech |
| Services | `docs/services/README.md` | Catalog 12 servicii |
| Security | `docs/security/README.md` | Arhitectură securitate |
| Legal | `docs/legal/compliance-research.md` | GDPR, compliance |

## Current Status

**Phase 0: Planning** - COMPLETAT ✓
- PRD finalizat
- Tech stack decis
- 12 servicii documentate
- Securitate planificată
- Compliance GDPR cercetat

**Next: Phase 1** - Foundation Setup
- Database schema
- API design
- Auth system
- Project structure
