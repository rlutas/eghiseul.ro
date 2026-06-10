-- 050_rename_certificat_integritate_slug.sql
-- Shorten the Certificat de Integritate service slug so its public URL is
-- /servicii/certificat-integritate (the homepage hero already links there).
-- The DB had the long slug `certificat-integritate-comportamentala`, which
-- 404'd. The display name stays "Certificat de Integritate Comportamentală".
--
-- Also fix the bundled-add-on references on the cazier services, which point
-- at the old slug via service_options.config->>'addon_service_slug'.
--
-- Orders reference the service by service_id (UUID), so existing orders are
-- unaffected by the slug change.

UPDATE services
SET slug = 'certificat-integritate', updated_at = now()
WHERE slug = 'certificat-integritate-comportamentala';

UPDATE service_options
SET config = jsonb_set(config, '{addon_service_slug}', '"certificat-integritate"'),
    updated_at = now()
WHERE code = 'addon_certificat_integritate'
  AND config->>'addon_service_slug' = 'certificat-integritate-comportamentala';
