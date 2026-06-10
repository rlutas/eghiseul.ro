-- 051_cazier_fiscal_pf_name.sql
-- Cazier Fiscal is a PF-locked flow (personal KYC, no client-type picker), so
-- label it explicitly as "Persoană Fizică" — matching cazier-judiciar-persoana-fizica.
-- The wizard now also defaults clientType to 'PF' for such services so the
-- "Motivul solicitării" dropdown shows at step 1.

UPDATE services
SET name = 'Cazier Fiscal Persoană Fizică', updated_at = now()
WHERE slug = 'cazier-fiscal' AND name = 'Cazier Fiscal';
