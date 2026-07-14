-- 116_certificat_urbanism.sql
-- Certificat de urbanism pentru informare — service parity with cfunciara.ro
-- (780 lei + TVA acolo, taxe incluse). Manually fulfilled: cererea se depune la
-- primăria localității imobilului; termen legal de eliberare ~30 zile lucrătoare.
-- Folosit la achiziții de teren/casă (ce se poate construi: POT/CUT, restricții,
-- interdicții) — upsell din calculatorul de credit ipotecar + articolele imobiliare.
--
-- Same shape as the topograf services (migration 084): PropertyDataStep with
-- identificationService enabled so ADDRESS-only orders are valid (clientul are
-- adresa terenului; CF/cadastral opționale), no KYC, digital delivery.
-- Idempotent on slug.

INSERT INTO services (
  slug, code, name, description, short_description, category, base_price, currency,
  is_active, is_featured, requires_kyc, estimated_days, urgent_available, urgent_days,
  display_order, verification_config, processing_config
) VALUES
  (
    'certificat-urbanism-informare',
    'SRV-CFURB',
    'Certificat de Urbanism pentru Informare',
    'Certificat de urbanism în scop de informare, obținut de la primăria localității imobilului: regim juridic, economic și tehnic — ce se poate construi (POT/CUT), restricții și interdicții. Recomandat înainte de cumpărarea unui teren.',
    'Afli ce se poate construi pe un teren înainte să cumperi: regim tehnic, juridic și economic, de la primărie.',
    'imobiliare',
    780,
    'RON',
    true, false, false,
    30,
    false, 10,
    53,
    '{"signature":{"enabled":false,"required":false,"termsAcceptanceRequired":false},"companyKyc":{"enabled":false,"validation":"manual","allowedTypes":[],"autoComplete":false,"blockedTypes":[],"specialRules":[]},"personalKyc":{"enabled":false,"selfieRequired":false,"parentDocuments":{"enabled":false},"citizenshipFlows":{"foreign":{"documents":["passport"]},"european":{"documents":["passport"]},"romanian":{"documents":["ci_or_passport"]}},"acceptedDocuments":["ci_vechi","ci_nou_front","ci_nou_back","passport"],"signatureRequired":false,"parentDataRequired":false,"expiredDocumentAllowed":false,"requireAddressCertificate":"never"},"vehicleVerification":{"fields":{"vin":{"required":false},"year":{"required":false},"brand":{"required":false},"model":{"required":false},"period":{"required":false},"category":{"required":false},"plateNumber":{"required":false}},"enabled":false,"plateFormat":"romanian","vinValidation":false},"propertyVerification":{"enabled":true,"fields":{"county":{"required":true},"locality":{"required":true},"carteFunciara":{"required":false},"cadastral":{"required":false},"topografic":{"required":false}},"identificationService":{"enabled":true,"extraFields":["address"]}}}'::jsonb,
    '{"estimated_days_display":"cca. 30 de zile lucrătoare (termen legal primărie)"}'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
