/**
 * Module Registry
 *
 * Central registry for all verification module components.
 * Maps step IDs to their React components.
 */

import type { ComponentType } from 'react';
import type { ModularStepId, ModuleBaseProps } from '@/types/verification-modules';

// Module component types
export interface ModuleRegistryEntry {
  stepId: ModularStepId;
  label: string;
  labelRo: string;
  // Component will be lazy-loaded
  componentPath: string;
}

/**
 * Registry of all available modules
 */
export const MODULE_REGISTRY: Record<ModularStepId, ModuleRegistryEntry> = {
  'contact': {
    stepId: 'contact',
    label: 'Contact',
    labelRo: 'Date Contact',
    componentPath: '@/components/orders/steps/contact-step',
  },
  'client-type': {
    stepId: 'client-type',
    label: 'Client Type',
    labelRo: 'Tip Client',
    componentPath: '@/components/orders/modules/client-type/ClientTypeStep',
  },
  'personal-data': {
    stepId: 'personal-data',
    label: 'Personal Data',
    labelRo: 'Date Personale',
    componentPath: '@/components/orders/modules/personal-kyc/PersonalDataStep',
  },
  'company-data': {
    stepId: 'company-data',
    label: 'Company Data',
    labelRo: 'Date Firmă',
    componentPath: '@/components/orders/modules/company-kyc/CompanyDataStep',
  },
  'property-data': {
    stepId: 'property-data',
    label: 'Property Data',
    labelRo: 'Date Imobil',
    componentPath: '@/components/orders/modules/property/PropertyDataStep',
  },
  'vehicle-data': {
    stepId: 'vehicle-data',
    label: 'Vehicle Data',
    labelRo: 'Date Vehicul',
    componentPath: '@/components/orders/modules/vehicle/VehicleDataStep',
  },
  'options': {
    stepId: 'options',
    label: 'Options',
    labelRo: 'Opțiuni',
    componentPath: '@/components/orders/steps/options-step',
  },
  'kyc-documents': {
    stepId: 'kyc-documents',
    label: 'KYC Documents',
    labelRo: 'Documente KYC',
    componentPath: '@/components/orders/modules/personal-kyc/KYCDocumentsStep',
  },
  'signature': {
    stepId: 'signature',
    label: 'Signature',
    labelRo: 'Semnătură',
    componentPath: '@/components/orders/modules/signature/SignatureStep',
  },
  'delivery': {
    stepId: 'delivery',
    label: 'Delivery',
    labelRo: 'Livrare',
    componentPath: '@/components/orders/steps/delivery-step',
  },
  'billing': {
    stepId: 'billing',
    label: 'Billing',
    labelRo: 'Facturare',
    componentPath: '@/components/orders/steps-modular/billing-step',
  },
  'review': {
    stepId: 'review',
    label: 'Review',
    labelRo: 'Finalizare',
    componentPath: '@/components/orders/steps/review-step',
  },
};

/**
 * Get module entry by step ID
 */
export function getModuleEntry(stepId: ModularStepId): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY[stepId];
}

/**
 * Check if a step ID is valid
 */
export function isValidStepId(stepId: string): stepId is ModularStepId {
  return stepId in MODULE_REGISTRY;
}

/**
 * Get all module entries
 */
export function getAllModules(): ModuleRegistryEntry[] {
  return Object.values(MODULE_REGISTRY);
}

/**
 * Dynamic component loader type
 * This will be used to lazy-load components
 * Components receive a config prop specific to their module type
 */
export type ModuleComponentLoader = () => Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ComponentType<any>;
}>;

/**
 * Map of step IDs to component loaders for dynamic imports
 * This enables code splitting - components are only loaded when needed
 */
export const MODULE_LOADERS: Partial<Record<ModularStepId, ModuleComponentLoader>> = {
  'client-type': () => import('@/components/orders/modules/client-type/ClientTypeStep'),
  'personal-data': () => import('@/components/orders/modules/personal-kyc/PersonalDataStep'),
  'company-data': () => import('@/components/orders/modules/company-kyc/CompanyDataStep'),
  'property-data': () => import('@/components/orders/modules/property/PropertyDataStep'),
  'vehicle-data': () => import('@/components/orders/modules/vehicle/VehicleDataStep'),
  'kyc-documents': () => import('@/components/orders/modules/personal-kyc/KYCDocumentsStep'),
  'signature': () => import('@/components/orders/modules/signature/SignatureStep'),
  'billing': () => import('@/components/orders/steps-modular/billing-step'),
};

/**
 * Check if a module has a dynamic loader
 */
export function hasModuleLoader(stepId: ModularStepId): boolean {
  return stepId in MODULE_LOADERS;
}
