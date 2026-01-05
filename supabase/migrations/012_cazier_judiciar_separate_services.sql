-- =============================================
-- Migration: 012_cazier_judiciar_separate_services
-- Description: Create separate services for Cazier Judiciar PF and PJ
-- Date: 2025-12-19
-- Sprint: Sprint 3 - Modular Verification
-- =============================================

-- =============================================
-- CAZIER JUDICIAR - PERSOANĂ FIZICĂ
-- =============================================

INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured, is_active,
  meta_title, meta_description
) VALUES (
  'cazier-judiciar-persoana-fizica',
  'SRV-002-PF',
  'Cazier Judiciar Persoană Fizică',
  'Obținem cazierul judiciar pentru persoane fizice de la Poliție/Parchet. Documentul atestă că nu ai antecedente penale. Necesar pentru angajare, emigrare, adopție, sau alte proceduri legale.',
  'Cazier judiciar pentru persoane fizice - fără antecedente penale.',
  'juridice',
  169.00,
  TRUE,
  5,
  2,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "birth_place", "address", "phone", "email", "father_name", "mother_name"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    },
    "use_cases": ["angajare", "emigrare", "adopție", "proceduri legale", "permis port armă"]
  }',
  '{
    "personalKyc": {
      "enabled": true,
      "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
      "requireAddressCertificate": "ci_nou_passport",
      "selfieRequired": true,
      "signatureRequired": true,
      "expiredDocumentAllowed": false,
      "citizenshipFlows": {
        "romanian": { "documents": ["ci_or_passport", "selfie"] },
        "european": { "documents": ["passport", "residence_permit", "selfie"], "processingType": "extended", "extraDays": 10, "extraCost": 50 },
        "foreign": { "documents": ["passport", "registration_cert", "selfie"], "processingType": "extended", "extraDays": 15, "extraCost": 100 }
      },
      "parentDataRequired": true,
      "parentDocuments": { "enabled": false }
    },
    "companyKyc": {
      "enabled": false,
      "validation": "manual",
      "autoComplete": false,
      "allowedTypes": [],
      "blockedTypes": [],
      "specialRules": []
    },
    "propertyVerification": {
      "enabled": false,
      "fields": {
        "county": { "required": false },
        "locality": { "required": false },
        "carteFunciara": { "required": false },
        "cadastral": { "required": false },
        "topografic": { "required": false }
      },
      "identificationService": { "enabled": false, "extraFields": [] }
    },
    "vehicleVerification": {
      "enabled": false,
      "fields": {
        "plateNumber": { "required": false },
        "vin": { "required": false },
        "brand": { "required": false },
        "model": { "required": false },
        "year": { "required": false },
        "category": { "required": false },
        "period": { "required": false }
      },
      "plateFormat": "romanian",
      "vinValidation": false
    },
    "signature": {
      "enabled": true,
      "required": true,
      "termsAcceptanceRequired": true
    }
  }'::JSONB,
  10,
  TRUE,
  TRUE,
  'Cazier Judiciar Persoană Fizică Online | eGhișeul',
  'Obține cazierul judiciar pentru persoană fizică online, rapid și simplu. Livrare în 5 zile lucrătoare. Document oficial de la Poliție.'
) ON CONFLICT (slug) DO UPDATE SET
  verification_config = EXCLUDED.verification_config,
  description = EXCLUDED.description,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- =============================================
-- CAZIER JUDICIAR - PERSOANĂ JURIDICĂ (FIRMĂ)
-- =============================================

INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured, is_active,
  meta_title, meta_description
) VALUES (
  'cazier-judiciar-persoana-juridica',
  'SRV-002-PJ',
  'Cazier Judiciar Persoană Juridică',
  'Obținem cazierul judiciar pentru firme și companii. Necesar pentru licitații publice, contracte cu statul, sau alte proceduri ce necesită dovada lipsei antecedentelor penale ale firmei.',
  'Cazier judiciar pentru firme - necesar licitații și contracte.',
  'juridice',
  199.00,
  TRUE,
  7,
  3,
  '{
    "required_fields": ["cui", "company_name", "representative_cnp", "representative_name", "phone", "email"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "company_cui": true,
      "representative_id": true,
      "selfie": true,
      "signature": true
    },
    "use_cases": ["licitații publice", "contracte cu statul", "parteneriate", "proceduri legale"]
  }',
  '{
    "personalKyc": {
      "enabled": true,
      "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
      "requireAddressCertificate": "ci_nou_passport",
      "selfieRequired": true,
      "signatureRequired": true,
      "expiredDocumentAllowed": false,
      "citizenshipFlows": {
        "romanian": { "documents": ["ci_or_passport", "selfie"] },
        "european": { "documents": ["passport", "residence_permit", "selfie"] },
        "foreign": { "documents": ["passport", "registration_cert", "selfie"] }
      },
      "parentDataRequired": false,
      "parentDocuments": { "enabled": false }
    },
    "companyKyc": {
      "enabled": true,
      "validation": "infocui",
      "autoComplete": true,
      "allowedTypes": ["SRL", "SA", "SCS", "SNC", "SCA", "PFA", "II", "IF", "COOPERATIVA", "ONG", "ASOCIATIE", "FUNDATIE"],
      "blockedTypes": [],
      "specialRules": [
        {
          "entityTypes": ["PFA", "II", "IF"],
          "action": "warn",
          "message": "Pentru PFA/II/IF, cazierul se eliberează pe numele persoanei fizice titulare. Poți folosi serviciul pentru Persoană Fizică."
        }
      ]
    },
    "propertyVerification": {
      "enabled": false,
      "fields": {
        "county": { "required": false },
        "locality": { "required": false },
        "carteFunciara": { "required": false },
        "cadastral": { "required": false },
        "topografic": { "required": false }
      },
      "identificationService": { "enabled": false, "extraFields": [] }
    },
    "vehicleVerification": {
      "enabled": false,
      "fields": {
        "plateNumber": { "required": false },
        "vin": { "required": false },
        "brand": { "required": false },
        "model": { "required": false },
        "year": { "required": false },
        "category": { "required": false },
        "period": { "required": false }
      },
      "plateFormat": "romanian",
      "vinValidation": false
    },
    "signature": {
      "enabled": true,
      "required": true,
      "termsAcceptanceRequired": true
    }
  }'::JSONB,
  11,
  TRUE,
  TRUE,
  'Cazier Judiciar Persoană Juridică Online | Firme | eGhișeul',
  'Obține cazierul judiciar pentru firma ta online. Necesar pentru licitații publice și contracte. Livrare în 7 zile lucrătoare.'
) ON CONFLICT (slug) DO UPDATE SET
  verification_config = EXCLUDED.verification_config,
  description = EXCLUDED.description,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description;

-- =============================================
-- UPDATE ORIGINAL CAZIER JUDICIAR AS HUB PAGE
-- =============================================
-- The original page becomes a hub that links to both services

UPDATE services
SET
  description = 'Obținem cazierul judiciar de la Poliție/Parchet. Disponibil pentru persoane fizice și persoane juridice (firme). Alege tipul de cazier de care ai nevoie.',
  short_description = 'Cazier judiciar online pentru persoane fizice și firme.',
  config = '{
    "is_hub_page": true,
    "hub_services": ["cazier-judiciar-persoana-fizica", "cazier-judiciar-persoana-juridica"],
    "required_fields": [],
    "delivery_methods": ["email", "registered_mail", "courier"]
  }'::JSONB,
  meta_title = 'Cazier Judiciar Online | Persoane Fizice și Firme | eGhișeul',
  meta_description = 'Obține cazierul judiciar online rapid și simplu. Pentru persoane fizice sau firme. Livrare în 5-7 zile lucrătoare.'
WHERE slug = 'cazier-judiciar';

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- SELECT slug, name, base_price,
--        verification_config->'personalKyc'->>'enabled' as personal_kyc,
--        verification_config->'companyKyc'->>'enabled' as company_kyc
-- FROM services
-- WHERE slug LIKE 'cazier-judiciar%'
-- ORDER BY display_order;
