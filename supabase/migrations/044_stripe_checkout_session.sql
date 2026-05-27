-- Migration 044: Stripe Checkout Session support (Embedded Checkout)
--
-- Switching from PaymentIntent + Elements (inline form) to Checkout Session
-- + EmbeddedCheckout (inline iframe) gives us native `line_items` support in
-- the Stripe Dashboard — operators see each addon as its own line + the
-- coupon discount line, matching cazierjudiciaronline.com's UX.
--
-- The PaymentIntent still exists (Checkout Session creates one), so the
-- existing `stripe_payment_intent_id` column stays populated by the webhook
-- on `checkout.session.completed`.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id
  ON orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
