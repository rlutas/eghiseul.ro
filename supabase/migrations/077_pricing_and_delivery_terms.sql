-- Migration 077: pricing + delivery-term alignment
--
-- Context: audit timpi de livrare + prețuri (2026-06-23), aliniere cu WPForms
-- vechi + decizii business. Două căi de afișare a termenului trebuie ținute
-- consistente:
--   • paginile /servicii/* → formatEstimatedDays() = processing_config.estimated_days_display
--   • wizard price-sidebar  → calcul din coloana numerică estimated_days
--     (constatator + extras-carte-funciara sunt hardcodate "câteva minute (24/7)")
-- De aceea setăm AMBELE (string range + numeric) acolo unde contează.
--
-- processing_config e JSONB → folosim `||` (merge) ca să NU pierdem cheile
-- existente (numbering, institution, enable_*, etc).

BEGIN;

-- ── Prețuri ──────────────────────────────────────────────────────────────
-- Integritate: aliniere la 198 (era 250), ca restul caziere-lor.
UPDATE services SET base_price = 198 WHERE slug = 'certificat-integritate';

-- Celibat: 698 lei (WPForms vechi: 699 „Obținere Certificat de Celibat").
UPDATE services SET base_price = 698 WHERE slug = 'certificat-celibat';

-- ── Caziere cu taxă urgență: două opțiuni (normal 2-4 / urgent 1-2) ───────
-- Judiciar (PF/PJ/generic) — estimated_days_display "2-4" există deja; adăugăm
-- urgent_days_display ca să se afișeze a doua opțiune (ca la integritate).
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"2-4 zile lucrătoare","urgent_days_display":"1-2 zile lucrătoare"}'::jsonb
WHERE slug IN ('cazier-judiciar','cazier-judiciar-persoana-fizica','cazier-judiciar-persoana-juridica','cazier-auto');

-- Integritate: are deja ambele în config; ne asigurăm că sunt setate.
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"2-4 zile lucrătoare","urgent_days_display":"1-2 zile lucrătoare"}'::jsonb
WHERE slug = 'certificat-integritate';

-- ── Cazier fiscal: 2-4 zile (fără urgență — nu are opțiunea Procesare Urgentă) ─
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"2-4 zile lucrătoare"}'::jsonb,
  estimated_days = 3   -- alinia numericul (era 5) cu range-ul afișat
WHERE slug = 'cazier-fiscal';

-- ── Identificare imobil: 2-4 zile (să fim acoperiți) ──────────────────────
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"2-4 zile lucrătoare"}'::jsonb,
  estimated_days = 3
WHERE slug = 'identificare-imobil';

-- ── Digital instant (worker A→Z): câteva minute ──────────────────────────
-- Extras CF (ANCPI worker) + Constatator (ONRC worker). Wizard sidebar deja
-- afișează "câteva minute (24/7)"; setăm și pe paginile /servicii la fel.
-- Constatator: worker scoate firmă de bază/IMM/insolvență + PF + istoric;
-- emailul (api/onrc/result) spune deja „câteva minute, max 24h dacă ONRC e în
-- mentenanță".
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"câteva minute (24/7)"}'::jsonb,
  estimated_days = 1
WHERE slug IN ('extras-carte-funciara','certificat-constatator');

-- ── Stare civilă (naștere/căsătorie/celibat): baseline 7-15 zile ──────────
-- WPForms vechi spunea „15-30 zile". Decizie business: afișăm 7-15 ca baseline
-- acoperitor. NOTĂ: termenul real variază pe oficiul de stare civilă selectat
-- (București + sectoare = 15-30; oficii rapide ex. Satu Mare = 5-7). Acela e
-- un follow-up (câmpul localitate e text liber → necesită selecție structurată).
UPDATE services
SET processing_config = COALESCE(processing_config, '{}'::jsonb)
  || '{"estimated_days_display":"7-15 zile lucrătoare"}'::jsonb,
  estimated_days = 10
WHERE slug IN ('certificat-nastere','certificat-casatorie','certificat-celibat');

COMMIT;

-- Verificare (rulează manual după apply):
-- SELECT slug, base_price, estimated_days, processing_config->>'estimated_days_display' AS disp,
--        processing_config->>'urgent_days_display' AS urgent
-- FROM services ORDER BY slug;
