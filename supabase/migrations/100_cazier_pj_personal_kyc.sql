-- Migration 100: Re-enable personal KYC (buletin administrator + selfie) for
-- cazier judiciar Persoană Juridică
-- Date: 2026-07-08
--
-- Context: order E-260708-VC4GH completed the wizard WITHOUT the legal
-- representative's ID and selfie. Not a client-side bypass — the service's
-- verification_config had personalKyc.enabled=false + acceptedDocuments=[],
-- so the wizard never built the KYC step and the server-side guard added the
-- same morning (commit 7192d5e, keyed on personalKyc.enabled) skipped the
-- order entirely.
--
-- Original design (migration 012) HAD personalKyc enabled for this service
-- (representative CI + selfie); it was disabled directly in the DB at some
-- point before 2026-05-28 (migration 046 already lists it as disabled) with
-- no migration recording the change. Legacy config.kyc_requirements still
-- says representative_id + selfie = true.
--
-- Fix: replace the WHOLE personalKyc object (not a key-level patch) so the
-- migration is reproducible from a clean replay and finally records the real
-- production shape: simplified PF flow, same as cazier-auto — selfie
-- required, no parent data, no address certificate. COALESCE guards against
-- a NULL verification_config (jsonb_set on NULL would silently wipe the
-- config), and create_missing=true creates the personalKyc key if absent.
-- Data-only change (jsonb), no DDL — PostgREST schema cache unaffected.

UPDATE services
SET verification_config = jsonb_set(
  COALESCE(verification_config, '{}'::jsonb),
  '{personalKyc}',
  '{
    "enabled": true,
    "selfieRequired": true,
    "parentDocuments": { "enabled": false },
    "citizenshipFlows": {
      "foreign":  { "documents": ["passport", "registration_cert", "selfie"] },
      "european": { "documents": ["passport", "residence_permit", "selfie"] },
      "romanian": { "documents": ["ci_or_passport", "selfie"] }
    },
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
    "signatureRequired": false,
    "parentDataRequired": false,
    "expiredDocumentAllowed": false,
    "requireAddressCertificate": "never"
  }'::jsonb,
  true
)
WHERE slug = 'cazier-judiciar-persoana-juridica';

-- Verify
SELECT
  slug,
  verification_config->'personalKyc'->>'enabled'          AS pk_enabled,
  verification_config->'personalKyc'->>'selfieRequired'   AS selfie_required,
  verification_config->'personalKyc'->'acceptedDocuments' AS accepted_documents,
  verification_config->'personalKyc'->>'parentDataRequired' AS parent_data_required,
  verification_config->'personalKyc'->>'requireAddressCertificate' AS require_address_cert
FROM services
WHERE slug = 'cazier-judiciar-persoana-juridica';
