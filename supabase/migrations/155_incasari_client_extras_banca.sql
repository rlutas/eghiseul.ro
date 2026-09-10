-- 155: legarea încasărilor prin transfer bancar de comenzi.
--
-- Context (10.09.2026): importul de extras (`/admin/decontari/banca`) potrivea
-- DOAR creditele Stripe cu payout-urile. O plată venită direct de la client în
-- cont cădea pe categoria `altele`, fără nicio legătură cu comanda — deci
-- operatorul nu avea cum să vadă din decontări că E-260905-DMUZA fusese
-- plătită. Adăugăm categoria `incasare_client` și legătura către comandă.
--
-- `matched_order_id` e ON DELETE SET NULL: ștergerea unei comenzi nu are voie
-- să șteargă linia de extras, care e document contabil.

ALTER TABLE bank_statement_entries
  ADD COLUMN IF NOT EXISTS matched_order_id uuid REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bank_entries_matched_order
  ON bank_statement_entries (matched_order_id)
  WHERE matched_order_id IS NOT NULL;
