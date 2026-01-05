-- =============================================
-- Migration: 010_verification_config
-- Description: Add verification_config JSONB column for modular verification system
-- Date: 2025-12-19
-- Sprint: Sprint 3 - Modular Verification
-- =============================================

-- =============================================
-- ADD VERIFICATION_CONFIG COLUMN
-- =============================================
-- This column stores the modular verification configuration for each service.
-- Different services can enable/disable different verification modules:
-- - personalKyc: Personal identity verification (CI, Passport, OCR)
-- - companyKyc: Company verification (CUI validation)
-- - propertyVerification: Property data (Carte Funciară)
-- - vehicleVerification: Vehicle data (Cazier Auto, Rovinieta)
-- - signature: Electronic signature requirement
-- - externalRedirect: Redirect to external services

ALTER TABLE services
ADD COLUMN IF NOT EXISTS verification_config JSONB;

-- Add comment for documentation
COMMENT ON COLUMN services.verification_config IS 'Modular verification configuration: personalKyc, companyKyc, propertyVerification, vehicleVerification, signature, externalRedirect';

-- Create GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_services_verification_config
ON services USING GIN (verification_config)
WHERE verification_config IS NOT NULL;

-- =============================================
-- UPDATE EXISTING SERVICES WITH DEFAULT CONFIG
-- =============================================

-- Cazier Fiscal: Full KYC with CI/Passport, OCR, Selfie, Signature
UPDATE services
SET verification_config = '{
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
    "requireAddressCertificate": "ci_nou_passport",
    "selfieRequired": true,
    "signatureRequired": true,
    "expiredDocumentAllowed": false,
    "citizenshipFlows": {
      "romanian": { "documents": ["ci_or_passport", "selfie"] },
      "european": { "documents": ["passport", "residence_permit", "selfie"], "processingType": "extended", "extraDays": 5 },
      "foreign": { "documents": ["passport", "registration_cert", "selfie"], "processingType": "extended", "extraDays": 10 }
    },
    "parentDataRequired": false,
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
}'::JSONB
WHERE slug = 'cazier-fiscal';

-- Extras Carte Funciară: Property verification + basic personal data
UPDATE services
SET verification_config = '{
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport"],
    "requireAddressCertificate": "never",
    "selfieRequired": false,
    "signatureRequired": false,
    "expiredDocumentAllowed": false,
    "citizenshipFlows": {
      "romanian": { "documents": ["ci_or_passport"] },
      "european": { "documents": ["passport"] },
      "foreign": { "documents": ["passport"] }
    },
    "parentDataRequired": false,
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
    "enabled": true,
    "fields": {
      "county": { "required": true },
      "locality": { "required": true },
      "carteFunciara": { "required": false },
      "cadastral": { "required": true },
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
    "enabled": false,
    "required": false,
    "termsAcceptanceRequired": false
  }
}'::JSONB
WHERE slug = 'extras-carte-funciara';

-- Certificat Constatator: Company KYC only (CUI validation), no personal KYC
UPDATE services
SET verification_config = '{
  "personalKyc": {
    "enabled": false,
    "acceptedDocuments": [],
    "requireAddressCertificate": "never",
    "selfieRequired": false,
    "signatureRequired": false,
    "expiredDocumentAllowed": false,
    "citizenshipFlows": {
      "romanian": { "documents": [] },
      "european": { "documents": [] },
      "foreign": { "documents": [] }
    },
    "parentDataRequired": false,
    "parentDocuments": { "enabled": false }
  },
  "companyKyc": {
    "enabled": true,
    "validation": "infocui",
    "autoComplete": true,
    "allowedTypes": ["SRL", "SA", "SCS", "SNC", "PFA", "II", "IF", "COOPERATIVA"],
    "blockedTypes": ["ASOCIATIE", "FUNDATIE", "ONG", "CABINET", "PAROHIE", "SINDICAT"],
    "blockMessage": "Pentru acest tip de entitate nu se poate elibera certificat constatator de la ONRC!",
    "specialRules": [
      {
        "entityTypes": ["PFA", "II", "IF"],
        "action": "warn",
        "message": "Pentru PFA/II/IF se eliberează certificat constatator pe persoană fizică."
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
    "enabled": false,
    "required": false,
    "termsAcceptanceRequired": false
  }
}'::JSONB
WHERE slug = 'certificat-constatator';

-- =============================================
-- ADD MORE SERVICES WITH VERIFICATION CONFIG
-- =============================================

-- Cazier Judiciar: Full KYC with citizenship flows
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured
) VALUES (
  'cazier-judiciar',
  'SRV-002',
  'Cazier Judiciar',
  'Obținem cazierul judiciar de la Poliție/Parchet. Documentul atestă că nu ai antecedente penale.',
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
  4,
  TRUE
) ON CONFLICT (slug) DO UPDATE SET verification_config = EXCLUDED.verification_config;

