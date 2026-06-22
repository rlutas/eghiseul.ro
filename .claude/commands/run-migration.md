---
description: Rulează o migrare DB pe Supabase corect (REST/pg, fără să ceri userului SQL manual), cu nudge de reload schema-cache PostgREST. Folosește când userul cere o schimbare de schemă/migrare.
argument-hint: [descriere scurtă a migrării]
disable-model-invocation: true
allowed-tools: Bash, Read, Write, Edit
---

Implementează migrarea: **$ARGUMENTS**

Respectă `.claude/rules/database.md`. Pași:

1. **Scrie fișierul** `supabase/migrations/NNN_nume.sql` (NNN = următorul număr liber). Salvează-l ÎNTOTDEAUNA, chiar dacă rulezi prin REST.
2. **Rulează** prin Node `pg` (DDL) sau REST API — NU cere userului să ruleze SQL manual. Credențiale din `.env.local` (`SUPABASE_DB_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`). Pooler: `aws-1-eu-west-2.pooler.supabase.com:6543`, user `postgres.llbwmitdrppomeptqlue`, SSL `{rejectUnauthorized:false}`. (`psql` NU e instalat.)
3. **OBLIGATORIU la final de migrare** care adaugă/redenumește/șterge coloană/tabel — pune nudge de reload (altfel supabase-js dă `column X does not exist` / PGRST204):
   ```sql
   COMMENT ON COLUMN <table>.<col> IS '...';  -- DDL real care declanșează pgrst_ddl_watch
   NOTIFY pgrst, 'reload schema';
   ```
   `ADD COLUMN IF NOT EXISTS` e no-op dacă coloana există → NU declanșează reload.
4. **Verifică** printr-un client supabase-js PROASPĂT (nu dev server-ul lung): un `update({col:null}).eq('id','<uuid-imposibil>')` NU trebuie să dea eroare.
5. **NU folosi `.or()` pe UPDATE/DELETE** — PostgREST-ul nostru îl respinge cu 42703 înșelător (a dublat facturi). Folosește UPDATE-uri condiționale secvențiale.

La final actualizează `docs/technical/database/` dacă schema s-a schimbat.
