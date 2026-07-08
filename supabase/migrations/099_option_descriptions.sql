-- 099: Descrieri pentru opțiunile fără text (cardurile „Opțiuni Disponibile"
-- apăreau goale pe paginile de servicii). Se completează DOAR unde lipsesc.

UPDATE service_options SET description = 'Comanda ta intră prioritar în lucru și primești documentul în termenul urgent afișat.'
WHERE code = 'urgenta' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Traducere realizată de un traducător autorizat de Ministerul Justiției, în limba de care ai nevoie.'
WHERE code = 'traducere' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Legalizarea notarială a traducerii autorizate — cerută frecvent la dosarele oficiale din străinătate.'
WHERE code = 'legalizare' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Apostila Camerei Notarilor aplicată pe traducerea legalizată — cerută de anumite state.'
WHERE code = 'apostila_notari' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Exemplare suplimentare ale documentului, utile când depui mai multe dosare.'
WHERE code = 'copii_suplimentare' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Un specialist verifică suplimentar corectitudinea datelor înainte de depunere.'
WHERE code = 'verificare_expert' AND (description IS NULL OR trim(description) = '');

UPDATE service_options SET description = 'Apostila de la Haga aplicată pe document — obligatorie pentru folosirea în afara Uniunii Europene.'
WHERE code = 'apostila_haga' AND (description IS NULL OR trim(description) = '');
