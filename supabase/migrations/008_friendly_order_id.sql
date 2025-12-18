-- Migration: 008_friendly_order_id.sql
-- Description: Add friendly_order_id column to orders table for human-readable order IDs
-- Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20251218-A3B2C)
-- Author: System Designer Agent
-- Date: 2025-12-18

-- =============================================================================
-- 1. ADD FRIENDLY_ORDER_ID COLUMN
-- =============================================================================

-- Add the column (nullable first to handle existing rows)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS friendly_order_id VARCHAR(50);

-- =============================================================================
-- 2. CREATE FUNCTION TO GENERATE FRIENDLY ORDER ID
-- =============================================================================

-- Base32 character set (excludes I, O, 0, 1 for clarity)
CREATE OR REPLACE FUNCTION generate_friendly_order_id()
RETURNS VARCHAR(50) AS $$
DECLARE
  date_part TEXT;
  code_part TEXT;
  base32_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  random_char CHAR;
  new_id VARCHAR(50);
  attempts INT := 0;
  max_attempts INT := 10;
BEGIN
  -- Generate date part: YYYYMMDD
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  LOOP
    -- Generate 5 random Base32 characters
    code_part := '';
    FOR i IN 1..5 LOOP
      random_char := SUBSTRING(base32_chars FROM (1 + floor(random() * 32)::int) FOR 1);
      code_part := code_part || random_char;
    END LOOP;

    new_id := 'ORD-' || date_part || '-' || code_part;

    -- Check if ID already exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE friendly_order_id = new_id) THEN
      RETURN new_id;
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      -- Fallback: use timestamp-based unique ID
      RETURN 'ORD-' || date_part || '-' || SUBSTRING(md5(random()::text || now()::text) FOR 5);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 3. CREATE TRIGGER FOR AUTO-GENERATING FRIENDLY ORDER ID
-- =============================================================================

CREATE OR REPLACE FUNCTION trigger_generate_friendly_order_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if not already provided
  IF NEW.friendly_order_id IS NULL OR NEW.friendly_order_id = '' THEN
    NEW.friendly_order_id := generate_friendly_order_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS orders_generate_friendly_id ON orders;

-- Create trigger
CREATE TRIGGER orders_generate_friendly_id
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_friendly_order_id();

-- =============================================================================
-- 4. BACKFILL EXISTING ORDERS
-- =============================================================================

-- Generate friendly_order_id for existing orders that don't have one
UPDATE orders
SET friendly_order_id = generate_friendly_order_id()
WHERE friendly_order_id IS NULL;

-- =============================================================================
-- 5. ADD UNIQUE CONSTRAINT
-- =============================================================================

-- Now make the column unique and not null
ALTER TABLE orders
ALTER COLUMN friendly_order_id SET NOT NULL;

-- Add unique constraint
ALTER TABLE orders
ADD CONSTRAINT orders_friendly_order_id_unique UNIQUE (friendly_order_id);

-- =============================================================================
-- 6. CREATE INDEX FOR FAST LOOKUPS
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_friendly_order_id
ON orders(friendly_order_id);

-- Partial index for draft orders (for support lookup)
CREATE INDEX IF NOT EXISTS idx_orders_draft_lookup
ON orders(friendly_order_id, status, created_at)
WHERE status = 'draft';

-- =============================================================================
-- 7. ADD ABANDONED EMAIL TRACKING COLUMN
-- =============================================================================

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS abandoned_email_sent_at TIMESTAMPTZ;

-- Index for finding abandoned orders
CREATE INDEX IF NOT EXISTS idx_orders_abandoned
ON orders(status, created_at, abandoned_email_sent_at)
WHERE status = 'draft' AND abandoned_email_sent_at IS NULL;

-- =============================================================================
-- 8. UPDATE RLS POLICIES
-- =============================================================================

-- Allow users to create draft orders without authentication
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

CREATE POLICY "Users can insert own orders or guest drafts"
  ON orders FOR INSERT
  WITH CHECK (
    -- Authenticated users can create orders for themselves
    (auth.uid() = user_id) OR
    -- Guest users can create draft orders (user_id is null)
    (user_id IS NULL AND status = 'draft')
  );

-- Allow users to view their own orders OR drafts with matching email
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders or their drafts"
  ON orders FOR SELECT
  USING (
    -- Authenticated users see their orders
    (auth.uid() = user_id) OR
    -- Guest drafts can be viewed (will be validated in API)
    (user_id IS NULL AND status = 'draft')
  );

-- Allow users to update their own draft orders
DROP POLICY IF EXISTS "Users can update own draft orders" ON orders;

CREATE POLICY "Users can update own draft orders"
  ON orders FOR UPDATE
  USING (
    -- Authenticated users can update their drafts
    (auth.uid() = user_id AND status = 'draft') OR
    -- Guest drafts can be updated (will be validated in API)
    (user_id IS NULL AND status = 'draft')
  );

-- =============================================================================
-- 9. COMMENTS
-- =============================================================================

COMMENT ON COLUMN orders.friendly_order_id IS
  'Human-readable order ID in format ORD-YYYYMMDD-XXXXX for customer communication';

COMMENT ON COLUMN orders.abandoned_email_sent_at IS
  'Timestamp when abandoned order recovery email was sent';

COMMENT ON FUNCTION generate_friendly_order_id() IS
  'Generates unique human-readable order IDs using Base32 characters';

-- =============================================================================
-- VERIFICATION QUERIES (run after migration)
-- =============================================================================

-- Check that all orders have friendly_order_id
-- SELECT COUNT(*) FROM orders WHERE friendly_order_id IS NULL; -- Should be 0

-- Check format
-- SELECT friendly_order_id FROM orders LIMIT 5;

-- Test the generator
-- SELECT generate_friendly_order_id();
