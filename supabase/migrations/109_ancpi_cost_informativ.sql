-- 109: Cost ANCPI informativ per serviciu cadastral (processing_config.ancpi_cost_ron)
--
-- Tarifele oficiale ANCPI (Ordin 16/2019, https://sj.ancpi.ro/tarife-servicii/),
-- mapate pe serviciile noastre. INFORMATIV — apare la topograf (/colaborator/servicii)
-- și e editabil din admin Settings → Servicii (merge în processing_config, deci
-- fără coloană nouă / fără reload de schema cache PostgREST).
--
-- Mapare (cod tarif ANCPI → serviciu):
--   2.7.2 Extras CF informare (online 20)     → extras-carte-funciara, extras-cf-colectiv
--   2.7.8 Certificat identificare după adresă → identificare-imobil (100)
--   2.7.6 Identificare după proprietar        → identificare-imobile-proprietar (10/proprietar/BCPI)
--   2.7.7 Extras din planul cadastral         → extras-plan-cadastral (15)
--   2.7.4 Certificat de sarcini               → certificat-sarcini (100/BCPI)
--   2.7.5 Copii certificate din arhivă        → toate serviciile "copie-*" (25/dosar)
--   2.6.3 Actualizare informații tehnice      → actualizare-adresa-cf (60)
--   2.7.9 Referat registru proprietari        → certificat-detineri-imobile (10/proprietar)
--   plan-amplasament-delimitare: tarif variabil (recepții) — rămâne NULL, se setează din admin.

UPDATE services SET processing_config = jsonb_set(COALESCE(processing_config, '{}'::jsonb), '{ancpi_cost_ron}', to_jsonb(v.cost))
FROM (VALUES
  ('extras-carte-funciara', 20),
  ('extras-cf-colectiv', 20),
  ('identificare-imobil', 100),
  ('identificare-imobile-proprietar', 10),
  ('extras-plan-cadastral', 15),
  ('certificat-sarcini', 100),
  ('copie-carte-funciara', 25),
  ('copie-plan-cadastral', 25),
  ('copie-releveu', 25),
  ('copie-inventar-coordonate', 25),
  ('copie-intabulare', 25),
  ('copie-arhiva-ocpi', 25),
  ('copie-contract-vanzare', 25),
  ('copie-plan-incadrare', 25),
  ('actualizare-adresa-cf', 60),
  ('certificat-detineri-imobile', 10)
) AS v(slug, cost)
WHERE services.slug = v.slug;
