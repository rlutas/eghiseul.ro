-- Migration 035: Allow missing event_type values in order_history
--
-- Bug found via integration test 2026-04-27 (`tests/integration/order-submit.test.mjs`):
-- 6 event_type values referenced in application code were rejected by the
-- existing CHECK constraint (added in migration 025), so the corresponding
-- audit trail rows were silently dropped:
--
--   * order_submitted              src/app/api/orders/[id]/submit/route.ts:330
--   * payment_rejected             src/app/api/admin/orders/[id]/verify-payment/route.ts:101
--   * payment_verified             src/app/api/admin/orders/[id]/verify-payment/route.ts:183
--   * tracking_update              src/app/api/cron/update-tracking/route.ts:201
--   * payment_proof_submitted      src/app/api/orders/[id]/bank-transfer/route.ts:102
--   * document_generation_failed   src/lib/documents/auto-generate.ts:339
--
-- The INSERTs were wrapped in try/catch by callers, so the constraint
-- violations did not surface as user-visible errors but silently truncated
-- the GDPR audit trail (consent snapshot, IP, document hash for submitted
-- orders; payment verification decisions; tracking transitions; etc.).
--
-- Fix: re-create the CHECK constraint with the full union of values. Existing
-- rows are unaffected.

ALTER TABLE order_history DROP CONSTRAINT IF EXISTS order_history_event_type_check;

ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    -- Core (migrations 002, 022, 025)
    'created',
    'status_changed',
    'status_change',
    'payment_received',
    'payment_confirmed',
    'payment_created',
    'kyc_submitted',
    'kyc_approved',
    'kyc_rejected',
    'document_uploaded',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'note_added',
    'assigned',
    'awb_created',
    'awb_cancelled',
    'draft_created',
    'order_created',
    'order_completed',
    'bank_transfer_submitted',
    'document_generated',
    'option_completed',
    'submitted_to_institution',
    'document_received_from_institution',
    'extras_started',
    'notification_sent',
    -- Added in migration 035 (referenced in code, were silently rejected)
    'order_submitted',
    'payment_rejected',
    'payment_verified',
    'tracking_update',
    'payment_proof_submitted',
    'document_generation_failed'
  ));
