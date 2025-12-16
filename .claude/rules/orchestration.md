# Multi-Agent Orchestration Rules

## Development Phases

### Phase 0: Planning & Research (CURRENT)
```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: PLANNING & RESEARCH                                    │
├─────────────────────────────────────────────────────────────────┤
│ Active Agents:                                                  │
│  • research-analyst (information gathering)                     │
│  • market-researcher (market analysis)                          │
│  • competitive-analyst (competitor research)                    │
│  • legal-advisor (GDPR, compliance)                            │
│  • system-designer (architecture planning)                      │
│  • prd-writer (PRD creation)                                   │
│                                                                 │
│ Deliverables:                                                   │
│  ✓ docs/prd/eghiseul-prd.md                                    │
│  ✓ docs/technical/technology-decisions-summary.md              │
│  ✓ docs/legal/compliance-research.md                           │
│  ✓ docs/security/security-architecture.md                      │
│  ✓ docs/services/*.md (12 services documented)                 │
│  ✓ DEVELOPMENT_MASTER_PLAN.md                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1: Foundation Setup
```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION SETUP                                       │
├─────────────────────────────────────────────────────────────────┤
│ Active Agents:                                                  │
│  • system-designer (database schema)                           │
│  • database-planner (Supabase tables, RLS)                     │
│  • api-designer (API structure)                                │
│  • security-auditor (auth architecture)                        │
│                                                                 │
│ Deliverables:                                                   │
│  ○ Database schema + migrations                                │
│  ○ API endpoint specifications                                 │
│  ○ Auth system implementation                                  │
│  ○ Project structure (Next.js)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Core Development
```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: CORE DEVELOPMENT                                       │
├─────────────────────────────────────────────────────────────────┤
│ Active Agents:                                                  │
│  • ui-designer (component design)                              │
│  • code-reviewer (code quality)                                │
│  • test-strategist (testing)                                   │
│  • ux-reviewer (UX validation)                                 │
│                                                                 │
│ Deliverables:                                                   │
│  ○ Auth UI (login, register, 2FA)                             │
│  ○ Multi-tenancy (partner isolation)                          │
│  ○ File upload + OCR                                          │
│  ○ First 3 services (Cazier Fiscal, Extras CF, Cert. Const.)  │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 3: Integration & Polish
```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: INTEGRATION & POLISH                                   │
├─────────────────────────────────────────────────────────────────┤
│ Active Agents:                                                  │
│  • stripe-expert (payment integration)                         │
│  • payment-integration (flows)                                 │
│  • performance-optimizer (optimization)                        │
│  • seo-optimizer (SEO setup)                                   │
│                                                                 │
│ Deliverables:                                                   │
│  ○ Stripe payments                                             │
│  ○ SmartBill invoicing                                         │
│  ○ KYC flow with AWS Textract                                  │
│  ○ SMS + Email notifications                                   │
│  ○ Remaining 9 services                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 4: Launch Prep
```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 4: LAUNCH PREP                                            │
├─────────────────────────────────────────────────────────────────┤
│ Active Agents:                                                  │
│  • security-auditor (final security audit)                     │
│  • technical-writer (documentation)                            │
│  • deployment-troubleshooter (production deploy)               │
│  • terms-writer (legal pages)                                  │
│                                                                 │
│ Deliverables:                                                   │
│  ○ Security audit report                                       │
│  ○ User documentation                                          │
│  ○ Terms of service, Privacy policy                           │
│  ○ Production deployment                                       │
│  ○ Monitoring setup                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Coordination Pattern

For complex tasks requiring multiple agents:

```
1. agent-organizer receives task
         │
         ▼
2. Decomposes into subtasks
         │
         ▼
3. Checks context-manager for existing state
         │
         ▼
4. Assigns subtasks to appropriate agents
    │         │         │
    ▼         ▼         ▼
 Agent A   Agent B   Agent C  (parallel if independent)
    │         │         │
    └────┬────┴────┬────┘
         │         │
         ▼         ▼
5. context-manager collects outputs
         │
         ▼
6. agent-organizer aggregates results
         │
         ▼
7. Final deliverable
```

## Communication Protocol

Agents communicate via JSON:

```json
{
  "requesting_agent": "agent-name",
  "request_type": "get_context | update_context | coordinate",
  "payload": {
    "query": "description of what's needed",
    "phase": "current development phase",
    "dependencies": ["list of required inputs"]
  }
}
```

## Workflow Phases per Agent

Each agent follows three phases:

1. **Discovery**: Query context-manager, understand requirements
2. **Implementation**: Execute core responsibilities
3. **Excellence**: Validate output, report completion

## Parallel vs Sequential Execution

### Run in PARALLEL when:
- Agents work on independent subtasks
- No data dependencies between agents
- Different system components

**Examples:**
```
PARALLEL OK:
├── market-researcher (market analysis)
├── competitive-analyst (competitor research)
└── trend-analyst (trends)

PARALLEL OK:
├── ui-designer (frontend components)
├── api-designer (API endpoints)
└── database-planner (database schema)
```

### Run SEQUENTIALLY when:
- Output depends on prior results
- Architecture decisions inform implementation
- Research informs strategy

**Examples:**
```
SEQUENTIAL REQUIRED:
research-analyst → product-manager → prd-writer

SEQUENTIAL REQUIRED:
system-designer → api-designer → api-documenter

SEQUENTIAL REQUIRED:
ui-designer → ux-reviewer → code-reviewer
```

## Progress Tracking

Agents report progress as:

```json
{
  "agent": "agent-name",
  "phase": "0-4",
  "status": "analyzing | implementing | complete",
  "output_location": "docs/path/to/file.md",
  "dependencies_met": true,
  "blockers": []
}
```

## Agent Handoff Protocol

When passing work between agents:

```json
{
  "from_agent": "research-analyst",
  "to_agent": "product-manager",
  "handoff_type": "research_complete",
  "deliverable": "docs/analysis/market-research.md",
  "summary": "Brief description of findings",
  "action_required": "Prioritize features based on research"
}
```

## Error Handling

If an agent encounters issues:

1. Log error with context
2. Notify agent-organizer
3. Check if task can be reassigned
4. If blocked, escalate to human

```json
{
  "agent": "api-designer",
  "error_type": "dependency_missing",
  "message": "Database schema not yet defined",
  "blocked_by": "database-planner",
  "suggested_action": "Run database-planner first"
}
```
