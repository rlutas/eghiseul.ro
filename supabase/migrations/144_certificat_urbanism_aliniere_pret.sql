-- 144_certificat_urbanism_aliniere_pret.sql
--
-- Certificat de Urbanism pentru Informare: 780 → 943,50 RON (cu TVA).
--
-- Auditul din 14.08 (docs/services/2026-08-14-audit-preturi-cfunciara.md) a
-- arătat că e singurul serviciu imobiliar rămas sub prețul concurentului:
-- cfunciara afișează 780 lei + TVA (= 943,80 cu TVA), noi vindeam la 780 cu TVA
-- inclus — adică sub costul lor de listă, deși lucrarea e aceeași (primărie,
-- 30 de zile lucrătoare).
--
-- Rotunjit la 943,50 (nu 943,80): prețurile afișate pe platformă se termină în
-- .50 sau .00, iar 30 de bani nu schimbă poziționarea.
--
-- Decizia lui Raul, 14.08.2026: aliniem urbanismul; identificările (198 vs
-- 302,50 la ei) rămân deocamdată sub prețul lor, ca preț de intrare.

BEGIN;

UPDATE services
SET base_price = 943.50,
    updated_at = NOW()
WHERE slug = 'certificat-urbanism-informare';

COMMIT;

-- Verificare:
--   SELECT slug, base_price FROM services WHERE slug = 'certificat-urbanism-informare';
--   → 943.50
