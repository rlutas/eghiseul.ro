# Modular Verification System - Implementation Guide

**Version:** 1.0
**Date:** 2025-12-19
**Status:** Production Ready
**Sprint:** Sprint 3 - KYC & Documents

---

## Overview

This guide provides a comprehensive walkthrough of the Modular Verification System implementation. The system enables dynamic order wizard configuration based on service requirements, allowing different services to enable/disable verification modules as needed.

**Key Benefits:**
- Single wizard codebase supporting all 12+ services
- Dynamic step generation based on database configuration
- Type-safe module architecture with full TypeScript support
- Conditional step rendering (e.g., Company KYC only for legal entities)
- Easy to extend with new verification modules

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE CONFIGURATION                         │
│                    (Database: JSONB Column)                      │
│                                                                  │
│  services.verification_config = {                                │
│    personalKyc: { enabled: true, ... },                         │
│    companyKyc: { enabled: false },                              │
│    propertyVerification: { enabled: false },                    │
│    vehicleVerification: { enabled: false },                     │
│    signature: { enabled: true, required: true }                 │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP BUILDER                                  │
│        (src/lib/verification-modules/step-builder.ts)            │
│                                                                  │
│  buildWizardSteps(config) → [                                    │
│    { id: 'contact', ... },                                       │
│    { id: 'personal-data', ... },      # if personalKyc enabled   │
│    { id: 'options', ... },                                       │
│    { id: 'kyc-documents', ... },      # if selfie required       │
│    { id: 'signature', ... },          # if signature required    │
│    { id: 'delivery', ... },                                      │
│    { id: 'review', ... }                                         │
│  ]                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  MODULAR WIZARD PROVIDER                         │
│         (src/providers/modular-wizard-provider.tsx)              │
│                                                                  │
│  - Manages wizard state (current step, data, etc.)              │
│  - Initializes module states based on config                    │
│  - Provides update functions for each module                    │
│  - Handles auto-save, navigation, validation                    │
│  - Exposes hooks: useModularWizard()                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE COMPONENTS                             │
│                                                                  │
│  PersonalKYC → CompanyKYC → Property → Vehicle → Signature     │
│                                                                  │
│  Each module:                                                    │
│  - Receives config (what fields are required)                   │
│  - Receives state (current module data)                         │
│  - Calls onUpdate(data) to update state                         │
│  - Calls onComplete() when valid                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── types/
│   └── verification-modules.ts              # TypeScript type definitions
│
├── lib/
│   └── verification-modules/
│       ├── registry.ts                      # Module component registry
│       └── step-builder.ts                  # Dynamic step builder
│
├── providers/
│   └── modular-wizard-provider.tsx          # State management
│
└── components/orders/
    └── modules/
        ├── personal-kyc/
        │   ├── PersonalDataStep.tsx         # Personal data entry + OCR
        │   └── KYCDocumentsStep.tsx         # Document upload + validation
        ├── company-kyc/
        │   └── CompanyDataStep.tsx          # CUI validation
        ├── property/
        │   └── PropertyDataStep.tsx         # Carte Funciară data
        ├── vehicle/
        │   └── VehicleDataStep.tsx          # Auto/Rovinieta data
        └── signature/
            └── SignatureStep.tsx            # Electronic signature

supabase/
└── migrations/
    └── 010_verification_config.sql          # Database migration
```

---

## Implementation Steps

### 1. Type System (`src/types/verification-modules.ts`)

Complete TypeScript definitions for:

**Module Configurations:**
- `PersonalKYCConfig` - Identity verification settings
- `CompanyKYCConfig` - Company validation settings
- `PropertyVerificationConfig` - Property data requirements
- `VehicleVerificationConfig` - Vehicle data requirements
- `SignatureConfig` - Signature requirements

**Module States:**
- `PersonalKYCState` - Personal data + documents
- `CompanyKYCState` - Company data + validation
- `PropertyState` - Property details
- `VehicleState` - Vehicle details
- `SignatureState` - Signature + terms

**Wizard State:**
- `ModularWizardState` - Complete wizard state
- `ModularStep` - Step definition with conditions

**Key Features:**
- Default configurations (`DEFAULT_DISABLED_CONFIG`, `FULL_KYC_CONFIG`)
- Type-safe module props interfaces
- Conditional step support

### 2. Module Registry (`src/lib/verification-modules/registry.ts`)

Maps step IDs to component paths:

```typescript
export const MODULE_REGISTRY: Record<ModularStepId, ModuleRegistryEntry> = {
  'contact': {
    stepId: 'contact',
    label: 'Contact',
    labelRo: 'Date Contact',
    componentPath: '@/components/orders/steps/contact-step',
  },
  'personal-data': {
    stepId: 'personal-data',
    label: 'Personal Data',
    labelRo: 'Date Personale',
    componentPath: '@/components/orders/modules/personal-kyc/PersonalDataStep',
  },
  // ... etc
};
```

**Features:**
- Lazy loading support (code splitting)
- Helper functions: `getModuleEntry()`, `isValidStepId()`
- Dynamic component loaders

### 3. Step Builder (`src/lib/verification-modules/step-builder.ts`)

Generates wizard steps based on service configuration:

```typescript
export function buildWizardSteps(
  config: ServiceVerificationConfig | null
): ModularStep[] {
  const steps: ModularStep[] = [];

  // Step 1: Contact (always present)
  steps.push({ id: 'contact', number: 1, ... });

  // Step 2: Personal Data (if personal KYC enabled)
  if (config.personalKyc.enabled) {
    steps.push({ id: 'personal-data', number: 2, ... });
  }

  // Step 2b: Company Data (conditional)
  if (config.companyKyc.enabled) {
    const step = { id: 'company-data', number: 3, ... };
    if (config.companyKyc.condition) {
      step.condition = createConditionFunction(config.companyKyc.condition);
    }
    steps.push(step);
  }

  // ... etc

  return steps;
}
```

**Features:**
- Conditional step rendering
- Dynamic step numbering
- Condition evaluation (`client_type == 'PJ'`, etc.)
- Navigation helpers: `getNextStep()`, `getPrevStep()`, `getVisibleSteps()`

### 4. Provider (`src/providers/modular-wizard-provider.tsx`)

State management for the wizard:

```typescript
interface ModularWizardContextType {
  state: ModularWizardState;
  service: Service | null;

  // Navigation
  goToStep: (stepId: ModularStepId) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Data updates
  updateContact: (data: Partial<Contact>) => void;
  updatePersonalKyc: (data: Partial<PersonalKYCState>) => void;
  updateCompanyKyc: (data: Partial<CompanyKYCState>) => void;
  updateProperty: (data: Partial<PropertyState>) => void;
  updateVehicle: (data: Partial<VehicleState>) => void;
  updateSignature: (data: Partial<SignatureState>) => void;

  // Price
  priceBreakdown: PriceBreakdown;

  // Actions
  saveDraft: () => Promise<void>;
  submitOrder: () => Promise<void>;
}

export function useModularWizard() {
  const context = useContext(ModularWizardContext);
  if (!context) throw new Error('Must be used within provider');
  return context;
}
```

**Features:**
- React Context + useReducer
- Auto-save with debouncing (500ms)
- localStorage backup
- URL synchronization (?step=2)
- Order ID generation
- Price calculation
- Browser navigation support

### 5. Module Components

Each module receives:

```typescript
interface ModuleBaseProps {
  isActive: boolean;
  onComplete: () => void;
  onBack: () => void;
}

interface PersonalKYCModuleProps extends ModuleBaseProps {
  config: PersonalKYCConfig;        // What fields are required
  state: PersonalKYCState;          // Current module data
  onUpdate: (state: Partial<PersonalKYCState>) => void;
  serviceSlug: string;
}
```

**Example: PersonalDataStep.tsx**

```typescript
export default function PersonalDataStep({
  config,
  state,
  onUpdate,
  onComplete,
  onBack,
}: PersonalKYCModuleProps) {
  const handleCNPChange = (cnp: string) => {
    onUpdate({ cnp });
  };

  const handleScanDocument = async (file: File) => {
    // OCR extraction
    const result = await extractData(file);
    onUpdate({
      cnp: result.cnp,
      firstName: result.firstName,
      // ... etc
    });
  };

  const isValid = validatePersonalData(state, config);

  return (
    <div>
      <Input value={state.cnp} onChange={handleCNPChange} />
      <DocumentScanner onScan={handleScanDocument} />
      <Button disabled={!isValid} onClick={onComplete}>Continue</Button>
    </div>
  );
}
```

### 6. Database Migration (`010_verification_config.sql`)

Adds JSONB column to services table:

```sql
ALTER TABLE services
ADD COLUMN IF NOT EXISTS verification_config JSONB;

-- Create GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_services_verification_config
ON services USING GIN (verification_config);

-- Update existing services with config
UPDATE services SET verification_config = '{
  "personalKyc": { "enabled": true, ... },
  "companyKyc": { "enabled": false },
  ...
}'::JSONB WHERE slug = 'cazier-fiscal';
```

**Configured Services:**
1. Cazier Fiscal - Full KYC (CI/Passport + Selfie + Signature)
2. Cazier Judiciar - Full KYC + Parent names
3. Certificat Naștere - Full KYC + Parent documents (conditional)
4. Certificat Constatator - Company KYC only (CUI validation)
5. Extras Carte Funciară - Property verification + Basic personal data
6. Cazier Auto - Vehicle verification only
7. Rovinieta - Vehicle data + External redirect

---

## Usage Examples

### Example 1: Service with Full KYC (Cazier Fiscal)

```json
{
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front", "ci_nou_back", "passport"],
    "requireAddressCertificate": "ci_nou_passport",
    "selfieRequired": true,
    "signatureRequired": true,
    "expiredDocumentAllowed": false
  },
  "companyKyc": { "enabled": false },
  "propertyVerification": { "enabled": false },
  "vehicleVerification": { "enabled": false },
  "signature": { "enabled": true, "required": true }
}
```

**Generated Steps:**
1. Contact
2. Personal Data (CNP, Name, Address)
3. Options
4. KYC Documents (ID Upload + Selfie)
5. Signature
6. Delivery
7. Review

### Example 2: Company Service (Certificat Constatator)

```json
{
  "personalKyc": { "enabled": false },
  "companyKyc": {
    "enabled": true,
    "validation": "infocui",
    "autoComplete": true,
    "allowedTypes": ["SRL", "SA", "PFA", "II"],
    "blockedTypes": ["ASOCIATIE", "FUNDATIE", "ONG"],
    "blockMessage": "Pentru acest tip de entitate nu se poate elibera certificat!"
  },
  "propertyVerification": { "enabled": false },
  "vehicleVerification": { "enabled": false },
  "signature": { "enabled": false }
}
```

**Generated Steps:**
1. Contact
2. Company Data (CUI → Auto-complete company info)
3. Options
4. Delivery
5. Review

### Example 3: Property Service (Extras CF)

```json
{
  "personalKyc": {
    "enabled": true,
    "acceptedDocuments": ["ci_vechi", "ci_nou_front"],
    "selfieRequired": false,
    "signatureRequired": false
  },
  "companyKyc": { "enabled": false },
  "propertyVerification": {
    "enabled": true,
    "fields": {
      "county": { "required": true },
      "locality": { "required": true },
      "cadastral": { "required": true }
    }
  },
  "vehicleVerification": { "enabled": false },
  "signature": { "enabled": false }
}
```

**Generated Steps:**
1. Contact
2. Personal Data (Basic info only)
3. Property Data (County, Locality, Nr. Cadastral)
4. Options
5. Delivery
6. Review

---

## Conditional Steps

Steps can be conditionally shown based on wizard state:

```typescript
// In config
{
  "companyKyc": {
    "enabled": true,
    "condition": "client_type == 'PJ'"  // Show only for legal entities
  }
}

