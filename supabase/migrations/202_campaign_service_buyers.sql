-- 202: Campaigns can target buyers of one service in a payment date range.
--
-- First use: a constatator message to contacts who paid between 2025 and two
-- weeks ago. The warm-up sends one email per contact, so it cannot reach them
-- again. Campaigns on this segment must set service_slug; the cron skips them
-- otherwise, so a missing slug can never fall through to the whole registry.

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS service_slug text,
  ADD COLUMN IF NOT EXISTS min_last_paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS max_last_paid_at timestamptz;

ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_segment_check;
ALTER TABLE public.email_campaigns ADD CONSTRAINT email_campaigns_segment_check
  CHECK (segment IN ('customers', 'subscribed', 'all_contacts', 'service_buyers'));

COMMENT ON COLUMN public.email_campaigns.service_slug IS
  'Required for segment service_buyers: only contacts with this slug in contacts.services.';

NOTIFY pgrst, 'reload schema';
