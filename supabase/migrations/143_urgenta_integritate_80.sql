-- 143_urgenta_integritate_80.sql
--
-- Taxa de „Procesare Urgentă" la certificatul de integritate: 100 → 80 RON,
-- ca la restul cazierelor.
--
-- Cum a apărut diferența (semnalat de echipă pe E-260813-BE38X vs
-- E-260810-WGS95, ambele urgente, 298 vs 278 lei):
--   • migrarea 036 (20.05) a coborât uplift-ul de urgență 100 → 80 pe cazier
--     judiciar (PF/PJ/generic) + cazier auto, dar lista de slug-uri NU includea
--     certificat-integritate;
--   • migrarea 077 (23.06) a aliniat BAZA integrității la 198 „ca restul
--     cazierelor", însă a lăsat opțiunea de urgență pe valoarea inițială (100,
--     stabilită când baza era 250).
-- Rezultat: aceeași bază (198), același termen (5 → 2 zile lucrătoare),
-- același flux prin avocat, dar 20 lei în plus la urgență.
--
-- Comenzile deja plătite NU se ating — prețul e înghețat în
-- `orders.selected_options.price_modifier` la momentul comenzii.

BEGIN;

UPDATE service_options so
SET price = 80.00,
    updated_at = NOW()
FROM services s
WHERE s.id = so.service_id
  AND so.code = 'urgenta'
  AND s.slug = 'certificat-integritate';

COMMIT;

-- Verificare:
--   SELECT s.slug, so.price, so.is_active
--   FROM service_options so JOIN services s ON s.id = so.service_id
--   WHERE so.code = 'urgenta'
--     AND s.slug IN ('cazier-judiciar-persoana-fizica','cazier-auto','certificat-integritate');
--   → toate 80.00, active
