-- Warm-up campaign: contactele pe care cronul le SARE (fără email valid,
-- domeniu nelivrabil, adresă de test, Resend respinge adresa) trebuie marcate,
-- altfel rămân la capul cozii FIFO și blochează batch-ul zilnic la infinit
-- (review 2026-09-14, fix peste migrația 157).
--
-- Semnificație diferită de `warmup_email_sent_at`: „sărit" ≠ „trimis". Motivul
-- rămâne pentru diagnostic în /admin/marketing.

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS warmup_skipped_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS warmup_skip_reason TEXT;

COMMENT ON COLUMN contacts.warmup_skipped_at IS 'Cronul de warm-up a sărit definitiv contactul (vezi warmup_skip_reason).';
COMMENT ON COLUMN contacts.warmup_skip_reason IS 'De ce a fost sărit: no email / test email / undeliverable domain / resend rejected.';

-- Reconstruim indexul parțial de selecție ca să excludă și contactele sărite.
DROP INDEX IF EXISTS idx_contacts_warmup_pending;
CREATE INDEX IF NOT EXISTS idx_contacts_warmup_pending
  ON contacts (first_seen_at, created_at)
  WHERE warmup_email_sent_at IS NULL
    AND warmup_skipped_at IS NULL
    AND marketing_status NOT IN ('unsubscribed', 'suppressed');

NOTIFY pgrst, 'reload schema';
