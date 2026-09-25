-- 187: Warm-up campaign sends to the most loyal contacts first.
--
-- Priority = platform orders ×10 + number of distinct services the contact
-- asked for (on the old WordPress site every WPForms submission for another
-- service added one entry to `services`). A contact with 3 services on the old
-- site ranks above one with a single cazier request.
--
-- Stored generated column so the cron can ORDER BY it through PostgREST.

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS warmup_priority integer
  GENERATED ALWAYS AS (
    COALESCE(orders_count, 0) * 10 + COALESCE(cardinality(services), 0)
  ) STORED;

CREATE INDEX IF NOT EXISTS contacts_warmup_queue_idx
  ON public.contacts (warmup_priority DESC, created_at)
  WHERE warmup_email_sent_at IS NULL AND warmup_skipped_at IS NULL;

-- Lower the daily batch from 75 to 50 (unsubscribe rate 1.8% on 25.09.2026).
UPDATE public.admin_settings
SET value = jsonb_set(value, '{dailyBatchSize}', '50'::jsonb)
WHERE key = 'warmup_campaign';
