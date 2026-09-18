-- 174: cupon de bun-venit pentru conturile de client (18.09.2026).
--
-- Un cupon poate aparține unui cont: `owner_user_id`. Ruta de aplicare
-- (`POST /api/orders/[id]/coupon`) refuză un cupon cu proprietar pe o comandă
-- care nu e a lui — codul din cont poate fi copiat, dar nu folosit de altcineva.
-- `system_kind = 'welcome'` marchează cupoanele create automat la primul acces
-- în cont (`src/lib/coupons/welcome.ts`), ca să se distingă în /admin/coupons
-- de cele de recovery și de cele date la telefon.

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS coupons_owner_user_id_idx
  ON coupons (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_system_kind_check;
ALTER TABLE coupons ADD CONSTRAINT coupons_system_kind_check
  CHECK (system_kind IS NULL OR system_kind IN ('recovery', 'phone_recovery', 'welcome'));

-- Real DDL at the end, so PostgREST reloads its schema cache even when the
-- ADD COLUMN above was a no-op (see .claude/rules/database.md).
COMMENT ON COLUMN coupons.owner_user_id IS
  'Contul căruia îi aparține cuponul (welcome). NULL = cupon general. Ruta de aplicare refuză un cupon cu proprietar pe comanda altui cont.';

NOTIFY pgrst, 'reload schema';
