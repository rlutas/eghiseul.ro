-- =============================================
-- Migration: 011_cazier_judiciar_pf_pj
-- Description: Update Cazier Judiciar to support both PF and PJ client types
-- Date: 2025-12-19
-- Sprint: Sprint 3 - Modular Verification
-- =============================================

-- =============================================
-- UPDATE CAZIER JUDICIAR FOR PF/PJ SUPPORT
-- =============================================
-- Cazier Judiciar can be requested by:
-- - PF (Persoana Fizică): Full personal KYC (CI + Selfie + Signature)
-- - PJ (Persoana Juridică): Company KYC (CUI) + Representative personal data + Signature

UPDATE services
SET verification_config = '{
  "clientTypeSelection": {
    "enabled": true,
    "options": [
      {
        "value": "PF",
        "label": "Persoană Fizică",
        "description": "Solicit cazier judiciar pentru mine personal"
      },
      {
        "value": "PJ",
        "label": "Persoană Juridică",
        "description": "Solicit cazier judiciar pentru firma mea"
      }
    ],
    "defaultValue": "PF"
  },
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
    "enabled": true,
    "condition": "client_type == ''PJ''",
    "validation": "infocui",
    "autoComplete": true,
    "allowedTypes": ["SRL", "SA", "SCS", "SNC", "SCA", "PFA", "II", "IF", "COOPERATIVA", "ONG", "ASOCIATIE", "FUNDATIE"],
    "blockedTypes": [],
    "specialRules": [
      {
        "entityTypes": ["PFA", "II", "IF"],
        "action": "warn",
        "message": "Pentru PFA/II/IF, cazierul se eliberează pe numele persoanei fizice titulare."
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
}'::JSONB
WHERE slug = 'cazier-judiciar';

-- =============================================
-- CREATE CAZIER JUDICIAR IF NOT EXISTS
-- =============================================
-- In case the service doesn't exist yet

INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured
) VALUES (
  'cazier-judiciar',
  'SRV-002',
  'Cazier Judiciar',
  'Obținem cazierul judiciar de la Poliție/Parchet. Documentul atestă că nu ai antecedente penale. Disponibil pentru persoane fizice și juridice.',
  'Document oficial care atestă lipsa antecedentelor penale.',
  'juridice',
  169.00,
  TRUE,
  5,
  2,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "birth_place", "address", "phone", "email", "purpose"],
    "delivery_methods": ["email", "registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    }
  }',
  '{
    "clientTypeSelection": {
      "enabled": true,
      "options": [
        {
          "value": "PF",
          "label": "Persoană Fizică",
          "description": "Solicit cazier judiciar pentru mine personal"
        },
        {
          "value": "PJ",
          "label": "Persoană Juridică",
          "description": "Solicit cazier judiciar pentru firma mea"
        }
      ],
      "defaultValue": "PF"
    },
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
      "enabled": true,
      "condition": "client_type == ''PJ''",
      "validation": "infocui",
      "autoComplete": true,
      "allowedTypes": ["SRL", "SA", "SCS", "SNC", "SCA", "PFA", "II", "IF", "COOPERATIVA", "ONG", "ASOCIATIE", "FUNDATIE"],
      "blockedTypes": [],
      "specialRules": [
        {
          "entityTypes": ["PFA", "II", "IF"],
          "action": "warn",
          "message": "Pentru PFA/II/IF, cazierul se eliberează pe numele persoanei fizice titulare."
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
  4,
  TRUE
) ON CONFLICT (slug) DO UPDATE SET
  verification_config = EXCLUDED.verification_config,
  description = EXCLUDED.description;

-- =============================================
-- VERIFICATION
-- =============================================
-- Run this to verify the update:
-- SELECT slug, name,
--        verification_config->'clientTypeSelection'->>'enabled' as has_client_type,
--        verification_config->'personalKyc'->>'enabled' as personal_kyc,
--        verification_config->'companyKyc'->>'enabled' as company_kyc
-- FROM services WHERE slug = 'cazier-judiciar';
