-- =============================================
-- Migration 033: Cetățean Străin (foreign citizen) surcharge option
-- =============================================
-- Goal: add a citizenship-flag service option `cetatean_strain` to the three
-- eligible "cazier / integritate" services. When the customer selects a
-- non-Romanian citizenship on the Personal Data step, the wizard auto-toggles
-- this option (system-applied, not user-applied). The option carries a
-- 100 RON surcharge and adds +7 business days to the processing window
-- (matches cazierjudiciaronline.com parity: 119 RON + 7-15 days; we picked
-- 100 RON + 7 pessimistic-upper-bound).
--
-- Eligible services (PF only — PJ entities aren't "foreign citizens", and the
-- cazier-auto flow already handles "permis strain"):
--   - cazier-judiciar-persoana-fizica
--   - cazier-judiciar (generic fallback slug)
--   - certificat-integritate-comportamentala
--
-- Intentionally EXCLUDED:
--   cazier-judiciar-persoana-juridica, certificat-constatator, extras-carte-
--   funciara, rovinieta, cazier-fiscal, cazier-auto.
--
-- Config JSON contract:
--   {
--     "flag_type": "citizenship_flag",   -- identifies this as a system-toggled
--                                        --   flag option (not a user add-on)
--     "adds_processing_days": 7          -- used by delivery-calculator to
--                                        --   extend ETA by 7 business days
--   }
--
-- Unique constraint UNIQUE(service_id, code) on service_options (see
-- migration 002_services.sql line 173) makes the insert idempotent via
-- ON CONFLICT DO NOTHING.
-- =============================================

BEGIN;

INSERT INTO service_options
  (service_id, code, name, description, price, price_type, is_active,
   is_required, max_quantity, display_order, config, created_at, updated_at)
SELECT
  s.id,
  'cetatean_strain',
  'Cetățean Străin (procesare 7-15 zile)',
  'Pentru solicitanți fără cetățenie română. Verificări suplimentare la IGI.',
  100.00,
  'fixed',
  TRUE,
  FALSE,
  1,
  1,
  '{"flag_type": "citizenship_flag", "adds_processing_days": 7}'::jsonb,
  now(),
  now()
FROM services s
WHERE s.slug IN (
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar',
  'certificat-integritate-comportamentala'
)
ON CONFLICT (service_id, code) DO NOTHING;

COMMIT;
