-- 097: Prețuri multilingv (798/398) + upsell pachet certificat (+498) +
--      coloană pentru emailul de confirmare comandă
--
-- 1. Aliniere prețuri la terminația -8 (decizie user): standalone 799→798,
--    add-on extras_multilingv 399→398.
-- 2. Upsell pe serviciile multilingv standalone: „Adaugă și certificatul"
--    la +498 (pachet mai bun decât certificatul separat la 998).
-- 3. orders.confirmation_email_sent_at — claim idempotent pentru emailul de
--    confirmare trimis clientului la plată (webhook + confirm-payment pot
--    rula amândouă; doar primul care revendică trimite).

UPDATE services SET base_price = 798.00, updated_at = now()
WHERE slug IN ('extras-multilingv-certificat-nastere', 'extras-multilingv-certificat-casatorie');

UPDATE service_options SET price = 398.00, updated_at = now()
WHERE code = 'extras_multilingv';

INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, config, display_order, icon)
SELECT s.id, 'certificat_pachet',
  'Adaugă și Certificatul de Căsătorie (pachet)',
  'Primești și certificatul de căsătorie (duplicat) împreună cu extrasul multilingv — la pachet, mai avantajos decât comandat separat.',
  498.00, 'fixed', true, false, 1, '{}'::jsonb, 1, 'file-plus'
FROM services s WHERE s.slug = 'extras-multilingv-certificat-casatorie'
  AND NOT EXISTS (SELECT 1 FROM service_options so WHERE so.service_id = s.id AND so.code = 'certificat_pachet');

INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, config, display_order, icon)
SELECT s.id, 'certificat_pachet',
  'Adaugă și Certificatul de Naștere (pachet)',
  'Primești și certificatul de naștere (duplicat) împreună cu extrasul multilingv — la pachet, mai avantajos decât comandat separat.',
  498.00, 'fixed', true, false, 1, '{}'::jsonb, 1, 'file-plus'
FROM services s WHERE s.slug = 'extras-multilingv-certificat-nastere'
  AND NOT EXISTS (SELECT 1 FROM service_options so WHERE so.service_id = s.id AND so.code = 'certificat_pachet');

ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;
