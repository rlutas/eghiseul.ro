-- 057_constatator_digital_service.sql
-- Certificat Constatator is a DIGITAL, instant document (PDF by email + in the
-- client's account, issued automatically via the ONRC API). Align the service:
--   13) no physical add-ons (urgent processing / extra copies) — not in the WP
--       form and meaningless for an instant digital doc;
--   16) sync the "purpose" list (Document solicitat spre a servi la) with ONRC.
-- (Delivery is email-only — handled in the wizard step-builder, no schema change.)

-- 13) Remove physical-delivery options + the urgent flag.
DELETE FROM service_options
 WHERE service_id = (SELECT id FROM services WHERE slug = 'certificat-constatator')
   AND code IN ('urgenta', 'copii_suplimentare');

UPDATE services SET urgent_available = false WHERE slug = 'certificat-constatator';

-- 16) Sync the purpose list with the ONRC cc-reasons for "Certificat de bază"
-- (subtype 070). "Informare" first (common default), "Altele" last.
UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{constatator,purposes}',
  to_jsonb(ARRAY[
    'Informare','Accesare Fonduri','Accesare Fonduri Europene','Administratia financiara',
    'Administrația Finanțelor Publice','Administraţia Fondului pentru Mediu',
    'Agenția de Plăți și Intervenții în Agricultură','Agenția Națională de Administrare Fiscală',
    'Agenția Națională pentru Ocuparea Forței de Muncă','Agenția Națională pentru Protecția Mediului',
    'Agenția Națională pentru Resurse Minerale','Agenţia pentru Finanţarea Investiţiilor Rurale (AFIR)',
    'Ambasadă','Atestare ANRE','Autoritatea Rutieră Română','Autorizare',
    'Banca Națională a României','Bancă','Birou notar public','Casa Națională de Asigurări de Sănătate',
    'Casa Națională de Pensii','Direcţia Generală a Vămilor','Eliberare cazier judiciar','Fonduri SAPARD',
    'Inspectoratul General pentru Imigrări','Instanță','Înregistrare în scopuri de TVA','Leasing',
    'Licitație','Ministerul Economiei, Energiei și Mediului de Afaceri','Ministerul Muncii și Justiţiei Sociale',
    'Ministerul Turismului','Obținere viză','Oficiul de Cadastru și Publicitate Imobiliară','Parchet',
    'Poliție','Primãrie','PSIPAN','Registrul Auto Român','Registrul Operatorilor Intracomunitari','Altele'
  ]::text[])
)
WHERE slug = 'certificat-constatator';

NOTIFY pgrst, 'reload schema';
