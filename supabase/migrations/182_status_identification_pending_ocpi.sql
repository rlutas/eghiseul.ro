-- 182: status nou `identification_pending_ocpi` — „Identificare nereușită —
-- certificat OCPI depus" + prețul identificării la 298 lei.
--
-- Context (21.09.2026): la identificare imobil, când topograful nu găsea
-- imobilul în e-Terra, comanda murea pe `standby` cu nota „nu s-a putut
-- identifica, are credit" (12 comenzi). Clientul vedea „așteptăm un răspuns de
-- la tine", nu primea niciun document, iar creditul trăia doar în notă.
--
-- Fluxul nou (decizie Raul): negăsit în e-Terra → topograful cere la OCPI
-- certificatul oficial privind înscrierea imobilului (Ordin ANCPI 16/2019,
-- cod 2.7.8 după adresă = 100 lei, cod 2.7.6 după proprietar = 125 lei, ~10
-- zile lucrătoare). Răspunsul e document în ambele cazuri: cu CF (urmează
-- extrasul) sau negativ (certificatul E livrarea, serviciu complet, fără
-- credit). Statusul ține comanda în „În procesare" (nu pauzată), cu termen
-- recalculat, și îi spune clientului exact unde e.
--
-- Diferă de:
--   - `submitted_to_institution` = cerere de extras/plan depusă, imobil cunoscut;
--   - `standby`                  = lipsesc date de la client (adresă incompletă);
--   - `on_hold_institution`      = ANCPI/registrul picat.

ALTER TABLE orders DROP CONSTRAINT orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  (status)::text = ANY (
    (ARRAY[
      'draft'::character varying,
      'pending'::character varying,
      'awaiting_payment'::character varying,
      'abandoned'::character varying,
      'paid'::character varying,
      'processing'::character varying,
      'documents_generated'::character varying,
      'submitted_to_institution'::character varying,
      'identification_pending_ocpi'::character varying,
      'document_received'::character varying,
      'extras_in_progress'::character varying,
      'la_tradus'::character varying,
      'la_legalizat'::character varying,
      'la_apostila_notari'::character varying,
      'eliberat_apostila_haga'::character varying,
      'kyc_pending'::character varying,
      'kyc_approved'::character varying,
      'kyc_rejected'::character varying,
      'in_progress'::character varying,
      'document_ready'::character varying,
      'shipped'::character varying,
      'delivered'::character varying,
      'completed'::character varying,
      'cancelled'::character varying,
      'cancellation_requested'::character varying,
      'refunded'::character varying,
      'standby'::character varying,
      'on_hold_institution'::character varying
    ])::text[]
  )
);

-- Preț: identificarea după adresă acoperă acum și certificatul 2.7.8 (100 lei
-- la OCPI) pe lângă extrasul CF (20 lei). 198 → 298 lei (TVA inclus).
-- Identificarea după proprietar rămâne la 198 până decide Raul (2.7.6 = 125).
UPDATE services SET base_price = 298.00, updated_at = now()
 WHERE slug = 'identificare-imobil';

-- Taxa informativă a depunerii la ghișeu pentru identificarea după proprietar
-- era 10 lei (greșit): serviciul ANCPI 2.7.6 costă 125 lei. Precompletează
-- corect câmpul „cost eliberare" al topografului.
UPDATE services
   SET processing_config = jsonb_set(coalesce(processing_config, '{}'::jsonb), '{ancpi_cost_ron}', '125'::jsonb),
       updated_at = now()
 WHERE slug = 'identificare-imobile-proprietar';
