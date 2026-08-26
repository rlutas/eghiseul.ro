-- 149: Revert 148 — extras-carte-funciara has NO per-order collaborator fee.
--
-- 148 misread the request: the "20 RON per extras CF" from the 26.08
-- discussion is the ANCPI eliberare cost (already correct in
-- taxe-eliberare.ts and order_supplier_costs), NOT an onorariu. Raul's
-- correction: the lawyer/collaborator fee does not apply to extras CF —
-- the 0.00 in the earnings view was right all along.

UPDATE services
SET lawyer_fee_ron = 0
WHERE slug = 'extras-carte-funciara';

COMMENT ON COLUMN services.lawyer_fee_ron IS
  'Per-order collaborator fee in RON: lawyer (Barou) services and topograf cadastral services (15 RON). 0 = no per-order fee (e.g. extras-carte-funciara — the 20 RON there is the ANCPI eliberare cost, tracked in order_supplier_costs, not a fee).';

NOTIFY pgrst, 'reload schema';
