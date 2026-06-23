-- 076: Wizard audit fixes (WPForms parity) — 2026-06-23
--
-- Decizii owner după auditul formularelor vs export WPForms:
--  1. Cazier judiciar (PF): re-colectează numele părinților (Prenume Tată/Mamă) —
--     WPForms 135/136. parentDataRequired era false (dropat la dedup civil-status,
--     dar judiciar nu are modul civil-status, deci se pierduseră complet).
--  2. Cazier judiciar (PF): câmp opțional "Nume Anterior" (WPForms 171) pentru cei
--     care și-au schimbat numele. Flag nou collectBirthName (wired în PersonalDataStep).
--  3. Cazier auto: cazierul auto e legat de ȘOFER (permis), nu de mașină. Înlocuim
--     numărul de înmatriculare cu "Numărul Permisului de Conducere".
--
-- PJ judiciar (cazier-judiciar-persoana-juridica) NU primește părinți/nume anterior
-- (e firmă, nu persoană).

-- 1 + 2. Cazier judiciar PF: parent names + nume anterior
UPDATE services
SET verification_config = jsonb_set(
      jsonb_set(verification_config, '{personalKyc,parentDataRequired}', 'true'),
      '{personalKyc,collectBirthName}', 'true'
    )
WHERE slug IN ('cazier-judiciar', 'cazier-judiciar-persoana-fizica');

-- 3. Cazier auto: permis în loc de înmatriculare
UPDATE services
SET verification_config = jsonb_set(
      jsonb_set(verification_config, '{vehicleVerification,fields,plateNumber,required}', 'false'),
      '{vehicleVerification,fields,drivingLicense}', '{"required": true}'::jsonb
    )
WHERE slug = 'cazier-auto';
