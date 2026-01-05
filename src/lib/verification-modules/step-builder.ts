/**
 * Dynamic Step Builder for Order Wizard
 *
 * Builds wizard steps based on service verification configuration.
 * Each service can have different steps enabled/disabled.
 */

import type {
  ServiceVerificationConfig,
  ModularStep,
  ModularStepId,
  ModularWizardState,
  ClientType,
} from '@/types/verification-modules';
import { DEFAULT_DISABLED_CONFIG } from '@/types/verification-modules';

/**
 * All possible steps with their configurations
 */
const ALL_STEPS: Record<ModularStepId, Omit<ModularStep, 'number' | 'condition'>> = {
  'contact': {
    id: 'contact',
    label: 'Contact',
    labelRo: 'Date Contact',
    moduleType: 'core',
  },
  'client-type': {
    id: 'client-type',
    label: 'Client Type',
    labelRo: 'Tip Client',
    moduleType: 'core',
  },
  'personal-data': {
    id: 'personal-data',
    label: 'Personal Data',
    labelRo: 'Date Personale',
    moduleType: 'personalKyc',
  },
  'company-data': {
    id: 'company-data',
    label: 'Company Data',
    labelRo: 'Date Firmă',
    moduleType: 'companyKyc',
  },
  'property-data': {
    id: 'property-data',
    label: 'Property Data',
    labelRo: 'Date Imobil',
    moduleType: 'property',
  },
  'vehicle-data': {
    id: 'vehicle-data',
    label: 'Vehicle Data',
    labelRo: 'Date Vehicul',
    moduleType: 'vehicle',
  },
  'options': {
    id: 'options',
    label: 'Options',
    labelRo: 'Opțiuni',
    moduleType: 'core',
  },
  'kyc-documents': {
    id: 'kyc-documents',
    label: 'KYC Documents',
    labelRo: 'Documente KYC',
    moduleType: 'personalKyc',
  },
  'signature': {
    id: 'signature',
    label: 'Signature',
    labelRo: 'Semnătură',
    moduleType: 'signature',
  },
  'delivery': {
    id: 'delivery',
    label: 'Delivery',
    labelRo: 'Livrare',
    moduleType: 'core',
  },
  'review': {
    id: 'review',
    label: 'Review',
    labelRo: 'Finalizare',
    moduleType: 'core',
  },
};

/**
 * Build wizard steps based on service verification config
 * @param config - Service verification configuration
 * @param clientType - Selected client type (PF/PJ), affects which steps are shown
 */
export function buildWizardSteps(
  config: ServiceVerificationConfig | null | undefined,
  clientType?: ClientType
): ModularStep[] {
  const verificationConfig = config ?? DEFAULT_DISABLED_CONFIG;
  const steps: ModularStep[] = [];
  let stepNumber = 1;

  // Step 1: Contact (always present)
  steps.push({
    ...ALL_STEPS['contact'],
    number: stepNumber++,
  });

  // Step 1b: Client Type Selection (if enabled)
  if (verificationConfig.clientTypeSelection?.enabled) {
    steps.push({
      ...ALL_STEPS['client-type'],
      number: stepNumber++,
    });
  }

  // Determine which modules to show based on clientType
  const hasClientTypeSelection = verificationConfig.clientTypeSelection?.enabled;
  const showPersonalData = verificationConfig.personalKyc.enabled &&
    (!hasClientTypeSelection || clientType === 'PF' || clientType === 'PJ'); // PJ also needs personal data for representative
  const showCompanyData = verificationConfig.companyKyc.enabled &&
    (!hasClientTypeSelection || clientType === 'PJ');

  // Step 2: Company Data (for PJ - comes before personal data)
  if (showCompanyData) {
    const companyStep: ModularStep = {
      ...ALL_STEPS['company-data'],
      number: stepNumber++,
    };

    // Add condition based on clientType if selection is enabled
    if (hasClientTypeSelection) {
      companyStep.condition = (state: ModularWizardState) => state.clientType === 'PJ';
    } else if (verificationConfig.companyKyc.condition) {
      companyStep.condition = createConditionFunction(verificationConfig.companyKyc.condition);
    }

    steps.push(companyStep);
  }

  // Step 3: Personal Data (if personal KYC enabled)
  if (showPersonalData) {
    const personalStep: ModularStep = {
      ...ALL_STEPS['personal-data'],
      number: stepNumber++,
    };

    // For PJ, label changes to "Date Reprezentant"
    if (hasClientTypeSelection) {
      personalStep.condition = (state: ModularWizardState) => {
        // Always show for PF, show for PJ with different context
        return state.clientType === 'PF' || state.clientType === 'PJ';
      };
    }

    steps.push(personalStep);
  }

  // Step 2c: Property Data (if property verification enabled)
  if (verificationConfig.propertyVerification.enabled) {
    steps.push({
      ...ALL_STEPS['property-data'],
      number: stepNumber++,
    });
  }

  // Step 2d: Vehicle Data (if vehicle verification enabled)
  if (verificationConfig.vehicleVerification.enabled) {
    steps.push({
      ...ALL_STEPS['vehicle-data'],
      number: stepNumber++,
    });
  }

  // Step 3: Options (always present)
  steps.push({
    ...ALL_STEPS['options'],
    number: stepNumber++,
  });

  // Step 4: KYC Documents (if personal KYC with documents)
  if (
    verificationConfig.personalKyc.enabled &&
    verificationConfig.personalKyc.acceptedDocuments.length > 0
  ) {
    steps.push({
      ...ALL_STEPS['kyc-documents'],
      number: stepNumber++,
    });
  }

  // Step 5: Signature (if required)
  if (verificationConfig.signature.enabled && verificationConfig.signature.required) {
    steps.push({
      ...ALL_STEPS['signature'],
      number: stepNumber++,
    });
  }

  // Step 6: Delivery (always present)
  steps.push({
    ...ALL_STEPS['delivery'],
    number: stepNumber++,
  });

  // Step 7: Review (always present)
  steps.push({
    ...ALL_STEPS['review'],
    number: stepNumber++,
  });

  return steps;
}

