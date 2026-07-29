-- 140: Furnizori canonici + grilă de tarife pentru costurile interne
--
-- Extinde feature-ul din migrarea 136. Două schimbări:
--
-- 1. Lista de furnizori devine cea reală: traducătorul, notarul (legalizări),
--    Camera Notarilor (apostila notarială) + instituțiile la care plătim taxă
--    pe fiecare document emis de workeri (ONRC, ANCPI).
--
-- 2. Cheie nouă `supplier_tariffs` — ce plătim, ca să nu se tasteze de fiecare
--    dată. Două forme în aceeași listă:
--      • per pagină  (traducător/notar): firstPageRon + extraPageRon
--        ex. notar: prima pagină 45, fiecare următoare 5 → 3 pagini = 55 lei
--      • fix per serviciu (ONRC/ANCPI): serviceSlug + amountRon
--
--    Intrările de taxă sunt seed-uite cu amountRon = null: serviciul e mapat la
--    instituție (deci apare la finalizare, cu câmp gol), dar suma o completează
--    echipa din Setări — nu inventăm cifre în migrare.
--    ⚠️ ANCPI: urgența costă 5× tariful normal (Ordin 16/2019), de-aia suma
--    rămâne editabilă la fiecare comandă și nu se auto-înregistrează.

UPDATE admin_settings
SET value = '[
  {"name": "Traducător", "type": "traducator", "active": true},
  {"name": "Notar", "type": "notar", "active": true},
  {"name": "Camera Notarilor", "type": "camera_notarilor", "active": true},
  {"name": "ONRC", "type": "institutie", "active": true},
  {"name": "ANCPI", "type": "institutie", "active": true}
]'::jsonb
WHERE key = 'suppliers';

INSERT INTO admin_settings (key, value)
VALUES ('suppliers', '[
  {"name": "Traducător", "type": "traducator", "active": true},
  {"name": "Notar", "type": "notar", "active": true},
  {"name": "Camera Notarilor", "type": "camera_notarilor", "active": true},
  {"name": "ONRC", "type": "institutie", "active": true},
  {"name": "ANCPI", "type": "institutie", "active": true}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO admin_settings (key, value)
VALUES ('supplier_tariffs', '[
  {"supplier": "ONRC", "category": "taxa_institutie", "serviceSlug": "certificat-constatator", "amountRon": null},

  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "extras-carte-funciara", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "extras-cf-colectiv", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "extras-plan-cadastral", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "identificare-imobil", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "identificare-imobile-proprietar", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "certificat-sarcini", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "certificat-detineri-imobile", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-carte-funciara", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-arhiva-ocpi", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-contract-vanzare", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-intabulare", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-inventar-coordonate", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-plan-cadastral", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-plan-incadrare", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "copie-releveu", "amountRon": null},
  {"supplier": "ANCPI", "category": "taxa_institutie", "serviceSlug": "plan-amplasament-delimitare", "amountRon": null}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE order_supplier_costs IS
  'Costuri interne per comandă: colaboratori (traducător/notar/Camera Notarilor) + taxe instituție (ONRC/ANCPI). Doar echipa. Marjă + raport lunar per furnizor. Tarife: admin_settings.supplier_tariffs.';

NOTIFY pgrst, 'reload schema';
