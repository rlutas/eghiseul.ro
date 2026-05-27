-- Migration 043: Self-cancel within 30 minutes + standby (paused SLA)
--
-- P0 features ported from cazierjudiciaronline.com:
--   #1 Client self-cancel 30 minutes after payment → status='cancellation_requested'
--   #3 Standby: pause SLA when blocked on client (missing docs, signature),
--      shift estimated_delivery_date forward by elapsed business days on resume.
--
-- Both features extend the orders.status CHECK constraint and add new
-- event_type values to order_history. The standby columns track the active
-- pause window so the resume math (addBusinessDays) is deterministic.

BEGIN;

-- 1. Add 'cancellation_requested' and 'standby' to orders.status CHECK -------
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status::text = ANY (ARRAY[
    'draft', 'pending', 'abandoned',
    'paid', 'processing',
    'documents_generated', 'submitted_to_institution',
    'document_received', 'extras_in_progress',
    'kyc_pending', 'kyc_approved', 'kyc_rejected',
    'in_progress', 'document_ready',
    'shipped', 'delivered', 'completed',
    'cancelled', 'cancellation_requested', 'refunded',
    'standby'
  ]::text[])
);

-- 2. Standby tracking columns ------------------------------------------------
-- standby_started_at  — UTC timestamp when admin paused SLA (NULL = not paused)
-- standby_total_seconds — accumulated paused seconds across all standby windows;
--                          used by addBusinessDays() on resume to shift the
--                          estimated_delivery_date forward by ceil(seconds/86400)
--                          business days.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS standby_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS standby_total_seconds BIGINT NOT NULL DEFAULT 0;

-- 3. Event types for status PATCH + standby transitions ----------------------
ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  event_type::text = ANY (ARRAY[
    'status_changed', 'order_submitted', 'payment_confirmed',
    'document_generated', 'payment_received', 'document_uploaded',
    'note_added', 'admin_action',
    'kyc_verified', 'kyc_rejected',
    'awb_created', 'shipped', 'delivered',
    'abandoned', 'recovery_email_sent',
    'cancelled', 'cancellation_requested',
    'refunded', 'modified',
    'extra_payment_sent', 'extra_payment_received',
    'standby_started', 'standby_ended'
  ]::text[])
);

-- 4. Index supports admin filter on cancellation_requested orders -----------
CREATE INDEX IF NOT EXISTS idx_orders_status_cancellation
  ON orders (status)
  WHERE status = 'cancellation_requested';

COMMIT;
