# Service Verification Requirements Matrix

## Overview

This document defines the verification requirements for each service on eghiseul.ro. The verification system is **modular** - each service can enable/disable verification components based on its specific needs.

**Last Updated:** 2025-12-19
**Version:** 1.0

---

## Service Requirements Matrix

### Quick Reference Table

| Service | KYC Personal | KYC Company | Signature | Selfie | Parents Docs | Property Data | Vehicle Data |
|---------|--------------|-------------|-----------|--------|--------------|---------------|--------------|
| Cazier Fiscal | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cazier Judiciar | ✅ | ⚡ PJ only | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cazier Auto | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Certificat Naștere | ✅ | ❌ | ✅ | ✅ | ⚡ Minor | ❌ | ❌ |
| Certificat Căsătorie | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certificat Celibat | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certificat Integritate | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certificat Constatator | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Extras Carte Funciară | ❌ | ⚡ Optional | ❌ | ❌ | ❌ | ✅ | ❌ |
| Extras Multilingv Naștere | ✅ | ❌ | ✅ | ✅ | ⚡ Minor | ❌ | ❌ |
| Extras Multilingv Căsătorie | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Rovinieta | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- ✅ Required
- ⚡ Conditional (depends on client type/scenario)
- ❌ Not required

---

## Detailed Service Requirements

### 1. Cazier Fiscal (SRV-001)

**Verification Type:** Full Personal KYC

```yaml
service: cazier-fiscal
verification:
  personal_kyc:
    enabled: true
    documents_required:
      - ci_front          # Obligatoriu
      - ci_back           # Opțional (pentru CI nou)
      - passport          # Alternativă la CI
      - certificat_domiciliu  # Pentru CI nou/Passport
    selfie_required: true
    signature_required: true

  company_kyc:
    enabled: false

  citizenship_flows:
    romanian_resident:
      documents: [ci_or_passport, selfie]
    foreign_romanian:
      documents: [passport, residence_permit, selfie]
    foreign:
      documents: [passport, registration_certificate, selfie]

  expired_document_allowed: false
```

**Flow Steps:**
1. Contact Data
2. Personal Data (CNP, Name)
3. Document Upload (CI/Passport)
4. Selfie KYC
5. Signature
6. Delivery Options
7. Payment

---

### 2. Cazier Judiciar (SRV-002)

**Verification Type:** Full Personal KYC + Optional Company Verification

```yaml
service: cazier-judiciar
verification:
  personal_kyc:
    enabled: true
    documents_required:
      - ci_front
      - ci_back           # Pentru CI nou
      - passport          # Alternativă
      - certificat_domiciliu
    selfie_required: true
    signature_required: true

  company_kyc:
    enabled: true
    condition: "client_type == 'PJ'"
    validation: infocui.ro
    blocked_types:
      - ASOCIAȚIE
      - FUNDAȚIE
      - ONG
      - CABINET
      - PAROHIE
    special_rules:
      - type: [PFA, II, IF]
        message: "Se eliberează cazier PF (nu au personalitate juridică)"

  citizenship_flows:
    romanian:
      documents: [ci_or_passport, selfie]
      processing: standard  # 3-5 zile
    european:
      documents: [passport_or_ci, residence_permit, selfie]
      processing: standard
    foreign:
      documents: [passport, residence_permit, registration_certificate, selfie]
      processing: extended  # 7-15 zile
      extra_cost: 119.00

  parent_data_required: true  # Prenume tată, prenume mamă
  expired_document_allowed: false
```

**Flow Steps:**
1. Contact Data
2. Client Type (PF/PJ) + Citizenship
3. Personal/Company Data
4. Document Upload KYC
5. Signature
6. Options (Urgent, Translation, Apostille)
7. Payment

---

### 3. Cazier Auto (SRV-003)

**Verification Type:** Vehicle Data Only

```yaml
service: cazier-auto
verification:
  personal_kyc:
    enabled: false

  company_kyc:
    enabled: false

  vehicle_verification:
    enabled: true
    fields_required:
      - numar_inmatriculare
      - serie_sasiu         # VIN
      - marca
      - model
      - an_fabricatie
    validation: RAR database

  expired_document_allowed: N/A
```

**Flow Steps:**
1. Contact Data
2. Vehicle Data
3. Billing Data
4. Payment

---

### 4. Certificat Constatator ONRC (SRV-030)

**Verification Type:** Company Verification Only (NO Personal KYC)

```yaml
service: certificat-constatator
verification:
  personal_kyc:
    enabled: false

  company_kyc:
    enabled: true
    required: true
    validation: infocui.ro + ONRC
    fields:
      - cui_cif
      - nume_firma      # Auto-completed
      - adresa          # Auto-completed
      - tip_entitate    # Auto-detected

    allowed_types:
      - SRL, S.R.L.
      - SA, S.A.
      - SCS, SCA, SNC
      - PFA, II, IF
      - COOPERATIVĂ

    blocked_types:
      - ASOCIAȚIE
      - FUNDAȚIE
      - FEDERAȚIE
      - ONG
      - CLUB, LIGA
      - SINDICAT
      - CABINET (medical, avocat)
      - PAROHIE, BISERICĂ
      - PUNCT DE LUCRU
      - FILIALĂ, SUCURSALĂ

    block_message: "Pentru acest tip de entitate nu se poate elibera certificat constatator de la ONRC!"

  signature_required: false
  selfie_required: false
```

