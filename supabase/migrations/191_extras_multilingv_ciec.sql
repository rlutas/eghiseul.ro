-- 191: extras multilingv, factual fix (06.10.2026). NOT APPLIED by the author;
-- apply after review.
--
-- The service and option texts described the product as the "formular standard
-- multilingv" of Regulation (EU) 2016/1191, "valabil în UE fără traducere".
-- What we actually request (cerere = Anexa 4 to HG 727/2013) and what the
-- civil-status office issues is the multilingual EXTRACT under Convention CIEC
-- no. 16 (Vienna, 1976), to which Romania acceded by Legea nr. 65/2012 (in
-- force for Romania since 05.06.2013). It has the same probative force as the
-- certificate, is accepted without translation/legalisation in the 23 other
-- states that apply the convention, and cannot be used before Romanian
-- authorities. The 2016/1191 form is a different thing: a translation aid that
-- only accompanies a certificate, between EU states.
-- Fact note: docs/documentero/extras-multilingv-fapte.md

UPDATE public.services
SET
  short_description = 'Extras multilingv al actului de naștere (Convenția CIEC nr. 16), acceptat fără traducere în 23 de state.',
  description = 'Extras multilingv al actului de naștere, eliberat de starea civilă în baza Convenției CIEC nr. 16 '
    || '(Viena, 1976; Legea nr. 65/2012). Are aceeași putere doveditoare ca certificatul și e acceptat fără '
    || 'traducere, legalizare sau apostilă în statele care aplică convenția (între care Italia, Spania, Germania, '
    || 'Franța). Nu se folosește în fața autorităților române.',
  updated_at = now()
WHERE slug = 'extras-multilingv-certificat-nastere';

UPDATE public.services
SET
  short_description = 'Extras multilingv al actului de căsătorie (Convenția CIEC nr. 16), acceptat fără traducere în 23 de state.',
  description = 'Extras multilingv al actului de căsătorie, eliberat de starea civilă în baza Convenției CIEC nr. 16 '
    || '(Viena, 1976; Legea nr. 65/2012). Are aceeași putere doveditoare ca certificatul și e acceptat fără '
    || 'traducere, legalizare sau apostilă în statele care aplică convenția (între care Italia, Spania, Germania, '
    || 'Franța). Nu se folosește în fața autorităților române.',
  updated_at = now()
WHERE slug = 'extras-multilingv-certificat-casatorie';

-- Option shown in the order wizard on the certificate services.
UPDATE public.service_options o
SET description = 'Extras multilingv după Convenția CIEC nr. 16, eliberat odată cu certificatul: acceptat fără '
    || 'traducere și fără apostilă în statele care aplică convenția (Italia, Spania, Germania, Franța și altele).'
FROM public.services s
WHERE o.service_id = s.id
  AND o.code = 'extras_multilingv'
  AND s.slug IN ('certificat-nastere', 'certificat-casatorie');
