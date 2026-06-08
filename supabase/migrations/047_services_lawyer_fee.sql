-- 047_services_lawyer_fee.sql
-- Per-service lawyer fee ("Onorariu Avocat") carved out of the service price as
-- a separate invoice line (total unchanged). 0 = no lawyer-fee line.
-- Applies to representation-based services (cazier, certificate de stare civilă,
-- integritate, celibat). Extras multilingv naștere/căsătorie get it once added.

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS lawyer_fee_ron numeric(10,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN services.lawyer_fee_ron IS
  'Onorariu avocat (RON) shown as a separate Oblio invoice line, carved out of the service price. 0 = no separate line.';

UPDATE services
SET lawyer_fee_ron = 15
WHERE slug IN (
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-fiscal',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-integritate-comportamentala',
  'certificat-celibat'
);
