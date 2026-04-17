-- =============================================
-- Migration 034: Add Certificat de Căsătorie + Certificat de Celibat
--                and normalize extras across the 3 "civil status" certificates
-- =============================================
-- Goal: round out the Starea Civilă certificate family alongside
-- certificat-nastere (SRV-013). Two new services are added:
--
--   SRV-014  certificat-casatorie   — Certificat de Căsătorie
--   SRV-015  certificat-celibat     — Certificat de Celibat
--
-- Both mirror certificat-nastere's base configuration (personale,
-- 179 RON base, 7 normal days, 3 urgent days) and reuse its
-- verification_config wholesale (copied via subquery — same KYC /
-- signature behavior). processing_config feature flags are tuned
-- per service:
--   - căsătorie enables `enable_spouse_names`
--   - celibat has no optional blocks
--
-- Extras normalization (mirrors migration 028 pattern): the 3
-- civil-status certificates all get the same 7-extra catalog —
-- urgenta, apostila_haga, traducere, legalizare, apostila_notari,
-- verificare_expert, copii_suplimentare. certificat-nastere
-- currently has 0 service_options rows, so this also backfills it.
--
-- Idempotent via UNIQUE(service_id, code) + ON CONFLICT DO NOTHING,
-- and UNIQUE(slug)/UNIQUE(code) on services. Wrapped in a
-- transaction — rollback on any error.
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Insert Certificat de Căsătorie (SRV-014)
-- -------------------------------------------------
INSERT INTO services (
  slug, code, name, description, category,
  base_price, requires_kyc, estimated_days, urgent_available, urgent_days,
  is_active, is_featured, display_order,
  config, processing_config, verification_config,
  created_at, updated_at
)
SELECT
  'certificat-casatorie',
  'SRV-014',
  'Certificat de Căsătorie',
  'Duplicat sau copie legalizată după Certificatul de Căsătorie, eliberat de Starea Civilă. Necesar pentru proceduri juridice, administrative, obținerea cetățeniei.',
  'personale',
  179.00,
  TRUE,
  7,
  TRUE,
  3,
  TRUE,
  FALSE,
  22,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "address", "phone", "email"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    }
  }'::jsonb,
  '{"enable_pj": false, "enable_cetatean_strain": false, "enable_parent_names": false, "enable_spouse_names": true}'::jsonb,
  COALESCE(
    (SELECT verification_config FROM services WHERE slug = 'certificat-nastere'),
    '{}'::jsonb
  ),
  now(),
  now()
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------
-- 2) Insert Certificat de Celibat (SRV-015)
-- -------------------------------------------------
INSERT INTO services (
  slug, code, name, description, category,
  base_price, requires_kyc, estimated_days, urgent_available, urgent_days,
  is_active, is_featured, display_order,
  config, processing_config, verification_config,
  created_at, updated_at
)
SELECT
  'certificat-celibat',
  'SRV-015',
  'Certificat de Celibat',
  'Document oficial emis de Starea Civilă care atestă că persoana nu este căsătorită. Necesar pentru căsătorie în străinătate, obținerea cetățeniei, proceduri juridice.',
  'personale',
  179.00,
  TRUE,
  7,
  TRUE,
  3,
  TRUE,
  FALSE,
  23,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "address", "phone", "email"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    }
  }'::jsonb,
  '{"enable_pj": false, "enable_cetatean_strain": false, "enable_parent_names": false}'::jsonb,
  COALESCE(
    (SELECT verification_config FROM services WHERE slug = 'certificat-nastere'),
    '{}'::jsonb
  ),
  now(),
  now()
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------
-- 3) Insert 7 extras for each of the 3 civil-status certificates
--    Pattern: one INSERT per (slug, code) pair, using
--    IN (...) + ON CONFLICT DO NOTHING so certificat-nastere
--    gets backfilled and new services get seeded.
-- -------------------------------------------------

-- 3a) urgenta — Procesare Urgentă — 100.00 — order 5
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'urgenta', 'Procesare Urgentă', 100.00, 'fixed', TRUE, FALSE, 1, 5, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3b) apostila_haga — Apostilă de la Haga — 238.00 — order 10
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_haga', 'Apostilă de la Haga', 238.00, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3c) traducere — Traducere Autorizată — 178.50 — order 15
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'traducere', 'Traducere Autorizată', 178.50, 'fixed', TRUE, FALSE, 1, 15, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3d) legalizare — Legalizare Notarială — 99.00 — order 20
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 20, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3e) apostila_notari — Apostilă Notari (Camera Notarilor) — 83.30 — order 25
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 25, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3f) verificare_expert — Verificare de Expert — 49.00 — order 30
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

-- 3g) copii_suplimentare — Copii Suplimentare — 25.00 — order 35, max_quantity 10
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'copii_suplimentare', 'Copii Suplimentare', 25.00, 'fixed', TRUE, FALSE, 10, 35, now(), now()
FROM services s
WHERE s.slug IN ('certificat-nastere', 'certificat-casatorie', 'certificat-celibat')
ON CONFLICT (service_id, code) DO NOTHING;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- SELECT slug, name, base_price, is_active FROM services
-- WHERE slug IN ('certificat-nastere','certificat-casatorie','certificat-celibat')
-- ORDER BY slug;
--
-- SELECT s.slug, COUNT(so.id) AS option_count
-- FROM services s JOIN service_options so ON so.service_id = s.id
-- WHERE s.slug IN ('certificat-nastere','certificat-casatorie','certificat-celibat')
-- GROUP BY s.slug ORDER BY s.slug;
-- -- Expected: 7 options per service.
-- =============================================
