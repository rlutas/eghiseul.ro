-- Migration 103: identificare-imobile-proprietar la același preț cu
-- identificarea după adresă
-- Date: 2026-07-08
--
-- Decizie user (2026-07-08): AMBELE identificări (după adresă și după numele
-- proprietarului) au același preț — 198 RON (TVA inclus; 163,64 + TVA).
-- Prețul de 302,50 era placeholder din migrarea 084 (catalog topograf).

UPDATE services
SET base_price = 198.00, updated_at = NOW()
WHERE slug = 'identificare-imobile-proprietar';

-- Verify
SELECT slug, base_price FROM services
WHERE slug IN ('identificare-imobil', 'identificare-imobile-proprietar');
