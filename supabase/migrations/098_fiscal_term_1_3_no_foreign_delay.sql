-- 098: Cazier fiscal — termen 1-3 zile lucrătoare peste tot + FĂRĂ prelungire
--      pentru cetățeni străini
--
-- Echipa a semnalat: (1) pagina afișa 2-4 zile, termenul real e 1-3;
-- (2) textul „cetățenii străini necesită verificări suplimentare (7-15 zile)"
-- NU e valabil la fiscal — ANAF nu prelungește pentru străini. Wizard-ul
-- citește acum extraDays din config (contact-step), deci punem 0.

UPDATE services SET
  processing_config = jsonb_set(
    COALESCE(processing_config, '{}'::jsonb),
    '{estimated_days_display}', '"1-3 zile lucrătoare"'
  ),
  estimated_days = 3,
  verification_config = jsonb_set(
    jsonb_set(
      verification_config,
      '{personalKyc,citizenshipFlows,foreign,extraDays}', '0'
    ),
    '{personalKyc,citizenshipFlows,european,extraDays}', '0'
  ),
  updated_at = now()
WHERE slug = 'cazier-fiscal';
