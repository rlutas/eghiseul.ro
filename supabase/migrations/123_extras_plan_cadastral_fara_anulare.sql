-- 123_extras_plan_cadastral_fara_anulare.sql
-- Politica de anulare (Raul, 2026-07-15): extrasul de plan cadastral intra in
-- procesare imediata (ca extrasul CF) — nu poate fi anulat in fereastra de
-- 30 min. Pagina /politica-de-anulare il muta automat la exceptii (lista e
-- generata din acest flag).

UPDATE services SET
  processing_config = jsonb_set(
    COALESCE(processing_config, '{}'::jsonb),
    '{allow_self_cancel}',
    'false'::jsonb
  ),
  updated_at = now()
WHERE slug = 'extras-plan-cadastral';

NOTIFY pgrst, 'reload schema';
