-- 049_invoice_generating_lock.sql
-- Prevent DUPLICATE Oblio invoices from concurrent payment webhooks.
--
-- Stripe fires both `checkout.session.completed` and `payment_intent.succeeded`
-- for the same successful card payment, ~1-2s apart. Both call
-- handlePaymentSucceeded, which read-checks `invoice_number` then creates the
-- invoice (the Oblio call takes ~1.5s). With no atomic guard, both events pass
-- the check before either writes invoice_number → two invoices (observed on
-- order E-260610-ZHGXB: EGI2024-24075 + EGI2024-24076).
--
-- This column is an atomic claim: a webhook sets it via a conditional UPDATE
-- (only when invoice_number IS NULL and the lock is free/stale) and proceeds
-- only if it won the row. The lock self-expires after a couple of minutes so a
-- genuine retry can re-claim if invoice creation failed.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_generating_at timestamptz;

COMMENT ON COLUMN orders.invoice_generating_at IS
  'Atomic lock against duplicate Oblio invoices from concurrent payment webhooks. Set just before invoice creation; self-expires (~2 min).';
