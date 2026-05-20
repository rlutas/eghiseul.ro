-- Migration 037: Block PFA/II/IF/Cabinet entities from PJ flow for cazier services
--
-- Aligns with cazierjudiciaronline.com behavior: PFA / Întreprindere
-- Individuală / Întreprindere Familială / Cabinet entities are tax-PF.
-- Cazierul/cazierul fiscal SE ELIBEREAZĂ pe persoana fizică titulară.
-- Until now we only warned the user — now we block and suggest switching
-- to the PF wizard (per word-boundary regex in
-- `src/lib/services/entity-type-detection.ts`).
--
-- ONG entities (Asociație / Fundație / etc.) remain allowed but the user
-- is warned that extra docs are needed (extras Registrul Asociațiilor +
-- încheiere motivată).

BEGIN;

-- 1. Cazier Judiciar PJ
UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      verification_config,
      '{companyKyc,blockedTypes}',
      '["PFA", "II", "IF", "CABINET", "BIROU NOTARIAL", "BIROU INDIVIDUAL", "EXECUTOR", "MEDIC SPECIALIST", "NOTAR PUBLIC"]'::jsonb
    ),
    '{companyKyc,blockMessage}',
    '"Pentru PFA / II / IF / Cabinet, cazierul se eliberează pe numele persoanei fizice titulare. Te rugăm să folosești fluxul pentru Persoană Fizică."'::jsonb
  ),
  '{companyKyc,specialRules}',
  '[
    {
      "entityTypes": ["ASOCIATIA", "ASOCIAȚIA", "FUNDATIE", "FUNDAȚIA", "FEDERATIE", "FEDERAȚIA", "ONG", "SINDICAT", "PAROHIA", "BISERICA", "MANASTIRE"],
      "action": "warn",
      "message": "Pentru ONG (Asociație / Fundație / etc.) este nevoie de documente suplimentare: extras la zi din Registrul Asociațiilor și Fundațiilor și încheierea motivată de înregistrare (originale)."
    }
  ]'::jsonb
),
updated_at = NOW()
WHERE slug = 'cazier-judiciar-persoana-juridica';

-- 2. Umbrella cazier-judiciar (some flows still hit this row)
UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      verification_config,
      '{companyKyc,blockedTypes}',
      '["PFA", "II", "IF", "CABINET", "BIROU NOTARIAL", "BIROU INDIVIDUAL", "EXECUTOR", "MEDIC SPECIALIST", "NOTAR PUBLIC"]'::jsonb
    ),
    '{companyKyc,blockMessage}',
    '"Pentru PFA / II / IF / Cabinet, cazierul se eliberează pe numele persoanei fizice titulare. Te rugăm să folosești fluxul pentru Persoană Fizică."'::jsonb
  ),
  '{companyKyc,specialRules}',
  '[
    {
      "entityTypes": ["ASOCIATIA", "ASOCIAȚIA", "FUNDATIE", "FUNDAȚIA", "FEDERATIE", "FEDERAȚIA", "ONG", "SINDICAT", "PAROHIA", "BISERICA", "MANASTIRE"],
      "action": "warn",
      "message": "Pentru ONG (Asociație / Fundație / etc.) este nevoie de documente suplimentare: extras la zi din Registrul Asociațiilor și Fundațiilor și încheierea motivată de înregistrare (originale)."
    }
  ]'::jsonb
),
updated_at = NOW()
WHERE slug = 'cazier-judiciar'
  AND verification_config ? 'companyKyc';

-- 3. Cazier Fiscal (PF + PJ unified service, same legal logic applies for PJ-typed CUIs)
UPDATE services
SET verification_config = jsonb_set(
  jsonb_set(
    jsonb_set(
      verification_config,
      '{companyKyc,blockedTypes}',
      '["PFA", "II", "IF", "CABINET", "BIROU NOTARIAL", "BIROU INDIVIDUAL", "EXECUTOR", "MEDIC SPECIALIST", "NOTAR PUBLIC"]'::jsonb
    ),
    '{companyKyc,blockMessage}',
    '"Pentru PFA / II / IF / Cabinet, cazierul fiscal se eliberează pe numele persoanei fizice titulare. Te rugăm să folosești fluxul pentru Persoană Fizică."'::jsonb
  ),
  '{companyKyc,specialRules}',
  '[
    {
      "entityTypes": ["ASOCIATIA", "ASOCIAȚIA", "FUNDATIE", "FUNDAȚIA", "FEDERATIE", "FEDERAȚIA", "ONG", "SINDICAT", "PAROHIA", "BISERICA", "MANASTIRE"],
      "action": "warn",
      "message": "Pentru ONG (Asociație / Fundație / etc.) este nevoie de documente suplimentare: extras la zi din Registrul Asociațiilor și Fundațiilor și încheierea motivată de înregistrare (originale)."
    }
  ]'::jsonb
),
updated_at = NOW()
WHERE slug = 'cazier-fiscal'
  AND verification_config ? 'companyKyc';

COMMIT;
