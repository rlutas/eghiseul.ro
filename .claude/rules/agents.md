# Agent Usage Rules

## Complete Agent Inventory (60 agents)

### Research & Analysis (7)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `research-analyst` | Information gathering, synthesis | `docs/analysis/` |
| `competitive-analyst` | Competitor SWOT, positioning | `docs/business/` |
| `competitor-researcher` | Deep feature comparison | `docs/business/` |
| `data-researcher` | Data mining, patterns | `docs/analysis/` |
| `market-researcher` | Market sizing, segments | `docs/business/` |
| `trend-analyst` | Emerging trends, foresight | `docs/analysis/` |
| `ux-researcher` | User insights, usability | `docs/analysis/` |

### Business & Product (7)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `business-analyst` | Requirements, process flows | `docs/business/` |
| `product-manager` | Strategy, roadmap, priorities | `docs/planning/` |
| `project-manager` | Timelines, resources, risks | `docs/planning/` |
| `scrum-master` | Sprint planning, retrospectives | `docs/planning/` |
| `legal-advisor` | GDPR, contracts, compliance | `docs/legal/` |
| `feature-prioritizer` | Feature ranking, trade-offs | `docs/planning/` |
| `user-story-writer` | User stories, acceptance criteria | `docs/prd/` |

### Architecture & Technical (6)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `system-designer` | System architecture, infrastructure | `docs/technical/` |
| `solution-architect` | End-to-end technical solutions | `docs/technical/` |
| `api-designer` | REST/GraphQL API design | `docs/technical/api/` |
| `database-planner` | Schemas, indexes, optimization | `docs/technical/` |
| `tech-stack-advisor` | Technology evaluation | `docs/technical/` |
| `technology-researcher` | New tech research | `docs/technical/` |

### Development & Code Quality (9)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `code-reviewer` | Code quality, bugs, security | Review comments |
| `performance-optimizer` | Performance bottlenecks | `docs/technical/` |
| `refactoring-expert` | Code restructuring | Implementation |
| `security-auditor` | Security vulnerabilities | `docs/security/` |
| `test-strategist` | Testing strategy, coverage | `docs/technical/` |
| `jwt-expert` | JWT auth implementation | Implementation |
| `stripe-expert` | Stripe integration | Implementation |
| `payment-integration` | Payment flows | `docs/technical/` |
| `best-practice-finder` | Industry standards | `docs/technical/` |

### UI/UX Design (10)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `ui-designer` | Interface layouts, components | `docs/design/` |
| `ux-reviewer` | UX evaluation, improvements | `docs/design/` |
| `wireframe-creator` | Low-fidelity mockups | `docs/design/` |
| `layout-designer` | Page layouts, grids | `docs/design/` |
| `brand-designer` | Brand identity, guidelines | `docs/design/` |
| `color-specialist` | Color palettes, accessibility | `docs/design/` |
| `typography-expert` | Font systems, hierarchies | `docs/design/` |
| `icon-designer` | Icon systems | `docs/design/` |
| `design-system-builder` | Component libraries, tokens | `docs/design/` |
| `prompt-engineer` | AI prompts, interactions | `docs/technical/` |

### Documentation & Specs (6)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `prd-writer` | Product Requirements Document | `docs/prd/` |
| `technical-writer` | Technical documentation | `docs/technical/` |
| `documentation-writer` | General documentation | `docs/` |
| `api-documenter` | API specs, OpenAPI | `docs/technical/api/` |
| `terms-writer` | Terms, privacy policies | `docs/legal/` |
| `feature-spec-writer` | Feature specifications | `docs/technical/` |

### Content & Marketing (5)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `blog-writer` | Blog posts, articles | `content/blog/` |
| `copywriter` | Marketing copy | `content/` |
| `email-writer` | Email templates | `content/emails/` |
| `landing-page-writer` | Landing page content | `content/` |
| `seo-optimizer` | SEO strategy | `docs/technical/` |

### Data & Analytics (5)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `analytics-setup` | Analytics implementation | `docs/technical/` |
| `dashboard-planner` | Dashboard design | `docs/design/` |
| `data-visualizer` | Charts, visualizations | `docs/design/` |
| `report-generator` | Business reports | `docs/business/` |
| `sql-expert` | SQL queries, optimization | Implementation |

### DevOps & Operations (2)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `deployment-troubleshooter` | CI/CD, deploy issues | Implementation |
| `error-investigator` | Debug, error analysis | Implementation |

### Orchestration (3)
| Agent | When to Use | Output Location |
|-------|-------------|-----------------|
| `agent-organizer` | Multi-agent task decomposition | N/A (coordination) |
| `context-manager` | Shared state management | N/A (coordination) |
| `team-communicator` | Team updates, status | `docs/planning/` |

## Agent Selection by Task Type

| Task | Primary | Supporting | Parallel OK? |
|------|---------|------------|--------------|
| **PRD creation** | prd-writer | product-manager, ux-researcher | No |
| **Market research** | market-researcher | competitive-analyst, trend-analyst | Yes |
| **System design** | system-designer | api-designer, database-planner | Partial |
| **Feature planning** | feature-spec-writer | product-manager, ux-researcher | No |
| **Tech evaluation** | tech-stack-advisor | technology-researcher, best-practice-finder | Yes |
| **Project coordination** | project-manager | scrum-master, agent-organizer | No |
| **API design** | api-designer | system-designer, api-documenter | No |
| **Business analysis** | business-analyst | market-researcher, legal-advisor | Yes |
| **Security review** | security-auditor | best-practice-finder | No |
| **UI design** | ui-designer | ux-reviewer, design-system-builder | Partial |
| **Code quality** | code-reviewer | test-strategist, security-auditor | Yes |
| **Performance** | performance-optimizer | analytics-setup | No |

## Agent Capabilities Summary

### Tools by Category

| Category | Standard Tools | Extra Tools |
|----------|---------------|-------------|
| Research | Read, Grep, Glob | WebFetch, WebSearch |
| Business | Read, Write, Edit, Glob, Grep | WebFetch, WebSearch |
| Technical | Read, Write, Edit, Glob, Grep | Bash, WebFetch |
| Development | Read, Write, Edit, Glob, Grep | Bash |
| Design | Read, Write, Edit, Glob, Grep | WebFetch |
| Documentation | Read, Write, Edit, Glob, Grep | Task, WebSearch |
| Content | Read, Write, Edit, Glob, Grep | WebSearch |
| Analytics | Read, Write, Edit, Glob, Grep | Bash |
| DevOps | Read, Write, Edit, Glob, Grep | Bash |
| Orchestration | Coordination only | Task |

## Creating New Agents

Agent files require YAML frontmatter in `.claude/agents/`:

```yaml
---
name: agent-name
description: When to use this agent and what it specializes in
tools: Read, Write, Edit, Glob, Grep
model: sonnet  # optional, defaults to current model
---

You are a [role] who helps developers [primary purpose].

## Core Capabilities:
- Capability 1
- Capability 2

## Approach:
1. Step 1
2. Step 2

## Tools Available:
- Tool descriptions

When working: [guidance for consistent output]
```

## Agent Invocation Examples

### Single Agent
```
Use the prd-writer agent to create a PRD for the user authentication system.
```

### Sequential Chain
```
1. Use research-analyst to gather requirements
2. Pass findings to product-manager for prioritization
3. Use prd-writer to create the final document
```

### Parallel Team
```
Launch simultaneously:
- market-researcher: analyze market size
- competitive-analyst: analyze competitors
- trend-analyst: identify trends
Then aggregate with agent-organizer
```
