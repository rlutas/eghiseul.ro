-- 130_draft_resume_token_admin_edit.sql
-- „Ajutare client blocat" — faza 2.5 + token de continuare emis de admin.
--
-- resume_token: token opac (randomBytes 24, base64url) generat de operator din
--   admin pe un DRAFT; linkul /comanda/<slug>?resume=<token> hidratează draftul
--   indiferent de email (acoperă și clienții blocați ÎNAINTE de pasul contact,
--   care n-au email salvat). Expiră în 48h. NU înlocuiește guard-urile pe
--   ?order=&email= (alea rămân); e o capabilitate separată, admin-emisă.
-- admin_edited_at: setat când un operator editează customer_data pe draft —
--   clientul care revine cu localStorage mai vechi primește datele de pe SERVER
--   (invalidare cache; decizie Raul 2026-07-21).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS resume_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS resume_token_expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_edited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_resume_token ON orders (resume_token)
  WHERE resume_token IS NOT NULL;

COMMENT ON COLUMN orders.resume_token IS
  'Token opac de continuare emis de admin pe draft (48h) — /comanda/<slug>?resume=<token>';
COMMENT ON COLUMN orders.admin_edited_at IS
  'Ultima editare de operator pe customer_data (draft) — invalidează localStorage-ul mai vechi al clientului';

NOTIFY pgrst, 'reload schema';
