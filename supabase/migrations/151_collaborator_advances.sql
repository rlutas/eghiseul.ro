-- 151: Avansuri trimise colaboratorilor pentru taxele instituțiilor
--
-- Raul îi trimite lui Mircea bani în cont (Revolut) ca să poată plăti taxele
-- OCPI la depunere. Până acum urmărirea se făcea din extrasul de cont, deci
-- soldul real (cât a primit vs. cât a consumat în taxe) nu se vedea nicăieri
-- în platformă și nu putea fi confruntat la decont.
--
-- Tabela ține doar banii TRIMIȘI. Consumul e deja în order_supplier_costs
-- (taxele per comandă), iar soldul se calculează din diferență.

CREATE TABLE IF NOT EXISTS collaborator_advances (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ron    numeric(10,2) NOT NULL CHECK (amount_ron > 0),
  sent_at       date NOT NULL DEFAULT CURRENT_DATE,
  -- revolut = transfer în contul lui; card = taxă plătită direct de noi;
  -- alt = orice altă formă (numerar, transfer bancar).
  method        text NOT NULL DEFAULT 'revolut' CHECK (method IN ('revolut','card','transfer','numerar','alt')),
  note          text,
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collaborator_advances_collab
  ON collaborator_advances (collaborator_id, sent_at DESC);

ALTER TABLE collaborator_advances ENABLE ROW LEVEL SECURITY;

-- Accesul trece exclusiv prin service role (API-urile de admin/colaborator);
-- nicio politică permisivă, ca la restul tabelelor operaționale.
COMMENT ON TABLE collaborator_advances IS
  'Bani trimiși colaboratorului pentru taxele instituțiilor (OCPI/ANCPI). Consumul e în order_supplier_costs; soldul = avansuri - taxe înregistrate.';
