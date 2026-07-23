-- 136: Costuri furnizori pe comandă (traducător / notar / apostilă etc.)
--
-- Echipa înregistrează cât ne-a costat PE NOI fiecare serviciu prestat de un
-- colaborator (ex. cât a facturat traducătoarea pentru traducerea de pe o
-- comandă), separat de ce a plătit clientul. Permite: (1) marja de profit per
-- comandă în admin, (2) raport lunar per colaborator (câte lucrări, la ce
-- comenzi, ce documente, total) pentru a combate factura furnizorului.
-- Vizibil DOAR echipei (admin API, service-role). Context:
-- docs/serviciu-traduceri-apostile/.

CREATE TABLE IF NOT EXISTS order_supplier_costs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  supplier       text NOT NULL,                 -- numele colaboratorului (din lista suppliers)
  category       text NOT NULL,                 -- traducere | legalizare | apostila | supralegalizare | copie_legalizata | curier | alt
  description    text,                           -- ex. "Traducere certificat naștere - Germană"
  document_language text,                        -- limba (opțional, la traduceri) — pt. raport
  amount_ron     numeric(10,2) NOT NULL CHECK (amount_ron >= 0),
  recorded_by    text,                           -- emailul adminului care a înregistrat
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_costs_order ON order_supplier_costs(order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_costs_supplier_date ON order_supplier_costs(supplier, created_at);

-- RLS: service-role only (admin APIs use the admin client). Block anon/auth.
ALTER TABLE order_supplier_costs ENABLE ROW LEVEL SECURITY;

-- Lista de colaboratori/furnizori (nume + tip) pentru dropdown consistent în
-- înregistrarea costurilor — cheie în admin_settings (pattern civil tiers).
INSERT INTO admin_settings (key, value)
VALUES ('suppliers', '[
  {"name": "Traducător (principal)", "type": "traducator", "active": true},
  {"name": "Notar (principal)", "type": "notar", "active": true}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE order_supplier_costs IS
  'Costuri interne per comandă de la colaboratori (traducător/notar/apostilă). Doar echipa. Marjă + raport lunar per furnizor.';

NOTIFY pgrst, 'reload schema';
