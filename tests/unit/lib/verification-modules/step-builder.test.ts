import { describe, expect, it } from 'vitest';
import { buildWizardSteps } from '@/lib/verification-modules/step-builder';
import {
  DEFAULT_DISABLED_CONFIG,
  FULL_KYC_CONFIG,
} from '@/types/verification-modules';
import type { ServiceVerificationConfig } from '@/types/verification-modules';

// Helper — merge a partial KYC config over the default so we get a fully-formed
// ServiceVerificationConfig without re-declaring every disabled module.
function mergeConfig(
  overrides: Partial<ServiceVerificationConfig>
): ServiceVerificationConfig {
  return {
    ...DEFAULT_DISABLED_CONFIG,
    ...overrides,
    personalKyc: { ...DEFAULT_DISABLED_CONFIG.personalKyc, ...overrides.personalKyc },
    companyKyc: { ...DEFAULT_DISABLED_CONFIG.companyKyc, ...overrides.companyKyc },
    signature: { ...DEFAULT_DISABLED_CONFIG.signature, ...overrides.signature },
  };
}

describe('buildWizardSteps — review step removal (2026-05-27)', () => {
  it('does NOT include a "review" step in the default wizard', () => {
    // Regression guard: dropping Review was the headline UX change of
    // 2026-05-27. If someone re-adds it the test points right at the cause.
    const steps = buildWizardSteps(DEFAULT_DISABLED_CONFIG);
    expect(steps.find((s) => s.id === 'review')).toBeUndefined();
  });

  it('does NOT include a "review" step with full KYC + signature config', () => {
    const config = mergeConfig(FULL_KYC_CONFIG as Partial<ServiceVerificationConfig>);
    const steps = buildWizardSteps(config);
    expect(steps.find((s) => s.id === 'review')).toBeUndefined();
  });

  it('ends the wizard with the "billing" step (last navigable)', () => {
    // The wizard now exits at billing → /comanda/checkout/[id]. Anything
    // tacked on after billing reintroduces friction; this test catches that.
    const config = mergeConfig(FULL_KYC_CONFIG as Partial<ServiceVerificationConfig>);
    const steps = buildWizardSteps(config);
    expect(steps[steps.length - 1].id).toBe('billing');
  });
});

describe('buildWizardSteps — cazier judiciar PF flow', () => {
  it('produces the expected 5-step PF flow when only PF is selected', () => {
    // Cazier judiciar PF after 2026-05-27 simplification:
    //   1. contact, 2. personal-data, 3. options, 4. kyc-documents,
    //   5. signature, 6. delivery, 7. billing
    // (Review intentionally removed; clientTypeSelection lives inside step 1.)
    const config = mergeConfig({
      personalKyc: {
        ...DEFAULT_DISABLED_CONFIG.personalKyc,
        enabled: true,
        acceptedDocuments: ['ci_vechi', 'ci_nou_front', 'ci_nou_back', 'passport'],
        parentDataRequired: false,
        requireAddressCertificate: 'never',
      },
      signature: { enabled: true, required: true, termsAcceptanceRequired: true },
    });
    const ids = buildWizardSteps(config, 'PF').map((s) => s.id);
    expect(ids).toEqual([
      'contact',
      'personal-data',
      'options',
      'kyc-documents',
      'signature',
      'delivery',
      'billing',
    ]);
  });
});
