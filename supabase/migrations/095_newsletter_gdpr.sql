-- 095: Newsletter/marketing GDPR completion
--
-- newsletter_subscribers existed minimally (email, source, consent,
-- created_at) with a POST /api/newsletter used by the calculators popup.
-- This adds what GDPR-compliant email marketing needs:
--   • unsubscribe_token — one-click opt-out link in every campaign email
--   • unsubscribed_at   — soft opt-out (keep the row as proof of consent)
--   • consent_text      — exact wording the user agreed to (proof)
--   • name / ip         — optional context (ip = consent audit)
--   • unique lower(email) — one row per address; re-subscribing reactivates

ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_text text,
  ADD COLUMN IF NOT EXISTS ip inet;

-- Backfill tokens for any pre-existing rows.
UPDATE newsletter_subscribers SET unsubscribe_token = gen_random_uuid()::text
WHERE unsubscribe_token IS NULL;

-- One subscriber per email (case-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_unique
  ON newsletter_subscribers (lower(email));
