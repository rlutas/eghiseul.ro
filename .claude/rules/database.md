# Database Rules

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