**Flow Steps:**
1. Contact Data + CUI
2. Document Type Selection
3. Billing Data
4. Payment

---

### 5. Extras Carte Funciară (SRV-031)

**Verification Type:** Property Data Only

```yaml
service: extras-carte-funciara
verification:
  personal_kyc:
    enabled: false

  company_kyc:
    enabled: false
    optional_for_billing: true  # Pentru facturare PJ

  property_verification:
    enabled: true
    fields_required:
      - judet
      - localitate_uat
      - nr_carte_funciara
      - nr_cadastral
    fields_optional:
      - nr_topografic
      - motiv_solicitare
    validation: ANCPI / e-Terra

  identification_service:
    # Special service for finding property
    enabled_for: [identificare_proprietar, identificare_adresa]
    extra_fields:
      - adresa_imobil
      - nume_proprietar
      - cnp_cui

  signature_required: false
  selfie_required: false
```

**Flow Steps:**
1. Contact Data
2. Property Data + Service Type
3. Billing Data
4. Payment

---

### 6. Certificat Naștere (SRV-010)

**Verification Type:** Full Personal KYC + Conditional Parent Documents

```yaml
service: certificat-nastere
verification:
  personal_kyc:
    enabled: true
    documents_required:
      - ci_front
      - ci_back
      - passport
      - certificat_domiciliu
      - vechiul_certificat   # Optional
    selfie_required: true
    signature_required: true

  company_kyc:
    enabled: false

  parent_documents:
    enabled: true
    condition: "pentru_cine == 'minor'"
    documents_required:
      - ci_parinte_1       # Buletin/Pașaport părinte
      - ci_parinte_2       # Opțional (al doilea părinte)

  parent_data_required: true  # Nume complet tată + mamă

  citizenship_flows:
    # Accepts both Romanian and foreign citizens
    all_citizenships_allowed: true

  # SPECIAL: This service accepts expired documents!
  expired_document_allowed: true
  expired_document_message: "Document expirat - acceptat pentru cerere certificat naștere"
```

**Flow Steps:**
1. Contact Data
2. Personal Data (Minor/Adult, Parent Names)
3. Service & Destination Country
4. Document Upload + KYC
5. Signature
6. Options (Translation, Apostille)
7. Payment

---

### 7. Rovinieta (SRV-040)

**Verification Type:** Vehicle Data Only (External Service)

```yaml
service: rovinieta
verification:
  personal_kyc:
    enabled: false

  company_kyc:
    enabled: false

  vehicle_verification:
    enabled: true
    fields_required:
      - numar_inmatriculare
      - categorie_vehicul   # A-G
      - perioada            # 1 zi - 12 luni
    validation: none (external)

  external_redirect:
    enabled: true
    target: erovinieta.net
    utm_tracking: true

  signature_required: false
  selfie_required: false
```

**Flow Steps:**
1. Vehicle Category + Period
2. Plate Number
3. Redirect to erovinieta.net

---

## Verification Components

### 1. Personal KYC Component

```typescript
interface PersonalKYCConfig {
  enabled: boolean;

  // Document requirements
  acceptedDocuments: ('ci_vechi' | 'ci_nou' | 'passport')[];
  addressCertificateRequired: boolean;  // For CI nou/Passport

  // Additional verification
  selfieRequired: boolean;
  signatureRequired: boolean;

  // Expiry rules
  expiredDocumentAllowed: boolean;

  // Citizenship flows
  citizenshipFlows: {
    romanian: CitizenshipFlow;
    european: CitizenshipFlow;
    foreign: CitizenshipFlow;
  };

  // Parent data
  parentDataRequired: boolean;
  parentDocumentsRequired: boolean;
  parentDocumentsCondition?: string;  // e.g., "pentru_cine == 'minor'"
}
```

### 2. Company KYC Component

```typescript
interface CompanyKYCConfig {
  enabled: boolean;
  condition?: string;  // e.g., "client_type == 'PJ'"

  // CUI validation
  validation: 'infocui' | 'onrc' | 'none';
  autoComplete: boolean;  // Auto-fill company data from CUI

  // Entity type rules
  allowedTypes: string[];
  blockedTypes: string[];
  blockMessage?: string;

  // Special rules
  specialRules: {
    types: string[];
    message: string;
    action: 'warn' | 'block' | 'redirect';
  }[];
}
```

### 3. Property Verification Component

```typescript
interface PropertyVerificationConfig {
  enabled: boolean;

  // Required fields
  fields: {
    judet: boolean;
    localitate: boolean;
    carteFunciara: boolean;
    cadastral: boolean;
    topografic: boolean;
  };

  // Validation
  validation: 'ancpi' | 'eterra' | 'none';

  // Identification services
  identificationServices: boolean;
  identificationFields?: string[];
}
```

