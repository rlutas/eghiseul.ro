-- 133: Expirarea link-ului de plată extra (Stripe Checkout Session ține 24h)
--
-- Fluxul Modifică → link plată extra nu persista când expiră sesiunea, deci
-- adminul nu vedea că link-ul clientului a murit (caz real E-260719-LS53Y:
-- link trimis 22.07 10:50, expirat 23.07 10:50, plată 824,50 pending fără
-- niciun semnal). Coloana alimentează: alerta din admin (comandă + listă),
-- reminder-ul automat pre-expirare și butonul de regenerare.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS pending_extra_payment_expires_at TIMESTAMPTZ;

-- Reload nudge (vezi database.md): COMMENT = DDL real care declanșează
-- pgrst_ddl_watch chiar dacă ADD COLUMN a fost no-op.
COMMENT ON COLUMN orders.pending_extra_payment_expires_at IS
  'Expirarea Stripe Checkout Session pentru plata extra pending (24h de la creare). NULL = fără link pending sau link pre-migrația 133.';

NOTIFY pgrst, 'reload schema';
