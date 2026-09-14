-- Recovery în 3 pași pentru coșurile abandonate (înlocuiește emailul unic cu
-- cupon 10% — 1,4% redemption, 20 din 1.444 cupoane). Cercetare în
-- docs/marketing/email-marketing-plan-2026-09.md §4.1:
--   pasul 1 (30 min / 2 h idle la draft): „reia de unde ai rămas", FĂRĂ cupon
--   pasul 2 (+24 h): încredere — ce urmează după plată, echipă reală, recenzii
--   pasul 3 (+48 h): abia acum cuponul 10% / 48 h
--
-- `recovery_email_sent_at` rămâne = primul email (dashboardul îl citește ca
-- „a primit recovery"). Cine a primit deja emailul vechi cu cupon e marcat ca
-- terminat (pasul 3) ca să nu primească secvența nouă peste.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS recovery_email_step SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recovery_email_last_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.recovery_email_step IS 'Câte emailuri de recovery au plecat (0–3); 3 = secvență terminată (cuponul a fost trimis).';
COMMENT ON COLUMN orders.recovery_email_last_sent_at IS 'Când a plecat ultimul email din secvența de recovery (pasul următor se calculează de aici).';

UPDATE orders
SET recovery_email_step = 3, recovery_email_last_sent_at = recovery_email_sent_at
WHERE recovery_email_sent_at IS NOT NULL AND recovery_email_step = 0;

CREATE INDEX IF NOT EXISTS idx_orders_recovery_pending
  ON orders (created_at)
  WHERE status IN ('abandoned', 'draft') AND recovery_email_step < 3;

NOTIFY pgrst, 'reload schema';
