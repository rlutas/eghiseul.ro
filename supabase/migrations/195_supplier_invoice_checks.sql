-- 195: Checklist lunar pentru facturile de furnizor care nu vin prin SPV
-- (Meta, Google, TikTok, OpenAI, Anthropic, Vercel...). Un rând pe
-- (lună, furnizor): descărcată → listată → predată contabilului, fiecare cu
-- cine și când. Furnizorul se calculează în aplicație din descrierea liniei de
-- extras (src/lib/accounting/supplier-invoices.ts), deci tabela ține DOAR
-- bifele, nu și plățile.

CREATE TABLE IF NOT EXISTS supplier_invoice_checks (
  month date NOT NULL,                     -- prima zi a lunii extrasului
  supplier_key text NOT NULL,              -- 'meta' | 'google_ads' | ... | 'pos:<NUME>'
  downloaded_at timestamptz,
  downloaded_by uuid REFERENCES profiles(id),
  printed_at timestamptz,
  printed_by uuid REFERENCES profiles(id),
  handed_at timestamptz,
  handed_by uuid REFERENCES profiles(id),
  note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (month, supplier_key),
  CHECK (month = date_trunc('month', month)::date)
);

-- Doar service role (API-ul de admin verifică permisiunea payments.verify).
ALTER TABLE supplier_invoice_checks ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE supplier_invoice_checks IS
  'Checklist lunar facturi furnizori fara SPV (descarcata/listata/predata contabil) — /admin/decontari/banca';
NOTIFY pgrst, 'reload schema';
