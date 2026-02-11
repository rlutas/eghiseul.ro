-- Migration: Add courier-related columns to orders table
-- Date: 2026-01-12
-- Description: Support for courier integrations (Fan Courier, Sameday, DHL, UPS, FedEx)

-- Add courier provider column (fancourier, sameday, dhl, ups, fedex)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_provider VARCHAR(50);

-- Add courier service column (STANDARD, EXPRESS, etc.)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_service VARCHAR(100);

-- Add courier quote (stores the selected shipping quote with pricing)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_quote JSONB;

-- Add AWB creation timestamp
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_created_at TIMESTAMP WITH TIME ZONE;

-- Note: AWB number is stored in existing delivery_tracking_number column
-- Note: Tracking URL is stored in existing delivery_tracking_url column

-- Create index for courier provider queries
CREATE INDEX IF NOT EXISTS idx_orders_courier_provider ON orders(courier_provider);

-- Add comment for documentation
COMMENT ON COLUMN orders.courier_provider IS 'Courier provider code: fancourier, sameday, dhl, ups, fedex';
COMMENT ON COLUMN orders.courier_service IS 'Courier service code: STANDARD, EXPRESS, COLLECT_POINT, etc.';
COMMENT ON COLUMN orders.courier_quote IS 'Selected shipping quote with full pricing breakdown';
COMMENT ON COLUMN orders.awb_created_at IS 'Timestamp when AWB was created/generated';
