/**
 * Verification Modules - Main Export
 *
 * This module provides the modular verification system for the order wizard.
 * Services can enable/disable different verification modules based on their requirements.
 */

// Registry exports
export {
  MODULE_REGISTRY,
  MODULE_LOADERS,
  getModuleEntry,
  isValidStepId,
  getAllModules,
  hasModuleLoader,
  type ModuleRegistryEntry,
  type ModuleComponentLoader,
} from './registry';

// Step builder exports
export {
  buildWizardSteps,
  getNextStep,
  getPrevStep,
  getStepById,
  canProceedToNext,
  canGoBack,
  getVisibleSteps,
  renumberSteps,
} from './step-builder';

// Re-export types from verification-modules types
export type {
  // Document types
  DocumentType,
  CitizenshipType,

  // Module configs
  PersonalKYCConfig,
  CompanyKYCConfig,
  PropertyVerificationConfig,
  VehicleVerificationConfig,
  SignatureConfig,
  ServiceVerificationConfig,

  // Step types
  ModularStepId,
  ModularStep,

  // State types
  PersonalKYCState,
  CompanyKYCState,
  PropertyState,
  VehicleState,
  SignatureState,
  ModularWizardState,

  // Component props
  ModuleBaseProps,
  PersonalKYCModuleProps,
  CompanyKYCModuleProps,
  PropertyModuleProps,
  VehicleModuleProps,
  SignatureModuleProps,
} from '@/types/verification-modules';

// Re-export default configs
export {
  DEFAULT_DISABLED_CONFIG,
  FULL_KYC_CONFIG,
  COMPANY_ONLY_CONFIG,
} from '@/types/verification-modules';
