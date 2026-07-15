-- 124_rovinieta_fara_anulare.sql
-- Politica de anulare (Raul, 2026-07-15): rovinieta odata emisa nu poate fi
-- anulata (valabilitatea porneste la emitere, CNAIR nu ramburseaza) — iese
-- din fereastra de 30 min. Pagina /politica-de-anulare o muta automat la
-- exceptii (lista e generata din acest flag).

UPDATE services SET
  processing_config = jsonb_set(
    COALESCE(processing_config, '{}'::jsonb),
    '{allow_self_cancel}',
    'false'::jsonb
  ),
  updated_at = now()
WHERE slug = 'rovinieta';

NOTIFY pgrst, 'reload schema';
