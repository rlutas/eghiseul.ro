-- Extrasele multilingve (naștere + căsătorie) nu mai întreabă
-- „Vechiul certificat mi-a fost: Pierdut".
--
-- Cerere echipă din Ghid (01.10.2026): un extras multilingv se poate elibera
-- oricând, chiar de două ori într-o lună, iar întrebarea îi obliga pe clienți
-- să bifeze „pierdut" pentru un document pe care poate nu l-au avut niciodată.
-- Cererea ANEXA 4 nu folosește câmpul. Certificatele de naștere/căsătorie
-- (duplicat, ANEXA 59) îl păstrează.

UPDATE services
SET verification_config = jsonb_set(
      verification_config,
      '{civilStatus,fields,oldCertificateReason}',
      'false'::jsonb,
      false
    ),
    updated_at = now()
WHERE slug IN ('extras-multilingv-certificat-nastere', 'extras-multilingv-certificat-casatorie')
  AND verification_config #> '{civilStatus,fields,oldCertificateReason}' = 'true'::jsonb;
