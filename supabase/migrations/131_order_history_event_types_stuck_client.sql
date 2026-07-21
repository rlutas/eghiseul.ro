-- 131_order_history_event_types_stuck_client.sql
-- Audit-ul pt „ajutare client blocat" pica silențios: CHECK-ul pe
-- order_history.event_type nu includea noile tipuri (resume_link_generated,
-- draft_edited_by_admin) → insert-urile eșuau fără să fie observate (finding
-- test e2e 2026-07-21). Re-creăm constraint-ul cu lista completă + cele 2 noi.

ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  (event_type)::text = ANY (ARRAY[
    'status_changed'::text, 'order_submitted'::text, 'payment_confirmed'::text,
    'document_generated'::text, 'payment_received'::text, 'document_uploaded'::text,
    'note_added'::text, 'admin_action'::text, 'kyc_verified'::text,
    'kyc_rejected'::text, 'awb_created'::text, 'shipped'::text, 'delivered'::text,
    'abandoned'::text, 'recovery_email_sent'::text, 'cancelled'::text,
    'cancellation_requested'::text, 'refunded'::text, 'modified'::text,
    'extra_payment_sent'::text, 'extra_payment_received'::text,
    'standby_started'::text, 'standby_ended'::text, 'reupload_requested'::text,
    'kyc_photo_resubmitted'::text, 'document_viewed_by_client'::text,
    'barou_allocation_failed'::text, 'document_generation_failed'::text,
    'extra_invoice_issued'::text, 'extra_invoice_failed'::text,
    -- noi (client blocat):
    'resume_link_generated'::text, 'draft_edited_by_admin'::text
  ])
);

NOTIFY pgrst, 'reload schema';
