-- =============================================
-- Migration 032: Promote estimated_completion_date to TIMESTAMPTZ
-- =============================================
-- The column already exists (migration 002) as DATE, populated by a trigger
-- `calculate_estimated_completion()` that used naive calendar-date math
-- (no holidays, no noon cutoff). This migration:
--
--  1) Drops the legacy trigger + trigger function so the app can write the
--     column explicitly using the new delivery calculator
--     (`src/lib/delivery-calculator.ts`), which accounts for:
--        - Romanian public holidays 2026-2028
--        - 12:00 Europe/Bucharest noon cutoff
--        - Per-option delivery-day impact
--        - Courier transit time
--  2) Converts the column from DATE to TIMESTAMPTZ so the app can store
--     the exact UTC ISO timestamp (not just a local calendar day).
--  3) Preserves existing DATE values by casting them to TIMESTAMPTZ at UTC
--     midnight — harmless for orders still in draft/pending.
--  4) Backfill is deliberately skipped for paid/completed orders: legacy
--     rows remain at their trigger-computed value (already cast), new orders
--     are written by the application layer. Old orders without the column
--     populated stay NULL and the UI falls back to showing estimated_days.
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Drop legacy trigger and function
-- -------------------------------------------------
DROP TRIGGER IF EXISTS orders_calculate_estimated_completion ON orders;
DROP FUNCTION IF EXISTS calculate_estimated_completion();

-- -------------------------------------------------
-- 2) Alter column type DATE -> TIMESTAMPTZ
-- -------------------------------------------------
-- Defensive: ensure the column exists (should be a no-op after migration 002).
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMPTZ;

-- Only alter if currently DATE (idempotent when re-run against TIMESTAMPTZ).
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'estimated_completion_date';

  IF col_type = 'date' THEN
    ALTER TABLE orders
      ALTER COLUMN estimated_completion_date TYPE TIMESTAMPTZ
      USING estimated_completion_date::timestamp AT TIME ZONE 'UTC';
  END IF;
END $$;

-- -------------------------------------------------
-- 3) Documentation
-- -------------------------------------------------
COMMENT ON COLUMN orders.estimated_completion_date IS
  'Estimated completion timestamp (UTC). Computed at order submission / payment via src/lib/delivery-calculator.ts, which respects Romanian holidays, noon cutoff, and per-option/courier impact. NULL for legacy orders created before migration 032.';

-- -------------------------------------------------
-- 4) Index for admin reporting (overdue orders dashboard)
-- -------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_estimated_completion
  ON orders (estimated_completion_date)
  WHERE estimated_completion_date IS NOT NULL;

COMMIT;
