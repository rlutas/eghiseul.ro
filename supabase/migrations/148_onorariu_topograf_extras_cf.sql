-- 148: Onorariu topograf 20 RON pe extras-carte-funciara.
--
-- 107 left extras-carte-funciara at 0 on purpose: the ANCPI worker fulfilled
-- it, no topograph involved. That stopped being true on 13.07 when the ANCPI
-- ePay portal died — since the 21.08 handover Mircea works every extras CF
-- manually, but the earnings view still showed 0.00 for them (flagged in the
-- 26.08 settlement as an open issue, decided today: 20 RON per extras CF).
--
-- The fee is read live from services at settlement time, so the whole history
-- of manually-worked extras CF orders picks it up too — which is exactly the
-- retroactive adjustment agreed in the settlement.

UPDATE services
SET lawyer_fee_ron = 20
WHERE slug = 'extras-carte-funciara';

COMMENT ON COLUMN services.lawyer_fee_ron IS
  'Per-order collaborator fee in RON: lawyer (Barou) services; topograf cadastral services (15 RON, extras-carte-funciara 20 RON since the ANCPI worker died and the topograph works them manually). 0 = no collaborator involved.';

NOTIFY pgrst, 'reload schema';
