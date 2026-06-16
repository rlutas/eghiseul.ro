-- 065_ancpi_jobs_queue.sql
-- ANCPI automation queue (Phase 1 of docs/technical/specs/ancpi-automation-plan.md).
-- A separate worker polls PENDING jobs, places the order on the ePay ANCPI portal
-- (epay.ancpi.ro), pays from prepaid credit points, downloads the PDF and writes
-- the result back. One job per order (unique). Mirrors onrc_jobs.
--
-- Anti-double-pay: the worker saves ancpi_order_id (the ePay order id) BEFORE the
-- final confirmation is trusted; the SUBMIT claim requires ancpi_order_id IS NULL,
-- so a job that already placed an order takes the RETRIEVE path, never re-pays.

CREATE TABLE IF NOT EXISTS ancpi_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','CHECKPOINT','AWAITING_DOCUMENT','NEEDS_OPERATOR','DONE','FAILED')),
  service_type text NOT NULL,          -- EXTRAS_CF | EXTRAS_PLAN_CADASTRAL | IDENTIFICARE_PROPRIETAR | IDENTIFICARE_ADRESA
  prod_id text,                        -- ePay product id (e.g. 14200 preplatit, 1420, 419)
  -- application detail (for the worker): imobile[] with judet/uat/identificator etc.
  detail jsonb,
  -- checkpoint (anti-double-pay)
  ancpi_cart_reg_id text,              -- cartRegId of the basket line
  ancpi_order_id text,                 -- ePay order id (e.g. 10054451) — set once placed
  registration_number text,            -- "Numar Inregistrare" (e.g. 69000)
  -- result
  document_url text,                   -- S3 key of the extras PDF
  chitanta_url text,                   -- S3 key of the ANCPI receipt PDF (accounting)
  downloaded_at timestamptz,
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  locked_at timestamptz,
  awaiting_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One job per order (idempotent creation at payment time).
CREATE UNIQUE INDEX IF NOT EXISTS ancpi_jobs_order_uniq ON ancpi_jobs(order_id);
-- Fast claim of the next PENDING job.
CREATE INDEX IF NOT EXISTS ancpi_jobs_pending_idx ON ancpi_jobs(created_at) WHERE status = 'PENDING';

COMMENT ON TABLE ancpi_jobs IS 'ANCPI automation queue — extras carte funciara (ePay worker)';

-- Chronological activity log for the admin (/admin/ancpi) — "ce a făcut workerul".
CREATE TABLE IF NOT EXISTS ancpi_job_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES ancpi_jobs(id) ON DELETE CASCADE,
  order_id uuid,
  type text NOT NULL,        -- claimed_submit | claimed_retrieve | placed | awaiting | done | failed | needs_operator | retry | reaper | stuck
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ancpi_job_events_job_idx ON ancpi_job_events(job_id, created_at DESC);
COMMENT ON TABLE ancpi_job_events IS 'ANCPI automation activity log (per job) for the admin';

-- Real DDL above already fires pgrst_ddl_watch; nudge the cache explicitly too.
NOTIFY pgrst, 'reload schema';
