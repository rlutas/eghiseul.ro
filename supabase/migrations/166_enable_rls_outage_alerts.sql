-- 166: Enable RLS on public.outage_alerts (Supabase advisor, ERROR level).
--
-- The table was created without RLS while `anon` and `authenticated` held the
-- full default grant set (SELECT, INSERT, UPDATE, DELETE). It is exposed through
-- PostgREST, so anyone with the anon key — which ships in the public JS bundle —
-- could read, edit or delete every row.
--
-- Content at the time of the fix: 119 sign-ups for the "tell me when ANCPI/ONRC
-- is back" alert, each with an email address, marketing consent, IP, user agent
-- and referrer, i.e. the GDPR consent record itself.
--
-- No policies are created, which denies anon and authenticated outright. That is
-- correct here: every read and write already goes through API routes using the
-- service-role client, which bypasses RLS —
--   src/app/api/outage-alerts/route.ts:48        (public sign-up, createAdminClient)
--   src/app/api/cron/outage-alerts/route.ts:105  (notification cron)
-- Verified with: grep -rn "outage_alerts" src/ — no other caller.

ALTER TABLE public.outage_alerts ENABLE ROW LEVEL SECURITY;

REVOKE SELECT, INSERT, UPDATE, DELETE ON public.outage_alerts FROM anon, authenticated;

COMMENT ON TABLE public.outage_alerts IS
  'Inscrieri la notificarea de revenire a unui serviciu extern picat (ANCPI/ONRC). RLS enabled with no policies on purpose: every read and write goes through API routes using the service-role client (api/outage-alerts, api/cron/outage-alerts). See migration 166.';

NOTIFY pgrst, 'reload schema';
