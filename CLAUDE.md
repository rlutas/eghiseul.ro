# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: eghiseul.ro

Platformă digitală pentru România, în proces de reconstrucție din WordPress. Obiective principale:
- Rebuild complet al platformei
- Arhitectură API-first pentru parteneriate
- Multiple servicii integrate (12 servicii)
- Scalabilitate pentru expansiune

## Tech Stack

```
Frontend:   Next.js 14+ (TypeScript, Tailwind, shadcn/ui)
Backend:    Supabase (PostgreSQL, Auth, Real-time)
Storage:    AWS S3 (contracts, KYC documents)
OCR:        GEMINI AI SEND TO AI TO EXTRACT
Payments:   Stripe
SMS:        SMSLink.ro
Email:      Resend
Invoicing:  SmartBill
```

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

## Development Phases

### Phase 0: Planning & Research (CURRENT)
**Active agents**: research-analyst, market-researcher, competitive-analyst, legal-advisor, system-designer, prd-writer
**Output**: PRD, tech stack decisions, compliance research, architecture docs

### Phase 1: Foundation Setup
**Active agents**: system-designer, database-planner, api-designer, security-auditor
**Output**: Database schema, API specs, auth system, security architecture

### Phase 2: Core Development
**Active agents**: code-reviewer, test-strategist, ui-designer, ux-reviewer
**Output**: Auth, multi-tenancy, file upload, first 3 services

### Phase 3: Integration & Polish
**Active agents**: stripe-expert, payment-integration, performance-optimizer, seo-optimizer
**Output**: Payments, invoicing, KYC, notifications

### Phase 4: Launch Prep
**Active agents**: security-auditor, technical-writer, deployment-troubleshooter
**Output**: Security audit, documentation, production deploy

## Agent Collaboration Rules

### Sequential Chains (output depends on prior agent)
```
research-analyst → product-manager → prd-writer → feature-spec-writer
market-researcher → competitive-analyst → product-manager
system-designer → api-designer → database-planner
ui-designer → ux-reviewer → code-reviewer
```

### Parallel Teams (independent work)
```
[research-analyst, market-researcher, trend-analyst] → aggregate findings
[ui-designer, api-designer, database-planner] → different system parts
[security-auditor, performance-optimizer, test-strategist] → quality checks
```

### Orchestration Pattern
```
1. agent-organizer receives task
2. Decomposes into subtasks
3. Assigns to appropriate agents
4. context-manager maintains shared state
5. agent-organizer aggregates results
```

## Documentation Structure

```
docs/
├── business/           # Market analysis, competitor research
├── prd/               # Product Requirements Documents
├── services/          # 12 service specifications
├── technical/         # Architecture, API, tech stack
├── security/          # Security architecture, checklists
├── legal/             # GDPR, compliance, contracts
├── analysis/          # Feature analysis, flows
├── design/            # UI/UX designs, wireframes
├── planning/          # Roadmaps, sprints
└── legacy/            # WordPress reference
```

## Quick Reference

| Task | Agent(s) to Use |
|------|-----------------|
| New PRD | `prd-writer` → `product-manager` |
| API design | `api-designer` → `api-documenter` |
| Database schema | `database-planner` → `sql-expert` |
| Market research | `market-researcher` + `competitive-analyst` |
| Security review | `security-auditor` → `best-practice-finder` |
| UI components | `ui-designer` + `design-system-builder` |
| Code quality | `code-reviewer` + `test-strategist` |
| Performance | `performance-optimizer` + `analytics-setup` |
| Legal/GDPR | `legal-advisor` + `terms-writer` |

## Files to Track

- **DEVELOPMENT_MASTER_PLAN.md** - Sprint checklists, progress tracking
- **docs/prd/eghiseul-prd.md** - Product requirements
- **docs/technical/technology-decisions-summary.md** - Tech stack decisions
- **docs/services/README.md** - Service catalog (12 services)
