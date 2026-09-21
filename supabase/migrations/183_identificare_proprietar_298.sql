-- 183: identificarea după proprietar la 298 lei, ca cea după adresă
-- (decizie Raul, 21.09.2026): același flux, același certificat OCPI când nu se
-- găsește online (cod 2.7.6, 125 lei), deci același preț.
UPDATE services SET base_price = 298.00, updated_at = now()
 WHERE slug = 'identificare-imobile-proprietar';
