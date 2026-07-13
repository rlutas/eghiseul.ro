# 2026-07-13 — Registrul de clienți & lead-uri (72k contacte)

## Ce s-a livrat

**Tabela `contacts`** (migrarea 110) — sursa de adevăr pentru lista de clienți. PII stă DOAR în DB
(RLS activ, zero politici publice — acces exclusiv prin service role), NU în docs/git.

**Import istoric** (`scripts/import-contacts.mjs`, rulat 13.07):
- cele 8 exporturi WPForms (94.386 intrări) + comenzile plătite de pe platforma nouă
- dedup pe email → **71.961 contacte unice**, din care **32 clienți confirmați** (plată)
- surse cumulate per contact (`wpforms:cazier-judiciar`, `platforma:extras-carte-funciara`...) + serviciile cerute

**Sync automat**: la fiecare comandă plătită nouă → upsert în contacts (webhook Stripe +
confirm-payment, exact o dată per comandă — legat de lock-ul de factură). `src/lib/contacts/upsert.ts`.

**Admin `/admin/clienti`** (permisiune `users.manage`): căutare email/nume/telefon, filtre pe
serviciu + client/lead, paginare, **export CSV pe filtrul curent**.

## Cadrul GDPR (decis)
- `is_customer=true` (a plătit) → **soft opt-in** (Legea 506/2004): comunicări despre servicii
  similare, obligatoriu cu dezabonare în fiecare email
- `is_customer=false` (lead — formular fără plată confirmată) → NU primește marketing fără re-permission
- `marketing_status`: soft_opt_in / subscribed / unsubscribed / suppressed (pregătit pentru Resend Audiences)

## De făcut (backlog)
- Flag `client` mai precis pe istoricul WP: cere export Stripe complet istoric → marcăm cine a plătit efectiv
- Sincronizare segment „clienți" în Resend Audiences + primul broadcast (cu unsubscribe Resend)
- ⚠️ De discutat: CSV-urile WPForms cu PII sunt în repo (docs/archive/exporturi-wpforms) — acum că
  datele-s în DB, recomandat să le scoatem din git

## Update (aceeași zi)
- **CSV-urile WPForms cu PII scoase din repo** (commit 20e56ab): backup local în afara git
  (`~/Documents/eghiseul-backups/`), `entries/` în .gitignore, README explicativ în arhivă.
  Fișierele rămân în istoricul git (repo privat) — scrub complet de istoric = operațiune separată dacă se decide.
- Fix CI: regula de lint `setState sincron în effect` pe pagina /admin/clienti — refăcut fetch-ul
  cu AbortController, loading setat din handler-e.
