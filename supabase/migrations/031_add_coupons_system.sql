-- =============================================
-- Migration 031: Coupons / discount system
-- =============================================
-- Ported from cazierjudiciaronline.com migration 014.
--
-- Adaptations for eghiseul.ro:
--   * RON amounts stored as NUMERIC (not bani/integer) - consistent with
--     the rest of the schema (services.base_price NUMERIC, orders.total_price DECIMAL).
--   * discount_value is NUMERIC (integer 1-100 for percentage, decimal RON for fixed).
--   * Uses gen_random_uuid() (pgcrypto), matches migration 002 pattern.
--   * created_by is UUID -> profiles(id) (not free text).
--   * Extends orders with coupon_code column. orders.discount_amount already
--     exists from migration 002 (DECIMAL(10,2) DEFAULT 0.00) — we leave it as-is.
--   * RLS: admin-only direct access. Public reads coupons via the
--     /api/coupons/validate endpoint which uses the service role key, so no
--     public RLS policy is needed.
--   * Partial unique index on (code) WHERE is_active = TRUE prevents
--     two active coupons from sharing a code, while allowing historical
--     copies to coexist (already covered by the UNIQUE constraint on code).
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Coupons table
-- -------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(10) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_amount NUMERIC NOT NULL DEFAULT 0 CHECK (min_amount >= 0),
  max_uses INT DEFAULT NULL CHECK (max_uses IS NULL OR max_uses > 0),
  times_used INT NOT NULL DEFAULT 0 CHECK (times_used >= 0),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup on code for active coupons (validation hot path)
CREATE INDEX IF NOT EXISTS idx_coupons_code_active ON coupons(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at DESC);

-- -------------------------------------------------
-- 2) updated_at trigger
-- -------------------------------------------------

-- Reuse existing helper if present (public.update_updated_at from migration 001),
-- otherwise inline a trigger function.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at' AND pronamespace = 'public'::regnamespace
  ) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS coupons_set_updated_at ON coupons;
CREATE TRIGGER coupons_set_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -------------------------------------------------
-- 3) Extend orders table
-- -------------------------------------------------
-- orders.discount_amount already exists (migration 002, DECIMAL(10,2) DEFAULT 0.00).
-- We only need to add coupon_code.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code) WHERE coupon_code IS NOT NULL;

-- -------------------------------------------------
-- 4) RLS
-- -------------------------------------------------

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Only admin roles can SELECT directly.
-- The /api/coupons/validate public endpoint uses the service role key
-- which bypasses RLS, so we don't need a public read policy.
DROP POLICY IF EXISTS "Admins can view coupons" ON coupons;
CREATE POLICY "Admins can view coupons"
  ON coupons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager', 'operator', 'contabil', 'avocat', 'employee')
    )
  );

DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
CREATE POLICY "Admins can insert coupons"
  ON coupons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
CREATE POLICY "Admins can update coupons"
  ON coupons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;
CREATE POLICY "Admins can delete coupons"
  ON coupons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

-- -------------------------------------------------
-- 5) Documentation comments
-- -------------------------------------------------

COMMENT ON TABLE coupons IS 'Discount coupons (percentage or fixed RON) for order checkout';
COMMENT ON COLUMN coupons.discount_type IS 'percentage (1-100) or fixed (RON)';
COMMENT ON COLUMN coupons.discount_value IS 'Integer 1-100 for percentage, decimal RON for fixed';
COMMENT ON COLUMN coupons.min_amount IS 'Minimum order subtotal (RON) for coupon to apply';
COMMENT ON COLUMN coupons.max_uses IS 'NULL = unlimited uses';
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code applied to this order (denormalized - persists if coupon deleted)';

COMMIT;
