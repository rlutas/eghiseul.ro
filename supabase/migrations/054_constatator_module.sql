-- 054_constatator_module.sql
-- Certificat Constatator (ONRC) details wizard module.
-- Document type is price-bearing (option A): selecting it overrides the order
-- base price — "cu Istoric" 499.99 vs "pe Firmă"/"PF" 119.99.
-- Mirrors the live WPForms constatator form (report types, purpose, period).
-- Applied live via REST on 2026-06-14; this file is the reproducible record.

UPDATE services
SET verification_config = verification_config || jsonb_build_object(
  'constatator', jsonb_build_object(
    'enabled', true,
    'documentTypes', jsonb_build_array(
      jsonb_build_object('value', 'firma', 'label', 'Certificat Constatator pe Firmă', 'price', 119.99),
      jsonb_build_object('value', 'pf', 'label', 'Certificat Constatator Persoană Fizică', 'price', 119.99,
        'reportTypes', jsonb_build_array('Certificat constatator de bază', 'Certificat constatator fonduri IMM', 'Certificat constatator pentru insolvență')),
      jsonb_build_object('value', 'istoric', 'label', 'Certificat Constatator cu Istoric', 'price', 499.99,
        'reportTypes', jsonb_build_array('Certificat constatator CAS', 'Certificat constatator pe persoană', 'IGI - obținere viză'))
    ),
    'purposes', jsonb_build_array(
      'Casa Națională de Asigurări de Sănătate (CNAS)', 'Administrația Finanțelor Publice',
      'Agenția Națională de Administrare Fiscală (ANAF)', 'Agenția pentru Finanțarea Investițiilor Rurale (AFIR)',
      'Autorizare', 'Eliberare cazier judiciar', 'Informare', 'Înregistrare în scopuri de TVA',
      'Poliție', 'Primărie', 'Altele'
    )
  )
)
WHERE slug = 'certificat-constatator';

-- No schema change (value-only update) → no PostgREST schema reload needed.
