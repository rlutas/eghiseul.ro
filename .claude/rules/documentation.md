# Documentation Rules

After completing ANY feature or modification:
1. API new/changed -> update `docs/technical/api/`
2. DB schema changed -> update `docs/technical/database/`
3. Task completed -> update `docs/DEVELOPMENT_MASTER_PLAN.md`
4. New feature -> create/update spec in `docs/technical/specs/`
5. Admin feature -> update `docs/admin/`
6. Security fix -> update `docs/security/SECURITY_AUDIT_SUMMARY.md`
7. New doc created -> update `docs/README.md` (main index)
8. New pattern/convention -> update `CLAUDE.md`
9. Anything shipped -> row in `docs/changelog/README.md` + detail file
   `docs/changelog/YYYY-MM-DD-<slug>.md` (see below)

Do NOT duplicate detailed information in CLAUDE.md - point to docs/ instead.
The `docs/README.md` file is the complete documentation index.

## Changelog = Knowledge Center for the team

`/admin/ghid` (Knowledge Center, 2026-09-14) renders `docs/changelog/` and
`docs/admin/` directly. The team reads what shipped THERE, not on WhatsApp.
So every changelog detail file MUST start with:

```markdown
# DD.MM.YYYY — Titlu
<!-- categorie: plati -->

## Pentru echipă

<3–10 lines in operator language, Romanian: what changes for me, which button
I press, what I stop doing. Link the procedure in docs/admin/ if one exists.>

---

<technical content as before>
```

Rules:
- NOT optional: a feature/fix without a changelog row + detail file is
  invisible to the team. Write it in the same commit as the code.
- `<!-- categorie: X -->` right under the H1 pins the business category shown
  as a filter chip in admin. X ∈ comenzi · plati · livrare · documente ·
  automatizari · clienti · seo · admin · infrastructura. Without it the entry
  is auto-classified by keywords (`src/lib/knowledge/categories.ts`) — pin it
  whenever the topic is mixed.
- `## Pentru echipă` is the FIRST section after the H1 (after the category comment). The card in admin shows
  it; the technical row from the table is folded under „Rezumat tehnic".
- No file paths, migration numbers or function names inside `## Pentru echipă`.
- Table row in `docs/changelog/README.md`: `| YYYY-MM-DD | <emoji> **Titlu** — rezumat tehnic | [file](file) |`.
  Emoji drives the badge: 🟣 feature · 🔴 fix · ✅ change · 🔄 refactor · 🔵 analysis.
- Team procedures live in `docs/admin/*.md`; curated list for the sidebar is
  `CURATED_GUIDES` in `src/lib/knowledge/docs.ts` — add there when a new
  procedure doc is written.
- Relative links between docs are rewritten to `/admin/ghid/<path>/`; links to
  non-markdown files (png, csv, pdf) render as plain text in admin.
- Full-text search covers EVERY `.md` under `docs/` (except `EXPORT/`,
  `SCREAMINGFROG/`), so a doc's H1 is its search title — always give docs a
  real `# Title`, in Romanian for team-facing docs.