-- Certificat Naștere: Full KYC, allows expired documents
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured
) VALUES (
  'certificat-nastere',
  'SRV-003',
  'Certificat de Naștere',
  'Obținem duplicat sau copie legalizată a certificatului de naștere de la Starea Civilă.',
  'Duplicat sau copie legalizată certificat naștere.',
  'personale',
  179.00,
  TRUE,
  7,
  3,
  '{
    "required_fields": ["cnp", "first_name", "last_name", "birth_date", "birth_place", "phone", "email", "father_name", "mother_name"],
    "delivery_methods": ["registered_mail", "courier"],
    "kyc_requirements": {
      "identity_card": true,
      "selfie": true,
      "signature": true
    }
  }',
  '{
    "personalKyc": {
      "enabled": true,
      "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport", "certificat_domiciliu"],
      "requireAddressCertificate": "ci_nou_passport",
      "selfieRequired": true,
      "signatureRequired": true,
      "expiredDocumentAllowed": true,
      "expiredDocumentMessage": "Pentru solicitarea certificatului de naștere, acceptăm și documente expirate.",
      "citizenshipFlows": {
        "romanian": { "documents": ["ci_or_passport", "selfie"] },
        "european": { "documents": ["passport", "selfie"] },
        "foreign": { "documents": ["passport", "selfie"] }
      },
      "parentDataRequired": true,
      "parentDocuments": { "enabled": true, "condition": "applicant_type == ''minor''" }
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
  5,
  FALSE
) ON CONFLICT (slug) DO UPDATE SET verification_config = EXCLUDED.verification_config;

-- Cazier Auto: Vehicle verification only
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured
) VALUES (
  'cazier-auto',
  'SRV-010',
  'Cazier Auto',
  'Obținem istoricul complet al vehiculului - accidente, daune, kilometraj, proprietari anteriori.',
  'Istoric complet vehicul - accidente, daune, kilometraj.',
  'auto',
  89.00,
  FALSE,
  1,
  1,
  '{
    "required_fields": ["plate_number", "email", "phone"],
    "optional_fields": ["vin"],
    "delivery_methods": ["email"],
    "kyc_requirements": {
      "identity_card": false,
      "selfie": false,
      "signature": false
    }
  }',
  '{
    "personalKyc": {
      "enabled": false,
      "acceptedDocuments": [],
      "requireAddressCertificate": "never",
      "selfieRequired": false,
      "signatureRequired": false,
      "expiredDocumentAllowed": false,
      "citizenshipFlows": {
        "romanian": { "documents": [] },
        "european": { "documents": [] },
        "foreign": { "documents": [] }
      },
      "parentDataRequired": false,
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
      "enabled": true,
      "fields": {
        "plateNumber": { "required": true },
        "vin": { "required": false },
        "brand": { "required": false },
        "model": { "required": false },
        "year": { "required": false },
        "category": { "required": false },
        "period": { "required": false }
      },
      "plateFormat": "romanian",
      "vinValidation": true
    },
    "signature": {
      "enabled": false,
      "required": false,
      "termsAcceptanceRequired": false
    }
  }'::JSONB,
  6,
  TRUE
) ON CONFLICT (slug) DO UPDATE SET verification_config = EXCLUDED.verification_config;

