-- 093: Add granular add-on workflow statuses (parity with cazierjudiciaronline.com)
--
-- eghiseul is multi-service so its pipeline is generic
-- (paid→processing→documents_generated→submitted_to_institution→
--  document_received→extras_in_progress→document_ready→shipped→completed).
-- The ops team (used to the cazier-only sister) needs the granular add-on
-- stages that happen AFTER the main document is issued and BEFORE shipping,
-- for orders that bought translation / legalization / apostille add-ons.
--
-- These 4 slot between `document_received`/`extras_in_progress` and
-- `document_ready`. They only apply to orders with the matching add-on; the
-- generic `extras_in_progress` stays for everything else.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'draft', 'pending', 'abandoned',
    'paid', 'processing', 'documents_generated', 'submitted_to_institution',
    'document_received', 'extras_in_progress',
    -- NEW add-on stages:
    'la_tradus', 'la_legalizat', 'la_apostila_notari', 'eliberat_apostila_haga',
    'kyc_pending', 'kyc_approved', 'kyc_rejected', 'in_progress',
    'document_ready', 'shipped', 'delivered', 'completed',
    'cancelled', 'cancellation_requested', 'refunded', 'standby'
  )
);
