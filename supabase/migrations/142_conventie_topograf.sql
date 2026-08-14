-- 142_conventie_topograf.sql
--
-- „Angajament de execuție documentație" (convenția cu topograful) pe serviciile
-- fulfilate de colaboratorul topograf.
--
-- Context: serviciile imobiliare NU merg prin avocat, deci nu au împuternicire
-- avocațială. Executantul (PFA topograf) are însă nevoie de mandatul scris al
-- proprietarului ca să ceară date din arhiva BCPI și să depună documentația în
-- numele lui. Clientul semnează convenția odată cu contractul de prestări.
--
-- Ce schimbă, pe fiecare serviciu asignat unui colaborator:
--   1. `conventie` — activează generarea documentului + câmpurile din wizard;
--   2. `signature` — aceste servicii NU aveau deloc pas de semnătură (nici
--      pentru contractul de prestări); acum clientul semnează o singură dată,
--      iar semnătura intră în ambele documente;
--   3. `propertyVerification.fields.carteFunciara.required` — numărul de CF
--      devine obligatoriu (fără el convenția nu identifică imobilul).
--
-- Idempotentă: rulează de câte ori vrei, `jsonb_set` suprascrie aceleași chei.

UPDATE services s
SET verification_config = jsonb_set(
      jsonb_set(
        jsonb_set(
          COALESCE(s.verification_config, '{}'::jsonb),
          '{conventie}',
          jsonb_build_object(
            'enabled', true,
            'executantName', 'Dumitrean Mircea Adrian',
            'executantAuthorization', 'Seria RO-SM-F nr. 0092/2013'
          ),
          true
        ),
        '{signature}',
        jsonb_build_object(
          'enabled', true,
          'required', true,
          'termsAcceptanceRequired', true
        ),
        true
      ),
      '{propertyVerification,fields,carteFunciara}',
      jsonb_build_object('required', true),
      true
    ),
    updated_at = NOW()
WHERE s.id IN (SELECT service_id FROM collaborator_service_assignments)
  AND COALESCE(s.verification_config -> 'propertyVerification' ->> 'enabled', 'false') = 'true';

-- Verificare (informativ):
--   SELECT slug,
--          verification_config->'conventie'->>'enabled' AS conventie,
--          verification_config->'signature'->>'enabled' AS semnatura
--   FROM services
--   WHERE id IN (SELECT service_id FROM collaborator_service_assignments);
