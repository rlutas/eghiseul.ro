-- 072_civil_status_remove_extra_options.sql
--
-- The civil-status services (certificat de naștere / căsătorie / celibat)
-- exposed two add-on options that do NOT exist in the legacy WPForms
-- originals: "Verificare de Expert" (verificare_expert) and
-- "Copii Suplimentare" (copii_suplimentare). Remove them from these three
-- services to match the source forms.
--
-- Deactivated (is_active = false) rather than deleted, so historical orders
-- that reference these option rows stay intact. The public wizard
-- (/api/services/[slug]) only loads options WHERE is_active = true, so this
-- hides them from the form.
--
-- "cetatean strain" was already removed for these services via the
-- personalKyc.allowForeignCitizen flag (migration 071) — no service_option
-- row exists for it here.

UPDATE service_options
SET is_active = false
WHERE code IN ('verificare_expert', 'copii_suplimentare')
  AND service_id IN (
    SELECT id FROM services
    WHERE slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
  );
