# Claude Code — setup, best practices & gap analysis (eghiseul.ro)

Research 2026-06-22 (4 agenți, surse oficiale `code.claude.com/docs`). Concluzii + ce am aplicat + ce a rămas.

---

## 1. Ierarhia de memorie (cum „ține minte" Claude)

Fiecare sesiune pornește cu context gol. Două mecanisme duc cunoștințele mai departe — ambele se încarcă la start, **ambele sunt CONTEXT, nu enforcement** (pentru garanții → hooks, nu memorie).

### CLAUDE.md (scrise de tine) — scope-uri (specific câștigă)
| Scope | Locație | Pentru |
|---|---|---|
| Managed/org | `/Library/Application Support/ClaudeCode/CLAUDE.md` | standarde org (nu se poate exclude) |
| User | `~/.claude/CLAUDE.md` | preferințe personale, toate proiectele |
| Proiect | `./CLAUDE.md` sau `./.claude/CLAUDE.md` | arhitectură, comenzi, convenții (commit în git) |
| Local | `./CLAUDE.local.md` | sandbox/test data (gitignore) |

Mecanică: Claude **urcă în arbore** și concatenează toate CLAUDE.md găsite (cel mai apropiat = prioritate). CLAUDE.md din **subdirectoare** se încarcă **on-demand** când Claude citește un fișier de acolo (NU la start; NU re-injectat după `/compact`). Comentariile HTML `<!-- -->` sunt **scoase** înainte de injectare (note gratis pentru mentenanță).

### Auto-memory (scrise de Claude) — v2.1.59+
`~/.claude/projects/<proiect>/memory/` cu `MEMORY.md` index + fișiere pe topic. **Doar primele 200 linii / 25KB din MEMORY.md** se încarcă la start; topic files on-demand. Keyed pe repo git (shared între worktrees), local pe mașină. „remember X" → auto-memory; „add to CLAUDE.md" → CLAUDE.md.

### `.claude/rules/*.md` — modul modern de a scala instrucțiuni
- Fără `paths:` → se încarcă FIECARE sesiune (prioritate ca CLAUDE.md).
- Cu `paths:` (glob în frontmatter) → se încarcă **DOAR când atingi fișiere care fac match** → economie context.
- `@import` în CLAUDE.md **NU economisește tokeni** (încarcă tot la start) — doar organizare. Pentru lazy-load real: path-scoped rules sau skills.

---

## 2. Ce face un CLAUDE.md BUN
- **Constrângerea:** se încarcă în context fiecare sesiune → bloat = Claude ignoră instrucțiunile reale. Anthropic: *„Bloated CLAUDE.md files cause Claude to ignore your actual instructions!"*
- **Mărime țintă:** <200 linii oficial; sweet spot comunitate **~80-150 linii** (~1.000-2.000 tokeni).
- **Test pe fiecare linie:** *„Ar face Claude o greșeală dacă scot linia asta?"* Dacă nu → taie.
- **Include:** comenzi neghicibile, reguli de stil care DIFERĂ de default, testare, etichetă repo, decizii de arhitectură, gotchas, env quirks. **Exclude:** orice e în cod, convenții standard, API docs (link), info care se schimbă des, tutoriale.
- **Negative rules** contează (never commit .env, no class components).
- **Emphasis trick:** `IMPORTANT`/`YOU MUST` pe reguli care „pică".

## 3. Matricea de decizie (unde pun fiecare lucru)
| Mecanism | Se încarcă | Pentru |
|---|---|---|
| **CLAUDE.md** | mereu, integral | context proiect scurt, „fă mereu X" |
| **rule unscoped** | mereu | standarde prea lungi pt main |
| **rule `paths:`** | doar la fișiere match | standarde pe tip de fișier (SQL, API) → economie |
| **skill** (`.claude/skills/`) | on-demand (model sau `/name`) | workflow/know-how necesar UNEORI |
| **subagent** (`.claude/agents/`) | context IZOLAT | muncă grea/paralelă care ar polua contextul |
| **hook** | determinist, pe eveniment | ce TREBUIE să se întâmple mereu (lint, guard) |
| `@import` | start, integral | doar organizare (fără economie) |

