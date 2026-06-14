-- 061_onrc_job_events.sql
-- Chronological activity log for the ONRC automation — "ce a făcut botul",
-- shown in the admin (/admin/onrc). Written best-effort by the queue API.
CREATE TABLE IF NOT EXISTS onrc_job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES onrc_jobs(id) ON DELETE CASCADE,
  order_id uuid,
  type text NOT NULL,        -- claimed_submit | submitted | awaiting | retrieved | done | failed | needs_operator | retry | reaper | stuck
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS onrc_job_events_job_idx ON onrc_job_events(job_id, created_at DESC);
COMMENT ON TABLE onrc_job_events IS 'ONRC automation activity log (per job) for the admin';
NOTIFY pgrst, 'reload schema';
