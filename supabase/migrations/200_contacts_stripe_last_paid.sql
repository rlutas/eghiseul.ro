-- 200: Warm-up campaign sends to real past buyers first, most recent first.
--
-- Matching the old list with Stripe (04.11.2026) showed that 16.608 contacts
-- labelled as leads have paid, and that the queue had mostly reached people
-- who last paid over two years ago. Buyers on the new platform rebought at
-- 3,9% after the email, old WordPress buyers at 0,23%, and contacts with no
-- Stripe payment produced no purchase.
--
-- This column holds only the date of the last paid charge, so the queue can
-- order by it. `is_customer` stays as it is: it means "paid on the new platform".

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS stripe_last_paid_at timestamptz;

COMMENT ON COLUMN public.contacts.stripe_last_paid_at IS
  'Last paid, non-refunded Stripe charge found for this email. Filled by a one-off match; orders the warm-up queue.';

CREATE INDEX IF NOT EXISTS contacts_warmup_buyers_queue_idx
  ON public.contacts (stripe_last_paid_at DESC NULLS LAST, warmup_priority DESC, created_at)
  WHERE warmup_email_sent_at IS NULL AND warmup_skipped_at IS NULL;

NOTIFY pgrst, 'reload schema';
