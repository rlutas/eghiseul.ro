-- 141: pe CE document s-a făcut cheltuiala
--
-- O comandă poate conține mai multe documente (cazier + certificat de
-- integritate adăugat ca add-on, cazier secundar, pachet naștere…), iar
-- traducerea/legalizarea se poate face pe fiecare. Până acum costul se
-- înregistra doar pe categorie („Traducere"), deci pe o comandă cu două
-- documente nu se putea spune cât a costat fiecare — doar totalul.
--
-- `document_label` = documentul la care se referă costul (numele serviciului
-- sau al add-on-ului). NULL pe comenzile cu un singur document, unde întrebarea
-- nu se pune.

ALTER TABLE order_supplier_costs
  ADD COLUMN IF NOT EXISTS document_label text;

COMMENT ON COLUMN order_supplier_costs.document_label IS
  'Documentul la care se referă costul (serviciu principal sau add-on). NULL când comanda are un singur document.';

NOTIFY pgrst, 'reload schema';
