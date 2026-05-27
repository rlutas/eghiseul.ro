-- Migration 040: Reduce Apostila Haga price 238 → 198 RON
-- Date: 2026-05-27
--
-- Aligns eghiseul.ro pricing with the sister projects cazierjudiciaronline.com
-- and ecazier.ro, which both dropped Apostila Haga to 198 RON earlier this
-- month. Customers compare addon prices across the three properties so a 40
-- RON gap is a visible disadvantage.
--
-- All other addons (Traducere 178.50, Legalizare 99, Apostila Notari 83.30,
-- Verificare Expert 49) already match — verified 2026-05-27 against
-- cazierjudiciaronline.com/src/config/addons.ts DEFAULT_ADDONS.
--
-- Applies to ALL 9 services that have this option row:
--   cazier-judiciar, cazier-judiciar-persoana-fizica,
--   cazier-judiciar-persoana-juridica, cazier-fiscal, cazier-auto,
--   certificat-integritate-comportamentala, certificat-casatorie,
--   certificat-celibat, certificat-nastere.

UPDATE service_options
SET
  price = 198.00,
  updated_at = NOW()
WHERE code = 'apostila_haga'
  AND price = 238.00;  -- guard: don't touch rows that may have already been adjusted

-- Verify (visible in psql / Supabase logs)
SELECT
  s.slug,
  o.code,
  o.price,
  o.updated_at
FROM service_options o
JOIN services s ON s.id = o.service_id
WHERE o.code = 'apostila_haga'
ORDER BY s.slug;
