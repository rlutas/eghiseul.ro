-- 132: Traducere Autorizată — descriere generică (limba se alege la selectare)
--
-- Patru servicii aveau descrierea veche „în limba engleză" deși wizard-ul
-- (și acum și dialogul admin Modifică) cere selectarea limbii din listă.
-- Aliniem la textul generic folosit deja de stare civilă / integritate / auto.

UPDATE service_options so
SET description = 'Traducere realizată de un traducător autorizat de Ministerul Justiției, în limba de care ai nevoie.',
    updated_at = NOW()
FROM services s
WHERE s.id = so.service_id
  AND so.code = 'traducere'
  AND s.slug IN (
    'cazier-fiscal',
    'cazier-judiciar',
    'cazier-judiciar-persoana-fizica',
    'cazier-judiciar-persoana-juridica'
  );
