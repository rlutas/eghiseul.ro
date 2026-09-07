-- 152: Costuri de perioadă pe zona unui colaborator (reclamă, abonamente etc.)
--
-- Decontul scădea doar costuri legate de comandă (taxe la instituție, comision
-- procesator). Din 07.09.2026 intră și cheltuielile care țin de serviciile
-- lucrate împreună, dar nu se pot atribui unei comenzi anume — în primul rând
-- bugetul de reclamă (Google Ads pe cadastru/PAD, Meta).
--
-- Se scad din venitul net ÎNAINTE de împărțeala 50/50, ca orice cost real.

CREATE TABLE IF NOT EXISTS collaborator_period_costs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label           text NOT NULL,
  amount_ron      numeric(10,2) NOT NULL CHECK (amount_ron > 0),
  -- Perioada la care se referă cheltuiala (prima zi a lunii, de regulă).
  period_start    date NOT NULL,
  period_end      date NOT NULL,
  category        text NOT NULL DEFAULT 'reclama'
                  CHECK (category IN ('reclama','abonament','instrumente','alt')),
  note            text,
  created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collaborator_period_costs_range CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_collab_period_costs
  ON collaborator_period_costs (collaborator_id, period_start DESC);

ALTER TABLE collaborator_period_costs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE collaborator_period_costs IS
  'Cheltuieli pe perioadă (reclamă, abonamente) pentru serviciile lucrate cu un colaborator; se scad din profit înainte de împărțeală.';
