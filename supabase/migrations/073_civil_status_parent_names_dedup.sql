-- 073_civil_status_parent_names_dedup.sql
--
-- Parent names were collected TWICE on naștere & căsătorie: once in the
-- civil-status step ("Numele complet al tatălui/mamei", full names →
-- civilStatus.parentNames) and again in the personal-data step
-- ("Prenume Tată/Mamă", first names → personalKyc.parentDataRequired).
-- The WPForms originals have a single full-name set. Keep the civil-status
-- one (full names) and turn off the personalKyc duplicate.
--
-- celibat: the WPForms original ([118] birth name, [2]/[4] full parent names)
-- collected birth name + full parent names, but our config didn't. Enable
-- civilStatus.birthName + civilStatus.parentNames and drop the personalKyc
-- first-name-only duplicate.
--
-- Document generation (auto-generate.ts + admin generate-document route) now
-- falls back to customer_data.civil_status.{fatherName,motherName,birthName}
-- when personalData doesn't carry them.

-- naștere & căsătorie: drop personalKyc parent-name duplicate
UPDATE services
SET verification_config = jsonb_set(
  verification_config, '{personalKyc,parentDataRequired}', 'false'::jsonb, true
)
WHERE slug IN ('certificat-nastere', 'certificat-casatorie');

-- celibat: add birthName + full parent names in civil-status, drop personalKyc dup
UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      verification_config, '{civilStatus,fields,parentNames}', 'true'::jsonb, true
    ), '{civilStatus,fields,birthName}', 'true'::jsonb, true
  ), '{personalKyc,parentDataRequired}', 'false'::jsonb, true
)
WHERE slug = 'certificat-celibat';

NOTIFY pgrst, 'reload schema';
