-- Migration 038: Update standard processing display for cazier judiciar
--
-- User feedback: termenul real de procesare pentru cazier judiciar e 2-4 zile,
-- nu 5-7 cum afișam. Adăugăm un display string în processing_config ca să
-- arătăm un RANGE (2-4) în loc de un singur număr (3) — UX mai onest.
--
-- DB `estimated_days` rămâne 3 (median, folosit pentru SLA calcule interne).
-- Display text iese din `processing_config.estimated_days_display`.

BEGIN;

UPDATE services
SET processing_config = processing_config || jsonb_build_object(
  'estimated_days_display', '2-4 zile lucrătoare'
),
updated_at = NOW()
WHERE slug IN (
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica'
);

COMMIT;
