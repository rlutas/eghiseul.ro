-- 067_ancpi_options_urgency_extra.sql
-- Extras carte funciară options:
--  - remove the obsolete urgency fee (the worker emits in ~minutes, 24/7 — there
--    is nothing to "rush"; standard delivery is already instant),
--  - add a per-item "extras suplimentar" option (49.99 RON) for the multi-imobil
--    "Adaugă un extras" flow. It's driven by the Property module (quantity =
--    number of additional imobile), hidden from the manual Options toggles.

UPDATE service_options
SET is_active = false, updated_at = now()
WHERE code = 'urgenta'
  AND service_id = (SELECT id FROM services WHERE slug = 'extras-carte-funciara');

INSERT INTO service_options (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, config, display_order, icon)
SELECT
  s.id, 'extras_suplimentar', 'Extras suplimentar',
  'Un extras de carte funciară pentru un imobil suplimentar (același județ).',
  49.99, 'fixed', true, false, 24, '{"per_item": true}'::jsonb, 5, 'plus'
FROM services s
WHERE s.slug = 'extras-carte-funciara'
  AND NOT EXISTS (
    SELECT 1 FROM service_options o WHERE o.service_id = s.id AND o.code = 'extras_suplimentar'
  );

NOTIFY pgrst, 'reload schema';
