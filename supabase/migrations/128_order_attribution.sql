-- 128: Atribuire pe comandă — de unde a venit clientul.
--
-- Contextul: nu aveam NIMIC. Nici UTM, nici referrer, nici pagina de intrare.
-- Practic nu puteam răspunde la „de unde a venit comanda asta", deși
-- investisem în articole (ANCPI), landing-uri (constatator per tip) și
-- clustere SEO. GA4 arată sesiuni; asta leagă banii de comanda reală.
--
-- Un singur JSONB în loc de 10 coloane: parametrii de campanie se schimbă
-- (gclid → gbraid → wbraid), iar o schemă rigidă ar cere migrare la fiecare
-- platformă nouă de ads.
--
-- Formă:
-- {
--   "first": { "utm_source": "google", "utm_medium": "organic",
--              "referrer": "https://google.com/", "landing": "/ancpi-nu-functioneaza/",
--              "at": "2026-07-18T10:00:00Z" },
--   "last":  { ... aceleași chei, la ultima vizită înainte de comandă }
-- }
--
-- first = ce ne-a descoperit clientul; last = ce a închis vânzarea. Ambele
-- contează: un articol poate aduce omul, iar pagina de serviciu îl convertește.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS attribution JSONB;

COMMENT ON COLUMN orders.attribution IS
  'Atribuire marketing: {first,last} cu utm_*, gclid/fbclid, referrer, landing, at. first=descoperire, last=conversie. Populat la crearea draftului din cookie-ul de atribuire.';

-- Interogarea principală din raport: „ce pagini de intrare aduc comenzi plătite".
CREATE INDEX IF NOT EXISTS idx_orders_attribution_first_landing
  ON orders ((attribution -> 'first' ->> 'landing'))
  WHERE attribution IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_attribution_last_source
  ON orders ((attribution -> 'last' ->> 'utm_source'))
  WHERE attribution IS NOT NULL;
