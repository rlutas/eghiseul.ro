-- Migration 042: Refund + extra-payment tracking for the "Modifică comandă plătită" feature
-- Date: 2026-05-27
--
-- The admin Modify dialog lets an operator change a paid order: add/remove
-- add-ons, swap couriers, flip urgency. The math falls one of three ways:
--   1. New total < paid → Stripe refund for the difference
--   2. New total > paid → new Stripe PaymentIntent for the difference,
--      customer gets a link to pay (admin can re-share)
--   3. New total = paid → just field changes, no money moves
--
-- This migration adds the columns we need to track those flows:
--   - refunded_amount: cumulative refunds (in RON, matches total_price units)
--   - additional_paid_amount: cumulative extra payments after the original
--   - pending_extra_payment_url, pending_extra_payment_amount: copy-paste
--     URL the admin can re-share if the customer missed the email
--   - last_modified_at, last_modified_by: audit metadata (in addition to
--     order_history rows for the actual event log)
--
-- order_history.event_type CHECK extended with `modified`, `extra_payment_sent`.

BEGIN;

-- ─── 1. Order row columns ─────────────────────────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC NOT NULL DEFAULT 0
    CHECK (refunded_amount >= 0);
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS additional_paid_amount NUMERIC NOT NULL DEFAULT 0
    CHECK (additional_paid_amount >= 0);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_payment_url TEXT;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_payment_amount NUMERIC;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_payment_intent_id TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMPTZ;
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS last_modified_by TEXT;

COMMENT ON COLUMN orders.refunded_amount IS
  'Cumulative RON refunded to the customer via the Modify dialog. Independent of payment_status; an order can be paid AND have refunds. Effective net charged = total_price - refunded_amount + additional_paid_amount.';
COMMENT ON COLUMN orders.additional_paid_amount IS
  'Cumulative RON paid AFTER the original capture, via "Modifică + plată extra" link. Incremented by the Stripe webhook for extra-charge PaymentIntents.';
COMMENT ON COLUMN orders.pending_extra_payment_url IS
  'Copy-paste-able client_secret URL for the latest extra-payment ask. NULL after the customer pays (cleared by webhook) or after the next modify cycle replaces it.';

-- ─── 2. order_history event_type extended ────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_history_event_type_check'
  ) THEN
    ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;
  END IF;
END $$;

ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    -- Legacy values
    'status_changed',
    'order_submitted',
    'payment_confirmed',
    'document_generated',
    -- Existing future-friendly set
    'payment_received',
    'document_uploaded',
    'note_added',
    'admin_action',
    'kyc_verified',
    'kyc_rejected',
    'awb_created',
    'shipped',
    'delivered',
    'abandoned',
    'recovery_email_sent',
    'cancelled',
    'refunded',
    -- NEW (2026-05-27 migration 042) — Modify dialog audit trail
    'modified',
    'extra_payment_sent',
    'extra_payment_received'
  ));

COMMIT;

-- Verify
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders'
  AND column_name IN (
    'refunded_amount',
    'additional_paid_amount',
    'pending_extra_payment_url',
    'pending_extra_payment_amount',
    'pending_extra_payment_intent_id',
    'last_modified_at',
    'last_modified_by'
  )
ORDER BY column_name;
