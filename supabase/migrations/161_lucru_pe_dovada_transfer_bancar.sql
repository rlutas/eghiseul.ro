-- 161: lucrul poate porni pe DOVADA de transfer bancar, înainte să intre banii.
--
-- Context (14.09.2026, comanda E-260912-5SNRM, certificat de căsătorie,
-- 1.248 lei): clientul a ales IBAN-ul pe 12.09 și a trimis ordinul de plată.
-- Banii ajung în cont a doua zi lucrătoare, uneori la două zile — timp în care
-- comanda stă pe `awaiting_payment` și echipa nu poate face nimic: fluxul de
-- procesare pornește doar din `paid`, iar documentele Barou (contract de
-- asistență, împuternicire, cerere) se generează exclusiv după plată.
--
-- Fluxul nou: operatorul verifică dovada (upload, email sau WhatsApp) și apasă
-- „Dovadă verificată — pornește lucrul". Comanda trece pe `processing`, primește
-- numerele de Barou și documentele, iar `payment_status` RĂMÂNE
-- `awaiting_verification`: factura, emailul de confirmare și joburile plătite
-- (ONRC/ANCPI) pleacă tot la „Confirmă plata", când banii apar în extras.
--
-- Cele două coloane țin urma deciziei (cine a verificat dovada și când), ca
-- bannerul „în lucru fără plată confirmată" să deosebească lucrul pornit
-- deliberat de o comandă avansată din greșeală.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS proof_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS proof_verified_by uuid REFERENCES profiles(id);

COMMENT ON COLUMN orders.proof_verified_at IS
  'Transfer bancar: operatorul a verificat dovada de plată și a pornit lucrul înainte de încasare. NULL = lucrul a pornit după confirmarea plății (sau deloc).';
COMMENT ON COLUMN orders.proof_verified_by IS
  'Operatorul care a verificat dovada de plată (vezi proof_verified_at).';

-- Tabul „Așteptare plată" filtrează de acum pe payment_status, nu pe status:
-- o comandă pornită pe dovadă e „În procesare" ȘI încă neîncasată, deci trebuie
-- să rămână în coada de confirmare a plății.
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_awaiting
  ON orders (payment_status)
  WHERE payment_status = 'awaiting_verification';

-- order_history: eveniment nou pentru audit.
ALTER TABLE order_history DROP CONSTRAINT order_history_event_type_check;
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN (
    'status_changed', 'order_submitted', 'payment_confirmed',
    'payment_proof_submitted', 'bank_transfer_submitted', 'document_generated',
    'payment_received', 'document_uploaded', 'note_added', 'admin_action',
    'kyc_verified', 'kyc_rejected', 'awb_created', 'shipped', 'delivered',
    'abandoned', 'recovery_email_sent', 'cancelled', 'cancellation_requested',
    'refunded', 'modified', 'extra_payment_sent', 'extra_payment_received',
    'standby_started', 'standby_ended', 'reupload_requested',
    'kyc_photo_resubmitted', 'document_viewed_by_client',
    'barou_allocation_failed', 'document_generation_failed',
    'extra_invoice_issued', 'extra_invoice_failed', 'resume_link_generated',
    'draft_edited_by_admin', 'phone_contact_logged',
    'work_started_on_proof'
  ));

NOTIFY pgrst, 'reload schema';
