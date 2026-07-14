-- 115: Company label on accounting history (Decontari) — portability for a
-- future company switch (new Stripe account + new bank + new Oblio). Old
-- rows stay tagged with the old firm; new syncs/imports stamp the current
-- one (env ACCOUNTING_COMPANY, fallback EDIGITALIZARE).

ALTER TABLE stripe_payouts
  ADD COLUMN IF NOT EXISTS company text NOT NULL DEFAULT 'EDIGITALIZARE';
ALTER TABLE bank_statement_entries
  ADD COLUMN IF NOT EXISTS company text NOT NULL DEFAULT 'EDIGITALIZARE';

COMMENT ON COLUMN stripe_payouts.company IS 'Firma pe care ruleaza contul Stripe la momentul sync-ului';
COMMENT ON COLUMN bank_statement_entries.company IS 'Firma titulara a contului bancar la momentul importului';
NOTIFY pgrst, 'reload schema';
