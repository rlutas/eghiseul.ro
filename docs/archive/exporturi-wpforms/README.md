# Exporturi WPForms (arhivă)

- `forms/` — definițiile formularelor WP (fără date personale). Rămân în repo ca referință.
- `entries/` — **SCOS din repo (2026-07-13, GDPR)**: conținea 94.386 intrări cu date personale.
  Datele au fost importate în tabela `contacts` din Supabase (migrarea 110, scripts/import-contacts.mjs)
  și sunt vizibile în admin la `/admin/clienti`. Backup local (în afara git):
  `~/Documents/eghiseul-backups/wpforms-entries-2026-07-13/` pe mașina lui Raul.

⚠️ Fișierele rămân în ISTORICUL git (commit-uri vechi). Repo-ul e privat; dacă vrem scrub complet
de istoric (git filter-repo + force push), e o operațiune separată de coordonat.
