-- 070_platform_outages.sql
--
-- Downtime log for the provider portals (ONRC / ANCPI). Each row is one outage
-- window: `started_at` when the worker first observed the portal down,
-- `ended_at` when it recovered (NULL = still ongoing). The workers probe their
-- portal on every poll tick and report status to /api/{onrc,ancpi}/pending
-- (?portal=up|down|maintenance); the endpoint opens/closes a row only on a
-- state TRANSITION (see src/lib/status/record-outage.ts).

CREATE TABLE IF NOT EXISTS public.platform_outages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        text NOT NULL CHECK (provider IN ('onrc', 'ancpi')),
  cause           text NOT NULL CHECK (cause IN ('maintenance', 'unreachable')),
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  detail          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- At most one OPEN outage per provider — enforces the "open/close" invariant at
-- the DB level so a missed transition can never leave two overlapping windows.
CREATE UNIQUE INDEX IF NOT EXISTS platform_outages_one_open_per_provider
  ON public.platform_outages (provider)
  WHERE ended_at IS NULL;

-- History queries: latest outages per provider.
CREATE INDEX IF NOT EXISTS platform_outages_provider_started
  ON public.platform_outages (provider, started_at DESC);

-- Service-role only (workers report via the authenticated /api/* endpoints which
-- use the service-role client); no public RLS policies needed.
ALTER TABLE public.platform_outages ENABLE ROW LEVEL SECURITY;

-- Real DDL so PostgREST's pgrst_ddl_watch trigger fires + an explicit reload
-- (see .claude/rules/database.md — CREATE TABLE IF NOT EXISTS is a no-op when the
-- table already exists, so the COMMENT guarantees a schema-cache refresh).
COMMENT ON TABLE public.platform_outages IS 'Provider portal downtime windows (ONRC/ANCPI), written by the workers on status transitions.';
NOTIFY pgrst, 'reload schema';
