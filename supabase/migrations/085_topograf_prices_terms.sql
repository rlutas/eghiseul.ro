-- 085_topograf_prices_terms.sql
-- Real prices + delivery terms for the 14 topograph services, aligned to the
-- cfunciara.ro market (docs/services/ancpi-servicii-costuri.csv).
--
-- base_price is VAT-INCLUSIVE in our schema; service pages show the ex-VAT
-- headline (base_price / 1.21) + "cu TVA" total. cfunciara quotes ex-VAT
-- ("139 lei + TVA"), so base_price = cfunciara_base * 1.21:
--   139 -> 168.19 ; 179 -> 216.59 ; 250 -> 302.50
-- estimated_days = numeric (wizard sidebar); processing_config.estimated_days_display
-- = the string shown on the service page (see memory pricing-delivery-terms).
-- Urgency (Prioritate) is handled separately (service_options), not here.

-- 250 + TVA, 4 zile
UPDATE services SET base_price = 302.50, estimated_days = 4, urgent_available = false,
  processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{estimated_days_display}', '"4 zile lucrătoare"', true),
  updated_at = now() WHERE slug = 'certificat-sarcini';

-- 139 + TVA, 4 zile
UPDATE services SET base_price = 168.19, estimated_days = 4, urgent_available = false,
  processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{estimated_days_display}', '"4 zile lucrătoare"', true),
  updated_at = now() WHERE slug IN ('copie-carte-funciara', 'extras-cf-colectiv');

-- 179 + TVA, 4 zile
UPDATE services SET base_price = 216.59, estimated_days = 4, urgent_available = false,
  processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{estimated_days_display}', '"4 zile lucrătoare"', true),
  updated_at = now() WHERE slug IN (
    'copie-plan-cadastral', 'copie-inventar-coordonate', 'copie-intabulare',
    'copie-releveu', 'copie-arhiva-ocpi', 'copie-contract-vanzare',
    'plan-amplasament-delimitare', 'copie-plan-incadrare'
  );

-- 250 + TVA, 5 zile
UPDATE services SET base_price = 302.50, estimated_days = 5, urgent_available = false,
  processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{estimated_days_display}', '"5 zile lucrătoare"', true),
  updated_at = now() WHERE slug IN ('identificare-imobile-proprietar', 'certificat-detineri-imobile');

-- 250 + TVA, 15 zile
UPDATE services SET base_price = 302.50, estimated_days = 15, urgent_available = false,
  processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{estimated_days_display}', '"15 zile lucrătoare"', true),
  updated_at = now() WHERE slug = 'actualizare-adresa-cf';

NOTIFY pgrst, 'reload schema';
