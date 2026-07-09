-- =============================================
-- Migration: 106_document_client_view_tracking
-- Description: Urmărim dacă CLIENTUL a deschis documentele de pe pagina de
--              status (ex. constatatorul ONRC / extrasul CF livrate de
--              workeri + emailul „documentul e gata"). Adminul vede pe
--              comandă „Vizualizat de client la <data> (xN)" + event în
--              istoricul comenzii la prima vizualizare.
-- Date: 2026-07-09
-- =============================================

ALTER TABLE order_documents ADD COLUMN IF NOT EXISTS first_viewed_by_client_at TIMESTAMPTZ;
ALTER TABLE order_documents ADD COLUMN IF NOT EXISTS last_viewed_by_client_at TIMESTAMPTZ;
ALTER TABLE order_documents ADD COLUMN IF NOT EXISTS client_view_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN order_documents.first_viewed_by_client_at IS
  'Prima deschidere a documentului de către CLIENT (preview/download de pe pagina de status sau din cont). NULL = clientul nu l-a deschis niciodată.';
COMMENT ON COLUMN order_documents.last_viewed_by_client_at IS
  'Ultima deschidere de către client.';
COMMENT ON COLUMN order_documents.client_view_count IS
  'De câte ori a deschis clientul documentul.';

-- order_history.event_type are CHECK strict — extindem lista cu:
--   * document_viewed_by_client — evenimentul nou al acestei migrări
--   * barou_allocation_failed   — folosit de ensure-barou-documents (2026-07-09)
--   * document_generation_failed — folosit de auto-generate de mult, dar
--     respins SILENȚIOS de constraint până acum (insertul înghițea eroarea)
ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  (event_type)::text = ANY (ARRAY[
    'status_changed','order_submitted','payment_confirmed','document_generated',
    'payment_received','document_uploaded','note_added','admin_action',
    'kyc_verified','kyc_rejected','awb_created','shipped','delivered',
    'abandoned','recovery_email_sent','cancelled','cancellation_requested',
    'refunded','modified','extra_payment_sent','extra_payment_received',
    'standby_started','standby_ended','reupload_requested','kyc_photo_resubmitted',
    'document_viewed_by_client','barou_allocation_failed','document_generation_failed'
  ]::text[])
);

NOTIFY pgrst, 'reload schema';
