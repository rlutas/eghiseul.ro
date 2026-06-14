-- 053_civil_status_module.sql
-- Civil-status wizard module for certificat naștere / căsătorie / celibat.
--
-- 1. Price: real price is ~1190 RON (the 179 placeholder was wrong). Set
--    naștere + căsătorie to 998 RON (per business decision 2026-06-14).
-- 2. verification_config.civilStatus: enable the new "civil-status" wizard step
--    with per-service field flags (marital history, spouse/birth names, parents,
--    purpose, country-of-use, etc.) — see src/types/verification-modules.ts.
--
-- Applied live via REST on 2026-06-14; this file is the reproducible record.

-- 1) Prices ------------------------------------------------------------------
UPDATE services SET base_price = 998 WHERE slug IN ('certificat-nastere', 'certificat-casatorie');

-- 2) Civil-status config (JSONB merge into existing verification_config) ------
-- Field set mirrors the live WPForms conditional logic (born/married abroad
-- transcription warnings, renounced-citizenship CNP note, marital history).
UPDATE services
SET verification_config = verification_config || jsonb_build_object(
  'civilStatus', jsonb_build_object(
    'enabled', true,
    'documentType', 'nastere',
    'fields', jsonb_build_object(
      'applicantType', true, 'birthPlace', true, 'currentlyMarried', true,
      'maritalHistory', true, 'marriagePlace', true, 'renouncedCitizenship', true,
      'birthName', true, 'parentNames', true, 'registrationPlace', true,
      'purpose', true, 'countryOfUse', true
    )
  )
)
WHERE slug = 'certificat-nastere';

UPDATE services
SET verification_config = verification_config || jsonb_build_object(
  'civilStatus', jsonb_build_object(
    'enabled', true,
    'documentType', 'casatorie',
    'fields', jsonb_build_object(
      'maritalHistory', true, 'marriagePlace', true, 'spouseName', true,
      'marriageDate', true, 'registrationPlace', true, 'birthName', true,
      'parentNames', true, 'renouncedCitizenship', true, 'purpose', true,
      'countryOfUse', true
    )
  )
)
WHERE slug = 'certificat-casatorie';

UPDATE services
SET verification_config = verification_config || jsonb_build_object(
  'civilStatus', jsonb_build_object(
    'enabled', true,
    'documentType', 'celibat',
    'fields', jsonb_build_object(
      'maritalStatus', true, 'maritalHistory', true, 'marriagePlace', true,
      'registrationPlace', true, 'renouncedCitizenship', true, 'purpose', true,
      'countryOfUse', true
    )
  )
)
WHERE slug = 'certificat-celibat';

-- No schema change (value-only update) → no PostgREST schema reload needed.
