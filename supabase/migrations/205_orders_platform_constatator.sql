-- =============================================================================
-- 205 — orders.platform: fourth brand certificat-constatator-express.ro (2026-11-11)
-- =============================================================================
-- Same deployment, DB and admin as eghiseul.ro, documentero.ro and
-- cazierfiscal.com (src/lib/brand/brands.ts). The draft route stamps the brand
-- of the request host; without this value the stamp fails the CHECK and the
-- order cannot be created on the new host.
-- =============================================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_platform_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_platform_check CHECK (platform IN ('eghiseul', 'documentero', 'cazierfiscal', 'constatator'));

COMMENT ON COLUMN public.orders.platform IS
  'Public brand the order was placed on: eghiseul | documentero | cazierfiscal | constatator. Stamped at draft creation from the request host (src/lib/brand/server.ts); read by brandForOrder().';
NOTIFY pgrst, 'reload schema';
