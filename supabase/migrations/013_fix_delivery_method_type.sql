-- Migration: 013_fix_delivery_method_type.sql
-- Description: Fix delivery_method column type from VARCHAR to JSONB
-- Date: 2026-01-05
-- Issue: delivery_method was defined as VARCHAR but the API sends JSONB objects
--
-- Background:
-- The orders table has delivery_method as VARCHAR(50) with CHECK constraint,
-- but the API sends delivery_method as a JSONB object with structure:
-- {
--   "type": "email|registered_mail|courier",
--   "name": "Email",
--   "price": 0,
--   "estimated_days": 0
-- }

-- =============================================================================
-- 1. DROP EXISTING CHECK CONSTRAINT
-- =============================================================================

-- Drop the old check constraint on delivery_method
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_delivery_method_check;

-- =============================================================================
-- 2. CONVERT EXISTING DATA
-- =============================================================================

-- Convert existing VARCHAR values to JSONB format
-- For any existing rows with simple string values like 'email', 'registered_mail', 'courier'
UPDATE orders
SET delivery_method = jsonb_build_object(
  'type', delivery_method,
  'name', CASE
    WHEN delivery_method = 'email' THEN 'Email'
    WHEN delivery_method = 'registered_mail' THEN 'Poștă Recomandată'
    WHEN delivery_method = 'courier' THEN 'Curier'
    ELSE delivery_method
  END,
  'price', COALESCE(delivery_price, 0),
  'estimated_days', 0
)::text::jsonb
WHERE delivery_method IS NOT NULL
  AND delivery_method IN ('email', 'registered_mail', 'courier');

-- =============================================================================
-- 3. CHANGE COLUMN TYPE
-- =============================================================================

-- Change column type from VARCHAR to JSONB
ALTER TABLE orders
ALTER COLUMN delivery_method TYPE JSONB USING
  CASE
    WHEN delivery_method IS NULL THEN NULL
    WHEN delivery_method::text ~ '^[a-z_]+$' THEN
      jsonb_build_object(
        'type', delivery_method::text,
        'name', delivery_method::text,
        'price', 0,
        'estimated_days', 0
      )
    ELSE delivery_method::text::jsonb
  END;

-- =============================================================================
-- 4. ADD COMMENTS
-- =============================================================================

COMMENT ON COLUMN orders.delivery_method IS
  'Delivery method details as JSONB: {type: string, name: string, price: number, estimated_days: number}';

-- =============================================================================
-- 5. FIX selected_options DEFAULT VALUE
-- =============================================================================

-- The selected_options column defaults to '{}' (object) but the API sends arrays
-- Change the default to '[]' (array) to match the API behavior
ALTER TABLE orders
ALTER COLUMN selected_options SET DEFAULT '[]'::jsonb;

COMMENT ON COLUMN orders.selected_options IS
  'Array of selected options as JSONB: [{option_id: uuid, option_name: string, quantity: number, price_modifier: number}]';

-- =============================================================================
-- VERIFICATION QUERY
-- =============================================================================

-- Verify the column type change
-- SELECT column_name, data_type, column_default FROM information_schema.columns
-- WHERE table_name = 'orders' AND column_name IN ('delivery_method', 'selected_options');

-- Check existing data
-- SELECT id, friendly_order_id, delivery_method, selected_options FROM orders WHERE delivery_method IS NOT NULL LIMIT 5;
