-- 086_topograf_urgency.sql
-- Priority (Prioritate) urgency option per topograph service, mirroring
-- cfunciara.ro exactly. cfunciara surcharges are ex-VAT; our prices are
-- VAT-inclusive, so surcharge stored = cfunciara_surcharge * 1.21:
--   +111 -> 134.31 ; +151 -> 182.71 ; +211 -> 255.31 ; +350 -> 423.50
-- Priority term: 2 zile (5 zile for actualizare-adresa). Services with no
-- urgency at cfunciara (certificat-sarcini, identificare-imobile-proprietar,
-- certificat-detineri-imobile) are left without an urgency option.
--
-- Urgency is a `service_options` row (code='urgenta', fixed price) + the
-- service's urgent_available/urgent_days flags. Idempotent via the existing
-- UNIQUE(service_id, code) constraint.

-- urgent flags: 2-day priority group
UPDATE services SET urgent_available = true, urgent_days = 2, updated_at = now()
WHERE slug IN (
  'copie-carte-funciara', 'extras-cf-colectiv',
  'copie-inventar-coordonate', 'copie-releveu', 'copie-arhiva-ocpi',
  'copie-plan-cadastral', 'copie-intabulare', 'copie-contract-vanzare',
  'plan-amplasament-delimitare', 'copie-plan-incadrare'
);
-- actualizare-adresa: 5-day priority (vs 15 standard)
UPDATE services SET urgent_available = true, urgent_days = 5, updated_at = now()
WHERE slug = 'actualizare-adresa-cf';

-- +151 -> 182.71 (extrase / CF colectivă)
INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order)
SELECT id, 'urgenta', 'Procesare Prioritară', 'Obținere în 2 zile lucrătoare în loc de 4 zile.', 182.71, 'fixed', true, false, 1, 1
FROM services WHERE slug IN ('copie-carte-funciara', 'extras-cf-colectiv')
ON CONFLICT (service_id, code) DO UPDATE
  SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
      price_type = EXCLUDED.price_type, is_active = true, updated_at = now();

-- +111 -> 134.31 (copii simple)
INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order)
SELECT id, 'urgenta', 'Procesare Prioritară', 'Obținere în 2 zile lucrătoare în loc de 4 zile.', 134.31, 'fixed', true, false, 1, 1
FROM services WHERE slug IN ('copie-inventar-coordonate', 'copie-releveu', 'copie-arhiva-ocpi')
ON CONFLICT (service_id, code) DO UPDATE
  SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
      price_type = EXCLUDED.price_type, is_active = true, updated_at = now();

-- +211 -> 255.31 (copii cu lucrare de topograf)
INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order)
SELECT id, 'urgenta', 'Procesare Prioritară', 'Obținere în 2 zile lucrătoare în loc de 4 zile.', 255.31, 'fixed', true, false, 1, 1
FROM services WHERE slug IN ('copie-plan-cadastral', 'copie-intabulare', 'copie-contract-vanzare', 'plan-amplasament-delimitare', 'copie-plan-incadrare')
ON CONFLICT (service_id, code) DO UPDATE
  SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
      price_type = EXCLUDED.price_type, is_active = true, updated_at = now();

-- +350 -> 423.50 (actualizare adresă: 5 zile vs 15)
INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order)
SELECT id, 'urgenta', 'Procesare Prioritară', 'Obținere în 5 zile lucrătoare în loc de 15 zile.', 423.50, 'fixed', true, false, 1, 1
FROM services WHERE slug = 'actualizare-adresa-cf'
ON CONFLICT (service_id, code) DO UPDATE
  SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
      price_type = EXCLUDED.price_type, is_active = true, updated_at = now();

NOTIFY pgrst, 'reload schema';