> Comenzile (`.claude/commands/`) au fost **unite în skills** — `.claude/skills/<name>/SKILL.md` e modul nou; comenzile single-file merg încă (legacy). `disable-model-invocation: true` pe orice cu efecte (deploy/commit/migrate) ca Claude să nu le declanșeze singur.

## 4. Plugins / MCP — curatează
Fiecare skill/plugin instalat are `name`+`description` în baseline FIECARE tură; fiecare MCP activ injectează tot schema de tool-uri. Testerii instalează ~11 plugins, **păstrează ~4**. Reguli: 1 tool per job, preferă skills (lazy) peste MCP always-on, activează MCP doar pentru serviciile pe care le atingi în sesiune.

---

## 5. Auditul setup-ului NOSTRU (eghiseul.ro)

**BUN:**
- CLAUDE.md lean-pointer (~208 linii, „nu duplica docs"). ✓
- `.claude/rules/` — 3 reguli incident-driven (database.md excelentă). ✓
- **Memoria = cea mai puternică parte** (11 fișiere, activ folosită, project-specific). ✓
- Plugins framework: vercel/supabase/stripe/context7 = exact stack-ul. ✓

**GAP-uri găsite:**
| Zonă | Gap |
|---|---|
| 🔴 Securitate | `settings.local.json` (chei live) era **trackuit în git** deși în .gitignore → **REPARAT** (untrack, chei păstrate local) |
| Hooks | zero — nicio automatizare determinstă (lint/typecheck/guard) |
| Slash commands/skills proiect | erau **zero** → **adăugate** (deploy-worker, run-migration) |
| Subagenți | 61 generici (boilerplate, nu domeniu) → **adăugat** migration-reviewer specific |
| Reguli | fără regulă testing/git/secrets |
| `settings.json` shared + `.mcp.json` | lipsesc → setup nereproductibil pt echipă |
| Plugins | `everything-claude-code` uriaș (~95% irelevant, **context7 DUBLAT**) = sink de baseline |
| Docs | DEVELOPMENT_MASTER_PLAN (153KB) + STATUS_CURRENT (127KB) f. mari (ok ca pointer) |

---

## 6. Ce am APLICAT (2026-06-22)
- 🔴 **Securitate:** `git rm --cached .claude/settings.local.json` (chei live ieșite din tracking; fișierul local + cheile rămân). În .gitignore deja.
- **Path-scoped** `.claude/rules/database.md` (`paths: supabase/**, **/*.sql, ...`) → regula grea PostgREST se încarcă doar la lucru DB.
- **Slash commands noi:** `/deploy-worker` (ONRC=git push vs ANCPI=railway up), `/run-migration` (REST + reload schema-cache + fără `.or()`).
- **Subagent** `migration-reviewer` (read-only, encodează capcanele database.md).
- Acest doc.

## 7. Recomandări RĂMASE (prioritizate)
1. **`.claude/settings.json` shared** — permisiuni (deny `Read(.env*)`, `Read(./secrets/**)`, `Bash(rm -rf *)`; allow `Bash(npm run lint/test/build)`) + (opțional) 1-2 hooks.
2. **Hooks** (în settings.json) — `PostToolUse` Edit|Write → typecheck/lint pe `*.ts`; `PreToolUse` Bash → blochează `rm -rf`/`sudo`. (Determinist, nu advisory.)
3. **`.mcp.json`** la root — MCP-uri proiect (supabase/stripe/vercel/github/playwright) → reproductibil.
4. **Trim plugins:** dezactivează `everything-claude-code` (sau cherry-pick ~5 skills) + elimină context7 dublat. (Caveman RĂMÂNE — decizia ownerului.)
5. **`/new-service` skill** — scaffold serviciu nou (din modular-wizard-guide).
6. **`.worktreeinclude`** pt `settings.local.json` (worktree-urile noi să primească config-ul local).
7. **Regulă testing/git** scurtă în `.claude/rules/`.

## Surse
code.claude.com/docs: memory · best-practices · skills · sub-agents · hooks · settings · claude-directory. + anthropic.com (Agent Skills, context engineering), awesome-claude-code, awesome-claude-md.

**Ultima actualizare:** 2026-06-22.
