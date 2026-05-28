-- Migration 046: Apply Step 2 simplification to other cazier services
-- Date: 2026-05-28
--
-- Context: migration 039 simplified Step 2 for cazier-judiciar (drops
-- parents field + drops address-certificate block on the wizard). User
-- decided 2026-05-28 to roll out the same simplification to other
-- PF-targeted cazier services so the wizard UX is consistent.
--
-- Affected services (PK enabled, currently NOT simplified):
--   - cazier-fiscal:                     parents=false, addr='ci_nou_passport' → drop addr cert
--   - cazier-judiciar-persoana-fizica:   parents=true, addr='ci_nou_passport' → drop both
--
-- NOT affected:
--   - cazier-judiciar (already simplified by migration 039)
--   - cazier-auto, cazier-judiciar-persoana-juridica (personalKyc disabled)
--
-- Net effect: Step 2 picker (CI vechi / CI nou / Pașaport) + scan zones
-- per type now applies to all PF cazier services. Address comes from
-- Step 4 (livrare) for ci_vechi + passport, or from RO CEI Reader PDF
-- for ci_nou — consistent with cazier-judiciar.

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
WHERE slug IN ('cazier-fiscal', 'cazier-judiciar-persoana-fizica');

-- Verify
SELECT
  slug,
  verification_config->'personalKyc'->>'parentDataRequired'        AS parent_data_required,
  verification_config->'personalKyc'->>'requireAddressCertificate' AS require_address_cert
FROM services
WHERE slug LIKE 'cazier%' OR slug LIKE 'integritate%'
ORDER BY slug;
