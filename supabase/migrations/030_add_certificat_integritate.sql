-- =============================================
-- Migration 030: Add Certificat de Integritate Comportamentală service
-- =============================================
-- Goal: introduce a new 'juridice' service for Certificat de Integritate
-- Comportamentală (CIC), mirroring cazierjudiciaronline.com feature set.
--
-- Feature flags (processing_config):
--   - PF only (no PJ)
--   - enables cetatean strain, parent names, nume anterior, urgency
--   - offers Cazier Judiciar as a bundled add-on (cross-service, +100 RON)
--
-- Pricing:
--   base_price = 250.00 RON, urgent +100 RON (via urgenta extra), străin handled
--   at order level by verification_config citizenshipFlows.
--   estimated_days = 5 (range 3-5), urgent_days = 2 (range 1-2).
--
-- Cross-service add-ons:
--   - On CIC: 'addon_cazier_judiciar' (+100 RON) → triggers bundled cazier flow.
--   - On judiciar, -pf, -pj: 'addon_certificat_integritate' (+100 RON) →
--     triggers bundled CIC flow.
--
-- Code selection note:
--   User suggested 'SRV-010', but that is already taken by cazier-auto (see
--   migration 010 line 399). 'SRV-011' is rovinieta. Next free numeric code
--   is 'SRV-012'.
--
-- Verification config for the new service mirrors cazier-judiciar-persoana-fizica
-- (copied via subquery) — same PF-only KYC behavior.
--
-- Unique constraint UNIQUE(service_id, code) on service_options makes the
-- cross-service add-on inserts idempotent via ON CONFLICT DO NOTHING.
-- Wrapped in a transaction — rollback on any error.
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Insert Certificat de Integritate Comportamentală service
-- -------------------------------------------------
INSERT INTO services (
  slug, code, name, description, category,
  base_price, requires_kyc, estimated_days, urgent_available, urgent_days,
  is_active, is_featured, display_order,
  config, processing_config, verification_config,
  created_at, updated_at
)
SELECT
  'certificat-integritate-comportamentala',
  'SRV-012',
  'Certificat de Integritate Comportamentală',
  'Document oficial eliberat de Inspectoratul General al Poliției Române (I.G.P.R.) care atestă integritatea comportamentală a solicitantului. Necesar pentru angajări în medii sensibile, lucru cu minori, voluntariat și alte situații care implică responsabilitate morală deosebită.',
  'juridice',
  250.00,
  TRUE,
  5,
  TRUE,
  2,
  TRUE,
  FALSE,
  20,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "birth_place", "address", "phone", "email", "purpose"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    }
  }'::jsonb,
  '{
    "enable_pj": false,
    "enable_cetatean_strain": true,
    "enable_parent_names": true,
    "enable_nume_anterior": true,
    "enable_cazier_judiciar_addon": true
  }'::jsonb,
  COALESCE(
    (SELECT verification_config FROM services WHERE slug = 'cazier-judiciar-persoana-fizica'),
    '{}'::jsonb
  ),
  now(),
  now()
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------
-- 2) Insert 7 base extras for the new service
--    (same pricing as normalized cazier services)
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'urgenta', 'Procesare Urgentă', 100.00, 'fixed', TRUE, FALSE, 1, 5, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'traducere', 'Traducere Autorizată', 178.50, 'fixed', TRUE, FALSE, 1, 15, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_haga', 'Apostilă de la Haga', 238.00, 'fixed', TRUE, FALSE, 1, 20, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'copii_suplimentare', 'Copii Suplimentare', 25.00, 'fixed', TRUE, FALSE, 1, 50, now(), now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

-- -------------------------------------------------
-- 3) Cross-service add-on on CIC: Cazier Judiciar bundled
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order, config, created_at, updated_at)
SELECT
  s.id,
  'addon_cazier_judiciar',
  'Cazier Judiciar (adaugă în aceeași comandă)',
  'Adaugă obținerea cazierului judiciar la aceeași comandă, cu documente și plată consolidate.',
  100.00,
  'fixed',
  TRUE,
  FALSE,
  1,
  60,
  '{"addon_service_slug": "cazier-judiciar-persoana-fizica", "addon_type": "bundled_service"}'::jsonb,
  now(),
  now()
FROM services s WHERE s.slug = 'certificat-integritate-comportamentala'
ON CONFLICT (service_id, code) DO NOTHING;

-- -------------------------------------------------
-- 4) Cross-service add-on on judiciar services: Certificat Integritate bundled
--    Added to: cazier-judiciar, cazier-judiciar-persoana-fizica,
--              cazier-judiciar-persoana-juridica
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, description, price, price_type, is_active, is_required, max_quantity, display_order, config, created_at, updated_at)
SELECT
  s.id,
  'addon_certificat_integritate',
  'Certificat Integritate (adaugă în aceeași comandă)',
  'Adaugă obținerea certificatului de integritate comportamentală la aceeași comandă, cu documente și plată consolidate.',
  100.00,
  'fixed',
  TRUE,
  FALSE,
  1,
  60,
  '{"addon_service_slug": "certificat-integritate-comportamentala", "addon_type": "bundled_service"}'::jsonb,
  now(),
  now()
FROM services s
WHERE s.slug IN (
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica'
)
ON CONFLICT (service_id, code) DO NOTHING;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- SELECT slug, code, name, base_price, is_active
-- FROM services WHERE slug = 'certificat-integritate-comportamentala';
--
-- SELECT code, name, price FROM service_options
-- WHERE service_id = (SELECT id FROM services WHERE slug = 'certificat-integritate-comportamentala')
-- ORDER BY code;
--
-- SELECT s.slug, so.code, so.price
-- FROM service_options so
-- JOIN services s ON s.id = so.service_id
-- WHERE so.code = 'addon_certificat_integritate';
-- =============================================
