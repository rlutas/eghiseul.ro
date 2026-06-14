-- 055_onrc_jobs_queue.sql
-- ONRC automation queue (Phase 1 of docs/technical/specs/onrc-automation-plan.md).
-- A separate Playwright worker polls PENDING jobs, applies on the ONRC RECOM
-- portal, and writes the result back. One job per order (unique).

CREATE TABLE IF NOT EXISTS onrc_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','NEEDS_OPERATOR','DONE','FAILED')),
  document_type text NOT NULL,          -- CERTIFICAT_CONSTATATOR | FURNIZARE_INFORMATII
  cui text NOT NULL,
  company_name text,
  -- application detail (for the worker)
  detail jsonb,                         -- documentType variant, reportType, purpose, period, requester
  -- result
  document_url text,
  registration_number text,
  downloaded_at timestamptz,
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- One job per order (idempotent creation at payment time).
CREATE UNIQUE INDEX IF NOT EXISTS onrc_jobs_order_uniq ON onrc_jobs(order_id);
-- Fast claim of the next PENDING job.
CREATE INDEX IF NOT EXISTS onrc_jobs_pending_idx ON onrc_jobs(created_at) WHERE status = 'PENDING';

COMMENT ON TABLE onrc_jobs IS 'ONRC automation queue — constatator / furnizare informatii (worker bot)';

-- Real DDL above already fires pgrst_ddl_watch; nudge the cache explicitly too.
NOTIFY pgrst, 'reload schema';
