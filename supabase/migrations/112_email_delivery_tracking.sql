-- 112: Positive email delivery signals on orders (extends 111 bounce tracking).
-- Populated by /api/webhooks/resend on email.delivered / email.opened.
-- A successful delivery also CLEARS email_bounced_at (corrected address works).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email_last_delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_last_opened_at timestamptz;

COMMENT ON COLUMN orders.email_last_delivered_at IS 'Last Resend email.delivered event for the order contact email';
COMMENT ON COLUMN orders.email_last_opened_at IS 'Last Resend email.opened event (requires open tracking enabled on the domain)';
