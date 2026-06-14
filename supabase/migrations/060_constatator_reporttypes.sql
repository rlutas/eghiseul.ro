-- 060_constatator_reporttypes.sql
-- ONRC step 4 (Tip Document) for "pe Firmă" offers 3 report types — mirror them
-- on our form. PF has no report-type picker here (manual flow). "Altele" purpose
-- shows a free-text input (already in the wizard); the worker sends it to ONRC
-- as documentTypeOtherReason. Auto-issued path covers "de bază"; IMM/insolvență
-- fall back to NEEDS_OPERATOR when their (different) purpose can't be auto-mapped.
UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{constatator,documentTypes}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN dt->>'value' = 'firma'
          THEN dt || jsonb_build_object('reportTypes', jsonb_build_array(
            'Certificat constatator de bază',
            'Certificat constatator fonduri IMM',
            'Certificat constatator pentru insolvență'))
        WHEN dt->>'value' = 'pf' THEN dt - 'reportTypes'
        ELSE dt
      END)
    FROM jsonb_array_elements(verification_config->'constatator'->'documentTypes') dt
  )
)
WHERE slug = 'certificat-constatator';
NOTIFY pgrst, 'reload schema';
