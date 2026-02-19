-- Migration: Add AWB tracking columns to orders table
-- Date: 2026-02-13
-- Description: Add delivery tracking events, status, and last update columns
--              for real-time AWB tracking support (Fan Courier + Sameday)

-- Add cached tracking events array (from courier API responses)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_tracking_events JSONB;

-- Add normalized tracking status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_tracking_status VARCHAR(50);

-- Add last tracking fetch timestamp
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_tracking_last_update TIMESTAMPTZ;

-- Add CHECK constraint for tracking status values
-- Use DO block to make it idempotent (skip if constraint already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_tracking_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_delivery_tracking_status_check
      CHECK (delivery_tracking_status IN (
        'pending', 'picked_up', 'in_transit', 'out_for_delivery',
        'delivered', 'failed_delivery', 'returned', 'cancelled', 'unknown'
      ));
  END IF;
END $$;

-- Create index on delivery_tracking_number for AWB lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(delivery_tracking_number);

-- Create index on delivery_tracking_status for status filtering
CREATE INDEX IF NOT EXISTS idx_orders_tracking_status ON orders(delivery_tracking_status);

-- Add column comments for documentation
COMMENT ON COLUMN orders.delivery_tracking_events IS 'Cached array of tracking events from courier API';
COMMENT ON COLUMN orders.delivery_tracking_status IS 'Normalized tracking status: pending, picked_up, in_transit, out_for_delivery, delivered, failed_delivery, returned, cancelled, unknown';
COMMENT ON COLUMN orders.delivery_tracking_last_update IS 'Timestamp of last tracking data fetch from courier API';
