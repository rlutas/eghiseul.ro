-- Migration 137: „Sunteți căsătorit(ă) în prezent?" pe toate certificatele de
-- stare civilă (mai puțin celibat)
--
-- Cerință Raul (28.07.2026): întrebarea exista doar la certificat de naștere
-- (`currentlyMarried`, da/nu). O vrem identică și la căsătorie + ambele
-- extrase multilingve. Varianta cu 4 opțiuni („Care este starea civilă
-- actuală?", `maritalStatus`) rămâne EXCLUSIV la celibat — pusă în plus peste
-- da/nu ar întreba clientul de două ori aceeași informație.
--
-- Naștere + extras multilingv naștere au deja `currentlyMarried = true`;
-- UPDATE-ul e idempotent, le include ca să fie config-ul explicit pe toate.
-- `maritalStatus = false` e setat explicit la cele două servicii de căsătorie:
-- undoes o activare aplicată mai devreme în aceeași sesiune, înainte de
-- clarificare.
UPDATE services
SET verification_config = jsonb_set(
  verification_config, '{civilStatus,fields,currentlyMarried}', 'true'::jsonb, true
)
WHERE slug IN (
  'certificat-nastere',
  'certificat-casatorie',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie'
)
  AND verification_config->'civilStatus' IS NOT NULL;

UPDATE services
SET verification_config = jsonb_set(
  verification_config, '{civilStatus,fields,maritalStatus}', 'false'::jsonb, true
)
WHERE slug IN ('certificat-casatorie', 'extras-multilingv-certificat-casatorie')
  AND verification_config->'civilStatus' IS NOT NULL;

NOTIFY pgrst, 'reload schema';
