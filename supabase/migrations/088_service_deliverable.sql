-- 088_service_deliverable.sql
-- "Ce primești" (livrabil) per serviciu cadastral, stocat în processing_config.deliverable.
-- Afișat la colaborator (ce are de livrat), pe pagina serviciului și în rezumatul comenzii.
-- Editabil ulterior din admin. identificare-imobile-proprietar livrează ȘI extras CF.

UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Certificat de sarcini'::text), true), updated_at=now() WHERE slug='certificat-sarcini';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie carte funciară (in extenso)'::text), true), updated_at=now() WHERE slug='copie-carte-funciara';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie plan cadastral'::text), true), updated_at=now() WHERE slug='copie-plan-cadastral';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Inventar de coordonate Stereo 70'::text), true), updated_at=now() WHERE slug='copie-inventar-coordonate';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie încheiere de intabulare'::text), true), updated_at=now() WHERE slug='copie-intabulare';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie releveu'::text), true), updated_at=now() WHERE slug='copie-releveu';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie certificată din arhiva OCPI'::text), true), updated_at=now() WHERE slug='copie-arhiva-ocpi';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Copie contract vânzare-cumpărare'::text), true), updated_at=now() WHERE slug='copie-contract-vanzare';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Plan de amplasament și delimitare (PAD)'::text), true), updated_at=now() WHERE slug='plan-amplasament-delimitare';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Plan de încadrare în zonă'::text), true), updated_at=now() WHERE slug='copie-plan-incadrare';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Extras de carte funciară colectivă'::text), true), updated_at=now() WHERE slug='extras-cf-colectiv';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Încheiere CF + extras cu adresa actualizată'::text), true), updated_at=now() WHERE slug='actualizare-adresa-cf';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Raport cu lista imobilelor deținute + extras(e) de carte funciară'::text), true), updated_at=now() WHERE slug='identificare-imobile-proprietar';
UPDATE services SET processing_config = jsonb_set(coalesce(processing_config,'{}'::jsonb), '{deliverable}', to_jsonb('Certificat privind deținerea/nedeținerea de imobile'::text), true), updated_at=now() WHERE slug='certificat-detineri-imobile';

NOTIFY pgrst, 'reload schema';