-- Rovinieta: Vehicle data with external redirect
INSERT INTO services (
  slug, code, name, description, short_description, category,
  base_price, requires_kyc, estimated_days, urgent_days,
  config, verification_config, display_order, is_featured
) VALUES (
  'rovinieta',
  'SRV-011',
  'Rovinieta Online',
  'Cumpără rovinieta online instant. Te redirecționăm către platforma oficială CNAIR.',
  'Rovinieta instant - redirect oficial CNAIR.',
  'auto',
  0.00,
  FALSE,
  0,
  0,
  '{
    "required_fields": ["plate_number", "category"],
    "delivery_methods": ["email"],
    "is_redirect": true
  }',
  '{
    "personalKyc": {
      "enabled": false,
      "acceptedDocuments": [],
      "requireAddressCertificate": "never",
      "selfieRequired": false,
      "signatureRequired": false,
      "expiredDocumentAllowed": false,
      "citizenshipFlows": {
        "romanian": { "documents": [] },
        "european": { "documents": [] },
        "foreign": { "documents": [] }
      },
      "parentDataRequired": false,
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
      "enabled": true,
      "fields": {
        "plateNumber": { "required": true },
        "vin": { "required": false },
        "brand": { "required": false },
        "model": { "required": false },
        "year": { "required": false },
        "category": { "required": true },
        "period": { "required": true }
      },
      "plateFormat": "romanian",
      "vinValidation": false
    },
    "signature": {
      "enabled": false,
      "required": false,
      "termsAcceptanceRequired": false
    },
    "externalRedirect": {
      "enabled": true,
      "url": "https://www.roviniete.ro",
      "utmTracking": true
    }
  }'::JSONB,
  7,
  FALSE
) ON CONFLICT (slug) DO UPDATE SET verification_config = EXCLUDED.verification_config;

-- =============================================
-- HELPER FUNCTION: Get required modules for service
-- =============================================

CREATE OR REPLACE FUNCTION get_service_required_modules(p_service_slug VARCHAR)
RETURNS TABLE (
  module_name VARCHAR,
  is_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'personalKyc'::VARCHAR AS module_name,
    COALESCE((verification_config->'personalKyc'->>'enabled')::BOOLEAN, FALSE) AS is_enabled
  FROM services WHERE slug = p_service_slug
  UNION ALL
  SELECT
    'companyKyc'::VARCHAR,
    COALESCE((verification_config->'companyKyc'->>'enabled')::BOOLEAN, FALSE)
  FROM services WHERE slug = p_service_slug
  UNION ALL
  SELECT
    'propertyVerification'::VARCHAR,
    COALESCE((verification_config->'propertyVerification'->>'enabled')::BOOLEAN, FALSE)
  FROM services WHERE slug = p_service_slug
  UNION ALL
  SELECT
    'vehicleVerification'::VARCHAR,
    COALESCE((verification_config->'vehicleVerification'->>'enabled')::BOOLEAN, FALSE)
  FROM services WHERE slug = p_service_slug
  UNION ALL
  SELECT
    'signature'::VARCHAR,
    COALESCE((verification_config->'signature'->>'enabled')::BOOLEAN, FALSE)
  FROM services WHERE slug = p_service_slug;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the migration:
--
-- SELECT slug, name, verification_config->'personalKyc'->>'enabled' as personal_kyc,
--        verification_config->'companyKyc'->>'enabled' as company_kyc,
--        verification_config->'propertyVerification'->>'enabled' as property,
--        verification_config->'vehicleVerification'->>'enabled' as vehicle
-- FROM services WHERE is_active = TRUE;
--
-- SELECT * FROM get_service_required_modules('cazier-fiscal');
-- SELECT * FROM get_service_required_modules('certificat-constatator');
--
-- =============================================
