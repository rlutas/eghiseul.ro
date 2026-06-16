-- 066_ancpi_service_automated_flow.sql
-- Align the `extras-carte-funciara` service to the automated, cfunciara-style flow:
--  - no ID/KYC for a public CF extract (only terms consent) → drop the KYC step,
--  - delivery is now ~minutes (automated via the ANCPI worker), not 5 days,
--  - refresh the customer-facing copy accordingly.
-- (Property module + pricing 79.99 RON are kept.)

UPDATE services
SET
  requires_kyc = false,
  estimated_days = 1,
  urgent_days = 1,
  verification_config = jsonb_set(
    verification_config, '{personalKyc,enabled}', 'false'::jsonb, true
  ),
  description = 'Extras de carte funciară pentru informare, obținut automat de la ANCPI. Conține situația cadastral-juridică a imobilului: proprietar, suprafață, sarcini și ipoteci. Alegi județul și localitatea, introduci numărul de carte funciară sau cadastral, plătești online și primești documentul pe email în câteva minute (dacă sistemul ANCPI este operațional).',
  short_description = 'Extras CF oficial de la ANCPI, livrat pe email în câteva minute.',
  meta_description = 'Extras de Carte Funciară online de la ANCPI, livrat pe email în câteva minute. Document oficial cu proprietar, suprafață și sarcini. Fără deplasări la ghișeu.',
  updated_at = now()
WHERE slug = 'extras-carte-funciara';

NOTIFY pgrst, 'reload schema';
