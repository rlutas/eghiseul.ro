-- Migration 039: Simplify Step 2 (date personale) for cazier-judiciar PF
-- Date: 2026-05-27
--
-- Rationale: Customers were getting lost between Step 2 (date personale) and
-- Step 3 (verification documents) because the form asked for too many fields.
-- Talked with team — for cazier judiciar PF we don't strictly need father/mother
-- names or domiciliu address on the form (UI level); admin can correct anything
-- post-submit and these aren't blockers for processing.
--
-- Changes for the `cazier-judiciar` service `verification_config.personalKyc`:
--   - parentDataRequired:        true  -> false   (drop "Prenume Tata" + "Prenume Mama")
--   - requireAddressCertificate: 'ci_nou_passport' -> 'never'
--                                                 (drop the entire "Adresă de Domiciliu"
--                                                 block on Step 2; delivery address is
--                                                 still collected separately on Step 4)
--
-- These can be reverted by running the inverse UPDATE.

UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    verification_config,
    '{personalKyc,parentDataRequired}',
    'false'::jsonb
  ),
  '{personalKyc,requireAddressCertificate}',
  '"never"'::jsonb
)
WHERE slug = 'cazier-judiciar';

-- Verify (visible in psql / Supabase logs)
SELECT
  slug,
  verification_config->'personalKyc'->>'parentDataRequired'        AS parent_data_required,
  verification_config->'personalKyc'->>'requireAddressCertificate' AS require_address_cert
FROM services
WHERE slug = 'cazier-judiciar';
