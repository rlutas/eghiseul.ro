-- 194: record failed card payments on the order.
--
-- Stripe sends `payment_intent.payment_failed` on every declined card attempt.
-- The webhook only logged it, so the team saw an abandoned order "stuck at
-- Facturare" while the client had in fact reached the card form and been
-- declined (E-261014-GD94K, 2 declines on 14.10.2026). Those are the warmest
-- leads for the phone queue: they wanted to pay, the bank said no, and the
-- obvious fix is a bank transfer (IBAN) or another card.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_failed_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_last_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_last_error text;

COMMENT ON COLUMN public.orders.payment_failed_count IS
  'Declined card attempts reported by Stripe (payment_intent.payment_failed).';
COMMENT ON COLUMN public.orders.payment_last_failed_at IS
  'When the last card attempt was declined.';
COMMENT ON COLUMN public.orders.payment_last_error IS
  'Stripe decline_code / code of the last declined attempt (e.g. insufficient_funds).';

-- Timeline entry for each declined attempt.
ALTER TABLE public.order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;
ALTER TABLE public.order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  event_type::text = ANY (ARRAY[
    'status_changed', 'order_submitted', 'payment_confirmed', 'payment_proof_submitted',
    'bank_transfer_submitted', 'document_generated', 'payment_received', 'document_uploaded',
    'note_added', 'admin_action', 'kyc_verified', 'kyc_rejected', 'awb_created', 'shipped',
    'delivered', 'abandoned', 'recovery_email_sent', 'cancelled', 'cancellation_requested',
    'refunded', 'modified', 'extra_payment_sent', 'extra_payment_received', 'standby_started',
    'standby_ended', 'reupload_requested', 'kyc_photo_resubmitted', 'document_viewed_by_client',
    'barou_allocation_failed', 'document_generation_failed', 'extra_invoice_issued',
    'extra_invoice_failed', 'resume_link_generated', 'draft_edited_by_admin',
    'phone_contact_logged', 'work_started_on_proof', 'payment_failed'
  ]::text[])
);

NOTIFY pgrst, 'reload schema';
