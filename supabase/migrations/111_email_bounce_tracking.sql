-- 111: Email bounce tracking on orders.
-- Populated by /api/webhooks/resend when Resend reports email.bounced /
-- email.complained for the order's contact email. Surfaced in admin as a
-- red banner so the operator knows the client is NOT receiving updates
-- (context: E-260713-MG6MF — document ready, client unreachable).

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS email_bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_bounce_reason text;

COMMENT ON COLUMN orders.email_bounced_at IS 'Set by Resend webhook when an email to the order contact bounced (NULL = no bounce known)';
COMMENT ON COLUMN orders.email_bounce_reason IS 'Bounce type/message from Resend (e.g. 550 5.1.1 user unknown)';
