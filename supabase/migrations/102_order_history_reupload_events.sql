-- Migration 102: order_history event types for the document-request flow
-- Date: 2026-07-08
--
-- The "Solicită documente" flow (and the older selfie-only reupload flow from
-- migration 048) insert order_history events 'reupload_requested' and
-- 'kyc_photo_resubmitted' — but the order_history_event_type_check constraint
-- never included them, so every such insert failed SILENTLY (the API code
-- doesn't check the insert result) and the audit trail was empty. Discovered
-- on E-260708-VC4GH: two requests sent, zero history entries.
--
-- Fix: recreate the CHECK with the two missing event types.

ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  (event_type)::text = ANY (ARRAY[
    'status_changed'::text,
    'order_submitted'::text,
    'payment_confirmed'::text,
    'document_generated'::text,
    'payment_received'::text,
    'document_uploaded'::text,
    'note_added'::text,
    'admin_action'::text,
    'kyc_verified'::text,
    'kyc_rejected'::text,
    'awb_created'::text,
    'shipped'::text,
    'delivered'::text,
    'abandoned'::text,
    'recovery_email_sent'::text,
    'cancelled'::text,
    'cancellation_requested'::text,
    'refunded'::text,
    'modified'::text,
    'extra_payment_sent'::text,
    'extra_payment_received'::text,
    'standby_started'::text,
    'standby_ended'::text,
    'reupload_requested'::text,
    'kyc_photo_resubmitted'::text
  ])
);

NOTIFY pgrst, 'reload schema';

-- Verify
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'order_history_event_type_check';
