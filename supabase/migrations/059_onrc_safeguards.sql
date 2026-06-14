-- 059_onrc_safeguards.sql
-- Safeguards for the ONRC queue: auto-retry, stale-PROCESSING reaper, and
-- "stuck AWAITING_DOCUMENT too long" → NEEDS_OPERATOR.
-- `awaiting_since` marks when a job first entered AWAITING_DOCUMENT so we can
-- escalate if ONRC never issues the document.
ALTER TABLE onrc_jobs
  ADD COLUMN IF NOT EXISTS awaiting_since timestamptz;

COMMENT ON COLUMN onrc_jobs.awaiting_since IS 'When the job first entered AWAITING_DOCUMENT (for stuck escalation)';
NOTIFY pgrst, 'reload schema';
