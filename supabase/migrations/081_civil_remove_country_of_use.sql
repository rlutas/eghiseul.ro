-- Migration 081: scoate „Țara în care urmează să fie folosit actul" de la
-- serviciile de stare civilă (naștere/căsătorie/celibat) — nu ne interesează.
-- Câmpul e gated pe verification_config.civilStatus.fields.countryOfUse.
UPDATE services
SET verification_config = jsonb_set(
  verification_config, '{civilStatus,fields,countryOfUse}', 'false'::jsonb, true
)
WHERE slug IN ('certificat-nastere','certificat-casatorie','certificat-celibat')
  AND verification_config->'civilStatus' IS NOT NULL;
