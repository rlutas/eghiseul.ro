-- 145: prioritate manuală pe comandă
--
-- Colaboratorul lucrează comenzile de la cea mai veche la cea mai nouă, ceea ce
-- e corect ca regulă generală. Dar când un client sună sau scrie supărat, acea
-- comandă trebuie să sară în capul listei indiferent de vechime — altfel echipa
-- îi cere colaboratorului „caut-o pe asta" prin 100 de rânduri.
--
-- 0 = normal (implicit), >0 = urcă în capul listei. Sortarea peste tot:
-- priority DESC, created_at ASC.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS priority smallint NOT NULL DEFAULT 0;

COMMENT ON COLUMN orders.priority IS
  'Prioritate manuală în cozile de lucru: 0 = normală, >0 = tratată prima (client nemulțumit, termen ratat). Sortare: priority DESC, created_at ASC.';

NOTIFY pgrst, 'reload schema';
