-- 203: cazier-judiciar (PF/PJ choice) asks for the company registration
-- certificate when the client is a company.
--
-- The PJ-only service `cazier-judiciar-persoana-juridica` had
-- `documentsRequired: true` + `requiredDocuments: ['company_registration_cert']`.
-- The combined `cazier-judiciar` service enabled companyKyc for
-- `client_type == 'PJ'` but never set those two keys, so the step builder
-- skipped the „Documente firmă" step: 5 paid PJ orders (19.10–06.11.2026,
-- e.g. E-261105-7ZTJ7) reached the team without the CUI certificate.
--
-- Value-only update, no schema change: no PostgREST reload needed.

UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(verification_config, '{companyKyc,documentsRequired}', 'true'::jsonb),
  '{companyKyc,requiredDocuments}', '["company_registration_cert"]'::jsonb
)
WHERE slug = 'cazier-judiciar';
