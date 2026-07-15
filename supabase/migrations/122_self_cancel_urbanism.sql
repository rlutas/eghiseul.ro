-- 122_self_cancel_urbanism.sql
-- Politica de anulare 30 min: certificat-urbanism-informare (serviciu nou,
-- migrarea 116) nu avea flag-ul allow_self_cancel setat (null). Endpoint-ul
-- tratează null ca permis (`!== false`), dar config-ul trebuie explicit —
-- null-urile din config au mai mușcat (vezi lecția „!== false" din 2026-07-13).

UPDATE services SET
  processing_config = jsonb_set(
    COALESCE(processing_config, '{}'::jsonb),
    '{allow_self_cancel}',
    'true'::jsonb
  ),
  updated_at = now()
WHERE slug = 'certificat-urbanism-informare'
  AND (processing_config -> 'allow_self_cancel') IS NULL;

NOTIFY pgrst, 'reload schema';