### 4. Vehicle Verification Component

```typescript
interface VehicleVerificationConfig {
  enabled: boolean;

  // Required fields
  fields: {
    plateNumber: boolean;
    vin: boolean;
    brand: boolean;
    model: boolean;
    year: boolean;
    category: boolean;  // For rovinieta
    period: boolean;    // For rovinieta
  };

  // Validation
  validation: 'rar' | 'external' | 'none';
}
```

---

## Service Configuration Schema

Each service is configured in the database or config file:

```typescript
interface ServiceVerificationConfig {
  serviceSlug: string;
  serviceName: string;

  // Verification components
  personalKyc: PersonalKYCConfig;
  companyKyc: CompanyKYCConfig;
  propertyVerification: PropertyVerificationConfig;
  vehicleVerification: VehicleVerificationConfig;

  // Form configuration
  formSteps: FormStep[];

  // Special rules
  expiredDocumentAllowed: boolean;
  externalRedirect?: {
    enabled: boolean;
    url: string;
    utmTracking: boolean;
  };
}
```

---

## Database Schema

### services table (extended)

```sql
ALTER TABLE services ADD COLUMN verification_config JSONB;

-- Example for Cazier Fiscal
UPDATE services SET verification_config = '{
  "personal_kyc": {
    "enabled": true,
    "accepted_documents": ["ci_vechi", "ci_nou", "passport"],
    "address_certificate_required": true,
    "selfie_required": true,
    "signature_required": true,
    "expired_document_allowed": false
  },
  "company_kyc": {
    "enabled": false
  },
  "property_verification": {
    "enabled": false
  },
  "vehicle_verification": {
    "enabled": false
  }
}'::jsonb
WHERE slug = 'cazier-fiscal';

-- Example for Certificat Constatator
UPDATE services SET verification_config = '{
  "personal_kyc": {
    "enabled": false
  },
  "company_kyc": {
    "enabled": true,
    "validation": "infocui",
    "auto_complete": true,
    "blocked_types": ["ASOCIAȚIE", "FUNDAȚIE", "ONG"]
  },
  "property_verification": {
    "enabled": false
  },
  "vehicle_verification": {
    "enabled": false
  }
}'::jsonb
WHERE slug = 'certificat-constatator';
```

---

## Component Usage in Order Wizard

The Order Wizard dynamically renders steps based on service configuration:

```typescript
function buildOrderSteps(service: Service): OrderStep[] {
  const steps: OrderStep[] = [];
  const config = service.verificationConfig;

  // Step 1: Always have contact
  steps.push({ id: 'contact', component: ContactStep });

  // Step 2: Personal data (if personal KYC enabled)
  if (config.personalKyc.enabled) {
    steps.push({ id: 'personal', component: PersonalDataStep });
  }

  // Step 2b: Company data (if company KYC enabled)
  if (config.companyKyc.enabled) {
    steps.push({ id: 'company', component: CompanyDataStep });
  }

  // Step 2c: Property data (if property verification enabled)
  if (config.propertyVerification.enabled) {
    steps.push({ id: 'property', component: PropertyDataStep });
  }

  // Step 2d: Vehicle data (if vehicle verification enabled)
  if (config.vehicleVerification.enabled) {
    steps.push({ id: 'vehicle', component: VehicleDataStep });
  }

  // Step 3: Service options
  steps.push({ id: 'options', component: ServiceOptionsStep });

  // Step 4: KYC documents (if personal KYC with docs)
  if (config.personalKyc.enabled && config.personalKyc.acceptedDocuments.length > 0) {
    steps.push({ id: 'kyc', component: KYCDocumentsStep });
  }

  // Step 5: Signature (if required)
  if (config.personalKyc.signatureRequired) {
    steps.push({ id: 'signature', component: SignatureStep });
  }

  // Step 6: Delivery
  steps.push({ id: 'delivery', component: DeliveryStep });

  // Step 7: Review & Payment
  steps.push({ id: 'review', component: ReviewStep });

  return steps;
}
```

---

## Related Documentation

- [Romanian Document Handling](./romanian-document-handling.md) - Document types and OCR
- [OCR Improvement Plan](./ocr-improvement-plan.md) - OCR system improvements
- [Document Comparison Table](./document-comparison-table.md) - Quick reference

---

## Implementation Checklist

### Phase 1: Database & Config
- [ ] Add `verification_config` column to services table
- [ ] Migrate existing service configurations
- [ ] Create TypeScript interfaces for configs

### Phase 2: Components
- [ ] Create `PersonalKYCStep` component
- [ ] Create `CompanyKYCStep` component
- [ ] Create `PropertyDataStep` component
- [ ] Create `VehicleDataStep` component
- [ ] Update Order Wizard to use dynamic steps

### Phase 3: Validation
- [ ] Implement CUI validation (infocui.ro)
- [ ] Implement property validation (ANCPI)
- [ ] Implement vehicle validation (if needed)
- [ ] Update OCR to work with component system

### Phase 4: Testing
- [ ] Test each service flow
- [ ] Test conditional fields
- [ ] Test edge cases (blocked company types, expired docs)
