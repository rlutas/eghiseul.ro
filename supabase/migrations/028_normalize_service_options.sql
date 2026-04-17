-- =============================================
-- Migration 028: Normalize service options across cazier services
-- =============================================
-- Goal: feature parity with cazierjudiciaronline.com — ensure all 4 cazier
-- services (fiscal, judiciar, judiciar-PF, judiciar-PJ) offer the same
-- 5 core extras: Apostilă Haga, Apostilă Notari, Legalizare, Verificare
-- Expert, plus the already-existing Traducere Autorizată / urgenta / copii.
--
-- Changes:
--   1) Fix mislabel on cazier-fiscal: code 'apostila' (name "Legalizare
--      Traducere") → rename to 'apostila_notari' / "Apostilă Notari
--      (Camera Notarilor)". Price stays 83.30.
--   2) Add missing 3 extras to cazier-fiscal: apostila_haga, legalizare,
--      verificare_expert.
--   3) Add missing 3 extras to cazier-judiciar, cazier-judiciar-persoana-fizica,
--      cazier-judiciar-persoana-juridica: apostila_notari, legalizare,
--      verificare_expert.
--
-- Unique constraint UNIQUE(service_id, code) already exists on
-- service_options (see migration 002_services.sql line 173), so
-- ON CONFLICT DO NOTHING is safe.
--
-- Existing codes (TRAD_EN, APOSTILA, URGENTA, COPIE_SUP, traducere_en,
-- urgenta, copii_suplimentare) are deliberately left unchanged for
-- backwards compatibility with wizard/UI code referencing them.
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Fix cazier-fiscal mislabel: apostila → apostila_notari
-- -------------------------------------------------
UPDATE service_options so
SET code = 'apostila_notari',
    name = 'Apostilă Notari (Camera Notarilor)',
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug = 'cazier-fiscal'
  AND so.code = 'apostila';

-- -------------------------------------------------
-- 2) Add missing 3 extras to cazier-fiscal
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_haga', 'Apostilă de la Haga', 238.00, 'fixed', TRUE, FALSE, 1, 20, now(), now()
FROM services s WHERE s.slug = 'cazier-fiscal'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'cazier-fiscal'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'cazier-fiscal'
ON CONFLICT (service_id, code) DO NOTHING;

-- -------------------------------------------------
-- 3) Add missing 3 extras to cazier-judiciar
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar'
ON CONFLICT (service_id, code) DO NOTHING;

-- -------------------------------------------------
-- 4) Add missing 3 extras to cazier-judiciar-persoana-fizica
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-fizica'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-fizica'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-fizica'
ON CONFLICT (service_id, code) DO NOTHING;

-- -------------------------------------------------
-- 5) Add missing 3 extras to cazier-judiciar-persoana-juridica
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-juridica'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-juridica'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'cazier-judiciar-persoana-juridica'
ON CONFLICT (service_id, code) DO NOTHING;

COMMIT;
