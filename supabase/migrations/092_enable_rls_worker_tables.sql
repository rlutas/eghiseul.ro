-- 092: Enable RLS on internal worker/system tables
--
-- Supabase linter flagged these 5 public-schema tables as
-- `rls_disabled_in_public` (2026-07-06): anyone with the anon key could
-- read/insert/update/delete every row. They are accessed EXCLUSIVELY via
-- service_role (Railway workers, admin API routes, /api/status, and the admin
-- pages' data queries all use createAdminClient()). service_role bypasses RLS,
-- so enabling RLS with NO policies fully denies anon + authenticated while
-- leaving every legitimate code path working.
--
-- Verified before applying: no app code reads these tables via the anon or
-- authenticated (logged-in user) client — the admin pages use createClient()
-- only for auth, then createAdminClient() for the actual .from() queries.

ALTER TABLE public.onrc_jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onrc_job_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ancpi_jobs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ancpi_job_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_heartbeats ENABLE ROW LEVEL SECURITY;
