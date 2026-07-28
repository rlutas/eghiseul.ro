-- Migration 138: rezultatul verificării e-Factura (SPV) pe comandă
--
-- Oblio emite factura chiar dacă datele clientului nu trec validările ANAF;
-- blocajul apare doar când echipa apasă „Trimite în SPV", deci se descoperea cu
-- zile întârziere (raport 27.07.2026: facturi din 8/10/12/14/25 iulie blocate,
-- EGH-0013/0028/0048/0172 + EGI2024-24312 pe CJO).
--
-- Verificăm exportul imediat după emitere (lib/oblio/einvoice-check.ts) și
-- salvăm aici, ca blocajul să fie vizibil în admin fără să caute cineva.
--
--   invoice_spv_status: null = neverificat, 'ok' = exportabil, 'blocked' = refuzat
--   invoice_spv_error : mesajul Oblio, exact cum îl vede echipa
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_spv_status text,
  ADD COLUMN IF NOT EXISTS invoice_spv_error text,
  ADD COLUMN IF NOT EXISTS invoice_spv_checked_at timestamptz;

-- COMMENT = DDL real → declanșează pgrst_ddl_watch și reîncarcă schema cache-ul
-- PostgREST chiar dacă ADD COLUMN IF NOT EXISTS a fost no-op (vezi
-- .claude/rules/database.md — a rupt emiterea facturilor la migrarea 052).
COMMENT ON COLUMN orders.invoice_spv_status IS
  'null=neverificat, ok=exportabil în SPV, blocked=refuzat de validările ANAF (vezi invoice_spv_error)';
COMMENT ON COLUMN orders.invoice_spv_error IS
  'Mesajul Oblio la exportul e-Factura când validarea eșuează (județ/localitate/țară client)';
COMMENT ON COLUMN orders.invoice_spv_checked_at IS
  'Ultima verificare a exportului e-Factura (lib/oblio/einvoice-check.ts)';

CREATE INDEX IF NOT EXISTS idx_orders_invoice_spv_blocked
  ON orders (invoice_spv_checked_at)
  WHERE invoice_spv_status = 'blocked';

NOTIFY pgrst, 'reload schema';
