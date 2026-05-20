-- Migration 036: Pricing realignment 2026-05-20
--
-- User decision (eghiseul.ro vs cazierjudiciaronline.com positioning):
--   • Cazier Judiciar PF/PJ: base 250 → 198 RON, urgent total 350 → 278 RON (urgenta uplift 100 → 80)
--   • Cazier Auto: aligned with judiciar — base 250 → 198, urgent uplift 100 → 80
--   • Cazier Fiscal: base 250 → 198, no urgent processing (urgenta option deactivated)
--   • Umbrella `cazier-judiciar` row (used in legacy / catalog landing): mirror PF base = 198
--
-- All other add-ons (traducere, apostila_haga, apostila_notari, legalizare,
-- verificare_expert, copii_suplimentare, cetatean_strain) are unchanged.
--
-- Rationale: undercut cazierjudiciaronline.com (250/350) by ~50 RON on the
-- entry-level tier while preserving margin on add-ons.

BEGIN;

-- 1. Update base prices for affected services
UPDATE services
SET base_price = 198.00,
    updated_at = NOW()
WHERE slug IN (
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal'
);

-- 2. Reduce urgenta uplift 100 → 80 for cazier-judiciar (all variants) + cazier-auto
UPDATE service_options
SET price = 80.00,
    updated_at = NOW()
WHERE code = 'urgenta'
  AND service_id IN (
    SELECT id FROM services WHERE slug IN (
      'cazier-judiciar',
      'cazier-judiciar-persoana-fizica',
      'cazier-judiciar-persoana-juridica',
      'cazier-auto'
    )
  );

-- 3. Deactivate urgenta for cazier-fiscal (no urgent processing offered)
UPDATE service_options
SET is_active = false,
    updated_at = NOW()
WHERE code = 'urgenta'
  AND service_id = (SELECT id FROM services WHERE slug = 'cazier-fiscal');

COMMIT;

-- Post-migration verification (run manually to confirm):
--
-- SELECT slug, base_price FROM services WHERE slug LIKE '%cazier%' ORDER BY slug;
-- → expected: cazier-auto, cazier-fiscal, cazier-judiciar, cazier-judiciar-persoana-fizica,
--             cazier-judiciar-persoana-juridica all at 198.00
--
-- SELECT s.slug, so.code, so.price, so.is_active
-- FROM service_options so JOIN services s ON s.id = so.service_id
-- WHERE so.code = 'urgenta' AND s.slug LIKE '%cazier%' ORDER BY s.slug;
-- → expected:
--     cazier-auto                            urgenta 80.00  true
--     cazier-fiscal                          urgenta 100.00 false
--     cazier-judiciar                        urgenta 80.00  true
--     cazier-judiciar-persoana-fizica        urgenta 80.00  true
--     cazier-judiciar-persoana-juridica      urgenta 80.00  true
