-- 134: Dedupe pentru reminder-ul de plată extra (cron orar)
--
-- Mirror al pattern-ului recovery_email_sent_at: reminder-ul pre-expirare se
-- trimite O DATĂ per link; regenerarea link-ului resetează coloana ca link-ul
-- nou să-și poată primi propriul reminder. Send eșuat lasă NULL (retry la
-- următoarea rulare); plasa a doua = Idempotency-Key Resend pe session id.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_reminder_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.pending_extra_reminder_sent_at IS
  'Când s-a trimis reminder-ul pre-expirare pentru link-ul de plată extra pending. NULL = netrimis (sau link regenerat).';

NOTIFY pgrst, 'reload schema';
