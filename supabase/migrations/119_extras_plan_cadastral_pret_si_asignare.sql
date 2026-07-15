-- 119_extras_plan_cadastral_pret_si_asignare.sql
-- Decizie Raul 2026-07-15:
-- 1. Extras plan cadastral la 89 lei (aliniat cu extrasul CF — ambele se pot
--    emite intern, nu prin topograf; era 79.99).
-- 2. Scos din asignările colaboratorului (Mircea) — serviciul se lucrează
--    intern. Asignările devin administrabile din /admin/colaboratori.

UPDATE services SET base_price = 89, updated_at = now()
WHERE slug = 'extras-plan-cadastral';

DELETE FROM collaborator_service_assignments
WHERE service_id = (SELECT id FROM services WHERE slug = 'extras-plan-cadastral');

COMMENT ON TABLE collaborator_service_assignments IS
  'Servicii alocate colaboratorilor (topografi) — administrabile din /admin/colaboratori (2026-07-15)';
NOTIFY pgrst, 'reload schema';
