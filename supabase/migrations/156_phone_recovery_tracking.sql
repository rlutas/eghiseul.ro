-- Phone-based abandoned cart recovery: bifă "contactat telefonic" pe comandă
-- + cupon custom (system_kind='phone_recovery') dat discreționar de echipă la
-- telefon, în loc de cuponul automat flat 10% din cron-ul recovery-emails.
--
-- Simplu, fără istoric de apeluri (decizie 2026-09-14): un singur set de
-- coloane pe orders, suprascris dacă echipa sună de mai multe ori.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contacted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contacted_by TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_contact_notes TEXT;

COMMENT ON COLUMN orders.phone_contacted_at IS 'Ultimul apel telefonic de recuperare (suprascris la fiecare apel).';
COMMENT ON COLUMN orders.phone_contacted_by IS 'Email admin care a marcat comanda ca sunată.';
COMMENT ON COLUMN orders.phone_contact_notes IS 'Notă liberă despre ultimul apel (obiecție client, rezultat).';

CREATE INDEX IF NOT EXISTS idx_orders_phone_contacted_at
  ON orders (phone_contacted_at)
  WHERE phone_contacted_at IS NOT NULL;

-- order_history: nou event_type pentru audit trail
ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    'status_changed', 'order_submitted', 'payment_confirmed',
    'payment_proof_submitted', 'bank_transfer_submitted', 'document_generated',
    'payment_received', 'document_uploaded', 'note_added', 'admin_action',
    'kyc_verified', 'kyc_rejected', 'awb_created', 'shipped', 'delivered',
    'abandoned', 'recovery_email_sent', 'cancelled', 'cancellation_requested',
    'refunded', 'modified', 'extra_payment_sent', 'extra_payment_received',
    'standby_started', 'standby_ended', 'reupload_requested',
    'kyc_photo_resubmitted', 'document_viewed_by_client',
    'barou_allocation_failed', 'document_generation_failed',
    'extra_invoice_issued', 'extra_invoice_failed', 'resume_link_generated',
    'draft_edited_by_admin', 'phone_contact_logged'
  ));

-- coupons: al doilea system_kind, pentru tab-ul de filtrare din /admin/coupons
ALTER TABLE coupons DROP CONSTRAINT coupons_system_kind_check;
ALTER TABLE coupons ADD CONSTRAINT coupons_system_kind_check
  CHECK (system_kind IS NULL OR system_kind IN ('recovery', 'phone_recovery'));

NOTIFY pgrst, 'reload schema';
