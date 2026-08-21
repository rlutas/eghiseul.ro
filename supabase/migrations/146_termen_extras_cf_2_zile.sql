-- 146: termenul afișat la extras CF / plan cadastral, aliniat la realitate
--
-- Portalul public ANCPI e oprit din 13 iulie, iar extrasele nu se mai eliberează
-- automat în câteva minute: cererea o depune la OCPI un partener autorizat, cu
-- acces la e-Terra din 12 august. Termenul real e de 2 zile lucrătoare, dar
-- pagina promitea în continuare „câteva minute (24/7)" — adică exact ce nu mai
-- putem face.
--
-- Când revin platformele publice și worker-ul reia eliberarea automată, se pun
-- la loc: estimated_days = 1 + estimated_days_display = 'câteva minute (24/7)'.

UPDATE services
   SET estimated_days = 2,
       processing_config = jsonb_set(
         coalesce(processing_config, '{}'::jsonb),
         '{estimated_days_display}',
         '"2 zile lucrătoare"'::jsonb,
         true
       )
 WHERE slug IN ('extras-carte-funciara', 'extras-plan-cadastral');

NOTIFY pgrst, 'reload schema';
