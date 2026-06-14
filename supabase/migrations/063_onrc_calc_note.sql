-- 063: ONRC calculation note (NC…) per job — needed by the accounting team to
-- reconcile each ONRC payment. Captured by the worker at finalize() and stored
-- so it shows on the order in admin.
ALTER TABLE onrc_jobs ADD COLUMN IF NOT EXISTS onrc_calc_note text;

-- Force a real DDL so PostgREST's pgrst_ddl_watch reloads the schema cache even
-- when the column already existed (ADD COLUMN IF NOT EXISTS is a no-op then).
COMMENT ON COLUMN onrc_jobs.onrc_calc_note IS 'ONRC calculation note (NC…) for accounting reconciliation';
NOTIFY pgrst, 'reload schema';
