-- 056_onrc_jobs_async.sql
-- The ONRC flow is asynchronous: the worker submits + pays, but the issued
-- document ("certificat constatator") is generated later in the ONRC backoffice
-- ("În procesare în backoffice"). The worker therefore runs in two phases:
--   1. submit + pay  -> save the ONRC request/draft ids, job -> AWAITING_DOCUMENT
--   2. poll the request page until the PDF appears -> download -> DONE
-- This migration adds the ids to persist + the new status.

ALTER TABLE onrc_jobs
  ADD COLUMN IF NOT EXISTS onrc_request_id text,   -- "Id cerere", e.g. 20262192280
  ADD COLUMN IF NOT EXISTS onrc_draft_id text;     -- wizard draft UUID (?id=...)

-- Extend the status CHECK to include AWAITING_DOCUMENT (between PROCESSING and DONE).
ALTER TABLE onrc_jobs DROP CONSTRAINT IF EXISTS onrc_jobs_status_check;
ALTER TABLE onrc_jobs ADD CONSTRAINT onrc_jobs_status_check
  CHECK (status IN ('PENDING','PROCESSING','AWAITING_DOCUMENT','NEEDS_OPERATOR','DONE','FAILED'));

-- Fast pickup of jobs waiting for their document (throttled by last_attempt_at).
CREATE INDEX IF NOT EXISTS onrc_jobs_awaiting_idx
  ON onrc_jobs(last_attempt_at) WHERE status = 'AWAITING_DOCUMENT';

-- A COMMENT is real DDL → fires pgrst_ddl_watch so the schema cache reloads
-- (ADD COLUMN IF NOT EXISTS is a no-op when the column already exists).
COMMENT ON COLUMN onrc_jobs.onrc_request_id IS 'ONRC "Id cerere" — for later verification of the request';
NOTIFY pgrst, 'reload schema';
