-- 121_cazier_auto_fara_vin.sql
-- Cazier auto = fișa conducătorului auto: se lucrează pe NR. PERMISULUI, nu pe
-- vehicul. vinValidation=true forța câmpul "Serie șasiu (VIN)" în wizard deși
-- vin.required=false (VehicleDataStep îl randează la required SAU vinValidation).
-- Raportat de Raul 2026-07-15; aliniere cu cazierjudiciaronline.com.

UPDATE services SET
  verification_config = jsonb_set(
    verification_config,
    '{vehicleVerification,vinValidation}',
    'false'::jsonb
  ),
  updated_at = now()
WHERE slug = 'cazier-auto'
  AND verification_config -> 'vehicleVerification' IS NOT NULL;

NOTIFY pgrst, 'reload schema';
