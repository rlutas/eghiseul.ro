-- =============================================
-- Migration: 004_fix_service_prices
-- Description: Update service prices to match documentation
-- Date: 2025-12-17
-- =============================================

-- Update Cazier Fiscal price (SRV-001)
-- From: 149.00 RON -> To: 250.00 RON (as per docs/sprints/services/cazier-fiscal.md)
UPDATE services
SET
  base_price = 250.00,
  updated_at = NOW()
WHERE code = 'SRV-001';

-- Update Extras Carte Funciara price (SRV-031)
-- From: 99.00 RON -> To: 79.99 RON (as per docs/sprints/services/extras-carte-funciara.md)
UPDATE services
SET
  base_price = 79.99,
  updated_at = NOW()
WHERE code = 'SRV-031';

-- Update Certificat Constatator price (SRV-030)
-- From: 129.00 RON -> To: 119.99 RON (as per docs/sprints/services/certificat-constatator.md)
UPDATE services
SET
  base_price = 119.99,
  updated_at = NOW()
WHERE code = 'SRV-030';

-- Update service options prices

-- Procesare Urgenta: +99 RON pentru toate serviciile de tip cazier
UPDATE service_options
SET
  price = 99.00,
  description = 'Reducem timpul de procesare. Ideal pentru situatii urgente.',
  updated_at = NOW()
WHERE code = 'urgenta';

-- Cazier Fiscal options:
-- Traducere Autorizata: +178.50 RON
-- Legalizare Traducere: +83.30 RON

UPDATE service_options
SET
  price = 178.50,
  name = 'Traducere Autorizata',
  description = 'Traducere autorizata in limba engleza a cazierului fiscal.',
  updated_at = NOW()
WHERE code = 'traducere_en'
AND service_id = (SELECT id FROM services WHERE code = 'SRV-001');

UPDATE service_options
SET
  price = 83.30,
  name = 'Legalizare Traducere',
  description = 'Legalizare traducere pentru uz in strainatate.',
  updated_at = NOW()
WHERE code = 'apostila'
AND service_id = (SELECT id FROM services WHERE code = 'SRV-001');

-- Verification query (run to confirm changes)
-- SELECT code, name, base_price FROM services WHERE code IN ('SRV-001', 'SRV-030', 'SRV-031');
-- SELECT so.code, so.name, so.price, s.name as service_name
-- FROM service_options so
-- JOIN services s ON s.id = so.service_id
-- ORDER BY s.code, so.display_order;
