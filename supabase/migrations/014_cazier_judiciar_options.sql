-- =============================================
-- Migration: 014_cazier_judiciar_options
-- Description: Add service options for Cazier Judiciar PF and PJ services
-- Date: 2026-01-05
-- Sprint: Sprint 3 - Modular Verification
-- =============================================

-- =============================================
-- SERVICE OPTIONS FOR CAZIER JUDICIAR - PERSOANA FIZICA
-- =============================================

DO $$
DECLARE
  v_service_id_pf UUID;
  v_service_id_pj UUID;
BEGIN
  -- Get service ID for PF
  SELECT id INTO v_service_id_pf FROM services WHERE slug = 'cazier-judiciar-persoana-fizica';

  -- Get service ID for PJ
  SELECT id INTO v_service_id_pj FROM services WHERE slug = 'cazier-judiciar-persoana-juridica';

  -- =========================================
  -- OPTIONS FOR PERSOANA FIZICA
  -- =========================================
  IF v_service_id_pf IS NOT NULL THEN
    -- 1. Procesare Urgentă
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pf,
      'URGENTA',
      'Procesare Urgentă',
      'Obținere în 2 zile lucrătoare în loc de 5 zile.',
      99.00,
      TRUE,
      FALSE,
      1
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 2. Traducere Legalizată Engleză
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pf,
      'TRAD_EN',
      'Traducere Legalizată Engleză',
      'Traducere autorizată în limba engleză a cazierului judiciar.',
      80.00,
      TRUE,
      FALSE,
      2
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 3. Apostilă Haga
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pf,
      'APOSTILA',
      'Apostilă de la Haga',
      'Apostilare pentru utilizare în străinătate (Convenția de la Haga).',
      150.00,
      TRUE,
      FALSE,
      3
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 4. Copie Suplimentară
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pf,
      'COPIE_SUP',
      'Copie Suplimentară',
      'Copie legalizată suplimentară a cazierului judiciar.',
      30.00,
      TRUE,
      FALSE,
      4
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    RAISE NOTICE 'Service options for cazier-judiciar-persoana-fizica inserted successfully.';
  ELSE
    RAISE NOTICE 'Service cazier-judiciar-persoana-fizica not found. Skipping PF options.';
  END IF;

  -- =========================================
  -- OPTIONS FOR PERSOANA JURIDICA
  -- =========================================
  IF v_service_id_pj IS NOT NULL THEN
    -- 1. Procesare Urgentă
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pj,
      'URGENTA',
      'Procesare Urgentă',
      'Obținere în 3 zile lucrătoare în loc de 7 zile.',
      99.00,
      TRUE,
      FALSE,
      1
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 2. Traducere Legalizată Engleză
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pj,
      'TRAD_EN',
      'Traducere Legalizată Engleză',
      'Traducere autorizată în limba engleză a cazierului judiciar.',
      80.00,
      TRUE,
      FALSE,
      2
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 3. Apostilă Haga
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pj,
      'APOSTILA',
      'Apostilă de la Haga',
      'Apostilare pentru utilizare în străinătate (Convenția de la Haga).',
      150.00,
      TRUE,
      FALSE,
      3
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    -- 4. Copie Suplimentară
    INSERT INTO service_options (
      service_id, code, name, description, price,
      is_active, is_required, display_order
    ) VALUES (
      v_service_id_pj,
      'COPIE_SUP',
      'Copie Suplimentară',
      'Copie legalizată suplimentară a cazierului judiciar.',
      30.00,
      TRUE,
      FALSE,
      4
    ) ON CONFLICT (service_id, code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price;

    RAISE NOTICE 'Service options for cazier-judiciar-persoana-juridica inserted successfully.';
  ELSE
    RAISE NOTICE 'Service cazier-judiciar-persoana-juridica not found. Skipping PJ options.';
  END IF;

END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the options were inserted:
--
-- SELECT s.slug, s.name as service_name, so.name as option_name, so.price
-- FROM service_options so
-- JOIN services s ON s.id = so.service_id
-- WHERE s.slug LIKE 'cazier-judiciar-persoana%'
-- ORDER BY s.slug, so.display_order;
