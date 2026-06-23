-- Migration 078: extras multilingv add-on pe naștere + căsătorie
--
-- Paritate WPForms: formularele de naștere/căsătorie aveau un add-on
-- „Extras Multilingv" (399 lei) — formular standard UE (Reg. 2016/1191),
-- recunoscut în alt stat membru fără traducere. Îl adăugăm ca service_option
-- toggle pe ambele certificate. Termenul rămâne cel al certificatului de bază
-- (e add-on pe aceeași comandă).
--
-- Cod: extras_multilingv. Idempotent prin ON CONFLICT (service_id, code).

INSERT INTO service_options
  (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order, icon)
SELECT
  s.id,
  'extras_multilingv',
  'Extras Multilingv',
  'Formular standard UE (Reg. 2016/1191) care însoțește certificatul și redă datele în mai multe limbi — recunoscut în alt stat membru fără traducere.',
  399,
  'fixed',
  true,
  false,
  1,
  6,
  'languages'
FROM services s
WHERE s.slug IN ('certificat-nastere','certificat-casatorie')
ON CONFLICT (service_id, code) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  price       = EXCLUDED.price,
  is_active   = EXCLUDED.is_active,
  max_quantity= EXCLUDED.max_quantity,
  icon        = EXCLUDED.icon,
  updated_at  = now();
