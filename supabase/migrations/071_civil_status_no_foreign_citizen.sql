-- 071_civil_status_no_foreign_citizen.sql
--
-- Civil-status documents (certificat de naștere / căsătorie / celibat) are
-- issued by the Romanian civil registry only for persons registered there,
-- so there is no "foreign citizen" application path — unlike cazier judiciar,
-- where foreign residents legitimately apply.
--
-- The WPForms originals for these three services have NO foreign-citizen
-- question. Our modular wizard showed the "Sunt cetățean străin" toggle for
-- every PF service. We gate it per-service via
-- verification_config.personalKyc.allowForeignCitizen (default = shown when
-- undefined/true). Set it to false for the three civil-status services.
--
-- contact-step.tsx reads this flag; see PersonalKYCConfig.allowForeignCitizen.

UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{personalKyc,allowForeignCitizen}',
  'false'::jsonb,
  true
)
WHERE slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
  AND verification_config -> 'personalKyc' IS NOT NULL;

-- Reload PostgREST schema cache (no-op for data-only change, but harmless).
NOTIFY pgrst, 'reload schema';
