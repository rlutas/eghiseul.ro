-- 114: Bank statement (extras de cont BT) import for the Decontari section.
-- Entries are parsed from the BT CSV export, auto-categorized, and credits
-- from Stripe are matched to stripe_payouts (bank_matched_at set).

CREATE TABLE IF NOT EXISTS bank_statement_entries (
  reference text PRIMARY KEY,              -- BT "Referinta" (unique per tx)
  account text NOT NULL,
  tx_date date NOT NULL,
  value_date date,
  tx_type text,                            -- BT "Tip tranzactie"
  description text,
  debit_bani bigint NOT NULL DEFAULT 0,
  credit_bani bigint NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'altele', -- stripe_payout | traduceri | taxe_onrc | furnizor_extern | curierat | salarii | comisioane_banca | aport | taxe_anaf | altele
  counterparty text,
  needs_invoice boolean NOT NULL DEFAULT false,  -- furnizori externi: factura de listat pt contabil
  matched_payout_id text REFERENCES stripe_payouts(id),
  imported_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_tx_date ON bank_statement_entries(tx_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_category ON bank_statement_entries(category);
ALTER TABLE bank_statement_entries ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE bank_statement_entries IS 'Extras de cont BT importat in /admin/decontari (Faza 2)';
NOTIFY pgrst, 'reload schema';
