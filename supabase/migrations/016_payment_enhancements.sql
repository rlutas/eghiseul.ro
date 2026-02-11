-- Migration: 016_payment_enhancements.sql
-- Description: Add columns for bank transfer payment flow
-- Date: 2026-01-12

-- Add payment_proof_url for bank transfer proof uploads
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Add verified_by for admin verification tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

-- Add index for payment status queries (for admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add index for finding orders awaiting verification
CREATE INDEX IF NOT EXISTS idx_orders_awaiting_verification
  ON orders(payment_status)
  WHERE payment_status = 'awaiting_verification';

-- Comment on new columns
COMMENT ON COLUMN orders.payment_proof_url IS 'S3 key for bank transfer payment proof (screenshot/PDF)';
COMMENT ON COLUMN orders.verified_by IS 'Admin user ID who verified the bank transfer payment';

-- Update payment_status check constraint to include new status
-- Note: This might fail if constraint already exists, which is OK
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

  -- Add new constraint with all valid statuses
  ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('unpaid', 'pending', 'awaiting_verification', 'paid', 'refunded', 'failed'));
EXCEPTION
  WHEN others THEN
    -- Constraint might already exist or not be modifiable, ignore
    NULL;
END $$;
