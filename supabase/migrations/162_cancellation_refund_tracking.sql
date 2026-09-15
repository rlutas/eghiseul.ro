-- =============================================================================
-- 162 — Anulare în 30 de minute: urmărirea refundului Stripe + fiscalul (storno
--       + factura taxei de anulare de 30%)
-- =============================================================================
-- Context (E-260915-M4A4V, 15.09.2026): „Procesează refund 70%" trimitea
-- refundul la Stripe și muta comanda pe `refunded`, dar:
--   * id-ul refundului se pierdea (insertul în order_history folosea coloane
--     inexistente și pica tăcut), deci echipa nu avea cum să vadă dacă banii
--     au plecat automat sau trebuie dați manual;
--   * factura rămânea pe 100% (sau nu exista deloc) — cei 30% reținuți nu
--     aveau document fiscal, iar decontările nu legau rambursarea de nimic.
--
-- Coloanele de mai jos țin rezultatul refundului și cele două documente
-- fiscale ale anulării, ca adminul și decontările să le arate.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS refund_stripe_id TEXT,
  ADD COLUMN IF NOT EXISTS refund_status TEXT,
  ADD COLUMN IF NOT EXISTS refund_error TEXT,
  ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS storno_invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS cancel_fee_invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS cancel_fee_invoice_url TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_refund_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_refund_status_check
  CHECK (refund_status IS NULL OR refund_status IN ('succeeded', 'failed', 'manual'));

COMMENT ON COLUMN orders.refund_stripe_id IS
  'Id-ul refundului Stripe (re_...) al anulării; NULL = necunoscut (refund manual fără id sau înainte de migrarea 162).';
COMMENT ON COLUMN orders.refund_status IS
  'succeeded = refund automat prin Stripe; failed = Stripe a refuzat (comanda rămâne cancellation_requested, echipa refundă manual); manual = echipa a confirmat că a refundat din dashboardul Stripe.';
COMMENT ON COLUMN orders.refund_error IS
  'Mesajul Stripe la ultimul refund automat eșuat; se golește la succes.';
COMMENT ON COLUMN orders.storno_invoice_number IS
  'Factura de stornare (Oblio, ex. EGH-0474) emisă pentru factura inițială la anulare.';
COMMENT ON COLUMN orders.cancel_fee_invoice_number IS
  'Factura taxei de anulare (30% reținut) emisă după refundul de 70%.';
