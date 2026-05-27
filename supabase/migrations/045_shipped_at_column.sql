-- Migration: Add shipped_at column to orders for auto-finalize cron
-- Date: 2026-05-27
-- Description: Records when an order transitioned to 'shipped' status (AWB created).
--              Used by /api/cron/auto-finalize-delivered to derive courier transit days
--              and decide when to auto-transition shipped → completed.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

-- Index for cron query: WHERE status='shipped' AND shipped_at IS NOT NULL ORDER BY shipped_at
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at
  ON orders(shipped_at)
  WHERE status = 'shipped';

COMMENT ON COLUMN orders.shipped_at IS
  'Timestamp when status transitioned to shipped (AWB created). Used by auto-finalize cron.';

-- Backfill: derive shipped_at from order_history for existing shipped orders
UPDATE orders o
SET shipped_at = sub.shipped_at
FROM (
  SELECT DISTINCT ON (order_id)
    order_id,
    created_at AS shipped_at
  FROM order_history
  WHERE event_type = 'awb_created'
     OR (event_type = 'status_change' AND new_value::text LIKE '%"status":"shipped"%')
  ORDER BY order_id, created_at ASC
) sub
WHERE o.id = sub.order_id
  AND o.shipped_at IS NULL
  AND o.status IN ('shipped', 'completed');
