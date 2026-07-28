-- Migration 139: cazier auto — paritate cu cazierjudiciaronline.com
--
-- Cerințe Raul (28.07.2026), toate pe serviciul `cazier-auto`:
--
-- 1. „Permis de conducere din străinătate" LIPSEA complet pe eghiseul, deși
--    există pe CJO (`enablePermisStrain` în src/config/auto.config.ts): fișa se
--    cere autorității care a emis permisul, deci alt tarif și alt termen.
--    Valorile sunt cele de pe CJO: 350 RON (vs 198) și 7-10 zile lucrătoare
--    (vs 3-5). Prețul înlocuiește base_price-ul, ca variantele de constatator.
--
-- 2. „Sunt cetățean străin" NU trebuie să apară la cazier auto — ce contează
--    aici e unde a fost emis PERMISUL, nu cetățenia. Se stinge prin
--    personalKyc.allowForeignCitizen = false (același comutator folosit de
--    documentele de stare civilă).
--
-- 3. Câmpul „Numărul Permisului de Conducere" se scoate — numărul se citește
--    din poza permisului (drivingLicense.required = false). Pasul rămâne, dar
--    conține doar întrebarea „emis în România / străinătate".
--
-- 4. Poza VERSO a permisului nu e necesară → extraDocuments păstrează doar
--    `permis_fata`. Codul continuă să suporte `permis_verso` pentru comenzile
--    deja plasate.
UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        verification_config,
        '{personalKyc,allowForeignCitizen}', 'false'::jsonb, true
      ),
      '{personalKyc,extraDocuments}', '["permis_fata"]'::jsonb, true
    ),
    '{vehicleVerification,fields,drivingLicense,required}', 'false'::jsonb, true
  ),
  '{vehicleVerification,foreignLicense}',
  jsonb_build_object(
    'enabled', true,
    'price', 350,
    'minDays', 7,
    'maxDays', 10,
    'daysDisplay', '7-10 zile lucrătoare'
  ),
  true
)
WHERE slug = 'cazier-auto';

NOTIFY pgrst, 'reload schema';
