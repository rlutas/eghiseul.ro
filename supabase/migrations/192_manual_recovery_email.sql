-- 192: email de recuperare trimis manual de echipă din /admin/recuperare-telefonica
-- (cerere echipă 07.10.2026: „sunt prea mulți de sunat, vrem să le putem scrie").
-- Fără cupon. Ultimul email manual ține `_at`/`_by`, ca două colege să nu scrie
-- aceluiași client; istoricul complet rămâne în order_history.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS manual_recovery_email_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS manual_recovery_email_by TEXT;

COMMENT ON COLUMN orders.manual_recovery_email_at IS 'Când a trimis echipa ultimul email manual de recuperare (fără cupon).';
COMMENT ON COLUMN orders.manual_recovery_email_by IS 'Cine a trimis ultimul email manual de recuperare (email admin).';

NOTIFY pgrst, 'reload schema';
