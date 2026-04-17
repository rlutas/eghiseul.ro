-- =============================================
-- Migration 029: Align pricing with cazierjudiciaronline.com
-- =============================================
-- Goals:
--   A) Match cazier.ro production pricing on judiciar services.
--   B) Standardize codes to lowercase across all cazier services.
--   C) Normalize cazier-auto (0 options → 7 options, same set as others).
--
-- Changes:
--   1) cazier-judiciar-persoana-juridica base_price: 300 → 250 (match PF).
--   2) Judiciar services (cazier-judiciar, -pf, -pj) — rename + reprice:
--        TRAD_EN    → traducere            (name: "Traducere Autorizată")   80.00 → 178.50
--        APOSTILA   → apostila_haga        (name kept: "Apostilă de la Haga") 150.00 → 238.00
--        URGENTA    → urgenta              (name kept: "Procesare Urgentă")   99.00 → 100.00
--        COPIE_SUP  → copii_suplimentare   (name: "Copii Suplimentare")       30.00 → 25.00
--   3) cazier-fiscal: rename + reprice urgenta 99 → 100, rename
--      traducere_en → traducere (add diacritic on name).
--   4) cazier-auto (currently 0 options): seed 7 extras so it matches the
--      normalized set on the other cazier services.
--
-- Unique constraint UNIQUE(service_id, code) on service_options.
-- Wrapped in a single transaction — rollback on any error.
-- =============================================

BEGIN;

-- -------------------------------------------------
-- 1) Base price: cazier-judiciar-persoana-juridica 300 → 250
-- -------------------------------------------------
UPDATE services
SET base_price = 250.00,
    updated_at = now()
WHERE slug = 'cazier-judiciar-persoana-juridica';

-- -------------------------------------------------
-- 2) Judiciar services: rename uppercase codes + reprice
--    Using UPDATE (not upsert) because the target lowercase codes do not
--    yet exist on these 3 services — no conflict possible.
-- -------------------------------------------------

-- 2a) TRAD_EN → traducere  (80.00 → 178.50, renamed "Traducere Autorizată")
UPDATE service_options so
SET code = 'traducere',
    name = 'Traducere Autorizată',
    price = 178.50,
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug IN ('cazier-judiciar', 'cazier-judiciar-persoana-fizica', 'cazier-judiciar-persoana-juridica')
  AND so.code = 'TRAD_EN';

-- 2b) APOSTILA → apostila_haga  (150.00 → 238.00, name kept)
UPDATE service_options so
SET code = 'apostila_haga',
    name = 'Apostilă de la Haga',
    price = 238.00,
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug IN ('cazier-judiciar', 'cazier-judiciar-persoana-fizica', 'cazier-judiciar-persoana-juridica')
  AND so.code = 'APOSTILA';

-- 2c) URGENTA → urgenta  (99.00 → 100.00, name kept "Procesare Urgentă")
UPDATE service_options so
SET code = 'urgenta',
    name = 'Procesare Urgentă',
    price = 100.00,
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug IN ('cazier-judiciar', 'cazier-judiciar-persoana-fizica', 'cazier-judiciar-persoana-juridica')
  AND so.code = 'URGENTA';

-- 2d) COPIE_SUP → copii_suplimentare  (30.00 → 25.00, renamed plural)
UPDATE service_options so
SET code = 'copii_suplimentare',
    name = 'Copii Suplimentare',
    price = 25.00,
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug IN ('cazier-judiciar', 'cazier-judiciar-persoana-fizica', 'cazier-judiciar-persoana-juridica')
  AND so.code = 'COPIE_SUP';

-- -------------------------------------------------
-- 3) cazier-fiscal: align urgenta price + rename traducere_en → traducere
-- -------------------------------------------------

-- 3a) urgenta: 99.00 → 100.00
UPDATE service_options so
SET price = 100.00,
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug = 'cazier-fiscal'
  AND so.code = 'urgenta';

-- 3b) traducere_en → traducere  (add diacritic: "Autorizata" → "Autorizată")
UPDATE service_options so
SET code = 'traducere',
    name = 'Traducere Autorizată',
    updated_at = now()
FROM services s
WHERE so.service_id = s.id
  AND s.slug = 'cazier-fiscal'
  AND so.code = 'traducere_en';

-- -------------------------------------------------
-- 4) cazier-auto: seed 7 extras (matches normalized set)
--    ON CONFLICT DO NOTHING — idempotent/re-runnable.
-- -------------------------------------------------
INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'urgenta', 'Procesare Urgentă', 100.00, 'fixed', TRUE, FALSE, 1, 5, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'traducere', 'Traducere Autorizată', 178.50, 'fixed', TRUE, FALSE, 1, 15, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_haga', 'Apostilă de la Haga', 238.00, 'fixed', TRUE, FALSE, 1, 20, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'apostila_notari', 'Apostilă Notari (Camera Notarilor)', 83.30, 'fixed', TRUE, FALSE, 1, 10, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'legalizare', 'Legalizare Notarială', 99.00, 'fixed', TRUE, FALSE, 1, 30, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'verificare_expert', 'Verificare de Expert', 49.00, 'fixed', TRUE, FALSE, 1, 40, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

INSERT INTO service_options
  (service_id, code, name, price, price_type, is_active, is_required, max_quantity, display_order, created_at, updated_at)
SELECT s.id, 'copii_suplimentare', 'Copii Suplimentare', 25.00, 'fixed', TRUE, FALSE, 1, 50, now(), now()
FROM services s WHERE s.slug = 'cazier-auto'
ON CONFLICT (service_id, code) DO NOTHING;

COMMIT;
