-- 089_service_self_cancel.sql
-- Per-service toggle for the 30-minute customer self-cancel (processing_config.allow_self_cancel).
-- Default ON (preserves current behavior); OFF for instant-automated services that enter
-- processing immediately (extras CF + certificat constatator) — there is no window to cancel.
-- Editable from /admin/settings → Servicii → Edit.

UPDATE services
SET processing_config = jsonb_set(coalesce(processing_config, '{}'::jsonb), '{allow_self_cancel}', 'true'::jsonb, true),
    updated_at = now();

UPDATE services
SET processing_config = jsonb_set(processing_config, '{allow_self_cancel}', 'false'::jsonb, true),
    updated_at = now()
WHERE slug IN ('extras-carte-funciara', 'certificat-constatator');

NOTIFY pgrst, 'reload schema';
