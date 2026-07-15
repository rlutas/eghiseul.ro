-- 125_telephone_orders.sql
-- Comenzi telefonice (create de admin A→Z): canal + operator + plata manuala
-- pe orders; extensie reupload_requests pentru fluxul de COMPLETARE
-- (client incarca actele + semneaza printr-un link personalizat, dupa plata).

ALTER TABLE orders ADD COLUMN IF NOT EXISTS channel VARCHAR(20) NOT NULL DEFAULT 'web';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by_admin UUID REFERENCES profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS flow VARCHAR(20) NOT NULL DEFAULT 'reupload';
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS require_email_confirm BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS signature_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS signature_completed_at TIMESTAMPTZ;
ALTER TABLE reupload_requests ADD COLUMN IF NOT EXISTS email_confirm_attempts INT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reupload_requests_flow_check'
  ) THEN
    ALTER TABLE reupload_requests
      ADD CONSTRAINT reupload_requests_flow_check CHECK (flow IN ('reupload', 'completion'));
  END IF;
END $$;

-- Real DDL ca sa se declanseze pgrst_ddl_watch chiar daca ADD COLUMN IF NOT
-- EXISTS a fost no-op (vezi .claude/rules/database.md, incident E-260610-NMU25)
COMMENT ON COLUMN orders.channel IS 'Canalul comenzii: web (wizard public) sau phone (creata de admin, comanda telefonica)';
COMMENT ON COLUMN orders.payment_reference IS 'Referinta platii manuale (nr. tranzactie transfer bancar / chitanta cash)';
COMMENT ON COLUMN reupload_requests.flow IS 'reupload = solicitare re-incarcare documente; completion = link completare comanda telefonica (acte + semnatura, gate email)';

NOTIFY pgrst, 'reload schema';
