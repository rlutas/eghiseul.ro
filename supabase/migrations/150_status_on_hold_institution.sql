-- 150: status nou `on_hold_institution` — „Blocat — instituție indisponibilă".
--
-- Context (28.08.2026): portalul ANCPI e picat din 13 iulie, iar registrul
-- proprietarilor nu e accesibil. Topograful are lucrări plătite pe care NU le
-- poate onora acum, dar singurul status de pauză era `standby` = „lipsesc
-- informații de la CLIENT" (cere notă despre client). Lucrările blocate de
-- instituție rămâneau pe `paid` și se amestecau cu cele lucrabile.
--
-- `on_hold_institution` = pauză din cauza instituției (ANCPI/OCPI/registru),
-- NU din vina clientului. SLA se pauzează la fel ca la standby (aceleași
-- coloane standby_started_at / standby_total_seconds).

ALTER TABLE orders DROP CONSTRAINT orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  (status)::text = ANY (
    (ARRAY[
      'draft'::character varying,
      'pending'::character varying,
      'abandoned'::character varying,
      'paid'::character varying,
      'processing'::character varying,
      'documents_generated'::character varying,
      'submitted_to_institution'::character varying,
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