// In step builder
if (config.companyKyc.condition) {
  step.condition = (state: ModularWizardState) => {
    // Parse condition: "client_type == 'PJ'"
    // Check if user has filled company CUI
    return state.companyKyc?.cui ? true : false;
  };
}
```

**Supported Conditions:**
- `client_type == 'PJ'` - Legal entity
- `client_type == 'PF'` - Natural person
- `applicant_type == 'minor'` - Under 18 years old
- `citizenship == 'foreign'` - Non-Romanian citizen

---

## Extending the System

### Adding a New Module

1. **Define Types** (`src/types/verification-modules.ts`):

```typescript
export interface NewModuleConfig {
  enabled: boolean;
  requiredFields: string[];
  // ... module-specific config
}

export interface NewModuleState {
  fieldA: string;
  fieldB: number;
  // ... module state
}

// Add to ServiceVerificationConfig
export interface ServiceVerificationConfig {
  personalKyc: PersonalKYCConfig;
  companyKyc: CompanyKYCConfig;
  newModule: NewModuleConfig;  // ← Add here
  // ...
}
```

2. **Register Module** (`registry.ts`):

```typescript
export const MODULE_REGISTRY: Record<ModularStepId, ModuleRegistryEntry> = {
  // ... existing modules
  'new-module': {
    stepId: 'new-module',
    label: 'New Module',
    labelRo: 'Modul Nou',
    componentPath: '@/components/orders/modules/new-module/NewModuleStep',
  },
};
```

3. **Update Step Builder** (`step-builder.ts`):

```typescript
export function buildWizardSteps(config: ServiceVerificationConfig): ModularStep[] {
  const steps: ModularStep[] = [];

  // ... existing steps

  // Add new module step
  if (config.newModule.enabled) {
    steps.push({
      ...ALL_STEPS['new-module'],
      number: stepNumber++,
    });
  }

  return steps;
}
```

4. **Update Provider** (`modular-wizard-provider.tsx`):

```typescript
// Add to state
interface ModularWizardState {
  // ... existing
  newModule: NewModuleState | null;
}

