-- 107: Topograf fee (15 RON) on the two manual cadastral services missed by 087.
--
-- Found 2026-07-10 while building the collaborator settlement view: the
-- monthly total showed 0.00 RON because identificare-imobil and
-- extras-plan-cadastral had lawyer_fee_ron = 0. Both are fulfilled manually by
-- the topograph, same as the rest of the cadastral catalog → same 15 RON fee.
-- extras-carte-funciara stays 0 on purpose (fulfilled by the ANCPI worker, no
-- topograph involved).

UPDATE services
SET lawyer_fee_ron = 15
WHERE slug IN ('identificare-imobil', 'extras-plan-cadastral')
  AND (lawyer_fee_ron IS NULL OR lawyer_fee_ron = 0);

COMMENT ON COLUMN services.lawyer_fee_ron IS
  'Per-order collaborator fee in RON: lawyer (Barou) services and topograf cadastral services (15 RON). 0 = no collaborator involved (e.g. extras-carte-funciara, automated via ANCPI worker).';

NOTIFY pgrst, 'reload schema';
