-- 120_cazier_auto_descriere_corecta.sql
-- URGENT (Raul, 2026-07-15): descrierea serviciului cazier-auto era pentru ALT
-- serviciu (istoric vehicul: accidente/daune/kilometraj/proprietari). Cazierul
-- auto real = fișa de evidență a CONDUCĂTORULUI auto (sancțiuni rutiere pe
-- permis, de la Poliția Rutieră) — wizard-ul colecta deja corect nr. permisului.
-- Aliniat cu cazierjudiciaronline.com.

UPDATE services SET
  description = 'Obținem cazierul auto (fișa de evidență a conducătorului auto) de la Poliția Rutieră: istoricul sancțiunilor rutiere, punctele de penalizare active și eventualele suspendări ale permisului. Necesar pentru atestat profesional (taxi, transport marfă/persoane), angajare ca șofer sau verificarea propriei situații.',
  short_description = 'Istoricul sancțiunilor rutiere și punctele de penalizare de pe permisul tău, de la Poliția Rutieră.',
  updated_at = now()
WHERE slug = 'cazier-auto';

NOTIFY pgrst, 'reload schema';