// Add action
type ModularWizardAction =
  | { type: 'UPDATE_NEW_MODULE'; payload: Partial<NewModuleState> }
  // ... existing actions

// Add reducer case
case 'UPDATE_NEW_MODULE':
  return {
    ...state,
    newModule: state.newModule ? { ...state.newModule, ...action.payload } : null,
    isDirty: true,
  };

// Add context method
interface ModularWizardContextType {
  // ... existing
  updateNewModule: (data: Partial<NewModuleState>) => void;
}

// Implement
const updateNewModule = useCallback((data: Partial<NewModuleState>) => {
  dispatch({ type: 'UPDATE_NEW_MODULE', payload: data });
}, []);
```

5. **Create Component** (`NewModuleStep.tsx`):

```typescript
interface NewModuleProps extends ModuleBaseProps {
  config: NewModuleConfig;
  state: NewModuleState;
  onUpdate: (state: Partial<NewModuleState>) => void;
}

export default function NewModuleStep({
  config,
  state,
  onUpdate,
  onComplete,
  onBack,
  isActive,
}: NewModuleProps) {
  const isValid = validateNewModule(state, config);

  return (
    <div>
      {/* Your UI here */}
      <Button onClick={onBack}>Back</Button>
      <Button disabled={!isValid} onClick={onComplete}>Continue</Button>
    </div>
  );
}
```

6. **Update Migration** (create new migration):

```sql
-- Add new module to existing services
UPDATE services
SET verification_config = jsonb_set(
  verification_config,
  '{newModule}',
  '{"enabled": false, "requiredFields": []}'::jsonb
)
WHERE verification_config IS NOT NULL;
```

---

## Testing

### Manual Testing Checklist

For each service:

- [ ] Steps appear in correct order
- [ ] Conditional steps show/hide correctly
- [ ] Module state persists when navigating back/forward
- [ ] Auto-save works (check localStorage + database)
- [ ] Validation prevents progression when invalid
- [ ] Price updates correctly with options
- [ ] Order ID generated after contact step
- [ ] URL updates with step number

### Service-Specific Tests

**Cazier Fiscal:**
- [ ] Personal data step appears
- [ ] KYC documents step appears
- [ ] Signature step appears
- [ ] All 6 documents can be uploaded

**Certificat Constatator:**
- [ ] Personal data step DOES NOT appear
- [ ] Company data step appears
- [ ] CUI validation works
- [ ] Blocked entity types show error

**Extras CF:**
- [ ] Property data step appears
- [ ] County/locality dropdowns work
- [ ] Cadastral number required

---

## Troubleshooting

### Issue: Steps not appearing

**Check:**
1. Service has `verification_config` in database
2. Module `enabled: true` in config
3. Step builder includes the module
4. Provider initializes module state

### Issue: Conditional step always shows

**Check:**
1. Condition string syntax correct
2. `createConditionFunction()` parsing condition
3. State has required fields to evaluate condition

### Issue: Module state not saving

**Check:**
1. `onUpdate()` being called
2. Provider has reducer case for module
3. `isDirty` flag set to true
4. Auto-save triggered (check console)

### Issue: TypeScript errors

**Check:**
1. All types imported from `verification-modules.ts`
2. Module state includes all required fields
3. Config matches interface definition

---

## Performance Considerations

1. **Code Splitting**: Modules are lazy-loaded via `MODULE_LOADERS`
2. **Debounced Auto-Save**: 500ms delay to avoid excessive API calls
3. **localStorage Cache**: Immediate save to localStorage, debounced server save
4. **GIN Index**: Fast JSONB queries on `verification_config`
5. **Conditional Rendering**: Only active step components render

---

## Migration from Old Wizard

If migrating from the old `order-wizard-provider.tsx`:

1. Keep old provider for backward compatibility
2. Create new routes using `ModularWizardProvider`
3. Gradually migrate services
4. Test thoroughly before removing old provider

**Key Differences:**
- Old: Hardcoded 6 steps
- New: Dynamic steps based on config
- Old: `OrderWizardContext`
- New: `ModularWizardContext`
- Old: Single state shape
- New: Modular state (personalKyc, companyKyc, etc.)

---

## Related Documentation

- **Architecture**: `modular-verification-architecture.md`
- **Requirements**: `service-verification-requirements.md`
- **API**: `docs/technical/api/ocr-kyc-api.md`
- **Database**: `supabase/migrations/010_verification_config.sql`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-19 | Initial implementation guide |

---

**Maintained by:** Development Team
**Last Updated:** 2025-12-19
**Status:** Production Ready
