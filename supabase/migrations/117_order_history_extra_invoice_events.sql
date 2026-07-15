-- 117_order_history_extra_invoice_events.sql
-- Adds extra_invoice_issued / extra_invoice_failed to the order_history
-- event_type CHECK. The invoice-health-check cron logs the extra-invoice heal
-- outcome to the order timeline (incident E-260714-WXGYQ: emission failed
-- silently for 12+ hourly runs; even the error-logging insert was silently
-- rejected by this CHECK, so the cause stayed invisible).

ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (((event_type)::text = ANY (ARRAY[
    'status_changed'::text, 'order_submitted'::text, 'payment_confirmed'::text,
    'document_generated'::text, 'payment_received'::text, 'document_uploaded'::text,
    'note_added'::text, 'admin_action'::text, 'kyc_verified'::text, 'kyc_rejected'::text,
    'awb_created'::text, 'shipped'::text, 'delivered'::text, 'abandoned'::text,
    'recovery_email_sent'::text, 'cancelled'::text, 'cancellation_requested'::text,
    'refunded'::text, 'modified'::text, 'extra_payment_sent'::text,
    'extra_payment_received'::text, 'standby_started'::text, 'standby_ended'::text,
    'reupload_requested'::text, 'kyc_photo_resubmitted'::text,
    'document_viewed_by_client'::text, 'barou_allocation_failed'::text,
    'document_generation_failed'::text,
    'extra_invoice_issued'::text, 'extra_invoice_failed'::text
  ])));

COMMENT ON CONSTRAINT order_history_event_type_check ON order_history IS
  'Event types incl. extra-invoice heal outcomes (2026-07-15)';
NOTIFY pgrst, 'reload schema';
