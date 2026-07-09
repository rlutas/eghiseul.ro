-- =============================================
-- Migration: 104_barou_numbers_post_payment
-- Description: Barou numbers move to the CENTRAL registry (dedicated Supabase
--              project, REGISTRY_SUPABASE_URL) and are allocated ONLY after
--              successful payment. This migration adds the completion marker
--              used by the webhook/confirm-payment/cron sweep, and deprecates
--              the LOCAL registry tables (data migrated centrally via
--              scripts/migrate-registry-to-central.ts; kept read-only for
--              history).
-- Date: 2026-07-09
-- =============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS barou_numbers_allocated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_barou_pending
  ON orders (paid_at)
  WHERE payment_status = 'paid' AND barou_numbers_allocated_at IS NULL;

-- Backfill: every already-paid order predates the post-payment flow — its
-- numbers were allocated at submit (or it never needed any). Mark them so the
-- cron sweep only ever touches orders paid AFTER this cutover.
UPDATE orders
SET barou_numbers_allocated_at = COALESCE(paid_at, updated_at, NOW())
WHERE payment_status = 'paid'
  AND barou_numbers_allocated_at IS NULL;

COMMENT ON COLUMN orders.barou_numbers_allocated_at IS
  'When the Barou contract + delegation numbers were allocated from the CENTRAL registry (post-payment). NULL on paid orders = pending allocation (cron sweep retries). Set-and-skip marker for no-lawyer services too.';

COMMENT ON TABLE number_registry IS
  '@deprecated 2026-07 — moved to the central registry project (REGISTRY_SUPABASE_URL). Read-only historical data; do not allocate from here.';
COMMENT ON TABLE number_ranges IS
  '@deprecated 2026-07 — moved to the central registry project (REGISTRY_SUPABASE_URL). Read-only historical data; do not allocate from here.';

NOTIFY pgrst, 'reload schema';
