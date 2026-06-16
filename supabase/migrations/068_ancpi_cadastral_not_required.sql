-- 068_ancpi_cadastral_not_required.sql
-- Bugfix: at step 2 the "Continuă" button stayed disabled when the client filled
-- only the CF number, because propertyVerification.fields.cadastral.required was
-- true. CF / cadastral / topo are ALTERNATIVE identifiers — the wizard already
-- enforces "at least one". Make cadastral not individually required.

UPDATE services
SET verification_config = jsonb_set(
      verification_config, '{propertyVerification,fields,cadastral,required}', 'false'::jsonb, true
    ),
    updated_at = now()
WHERE slug = 'extras-carte-funciara';

NOTIFY pgrst, 'reload schema';
