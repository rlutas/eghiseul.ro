---
paths:
  - "supabase/**"
  - "**/*.sql"
  - "src/lib/supabase/**"
  - "src/lib/oblio/**"
---

# Database Rules

> Regulă path-scoped: se încarcă DOAR când atingi fișiere SQL / Supabase / migrări (economie context în sesiunile fără DB). Conține lecții din incidente reale (lock facturi, `.or()` pe mutații, cache PostgREST).

- NEVER ask user to run SQL/migrations manually - execute via Supabase REST API yourself
- Read service role key from `.env.local` -> `SUPABASE_SERVICE_ROLE_KEY`
- REST API base: `https://llbwmitdrppomeptqlue.supabase.co/rest/v1/`
- Service role key bypasses RLS - full DB access
- Use `Prefer: return=representation` for INSERT/PATCH
- Use `Prefer: resolution=merge-duplicates` for upserts
- Migration files: `supabase/migrations/NNN_name.sql` (always save even if running via REST)
- Use `pg` npm module for DDL that REST API can't handle (CREATE TABLE, ALTER, etc.)
- Pooler host: `aws-1-eu-west-2.pooler.supabase.com:6543` with SSL `{ rejectUnauthorized: false }`
- psql is NOT installed - use Node.js pg module instead

## NEVER use `.or()` filters on UPDATE/DELETE (supabase-js mutations)
- Our PostgREST instance rejects `or=` filters on ANY mutation with
  `42703: column <table>.<col> does not exist` — **the column exists; the
  message is misleading.** The same `or=` filter on a SELECT works fine.
- This broke the invoice atomic lock (ensure-invoice.ts) on EVERY call: the
  42703 matched the schema-cache degradation regex, every caller skipped the
  lock, and the webhook/confirm-payment race double-issued invoices
  (EGI2024-24097 + 24098 for E-260612-QT376, 2026-06-12).
- Instead: run sequential conditional UPDATEs, each using only `.eq/.is/.lt/...`
  filters (each UPDATE is atomic on its own — Postgres re-evaluates the WHERE
  under row locks). See the claim in `lib/oblio/ensure-invoice.ts`.
- `.or()` on SELECT queries remains fine (used across admin list/count routes).
- When adding a lock/claim query, ALWAYS verify the exact query shape against
  production PostgREST with an impossible UUID (errors surface even when 0
  rows match) — a plain `update().eq()` passing does NOT prove the real claim
  works.

## PostgREST schema cache (CRITICAL after schema changes)
- After ANY migration that ADDs/RENAMEs/DROPs a column or table, PostgREST's
  schema cache must reload or supabase-js writes fail with
  `column X does not exist` / `PGRST204` even though the column exists in Postgres.
- Supabase auto-reloads via the `pgrst_ddl_watch` event trigger — **but only when
  a real DDL actually executes.** `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` is a
  **no-op (no DDL fired) when the column already exists**, so the cache is never told.
  This silently broke invoice creation (paid orders with no invoice — E-260610-NMU25).
- ALWAYS end a schema-changing migration with a reload nudge:
  `NOTIFY pgrst, 'reload schema';` AND a real DDL that fires the trigger, e.g.
  `COMMENT ON COLUMN <table>.<col> IS '...';` (a COMMENT is real DDL). See migration 052.
- After running such a migration, VERIFY via a fresh supabase-js client (not the
  long-running dev server, which pins a keep-alive connection to one replica):
  a no-op `update({col:null}).eq('id','<impossible-uuid>')` should NOT error.
- The Supabase PostgREST fleet has multiple replicas; a reload can propagate
  unevenly for a short window. App code that depends on a freshly-added column
  for correctness (locks, flags) MUST degrade gracefully — see
  `lib/oblio/ensure-invoice.ts` (creates the invoice even if the lock column is
  briefly invisible, re-checking first to avoid duplicates).