/**
 * Create a condition function from a condition string
 * e.g., "client_type == 'PJ'" or "applicant_type == 'minor'"
 */
function createConditionFunction(condition: string): (state: ModularWizardState) => boolean {
  return (state: ModularWizardState) => {
    try {
      // Simple parser for common conditions
      // Format: "field == 'value'" or "field != 'value'"

      const equalMatch = condition.match(/^(\w+)\s*==\s*['"](\w+)['"]$/);
      if (equalMatch) {
        const [, field, value] = equalMatch;
        return getStateValue(state, field) === value;
      }

      const notEqualMatch = condition.match(/^(\w+)\s*!=\s*['"](\w+)['"]$/);
      if (notEqualMatch) {
        const [, field, value] = notEqualMatch;
        return getStateValue(state, field) !== value;
      }

      // Default: show the step
      console.warn(`Unknown condition format: ${condition}`);
      return true;
    } catch {
      return true;
    }
  };
}

/**
 * Get a value from wizard state by field name
 */
function getStateValue(state: ModularWizardState, field: string): unknown {
  switch (field) {
    case 'client_type':
      // Use explicit clientType selection, or infer from company data
      return state.clientType ?? (state.companyKyc?.cui ? 'PJ' : 'PF');
    case 'applicant_type':
      // Check if it's for a minor
      return state.personalKyc?.birthDate
        ? isMinor(state.personalKyc.birthDate) ? 'minor' : 'adult'
        : 'adult';
    case 'citizenship':
      return state.personalKyc?.citizenship ?? 'romanian';
    default:
      return undefined;
  }
}

/**
 * Check if birth date indicates a minor (under 18)
 */
function isMinor(birthDate: string): boolean {
  try {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 < 18;
    }
    return age < 18;
  } catch {
    return false;
  }
}

/**
 * Get the next valid step based on current step and conditions
 */
export function getNextStep(
  steps: ModularStep[],
  currentStepId: ModularStepId,
  state: ModularWizardState
): ModularStep | null {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= steps.length - 1) {
    return null;
  }

  // Find next step that passes its condition
  for (let i = currentIndex + 1; i < steps.length; i++) {
    const step = steps[i];
    if (!step.condition || step.condition(state)) {
      return step;
    }
  }

  return null;
}

/**
 * Get the previous valid step based on current step and conditions
 */
export function getPrevStep(
  steps: ModularStep[],
  currentStepId: ModularStepId,
  state: ModularWizardState
): ModularStep | null {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  if (currentIndex <= 0) {
    return null;
  }

  // Find previous step that passes its condition
  for (let i = currentIndex - 1; i >= 0; i--) {
    const step = steps[i];
    if (!step.condition || step.condition(state)) {
      return step;
    }
  }

  return null;
}

/**
 * Get step by ID
 */
export function getStepById(
  steps: ModularStep[],
  stepId: ModularStepId
): ModularStep | undefined {
  return steps.find(s => s.id === stepId);
}

/**
 * Check if current step can proceed to next
 */
export function canProceedToNext(
  steps: ModularStep[],
  currentStepId: ModularStepId,
  state: ModularWizardState
): boolean {
  return getNextStep(steps, currentStepId, state) !== null;
}

/**
 * Check if current step can go back
 */
export function canGoBack(
  steps: ModularStep[],
  currentStepId: ModularStepId,
  state: ModularWizardState
): boolean {
  return getPrevStep(steps, currentStepId, state) !== null;
}

/**
 * Get all visible steps (steps that pass their conditions)
 */
export function getVisibleSteps(
  steps: ModularStep[],
  state: ModularWizardState
): ModularStep[] {
  return steps.filter(step => !step.condition || step.condition(state));
}

/**
 * Renumber visible steps (for progress display)
 */
export function renumberSteps(steps: ModularStep[]): ModularStep[] {
  return steps.map((step, index) => ({
    ...step,
    number: index + 1,
  }));
}
