-- 064: allow ONRC jobs without a CUI (persoană fizică is identified by CNP, not CUI).
-- PF constatator orders skip the company-data step, so customer_data.company.cui is
-- absent; the worker uses customer_data.constatator.requesterCnp instead.

ALTER TABLE onrc_jobs ALTER COLUMN cui DROP NOT NULL;

-- PostgREST schema-cache reload (see .claude/rules/database.md): a real DDL must
-- fire the pgrst_ddl_watch trigger AND we NOTIFY explicitly.
COMMENT ON COLUMN onrc_jobs.cui IS 'Company CUI for firmă/istoric; NULL for persoană fizică (CNP is in detail.requesterCnp).';
NOTIFY pgrst, 'reload schema';
