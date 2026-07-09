-- =============================================
-- Migration: 105_cazier_auto_permis_photos
-- Description: Cazierul auto cere de acum POZA permisului de conducere
--              (față + verso) la pasul KYC — obligatoriu, ca pe
--              cazierjudiciaronline.com. Numărul permisului se colecta deja
--              (vehicleVerification.drivingLicense, migrarea 075), dar poza
--              lipsea (regresie găsită pe E-260709-WT4KL: comanda a intrat
--              fără nicio poză de permis).
--              verification_config changes MUST be migrations (vezi
--              kyc-guard-coverage — driftul de config a mai scăpat o dată).
-- Date: 2026-07-09
-- =============================================

UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{personalKyc,extraDocuments}',
  '["permis_fata", "permis_verso"]'::jsonb
)
WHERE slug = 'cazier-auto'
  AND verification_config->'personalKyc' IS NOT NULL;

-- Verification:
-- SELECT verification_config->'personalKyc'->'extraDocuments' FROM services WHERE slug='cazier-auto';

NOTIFY pgrst, 'reload schema';
