-- 147: Alocă topografului (Mircea) și serviciile de identificare imobil +
-- extras de plan cadastral.
--
-- Context 2026-08-24: portalul ANCPI e picat din 13 iulie și doar el poate
-- lucra aceste comenzi (acces de profesionist). Avea deja extras-carte-funciara
-- (alocat 19.08) și restul serviciilor imobiliare, dar NU pe astea trei —
-- deci 29 de comenzi plătite (15 identificare-imobil, 3 identificare după
-- proprietar, 11 extras-plan-cadastral) nu îi apăreau în portal.
--
-- Idempotent: nu dublează alocările existente.

INSERT INTO collaborator_service_assignments (collaborator_id, service_id, can_upload_pdf)
SELECT p.id, s.id, true
FROM profiles p
JOIN services s ON s.slug IN (
  'identificare-imobil',
  'identificare-imobile-proprietar',
  'extras-plan-cadastral'
)
WHERE p.email = 'mirceadumitrean@yahoo.com'
  AND p.role = 'collaborator'
  AND NOT EXISTS (
    SELECT 1 FROM collaborator_service_assignments csa
    WHERE csa.collaborator_id = p.id AND csa.service_id = s.id
  );

NOTIFY pgrst, 'reload schema';
