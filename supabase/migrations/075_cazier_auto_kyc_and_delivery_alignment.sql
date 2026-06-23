-- 075: Cazier Auto KYC + delivery-term alignment
--
-- Cerere owner (2026-06-23):
--  * Cazier Auto trebuie să ceară poză act identitate (ca la Cazier Judiciar):
--    activăm personalKyc (CI/pașaport + selfie). Fără contract/signature (auto nu
--    are document_templates, deci signatureRequired rămâne false).
--  * Termen de livrare Cazier Auto = la fel ca Cazier Judiciar ("2-4 zile lucrătoare",
--    estimated_days 3 / urgent_days 2). Înainte: estimated_days=1, fără display range.
--  * Certificat Integritate: aliniem estimated_days la 3 (display era deja "2-4 zile").
--
-- Prețurile (auto base 198 + urgență 80 = ca judiciar; fiscal 198 doar simplu) erau
-- deja corecte în urma migrației 036 — nu se modifică aici.

-- 1. Cazier Auto: termen livrare ca la judiciar
UPDATE services
SET estimated_days = 3,
    urgent_days = 2,
    processing_config = COALESCE(processing_config, '{}'::jsonb)
      || '{"estimated_days_display": "2-4 zile lucrătoare"}'::jsonb
WHERE slug = 'cazier-auto';

-- 2. Cazier Auto: activează pasul de upload act identitate (CI/pașaport + selfie)
UPDATE services
SET verification_config = jsonb_set(
      verification_config,
      '{personalKyc}',
      '{
        "enabled": true,
        "selfieRequired": true,
        "parentDocuments": {"enabled": false},
        "citizenshipFlows": {
          "foreign": {"documents": []},
          "european": {"documents": []},
          "romanian": {"documents": ["ci_or_passport", "selfie"]}
        },
        "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
        "signatureRequired": false,
        "parentDataRequired": false,
        "expiredDocumentAllowed": false,
        "requireAddressCertificate": "never"
      }'::jsonb,
      true
    )
WHERE slug = 'cazier-auto';

-- 3. Certificat Integritate: aliniază estimated_days la judiciar (display deja "2-4 zile")
UPDATE services
SET estimated_days = 3,
    urgent_days = 2
WHERE slug = 'certificat-integritate';
