# Modular Verification Architecture

## Overview

This document describes the modular architecture for verification components in the eghiseul.ro platform. Each service can enable/disable different verification modules based on its requirements.

**Last Updated:** 2025-12-19
**Version:** 1.0

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORDER WIZARD PROVIDER                              │
│                    (Orchestrates all verification modules)                   │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ Service Config
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE CONFIGURATION                                │
│                                                                             │
│  {                                                                          │
│    slug: "cazier-fiscal",                                                   │
│    modules: {                                                               │
│      personalKyc: { enabled: true, ... },                                   │
│      companyKyc: { enabled: false },                                        │
│      propertyVerification: { enabled: false },                              │
│      vehicleVerification: { enabled: false }                                │
│    }                                                                        │
│  }                                                                          │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 │ Dynamically loads enabled modules
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION MODULES                                 │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  PERSONAL KYC   │  │   COMPANY KYC   │  │    PROPERTY     │             │
│  │     MODULE      │  │     MODULE      │  │     MODULE      │             │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤             │
│  │ • ID Upload     │  │ • CUI Input     │  │ • Județ Select  │             │
│  │ • OCR Extract   │  │ • Auto-complete │  │ • Localitate    │             │
│  │ • Selfie KYC    │  │ • Type Validate │  │ • Nr. CF        │             │
│  │ • Signature     │  │ • Block Rules   │  │ • Nr. Cadastral │             │
│  │ • Expiry Check  │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                                  │
│  │    VEHICLE      │  │    SIGNATURE    │                                  │
│  │     MODULE      │  │     MODULE      │                                  │
│  ├─────────────────┤  ├─────────────────┤                                  │
│  │ • Plate Number  │  │ • Canvas Draw   │                                  │
│  │ • Category      │  │ • Touch Support │                                  │
│  │ • VIN           │  │ • Save as Image │                                  │
│  │ • Period        │  │                 │                                  │
│  └─────────────────┘  └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                 │
                                 │ Module outputs
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORDER STATE                                        │
│                                                                             │
│  {                                                                          │
│    contact: { email, phone },                                               │
│    personalData: { cnp, name, birthDate, ... },                            │
│    companyData: { cui, name, address, type },                              │
│    propertyData: { judet, localitate, nrCF, ... },                         │
│    vehicleData: { plateNumber, category, ... },                            │
│    kycDocuments: { ... },                                                  │
│    signature: base64,                                                       │
│    ...                                                                      │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Specifications

### 1. Personal KYC Module

**Purpose:** Verify user identity using Romanian ID documents

**Components:**

```
src/components/orders/modules/
├── personal-kyc/
│   ├── index.ts                    # Module exports
│   ├── PersonalKYCModule.tsx       # Main container
│   ├── components/
│   │   ├── DocumentUploader.tsx    # Upload CI/Passport
│   │   ├── DocumentTypeDetector.tsx # Auto-detect doc type
│   │   ├── OCRResultDisplay.tsx    # Show extracted data
│   │   ├── AddressCertificateUploader.tsx # For CI nou/Passport
│   │   ├── SelfieCapture.tsx       # KYC selfie
│   │   ├── ExpiryValidator.tsx     # Check document expiry
│   │   └── CitizenshipSelector.tsx # RO/EU/Foreign flow
│   ├── hooks/
│   │   ├── useDocumentOCR.ts       # OCR extraction hook
│   │   ├── useExpiryValidation.ts  # Expiry check hook
│   │   └── useCitizenshipFlow.ts   # Different flows
│   └── types.ts                    # Module types
```

**Configuration:**

```typescript
interface PersonalKYCModuleConfig {
  enabled: boolean;

  // Document options
  acceptedDocuments: DocumentType[];
  requireAddressCertificate: 'always' | 'ci_nou_passport' | 'never';

  // Verification options
  selfieRequired: boolean;
  signatureRequired: boolean;

  // Expiry handling
  expiredDocumentAllowed: boolean;
  expiredDocumentWarning?: string;

  // Citizenship flows
  citizenshipFlows: {
    romanian: CitizenshipFlowConfig;
    european: CitizenshipFlowConfig;
    foreign: CitizenshipFlowConfig;
  };

  // Parent documents (for minors)
  parentDocuments: {
    enabled: boolean;
    condition?: string;  // e.g., "applicant_type == 'minor'"
  };

  // Parent data (names)
  parentDataRequired: boolean;
}
```

**Events:**

```typescript
interface PersonalKYCEvents {
  onDocumentUploaded: (doc: UploadedDocument) => void;
  onOCRComplete: (result: OCRResult) => void;
  onSelfieCapture: (image: string) => void;
  onSignatureComplete: (signature: string) => void;
  onValidationError: (error: ValidationError) => void;
  onModuleComplete: (data: PersonalKYCData) => void;
}
```

---

### 2. Company KYC Module

**Purpose:** Verify company/business entity using CUI

**Components:**

```
src/components/orders/modules/
├── company-kyc/
│   ├── index.ts
│   ├── CompanyKYCModule.tsx
│   ├── components/
│   │   ├── CUIInput.tsx            # CUI input with validation
│   │   ├── CompanyAutoComplete.tsx # Auto-fill from infocui.ro
│   │   ├── EntityTypeValidator.tsx # Check allowed/blocked types
│   │   ├── CompanyDetails.tsx      # Display company info
│   │   └── BlockedEntityWarning.tsx # Show blocked message
│   ├── hooks/
│   │   ├── useCUIValidation.ts     # CUI format validation
│   │   ├── useInfoCUI.ts           # infocui.ro API hook
│   │   └── useEntityTypeRules.ts   # Type blocking rules
│   └── types.ts
```

**Configuration:**

```typescript
interface CompanyKYCModuleConfig {
  enabled: boolean;
  condition?: string;  // When to show (e.g., "client_type == 'PJ'")

  // CUI validation
  validation: 'infocui' | 'onrc' | 'manual';
  autoComplete: boolean;

  // Entity type rules
  allowedTypes: string[];
  blockedTypes: string[];
  blockMessage?: string;

  // Special handling
  specialRules: {
    entityTypes: string[];
    action: 'allow' | 'block' | 'warn' | 'redirect';
    message: string;
    redirectService?: string;
  }[];
}
```

---

### 3. Property Verification Module

**Purpose:** Collect property/land data for CF services

**Components:**

```
src/components/orders/modules/
├── property-verification/
│   ├── index.ts
│   ├── PropertyModule.tsx
│   ├── components/
│   │   ├── CountySelector.tsx      # 42 județe
│   │   ├── LocalitySelector.tsx    # Conditional on county
│   │   ├── CFNumberInput.tsx       # Nr. Carte Funciară
│   │   ├── CadastralInput.tsx      # Nr. Cadastral
│   │   ├── IdentificationFields.tsx # For identification services
│   │   └── PropertySummary.tsx     # Display entered data
│   ├── hooks/
│   │   ├── useCountyLocalities.ts  # Fetch localities
│   │   └── usePropertyValidation.ts
│   ├── data/
│   │   └── counties.ts             # Static county list
│   └── types.ts
```

**Configuration:**

```typescript
interface PropertyModuleConfig {
  enabled: boolean;

  // Required fields
  fields: {
    county: { required: boolean };
    locality: { required: boolean };
    carteFunciara: { required: boolean };
    cadastral: { required: boolean };
    topografic: { required: boolean };
  };

  // Identification services (special)
  identificationService: {
    enabled: boolean;
    extraFields: string[];  // address, owner name, CNP/CUI
  };
}
```

---

### 4. Vehicle Verification Module

**Purpose:** Collect vehicle data for auto services

**Components:**

```
src/components/orders/modules/
├── vehicle-verification/
│   ├── index.ts
│   ├── VehicleModule.tsx
│   ├── components/
│   │   ├── PlateNumberInput.tsx    # Auto uppercase, format
│   │   ├── VINInput.tsx            # Serie șasiu
│   │   ├── VehicleCategorySelect.tsx # For rovinieta
│   │   ├── PeriodSelect.tsx        # For rovinieta
│   │   └── VehicleSummary.tsx
│   ├── hooks/
│   │   ├── usePlateValidation.ts   # Romanian plate format
│   │   └── useVINValidation.ts     # VIN checksum
│   └── types.ts
```

**Configuration:**

```typescript
interface VehicleModuleConfig {
  enabled: boolean;

  // Required fields
  fields: {
    plateNumber: { required: boolean };
    vin: { required: boolean };
    brand: { required: boolean };
    model: { required: boolean };
    year: { required: boolean };
    category: { required: boolean };  // Rovinieta
    period: { required: boolean };    // Rovinieta
  };

  // Validation
  plateFormat: 'romanian' | 'any';
  vinValidation: boolean;
}
```

---

### 5. Signature Module

**Purpose:** Capture electronic signature

**Components:**

```
src/components/orders/modules/
├── signature/
│   ├── index.ts
│   ├── SignatureModule.tsx
│   ├── components/
│   │   ├── SignatureCanvas.tsx     # Drawing canvas
│   │   ├── SignatureControls.tsx   # Clear, confirm buttons
│   │   └── SignaturePreview.tsx    # Show captured signature
│   ├── hooks/
│   │   └── useSignatureCapture.ts
│   └── types.ts
```

---

## Module Registry

All modules are registered in a central registry:

```typescript
// src/lib/verification-modules/registry.ts

import { PersonalKYCModule } from '@/components/orders/modules/personal-kyc';
import { CompanyKYCModule } from '@/components/orders/modules/company-kyc';
import { PropertyModule } from '@/components/orders/modules/property-verification';
import { VehicleModule } from '@/components/orders/modules/vehicle-verification';
import { SignatureModule } from '@/components/orders/modules/signature';

export const ModuleRegistry = {
  personalKyc: {
    component: PersonalKYCModule,
    stepId: 'personal-kyc',
    stepName: 'Verificare Identitate',
  },
  companyKyc: {
    component: CompanyKYCModule,
    stepId: 'company-kyc',
    stepName: 'Date Firmă',
  },
  propertyVerification: {
    component: PropertyModule,
    stepId: 'property',
    stepName: 'Date Imobil',
  },
  vehicleVerification: {
    component: VehicleModule,
    stepId: 'vehicle',
    stepName: 'Date Vehicul',
  },
  signature: {
    component: SignatureModule,
    stepId: 'signature',
    stepName: 'Semnătură',
  },
} as const;
```

---

## Dynamic Step Builder

The Order Wizard uses the service config to build steps dynamically:

```typescript
// src/lib/order-wizard/step-builder.ts

import { ModuleRegistry } from '@/lib/verification-modules/registry';
import { ServiceVerificationConfig } from '@/types/service-config';

interface OrderStep {
  id: string;
  name: string;
  component: React.ComponentType<StepProps>;
  condition?: (state: OrderState) => boolean;
}

export function buildOrderSteps(
  service: Service,
  config: ServiceVerificationConfig
): OrderStep[] {
  const steps: OrderStep[] = [];

  // 1. Contact (always first)
  steps.push({
    id: 'contact',
    name: 'Date Contact',
    component: ContactStep,
  });

  // 2. Personal KYC
  if (config.personalKyc.enabled) {
    steps.push({
      id: ModuleRegistry.personalKyc.stepId,
      name: ModuleRegistry.personalKyc.stepName,
      component: ModuleRegistry.personalKyc.component,
    });
  }

  // 3. Company KYC (conditional)
  if (config.companyKyc.enabled) {
    steps.push({
      id: ModuleRegistry.companyKyc.stepId,
      name: ModuleRegistry.companyKyc.stepName,
      component: ModuleRegistry.companyKyc.component,
      condition: config.companyKyc.condition
        ? (state) => evaluateCondition(config.companyKyc.condition!, state)
        : undefined,
    });
  }

  // 4. Property Verification
  if (config.propertyVerification.enabled) {
    steps.push({
      id: ModuleRegistry.propertyVerification.stepId,
      name: ModuleRegistry.propertyVerification.stepName,
      component: ModuleRegistry.propertyVerification.component,
    });
  }

  // 5. Vehicle Verification
  if (config.vehicleVerification.enabled) {
    steps.push({
      id: ModuleRegistry.vehicleVerification.stepId,
      name: ModuleRegistry.vehicleVerification.stepName,
      component: ModuleRegistry.vehicleVerification.component,
    });
  }

  // 6. Service Options
  steps.push({
    id: 'options',
    name: 'Opțiuni Serviciu',
    component: ServiceOptionsStep,
  });

  // 7. KYC Documents (if personal KYC needs document upload)
  if (config.personalKyc.enabled && config.personalKyc.acceptedDocuments?.length > 0) {
    steps.push({
      id: 'kyc-documents',
      name: 'Documente KYC',
      component: KYCDocumentsStep,
    });
  }

  // 8. Signature (if required)
  if (config.personalKyc.signatureRequired) {
    steps.push({
      id: ModuleRegistry.signature.stepId,
      name: ModuleRegistry.signature.stepName,
      component: ModuleRegistry.signature.component,
    });
  }

  // 9. Delivery
  steps.push({
    id: 'delivery',
    name: 'Livrare',
    component: DeliveryStep,
  });

  // 10. Review & Payment
  steps.push({
    id: 'review',
    name: 'Finalizare',
    component: ReviewStep,
  });

  return steps;
}
```

---

## Service Configuration Examples

### Cazier Fiscal

```typescript
const cazierFiscalConfig: ServiceVerificationConfig = {
  serviceSlug: 'cazier-fiscal',

  personalKyc: {
    enabled: true,
    acceptedDocuments: ['ci_vechi', 'ci_nou', 'passport'],
    requireAddressCertificate: 'ci_nou_passport',
    selfieRequired: true,
    signatureRequired: true,
    expiredDocumentAllowed: false,
    citizenshipFlows: {
      romanian: { documents: ['ci_or_passport', 'selfie'] },
      european: { documents: ['passport', 'residence_permit', 'selfie'] },
      foreign: { documents: ['passport', 'registration_certificate', 'selfie'] },
    },
    parentDataRequired: false,
    parentDocuments: { enabled: false },
  },

  companyKyc: { enabled: false },
  propertyVerification: { enabled: false },
  vehicleVerification: { enabled: false },
};
```

### Certificat Constatator

```typescript
const certificatConstatatorConfig: ServiceVerificationConfig = {
  serviceSlug: 'certificat-constatator',

  personalKyc: { enabled: false },

  companyKyc: {
    enabled: true,
    validation: 'infocui',
    autoComplete: true,
    allowedTypes: ['SRL', 'SA', 'SCS', 'SNC', 'PFA', 'II', 'IF', 'COOPERATIVA'],
    blockedTypes: ['ASOCIATIE', 'FUNDATIE', 'ONG', 'CABINET', 'PAROHIE'],
    blockMessage: 'Pentru acest tip de entitate nu se poate elibera certificat constatator!',
    specialRules: [
      {
        entityTypes: ['PFA', 'II', 'IF'],
        action: 'warn',
        message: 'Pentru PFA/II/IF se eliberează certificat constatator pe persoană fizică.',
      },
    ],
  },

  propertyVerification: { enabled: false },
  vehicleVerification: { enabled: false },
};
```

### Extras Carte Funciară

```typescript
const extrasCarteConfig: ServiceVerificationConfig = {
  serviceSlug: 'extras-carte-funciara',

  personalKyc: { enabled: false },
  companyKyc: { enabled: false },

  propertyVerification: {
    enabled: true,
    fields: {
      county: { required: true },
      locality: { required: true },
      carteFunciara: { required: true },
      cadastral: { required: true },
      topografic: { required: false },
    },
    identificationService: {
      enabled: true,
      extraFields: ['ownerName', 'address', 'cnpCui'],
    },
  },

  vehicleVerification: { enabled: false },
};
```

### Rovinieta

```typescript
const rovinietaConfig: ServiceVerificationConfig = {
  serviceSlug: 'rovinieta',

  personalKyc: { enabled: false },
  companyKyc: { enabled: false },
  propertyVerification: { enabled: false },

  vehicleVerification: {
    enabled: true,
    fields: {
      plateNumber: { required: true },
      category: { required: true },
      period: { required: true },
      vin: { required: false },
      brand: { required: false },
      model: { required: false },
      year: { required: false },
    },
    plateFormat: 'romanian',
  },

  externalRedirect: {
    enabled: true,
    url: 'https://erovinieta.net/checkout',
    utmTracking: true,
  },
};
```

---

## Module Communication

Modules communicate through the OrderWizardContext:

```typescript
// src/providers/order-wizard-provider.tsx

interface OrderWizardContextValue {
  // State
  service: Service;
  config: ServiceVerificationConfig;
  steps: OrderStep[];
  currentStep: number;
  orderState: OrderState;

  // Module data setters
  setContactData: (data: ContactData) => void;
  setPersonalKYCData: (data: PersonalKYCData) => void;
  setCompanyKYCData: (data: CompanyKYCData) => void;
  setPropertyData: (data: PropertyData) => void;
  setVehicleData: (data: VehicleData) => void;
  setSignature: (signature: string) => void;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepId: string) => void;

  // Validation
  validateCurrentStep: () => Promise<boolean>;
  getStepValidationErrors: (stepId: string) => ValidationError[];

  // Auto-save
  saveProgress: () => Promise<void>;
  loadProgress: (orderId: string) => Promise<void>;
}
```

---

## File Structure

```
src/
├── components/orders/
│   ├── modules/
│   │   ├── personal-kyc/
│   │   ├── company-kyc/
│   │   ├── property-verification/
│   │   ├── vehicle-verification/
│   │   └── signature/
│   ├── steps/
│   │   ├── contact-step.tsx
│   │   ├── options-step.tsx
│   │   ├── delivery-step.tsx
│   │   └── review-step.tsx
│   └── order-wizard.tsx
│
├── lib/
│   ├── verification-modules/
│   │   ├── registry.ts
│   │   ├── step-builder.ts
│   │   └── condition-evaluator.ts
│   └── services/
│       ├── document-ocr.ts
│       ├── document-validation.ts
│       ├── cui-validation.ts
│       └── property-validation.ts
│
├── providers/
│   └── order-wizard-provider.tsx
│
└── types/
    ├── service-config.ts
    ├── order-state.ts
    └── verification-modules.ts
```

---

## Implementation Priority

### Phase 1: Foundation
1. [ ] Create TypeScript interfaces
2. [ ] Create ModuleRegistry
3. [ ] Create step-builder
4. [ ] Update OrderWizardProvider

### Phase 2: Core Modules
1. [ ] PersonalKYCModule (with OCR integration)
2. [ ] CompanyKYCModule (with infocui.ro)
3. [ ] SignatureModule

### Phase 3: Extended Modules
1. [ ] PropertyVerificationModule
2. [ ] VehicleVerificationModule

### Phase 4: Configuration
1. [ ] Add verification_config to services table
2. [ ] Migrate all service configurations
3. [ ] Create admin UI for module configuration

---

## Related Documentation

- [Service Verification Requirements](./service-verification-requirements.md)
- [Romanian Document Handling](./romanian-document-handling.md)
- [OCR Improvement Plan](./ocr-improvement-plan.md)
