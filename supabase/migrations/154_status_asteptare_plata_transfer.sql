-- 154: status nou `awaiting_payment` — „Așteptare plată (transfer bancar)".
--
-- Context (10.09.2026, comanda E-260905-DMUZA): clientul a ales transfer
-- bancar, a plătit prin bancă, banii au intrat — dar comanda a rămas
-- `status='pending'`, cronul auto-abandon a trecut-o pe `abandoned` după 30 de
-- minute, iar clientul nu a primit niciun email. Cauza: ruta
-- /api/orders/[id]/bank-transfer se apela DOAR dacă clientul încărca dovada de
-- plată în checkout. Cine plătește ulterior din aplicația băncii nu se mai
-- întoarce pe site, deci alegerea „transfer bancar" nu se salva nicăieri.
--
-- `awaiting_payment` = comanda e trimisă, metoda e transferul bancar, banii
-- încă nu sunt confirmați de echipă. Diferă de:
--   - `pending`   = a apăsat „plătește cu cardul" și nu a terminat (se abandonează);
--   - `standby`   = plătită, dar așteptăm acte de la client;
--   - `abandoned` = renunțare reală.
--
-- Cronul auto-abandon NU atinge acest status (filtrează pe `pending`), deci
-- comanda așteaptă până când operatorul confirmă încasarea (Confirmă plata →
-- fulfilManuallyPaidOrder: factură Oblio, email de confirmare, joburi, Barou).

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

-- Bonus din același incident: `payment_proof_submitted` NU era în lista albă a
-- lui order_history.event_type, deși ruta îl scria de la bun început și
-- admin-ul avea deja etichetă pentru el („Dovadă de plată trimisă"). Insertul
-- pica TĂCUT (vezi și `status_change` vs `status_changed`), deci timeline-ul nu
-- arăta niciodată alegerea transferului bancar.
ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;

ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check CHECK (
  (event_type)::text = ANY (ARRAY[
    'status_changed'::text,
    'order_submitted'::text,
    'payment_confirmed'::text,
    'payment_proof_submitted'::text,
    'bank_transfer_submitted'::text,
    'document_generated'::text,
    'payment_received'::text,
    'document_uploaded'::text,
    'note_added'::text,
    'admin_action'::text,
    'kyc_verified'::text,
    'kyc_rejected'::text,
    'awb_created'::text,
    'shipped'::text,
    'delivered'::text,
    'abandoned'::text,
    'recovery_email_sent'::text,
    'cancelled'::text,
    'cancellation_requested'::text,
    'refunded'::text,
    'modified'::text,
    'extra_payment_sent'::text,
    'extra_payment_received'::text,
    'standby_started'::text,
    'standby_ended'::text,
    'reupload_requested'::text,
    'kyc_photo_resubmitted'::text,
    'document_viewed_by_client'::text,
    'barou_allocation_failed'::text,
    'document_generation_failed'::text,
    'extra_invoice_issued'::text,
    'extra_invoice_failed'::text,
    'resume_link_generated'::text,
    'draft_edited_by_admin'::text
  ])
);
