-- 190: catalog descriptions without "oficial" (26.09.2026).
--
-- Follow-up to 189. Five services still paired "oficial" with the document
-- (banned wording, see google-ads-documente-oficiale notes and
-- .claude/rules/content-and-seo.md §7: we are a private service; we obtain
-- documents, the institution issues them).
--
-- rovinieta also claimed "redirect oficial CNAIR": the page sells through
-- RovinietaPurchaseForm, it does not redirect to CNAIR.

UPDATE public.services
SET
  short_description = 'Extras CF de la ANCPI, obținut de noi și livrat pe email în câteva minute.',
  updated_at = now()
WHERE slug = 'extras-carte-funciara';

UPDATE public.services
SET
  description = 'Identificăm imobilul (parcela/construcția și numărul de carte funciară) după adresă, când nu cunoști numărul CF. '
    || 'După identificare primești și un extras de carte funciară. Dacă imobilul nu apare în e-Terra, depunem la OCPI '
    || 'cererea de certificat privind înscrierea imobilului (inclusă în preț) și primești certificatul eliberat de OCPI, '
    || 'cu numărul de CF sau cu mențiunea că nu figurează înscris. Apartamentele pot necesita verificări suplimentare.',
  updated_at = now()
WHERE slug = 'identificare-imobil';

UPDATE public.services
SET
  description = 'Serviciu de obținere a certificatului de integritate comportamentală, eliberat de Inspectoratul General '
    || 'al Poliției Române (IGPR) conform Legii 118/2019. Certificatul atestă că persoana nu a fost condamnată sau '
    || 'sancționată pentru infracțiuni săvârșite asupra minorilor și a altor persoane vulnerabile. Se cere la angajarea '
    || 'în roluri cu contact direct cu copiii sau cu persoane aflate în situații de risc și la voluntariat cu minori.',
  updated_at = now()
WHERE slug = 'certificat-integritate';

UPDATE public.services
SET
  short_description = 'Rovinieta online, plătită cu cardul, înregistrată în sistemul CNAIR.',
  description = 'Cumperi rovinieta online, cu cardul, în câteva minute. Introduci numărul de înmatriculare, alegi '
    || 'categoria și perioada, iar rovinieta se înregistrează în sistemul CNAIR.',
  updated_at = now()
WHERE slug = 'rovinieta';

UPDATE public.services
SET
  description = 'Serviciu de obținere a certificatului de celibat, eliberat de Serviciul de Stare Civilă al primăriei '
    || 'de domiciliu. Certificatul atestă că persoana nu este căsătorită la data eliberării. Se cere la căsătoria în '
    || 'străinătate, la dosarele de cetățenie și în unele proceduri juridice.',
  updated_at = now()
WHERE slug = 'certificat-celibat';
