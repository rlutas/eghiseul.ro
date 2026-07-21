-- 129_draft_current_step.sql
-- Persistă pasul curent din wizard pe comanda draft, ca:
--   (a) admin-ul să vadă UNDE s-a blocat clientul (nu doar ce a completat);
--   (b) resume-ul din email/link să revină la pasul corect (înainte era
--       hardcodat 'contact' pe ruta de resume server-side).
-- Valoarea = stepId-ul din wizard ('contact', 'personal-data', 'delivery',
-- 'billing', 'review', etc.). Se scrie deja din body de către /api/orders/draft
-- (era doar ecou în răspuns, acum se persistă).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS current_step TEXT;

COMMENT ON COLUMN orders.current_step IS
  'Wizard step id la care e/era clientul (draft): contact, personal-data, delivery, billing, review... Pt „unde s-a blocat" + resume la pasul corect.';

NOTIFY pgrst, 'reload schema';
