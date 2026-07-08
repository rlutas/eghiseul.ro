-- 096: Extras Multilingv ca servicii de sine stătătoare (paritate WP)
--
-- Pe WordPress, extrasul multilingv era produs separat (799 RON, formular
-- propriu — ex. comanda reală a Anei Malitca). Pe site-ul nou exista doar ca
-- add-on (+399) pe certificat naștere/căsătorie, ceea ce dădea 998+399=1397 —
-- model diferit și mai scump. Se adaugă două servicii standalone la 799,
-- clonând configurația de verificare/procesare de la serviciul-părinte
-- (același flux: KYC + date stare civilă + livrare; doar documentul livrat
-- diferă). Fără add-on-uri proprii și fără urgență (ca pe WP).

INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, currency, is_active, is_featured, requires_kyc,
  estimated_days, urgent_available, urgent_days, config, display_order,
  meta_title, meta_description, verification_config, processing_config, lawyer_fee_ron
)
SELECT
  'extras-multilingv-certificat-casatorie',
  'EXTRAS_ML_CASATORIE',
  'Extras Multilingv Certificat de Căsătorie',
  'Extras multilingv (formular standard UE conform Regulamentului 2016/1191) de pe certificatul de căsătorie — valabil în toate statele UE fără traducere autorizată și fără apostilă.',
  'Formular standard multilingv de pe certificatul de căsătorie, valabil în UE fără traducere.',
  category, 799.00, currency, true, false, requires_kyc,
  estimated_days, false, urgent_days, config, display_order + 1,
  'Extras Multilingv Certificat de Căsătorie — Comandă Online | eGhișeul.ro',
  'Obții online extrasul multilingv de pe certificatul de căsătorie: valabil în UE fără traducere și fără apostilă. Depunem cererea în numele tău, livrare electronică sau prin curier.',
  verification_config, processing_config, lawyer_fee_ron
FROM services WHERE slug = 'certificat-casatorie'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, currency, is_active, is_featured, requires_kyc,
  estimated_days, urgent_available, urgent_days, config, display_order,
  meta_title, meta_description, verification_config, processing_config, lawyer_fee_ron
)
SELECT
  'extras-multilingv-certificat-nastere',
  'EXTRAS_ML_NASTERE',
  'Extras Multilingv Certificat de Naștere',
  'Extras multilingv (formular standard UE conform Regulamentului 2016/1191) de pe certificatul de naștere — valabil în toate statele UE fără traducere autorizată și fără apostilă.',
  'Formular standard multilingv de pe certificatul de naștere, valabil în UE fără traducere.',
  category, 799.00, currency, true, false, requires_kyc,
  estimated_days, false, urgent_days, config, display_order + 1,
  'Extras Multilingv Certificat de Naștere — Comandă Online | eGhișeul.ro',
  'Obții online extrasul multilingv de pe certificatul de naștere: valabil în UE fără traducere și fără apostilă. Depunem cererea în numele tău, livrare electronică sau prin curier.',
  verification_config, processing_config, lawyer_fee_ron
FROM services WHERE slug = 'certificat-nastere'
ON CONFLICT (slug) DO NOTHING;
