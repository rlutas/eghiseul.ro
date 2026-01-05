# Modular Verification System - Test Plan

**Version:** 1.0
**Date:** 2025-12-19
**System:** Modular Order Wizard with Dynamic Verification Modules

---

## Table of Contents

1. [Overview](#overview)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Manual E2E Test Scenarios](#manual-e2e-test-scenarios)
5. [Edge Cases & Error Scenarios](#edge-cases--error-scenarios)
6. [Test Data Reference](#test-data-reference)

---

## Overview

The Modular Verification System is a dynamic order wizard that builds verification steps based on service configuration. It consists of:

- **Type Definitions:** `src/types/verification-modules.ts`
- **Step Builder:** `src/lib/verification-modules/step-builder.ts`
- **Module Registry:** `src/lib/verification-modules/registry.ts`
- **Wizard Provider:** `src/providers/modular-wizard-provider.tsx`
- **Module Components:** PersonalDataStep, KYCDocumentsStep, CompanyDataStep, PropertyDataStep, VehicleDataStep, SignatureStep

---

## Unit Tests

### 1. Step Builder Tests (`step-builder.ts`)

#### Test Suite: `buildWizardSteps()`

```typescript
describe('buildWizardSteps', () => {
  // ✅ Basic Configuration Tests
  test('should include contact, options, delivery, review for minimal config', () => {
    const config = DEFAULT_DISABLED_CONFIG;
    const steps = buildWizardSteps(config);

    expect(steps).toHaveLength(4);
    expect(steps.map(s => s.id)).toEqual([
      'contact', 'options', 'delivery', 'review'
    ]);
  });

  test('should assign sequential step numbers', () => {
    const config = DEFAULT_DISABLED_CONFIG;
    const steps = buildWizardSteps(config);

    expect(steps[0].number).toBe(1);
    expect(steps[1].number).toBe(2);
    expect(steps[2].number).toBe(3);
    expect(steps[3].number).toBe(4);
  });

  // ✅ Personal KYC Module Tests
  test('should include personal-data when personalKyc enabled', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      personalKyc: { ...DEFAULT_DISABLED_CONFIG.personalKyc, enabled: true }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'personal-data')).toBeDefined();
  });

  test('should include kyc-documents when personalKyc has accepted documents', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      personalKyc: {
        ...DEFAULT_DISABLED_CONFIG.personalKyc,
        enabled: true,
        acceptedDocuments: ['ci_vechi', 'ci_nou_front']
      }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'kyc-documents')).toBeDefined();
  });

  test('should NOT include kyc-documents when acceptedDocuments is empty', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      personalKyc: {
        ...DEFAULT_DISABLED_CONFIG.personalKyc,
        enabled: true,
        acceptedDocuments: []
      }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'kyc-documents')).toBeUndefined();
  });

  // ✅ Company KYC Module Tests
  test('should include company-data when companyKyc enabled', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: { ...DEFAULT_DISABLED_CONFIG.companyKyc, enabled: true }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'company-data')).toBeDefined();
  });

  test('should add condition to company-data step when specified', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: {
        ...DEFAULT_DISABLED_CONFIG.companyKyc,
        enabled: true,
        condition: "client_type == 'PJ'"
      }
    };
    const steps = buildWizardSteps(config);

    const companyStep = steps.find(s => s.id === 'company-data');
    expect(companyStep?.condition).toBeDefined();
  });

  // ✅ Property Module Tests
  test('should include property-data when propertyVerification enabled', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      propertyVerification: {
        ...DEFAULT_DISABLED_CONFIG.propertyVerification,
        enabled: true
      }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'property-data')).toBeDefined();
  });

  // ✅ Vehicle Module Tests
  test('should include vehicle-data when vehicleVerification enabled', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      vehicleVerification: {
        ...DEFAULT_DISABLED_CONFIG.vehicleVerification,
        enabled: true
      }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'vehicle-data')).toBeDefined();
  });

  // ✅ Signature Module Tests
  test('should include signature when signature enabled and required', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      signature: { enabled: true, required: true, termsAcceptanceRequired: true }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'signature')).toBeDefined();
  });

  test('should NOT include signature when enabled but not required', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      signature: { enabled: true, required: false, termsAcceptanceRequired: false }
    };
    const steps = buildWizardSteps(config);

    expect(steps.find(s => s.id === 'signature')).toBeUndefined();
  });

  // ✅ Full KYC Config Test (Cazier Fiscal scenario)
  test('should build correct steps for FULL_KYC_CONFIG', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      ...FULL_KYC_CONFIG
    };
    const steps = buildWizardSteps(config);

    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain('contact');
    expect(stepIds).toContain('personal-data');
    expect(stepIds).toContain('kyc-documents');
    expect(stepIds).toContain('signature');
    expect(stepIds).toContain('options');
    expect(stepIds).toContain('delivery');
    expect(stepIds).toContain('review');
  });

  // ✅ Company-Only Config Test (Certificat Constatator scenario)
  test('should build correct steps for COMPANY_ONLY_CONFIG', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      ...COMPANY_ONLY_CONFIG
    };
    const steps = buildWizardSteps(config);

    const stepIds = steps.map(s => s.id);
    expect(stepIds).toContain('company-data');
    expect(stepIds).not.toContain('personal-data');
    expect(stepIds).not.toContain('signature');
  });

  // ✅ Null/Undefined Config Tests
  test('should handle null config gracefully', () => {
    const steps = buildWizardSteps(null);
    expect(steps).toHaveLength(4); // Contact, Options, Delivery, Review
  });

  test('should handle undefined config gracefully', () => {
    const steps = buildWizardSteps(undefined);
    expect(steps).toHaveLength(4);
  });
});
```

#### Test Suite: Condition Functions

```typescript
describe('createConditionFunction', () => {
  test('should create function for client_type == "PJ"', () => {
    const state: ModularWizardState = {
      ...initialState,
      companyKyc: { cui: '12345678', ... }
    };

    const condition = createConditionFunction("client_type == 'PJ'");
    expect(condition(state)).toBe(true);
  });

  test('should create function for client_type == "PF"', () => {
    const state: ModularWizardState = {
      ...initialState,
      companyKyc: null
    };

    const condition = createConditionFunction("client_type == 'PF'");
    expect(condition(state)).toBe(true);
  });

  test('should handle applicant_type == "minor" condition', () => {
    const state: ModularWizardState = {
      ...initialState,
      personalKyc: {
        birthDate: '2010-01-01', // 15 years old
        ...otherFields
      }
    };

    const condition = createConditionFunction("applicant_type == 'minor'");
    expect(condition(state)).toBe(true);
  });

  test('should handle applicant_type == "adult" condition', () => {
    const state: ModularWizardState = {
      ...initialState,
      personalKyc: {
        birthDate: '1990-01-01', // 35 years old
        ...otherFields
      }
    };

    const condition = createConditionFunction("applicant_type == 'adult'");
    expect(condition(state)).toBe(true);
  });

  test('should default to true for unknown condition format', () => {
    const condition = createConditionFunction("unknown_format");
    expect(condition(initialState)).toBe(true);
  });
});
```

#### Test Suite: Navigation Functions

```typescript
describe('getNextStep', () => {
  test('should return next step from contact to personal-data', () => {
    const steps = buildWizardSteps(FULL_KYC_CONFIG);
    const state = initialState;

    const next = getNextStep(steps, 'contact', state);
    expect(next?.id).toBe('personal-data');
  });

  test('should skip steps that fail condition check', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: {
        enabled: true,
        condition: "client_type == 'PJ'"
      }
    };
    const steps = buildWizardSteps(config);
    const state = {
      ...initialState,
      companyKyc: null // PF client
    };

    const next = getNextStep(steps, 'contact', state);
    expect(next?.id).not.toBe('company-data'); // Should skip company step
  });

  test('should return null when on last step', () => {
    const steps = buildWizardSteps(DEFAULT_DISABLED_CONFIG);
    const state = initialState;

    const next = getNextStep(steps, 'review', state);
    expect(next).toBeNull();
  });

  test('should return null for invalid current step', () => {
    const steps = buildWizardSteps(DEFAULT_DISABLED_CONFIG);
    const state = initialState;

    const next = getNextStep(steps, 'invalid-step' as ModularStepId, state);
    expect(next).toBeNull();
  });
});

describe('getPrevStep', () => {
  test('should return previous step from personal-data to contact', () => {
    const steps = buildWizardSteps(FULL_KYC_CONFIG);
    const state = initialState;

    const prev = getPrevStep(steps, 'personal-data', state);
    expect(prev?.id).toBe('contact');
  });

  test('should return null when on first step', () => {
    const steps = buildWizardSteps(DEFAULT_DISABLED_CONFIG);
    const state = initialState;

    const prev = getPrevStep(steps, 'contact', state);
    expect(prev).toBeNull();
  });

  test('should skip conditional steps when going back', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: {
        enabled: true,
        condition: "client_type == 'PJ'"
      }
    };
    const steps = buildWizardSteps(config);
    const state = {
      ...initialState,
      companyKyc: null // PF client - company step hidden
    };

    // If we're on options and company-data is hidden, should go back to contact
    const prev = getPrevStep(steps, 'options', state);
    expect(prev?.id).toBe('contact');
  });
});

describe('getVisibleSteps', () => {
  test('should return all steps when no conditions exist', () => {
    const steps = buildWizardSteps(FULL_KYC_CONFIG);
    const state = initialState;

    const visible = getVisibleSteps(steps, state);
    expect(visible.length).toBe(steps.length);
  });

  test('should filter out steps that fail condition', () => {
    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: {
        enabled: true,
        condition: "client_type == 'PJ'"
      }
    };
    const steps = buildWizardSteps(config);
    const state = {
      ...initialState,
      companyKyc: null // PF client
    };

    const visible = getVisibleSteps(steps, state);
    expect(visible.find(s => s.id === 'company-data')).toBeUndefined();
  });
});

describe('renumberSteps', () => {
  test('should renumber steps sequentially starting from 1', () => {
    const steps = [
      { id: 'contact', number: 5 },
      { id: 'options', number: 10 },
      { id: 'review', number: 15 }
    ];

    const renumbered = renumberSteps(steps);
    expect(renumbered[0].number).toBe(1);
    expect(renumbered[1].number).toBe(2);
    expect(renumbered[2].number).toBe(3);
  });
});
```

### 2. CNP Validation Tests (`cnp.ts`)

```typescript
describe('validateCNP', () => {
  // ✅ Valid CNP Tests
  test('should validate correct male CNP from 1900s', () => {
    const result = validateCNP('1900101123456'); // Male, born 1990-01-01, county 12
    expect(result.valid).toBe(true);
    expect(result.data?.gender).toBe('male');
    expect(result.data?.birthYear).toBe(1990);
  });

  test('should validate correct female CNP from 2000s', () => {
    const result = validateCNP('6050515401234'); // Female, born 2005-05-15, county 40
    expect(result.valid).toBe(true);
    expect(result.data?.gender).toBe('female');
    expect(result.data?.birthYear).toBe(2005);
  });

  // ✅ Length Validation
  test('should reject CNP with less than 13 digits', () => {
    const result = validateCNP('123456789012');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('CNP-ul trebuie să conțină exact 13 cifre');
  });

  test('should reject CNP with more than 13 digits', () => {
    const result = validateCNP('12345678901234');
    expect(result.valid).toBe(false);
  });

  // ✅ Numeric Validation
  test('should reject CNP with non-numeric characters', () => {
    const result = validateCNP('1ABC456789012');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('CNP-ul trebuie să conțină doar cifre');
  });

  // ✅ Gender/Century Validation
  test('should reject CNP with invalid first digit (0)', () => {
    const result = validateCNP('0900101123456');
    expect(result.valid).toBe(false);
  });

  test('should reject CNP with invalid first digit (9)', () => {
    const result = validateCNP('9900101123456');
    expect(result.valid).toBe(false);
  });

  // ✅ Month Validation
  test('should reject CNP with invalid month (00)', () => {
    const result = validateCNP('1900001123456');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Luna');
  });

  test('should reject CNP with invalid month (13)', () => {
    const result = validateCNP('1901301123456');
    expect(result.valid).toBe(false);
  });

  // ✅ Day Validation
  test('should reject CNP with invalid day (00)', () => {
    const result = validateCNP('1900100123456');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Ziua');
  });

  test('should reject CNP with invalid day (32)', () => {
    const result = validateCNP('1900132123456');
    expect(result.valid).toBe(false);
  });

  test('should reject CNP with impossible date (Feb 30)', () => {
    const result = validateCNP('1900230123456');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Data de naștere');
  });

  // ✅ Future Date Validation
  test('should reject CNP with future birth date', () => {
    const futureYear = new Date().getFullYear() + 1;
    const cnpPrefix = futureYear > 2000 ? '5' : '1';
    const yearDigits = (futureYear % 100).toString().padStart(2, '0');
    const result = validateCNP(`${cnpPrefix}${yearDigits}0101123456`);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('viitor');
  });

  // ✅ County Code Validation
  test('should reject CNP with invalid county code (00)', () => {
    const result = validateCNP('1900101001234');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('județului');
  });

  test('should reject CNP with invalid county code (99)', () => {
    const result = validateCNP('1900101991234');
    expect(result.valid).toBe(false);
  });

  // ✅ Checksum Validation
  test('should reject CNP with invalid checksum', () => {
    const result = validateCNP('1900101123450'); // Wrong last digit
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('cifra de control');
  });

  // ✅ Age Calculation
  test('should calculate age correctly', () => {
    const birthYear = new Date().getFullYear() - 30;
    const yearDigits = (birthYear % 100).toString().padStart(2, '0');
    const result = validateCNP(`1${yearDigits}0101123456`);
    expect(result.valid).toBe(true);
    expect(result.data?.age).toBe(30);
  });

  // ✅ Helper Functions
  test('isAdult should return true for 18+ years old', () => {
    const birthYear = new Date().getFullYear() - 20;
    const yearDigits = (birthYear % 100).toString().padStart(2, '0');
    const result = isAdult(`1${yearDigits}0101123456`);
    expect(result).toBe(true);
  });

  test('isAdult should return false for under 18 years old', () => {
    const birthYear = new Date().getFullYear() - 15;
    const yearDigits = (birthYear % 100).toString().padStart(2, '0');
    const result = isAdult(`5${yearDigits}0101123456`);
    expect(result).toBe(false);
  });
});
```

---

## Integration Tests

### 1. ModularWizardProvider Tests

```typescript
describe('ModularWizardProvider', () => {
  // ✅ Initialization Tests
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    expect(result.current.state.currentStepId).toBe('contact');
    expect(result.current.state.steps).toHaveLength(0); // No service initialized
    expect(result.current.canSaveToServer).toBe(false);
  });

  test('should initialize service and build steps', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    const mockService = {
      id: 'service-1',
      slug: 'cazier-fiscal',
      verification_config: FULL_KYC_CONFIG
    };

    act(() => {
      result.current.initService(mockService, []);
    });

    expect(result.current.state.serviceSlug).toBe('cazier-fiscal');
    expect(result.current.state.steps.length).toBeGreaterThan(0);
    expect(result.current.state.personalKyc).not.toBeNull();
  });

  // ✅ Navigation Tests
  test('should navigate to next step', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    // Initialize with minimal config
    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: DEFAULT_DISABLED_CONFIG
      }, []);
    });

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.state.currentStepId).toBe('options');
  });

  test('should not navigate next from last step', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: DEFAULT_DISABLED_CONFIG
      }, []);
    });

    // Go to last step
    act(() => {
      result.current.goToStep('review');
    });

    const prevStepId = result.current.state.currentStepId;

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.state.currentStepId).toBe(prevStepId); // Should stay
  });

  test('should navigate to previous step', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: DEFAULT_DISABLED_CONFIG
      }, []);
      result.current.nextStep(); // Go to options
    });

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.state.currentStepId).toBe('contact');
  });

  // ✅ Data Update Tests
  test('should update contact data', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    act(() => {
      result.current.updateContact({
        email: 'test@example.com',
        phone: '0712345678'
      });
    });

    expect(result.current.state.contact.email).toBe('test@example.com');
    expect(result.current.state.contact.phone).toBe('0712345678');
    expect(result.current.state.isDirty).toBe(true);
  });

  test('should update personal KYC data', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: FULL_KYC_CONFIG
      }, []);

      result.current.updatePersonalKyc({
        firstName: 'Ion',
        lastName: 'Popescu',
        cnp: '1900101123456'
      });
    });

    expect(result.current.state.personalKyc?.firstName).toBe('Ion');
    expect(result.current.state.personalKyc?.lastName).toBe('Popescu');
  });

  // ✅ Order ID Generation
  test('should generate order ID when moving past contact with valid data', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: DEFAULT_DISABLED_CONFIG
      }, []);

      result.current.updateContact({
        email: 'test@example.com',
        phone: '0712345678',
        preferredContact: 'email'
      });

      result.current.nextStep();
    });

    expect(result.current.state.friendlyOrderId).not.toBeNull();
    expect(result.current.state.friendlyOrderId).toMatch(/^[A-Z0-9]{6}$/);
  });

  // ✅ Price Calculation
  test('should calculate price breakdown correctly', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    const mockService = {
      id: '1',
      slug: 'test',
      base_price: 100,
      currency: 'RON',
      verification_config: DEFAULT_DISABLED_CONFIG
    };

    act(() => {
      result.current.initService(mockService, []);

      result.current.updateOptions([
        { optionId: '1', optionName: 'Urgent', quantity: 1, priceModifier: 50 }
      ]);

      result.current.updateDelivery({ price: 20 });
    });

    expect(result.current.priceBreakdown.basePrice).toBe(100);
    expect(result.current.priceBreakdown.optionsPrice).toBe(50);
    expect(result.current.priceBreakdown.deliveryPrice).toBe(20);
    expect(result.current.priceBreakdown.totalPrice).toBe(170);
  });

  // ✅ Visible Steps Calculation
  test('should filter visible steps based on conditions', () => {
    const { result } = renderHook(() => useModularWizard(), {
      wrapper: ModularWizardProvider
    });

    const config = {
      ...DEFAULT_DISABLED_CONFIG,
      companyKyc: {
        enabled: true,
        condition: "client_type == 'PJ'"
      }
    };

    act(() => {
      result.current.initService({
        id: '1',
        slug: 'test',
        verification_config: config
      }, []);
    });

    // Without company data (PF client), company step should be hidden
    expect(result.current.visibleSteps.find(s => s.id === 'company-data')).toBeUndefined();

    // Add company data to make it visible
    act(() => {
      result.current.updateCompanyKyc({ cui: '12345678' });
    });

    expect(result.current.visibleSteps.find(s => s.id === 'company-data')).toBeDefined();
  });
});
```

### 2. Module Registry Tests

```typescript
describe('Module Registry', () => {
  test('should have entry for all step types', () => {
    const stepIds: ModularStepId[] = [
      'contact', 'personal-data', 'company-data', 'property-data',
      'vehicle-data', 'options', 'kyc-documents', 'signature',
      'delivery', 'review'
    ];

    stepIds.forEach(id => {
      expect(MODULE_REGISTRY[id]).toBeDefined();
      expect(MODULE_REGISTRY[id].stepId).toBe(id);
    });
  });

  test('should return module entry by ID', () => {
    const entry = getModuleEntry('personal-data');
    expect(entry?.stepId).toBe('personal-data');
    expect(entry?.componentPath).toBeTruthy();
  });

  test('should validate step IDs correctly', () => {
    expect(isValidStepId('contact')).toBe(true);
    expect(isValidStepId('invalid-step')).toBe(false);
  });

  test('should have loaders for modular steps', () => {
    expect(hasModuleLoader('personal-data')).toBe(true);
    expect(hasModuleLoader('company-data')).toBe(true);
    expect(hasModuleLoader('contact')).toBe(false); // Core step
  });
});
```

---

## Manual E2E Test Scenarios

### Scenario 1: Cazier Fiscal (Full Personal KYC)

**Service Config:** PersonalKYC + Signature

**Test Steps:**

1. **Navigate to Service**
   - [ ] Go to `/services/cazier-fiscal`
   - [ ] Click "Comandă Acum"
   - [ ] Verify wizard opens with correct steps

2. **Step 1: Contact**
   - [ ] Fill email: `test@example.com`
   - [ ] Fill phone: `0712345678`
   - [ ] Select preferred contact: Email
   - [ ] Click "Continuă"
   - [ ] Verify Order ID is generated (6 characters)
   - [ ] Verify auto-save indicator shows "Salvat"

3. **Step 2: Personal Data**
   - [ ] Fill first name: `Ion`
   - [ ] Fill last name: `Popescu`
   - [ ] Fill CNP: `1900101123456` (valid CNP)
   - [ ] Verify birth date auto-fills from CNP
   - [ ] Fill birth place: `București`
   - [ ] Select citizenship: `Romanian`
   - [ ] Fill document series: `RT`
   - [ ] Fill document number: `123456`
   - [ ] Fill document expiry: `2030-01-01`
   - [ ] Fill address fields
   - [ ] Click "Continuă"

4. **Step 3: Options**
   - [ ] Select "Traducere Legalizată" option
   - [ ] Verify price updates in sidebar
   - [ ] Click "Continuă"

5. **Step 4: KYC Documents**
   - [ ] Select document type: `CI Vechi`
   - [ ] Upload front image (< 5MB)
   - [ ] Verify OCR extracts data
   - [ ] Verify extracted data matches Step 2
   - [ ] Upload selfie
   - [ ] Click "Continuă"

6. **Step 5: Signature**
   - [ ] Draw signature on canvas
   - [ ] Check "Accept Terms & Conditions"
   - [ ] Click "Continuă"

7. **Step 6: Delivery**
   - [ ] Select "Email" delivery
   - [ ] Verify price = 0 RON
   - [ ] Click "Continuă"

8. **Step 7: Review**
   - [ ] Verify all data displays correctly
   - [ ] Verify price breakdown
   - [ ] Click "Finalizează Comanda"
   - [ ] Verify redirects to payment (Stripe)

**Expected Results:**
- All steps appear in correct order
- Data persists when navigating back/forward
- Auto-save works (check localStorage)
- OCR extracts CNP, name, address correctly
- Price calculation is accurate
- Order is saved to database

---

### Scenario 2: Certificat Constatator (Company Only)

**Service Config:** CompanyKYC only

**Test Steps:**

1. **Navigate to Service**
   - [ ] Go to `/services/certificat-constatator`
   - [ ] Click "Comandă Acum"

2. **Step 1: Contact**
   - [ ] Fill contact details
   - [ ] Click "Continuă"

3. **Step 2: Company Data**
   - [ ] Fill CUI: `12345678`
   - [ ] Click "Verifică CUI"
   - [ ] Verify company data auto-fills (if API available)
   - [ ] Manually fill company name if needed
   - [ ] Fill registration number
   - [ ] Fill address
   - [ ] Click "Continuă"

4. **Step 3: Options**
   - [ ] Select any options
   - [ ] Click "Continuă"

5. **Step 4: Delivery**
   - [ ] Select delivery method
   - [ ] Fill address if courier/mail
   - [ ] Click "Continuă"

6. **Step 5: Review**
   - [ ] Verify no Personal KYC or Signature steps appeared
   - [ ] Verify company data is shown
   - [ ] Click "Finalizează Comanda"

**Expected Results:**
- Personal KYC and Signature steps are NOT shown
- Only: Contact → Company Data → Options → Delivery → Review
- CUI validation works (if API enabled)

---

### Scenario 3: Carte Funciară (Property Verification)

**Service Config:** PropertyVerification

**Test Steps:**

1. **Navigate to Service**
   - [ ] Go to `/services/carte-funciara`
   - [ ] Click "Comandă Acum"

2. **Step 1: Contact**
   - [ ] Fill contact details
   - [ ] Click "Continuă"

3. **Step 2: Property Data**
   - [ ] Select county: `București`
   - [ ] Fill locality: `Sector 1`
   - [ ] Fill Carte Funciară number: `123456`
   - [ ] Fill cadastral number: `C1-654321`
   - [ ] Fill topografic (optional)
   - [ ] Click "Continuă"

4. **Step 3: Options → Delivery → Review**
   - [ ] Complete remaining steps
   - [ ] Verify property data shows in review

**Expected Results:**
- Property data step appears after Contact
- All property fields are validated
- No Personal KYC steps

---

### Scenario 4: Cazier Auto (Vehicle Verification)

**Service Config:** VehicleVerification

**Test Steps:**

1. **Navigate to Service**
   - [ ] Go to `/services/cazier-auto`
   - [ ] Click "Comandă Acum"

2. **Step 1: Contact**
   - [ ] Fill contact details
   - [ ] Click "Continuă"

3. **Step 2: Vehicle Data**
   - [ ] Fill plate number: `B123ABC` (Romanian format)
   - [ ] Fill VIN: `WVWZZZ1JZXW123456`
   - [ ] Fill brand: `Volkswagen`
   - [ ] Fill model: `Golf`
   - [ ] Fill year: `2020`
   - [ ] Click "Continuă"

4. **Step 3: Options → Delivery → Review**
   - [ ] Complete remaining steps
   - [ ] Verify vehicle data shows in review

**Expected Results:**
- Vehicle data step appears after Contact
- Plate number format is validated
- VIN validation works (if enabled)

---

### Scenario 5: Mixed Config (Personal + Company)

**Service Config:** PersonalKYC + CompanyKYC (conditional)

**Test Steps:**

1. **Scenario 5A: PF Client (Personal Only)**
   - [ ] Complete Contact step
   - [ ] Complete Personal Data step
   - [ ] Verify Company Data step does NOT appear
   - [ ] Complete remaining steps

2. **Scenario 5B: PJ Client (Personal + Company)**
   - [ ] Complete Contact step
   - [ ] Complete Personal Data step
   - [ ] At Company Data step, fill CUI
   - [ ] Verify Company Data step becomes visible
   - [ ] Complete Company Data
   - [ ] Complete remaining steps
   - [ ] Verify both personal and company data in review

**Expected Results:**
- Conditional steps show/hide based on data
- Navigation skips hidden steps
- Step numbering updates dynamically

---

## Edge Cases & Error Scenarios

### 1. Data Validation Edge Cases

#### CNP Validation

```
✅ Test Case: Invalid CNP Length
Input: "12345"
Expected: Error "CNP-ul trebuie să conțină exact 13 cifre"

✅ Test Case: Non-numeric CNP
Input: "ABC1234567890"
Expected: Error "CNP-ul trebuie să conțină doar cifre"

✅ Test Case: Invalid Checksum
Input: "1900101123450"
Expected: Error "cifra de control nu corespunde"

✅ Test Case: Future Birth Date
Input: CNP with year = 2030
Expected: Error "nu poate fi în viitor"

✅ Test Case: Invalid County Code
Input: "1900101991234"
Expected: Error "Codul județului din CNP este invalid"

✅ Test Case: Minor Age
Input: CNP with age < 18
Expected: isAdult() returns false

✅ Test Case: Leap Year Feb 29
Input: "1960229123456" (valid leap year)
Expected: Valid

✅ Test Case: Non-Leap Year Feb 29
Input: "1900229123456" (invalid)
Expected: Error "Data de naștere din CNP este invalidă"
```

#### OCR Data Extraction

```
✅ Test Case: CI Vechi (Old ID)
Expected Extractions:
- CNP
- First Name, Last Name
- Birth Date, Birth Place
- Series, Number
- Full Address (Jud., Str., Nr., Bl., Sc., Et., Ap.)

✅ Test Case: CI Nou Front + Back
Expected:
- Front: CNP, Name, Series, Number
- Back: Address (requires Certificat Domiciliu)

✅ Test Case: Passport
Expected:
- Name, Birth Date
- Passport Number
- Address requires separate certificate

✅ Test Case: Blurry Image
Expected: Low confidence warning

✅ Test Case: File Too Large (> 5MB)
Expected: Error "Fișierul este prea mare"

✅ Test Case: Invalid File Type (PDF)
Expected: Error "Tip de fișier neacceptat"
```

### 2. Navigation Edge Cases

```
✅ Test Case: Browser Back Button
Steps:
1. Navigate Contact → Personal Data → Options
2. Click browser back button
3. Verify wizard goes to Personal Data
4. Verify data is preserved

✅ Test Case: Direct URL Access
Steps:
1. Navigate to `/services/cazier-fiscal?step=5`
2. Verify wizard shows step 5
3. Verify previous data is loaded from cache (if exists)

✅ Test Case: URL Out of Range
Steps:
1. Navigate to `/services/cazier-fiscal?step=99`
2. Verify wizard defaults to step 1

✅ Test Case: Refresh on Step 3
Steps:
1. Fill Steps 1-3
2. Refresh page (F5)
3. Verify wizard restores to Step 3
4. Verify all data is preserved from localStorage
```

### 3. State Management Edge Cases

```
✅ Test Case: Concurrent Tab Editing
Steps:
1. Open same order in 2 tabs
2. Edit data in Tab 1
3. Edit different data in Tab 2
4. Verify last-write-wins in localStorage
5. Verify server save shows warning

✅ Test Case: Lost Network During Save
Steps:
1. Fill Contact + Personal Data
2. Disable network
3. Move to next step
4. Verify localStorage saves
5. Verify server save fails gracefully
6. Re-enable network
7. Verify auto-save retries

✅ Test Case: localStorage Full
Steps:
1. Fill localStorage to quota
2. Try to save order
3. Verify graceful error handling

✅ Test Case: Expired Session
Steps:
1. Fill order data
2. Wait for session to expire
3. Try to save to server
4. Verify redirect to login
5. After login, verify data is preserved
```

### 4. Module Condition Edge Cases

```
✅ Test Case: Condition Changes Mid-Wizard
Steps:
1. Start order as PF (no CUI)
2. Complete Personal Data
3. Company Data step is hidden
4. Go back to Personal Data
5. Add CUI (becomes PJ)
6. Verify Company Data step appears
7. Complete Company Data
8. Go forward
9. Verify step numbering updates

✅ Test Case: Minor to Adult Birthday
Steps:
1. Enter CNP with age = 17 years, 364 days
2. Parent documents step appears
3. Wait 1 day (simulated)
4. Verify parent step disappears

✅ Test Case: Citizenship Change
Steps:
1. Select Romanian citizenship
2. Documents: CI accepted
3. Change to Foreign citizenship
4. Verify document requirements change
5. Verify new document types appear
```

### 5. Price Calculation Edge Cases

```
✅ Test Case: Multiple Options
Options: Urgent (+50 RON) + Translation (+100 RON)
Delivery: Courier (+20 RON)
Base: 100 RON
Expected Total: 270 RON

✅ Test Case: Free Delivery
Delivery: Email (0 RON)
Expected: No delivery cost

✅ Test Case: Negative Price Modifier (Discount)
Option: Student Discount (-20 RON)
Base: 100 RON
Expected: 80 RON

✅ Test Case: Option Quantity > 1
Option: Extra Copy (+10 RON) x 3
Expected: +30 RON

✅ Test Case: Price with Promo Code
Base: 100 RON
Promo: DISCOUNT20 (-20%)
Expected: 80 RON
```

### 6. Document Upload Edge Cases

```
✅ Test Case: Upload Same File Twice
Expected: Replace or add duplicate?

✅ Test Case: Upload During OCR Processing
Expected: Queue or block?

✅ Test Case: OCR Timeout (> 30s)
Expected: Show retry option

✅ Test Case: OCR Extracts Wrong Data
Expected: Allow manual correction

✅ Test Case: Document Expired
Expected: Warning but allow continue (if config allows)

✅ Test Case: Selfie Face No Match
Expected: Confidence < 70%, show warning
```

### 7. Auto-Save Edge Cases

```
✅ Test Case: Rapid Field Changes
Steps:
1. Type rapidly in multiple fields
2. Verify debounce works (only 1 save after 500ms)

✅ Test Case: Save Without Contact Data
Steps:
1. Fill Personal Data without Contact
2. Verify localStorage saves
3. Verify server save is blocked (canSaveToServer = false)

✅ Test Case: Page Unload Warning
Steps:
1. Fill data (isDirty = true)
2. Try to close tab
3. Verify browser shows "unsaved changes" warning

✅ Test Case: Auto-Save After Error
Steps:
1. Server returns 500 error
2. User fixes data
3. Verify auto-save retries after debounce
```

---

## Test Data Reference

### Valid CNPs

```typescript
// Male, born 1990-01-01, Alba county
const CNP_MALE_1990 = '1900101011234';

// Female, born 2005-05-15, București
const CNP_FEMALE_2005 = '6050515401234';

// Minor (15 years old), Male
const CNP_MINOR = `5${(new Date().getFullYear() - 15) % 100}0101123456`;

// Foreign resident, Female
const CNP_FOREIGN_FEMALE = '8900101123456';
```

### Invalid CNPs for Testing

```typescript
const INVALID_CNPS = {
  tooShort: '123456789',
  tooLong: '12345678901234',
  nonNumeric: '1ABC456789012',
  invalidFirstDigit: '0900101123456',
  invalidMonth: '1901301123456',
  invalidDay: '1900132123456',
  futureDate: '5301201123456', // Year 2030
  invalidCounty: '1900101991234',
  wrongChecksum: '1900101123450'
};
```

### Test Service Configs

```typescript
// Minimal config (Contact → Options → Delivery → Review)
const MINIMAL_CONFIG = DEFAULT_DISABLED_CONFIG;

// Full KYC (Cazier Fiscal)
const FULL_KYC = {
  ...DEFAULT_DISABLED_CONFIG,
  personalKyc: {
    enabled: true,
    acceptedDocuments: ['ci_vechi', 'ci_nou_front', 'passport'],
    selfieRequired: true,
    signatureRequired: true,
    // ... rest of config
  },
  signature: { enabled: true, required: true }
};

// Company Only (Certificat Constatator)
const COMPANY_ONLY = {
  ...DEFAULT_DISABLED_CONFIG,
  companyKyc: {
    enabled: true,
    validation: 'infocui',
    autoComplete: true,
    // ... rest of config
  }
};

// Property Verification (Carte Funciară)
const PROPERTY_CONFIG = {
  ...DEFAULT_DISABLED_CONFIG,
  propertyVerification: {
    enabled: true,
    fields: {
      county: { required: true },
      locality: { required: true },
      carteFunciara: { required: true },
      cadastral: { required: true },
      topografic: { required: false }
    }
  }
};

// Vehicle Verification (Cazier Auto)
const VEHICLE_CONFIG = {
  ...DEFAULT_DISABLED_CONFIG,
  vehicleVerification: {
    enabled: true,
    fields: {
      plateNumber: { required: true },
      vin: { required: true },
      brand: { required: true },
      model: { required: true },
      year: { required: true }
    },
    plateFormat: 'romanian',
    vinValidation: true
  }
};
```

---

## Testing Tools Setup

### Recommended Testing Stack

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "jsdom": "^23.0.0"
  }
}
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Commands

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:unit": "vitest run src/lib",
    "test:integration": "vitest run src/providers"
  }
}
```

---

## Manual Testing Checklist

Print this checklist and check off each item during manual testing.

### Pre-Test Setup
- [ ] Database is seeded with test services
- [ ] Environment variables are set correctly
- [ ] OCR API (Gemini) is accessible
- [ ] Stripe test mode is enabled

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces step changes
- [ ] Focus indicators are visible
- [ ] Form errors are announced
- [ ] Color contrast meets WCAG AA

### Performance Testing
- [ ] Wizard loads in < 2s
- [ ] OCR processes in < 5s
- [ ] Auto-save completes in < 1s
- [ ] No memory leaks after 10 step navigations
- [ ] Works with slow 3G connection

### Security Testing
- [ ] XSS prevention in form fields
- [ ] CSRF tokens on API calls
- [ ] Files are scanned before upload
- [ ] Sensitive data is not logged
- [ ] localStorage is encrypted (if implemented)

---

## Success Criteria

The Modular Verification System is considered fully tested when:

1. **Unit Tests:** 100% coverage on `step-builder.ts` and `cnp.ts`
2. **Integration Tests:** All ModularWizardProvider state transitions work
3. **E2E Tests:** All 5 service scenarios pass without errors
4. **Edge Cases:** All 50+ edge cases are verified
5. **Cross-Browser:** Works on all 4 major browsers
6. **Performance:** Meets all performance benchmarks
7. **Accessibility:** WCAG 2.1 AA compliant

---

## Notes for Developers

- Run unit tests first: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Use `npm run test:ui` for interactive debugging
- Manual E2E tests should be done weekly during development
- Update this document when new modules are added
- All tests should pass before creating a PR

---

**Document Version:** 1.0
**Last Updated:** 2025-12-19
**Next Review:** After Sprint 3 completion
