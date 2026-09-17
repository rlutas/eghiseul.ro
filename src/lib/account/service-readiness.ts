/**
 * What a given service will still ask the customer for, given what their
 * account already holds.
 *
 * Never a gate: every service is orderable by anyone, including visitors with no
 * account at all, and the wizard collects whatever is missing. This exists so
 * the account can answer "how much will I have to type this time" — which is the
 * only reason to keep data in a profile in the first place.
 */

export interface ServiceRequirements {
  /** `verification_config.personalKyc.enabled` — needs an identity document. */
  needsIdentity: boolean;
  /** `verification_config.companyKyc.enabled` — needs company details. */
  needsCompany: boolean;
}

export interface AccountData {
  hasPersonalData: boolean;
  hasIdentityDocuments: boolean;
  hasCompanyData: boolean;
  hasAddress: boolean;
  hasBilling: boolean;
}

export interface ServiceReadiness {
  /** Nothing further will be asked beyond the service's own questions. */
  ready: boolean;
  /** What the order form will still ask for, in the customer's words. */
  missing: string[];
}

/**
 * Reads the flags off a service's `verification_config`. Written defensively:
 * the column is free-form JSON maintained per service, and a missing block just
 * means the step is off.
 */
export function serviceRequirements(verificationConfig: unknown): ServiceRequirements {
  const config = (verificationConfig ?? {}) as Record<string, { enabled?: boolean } | undefined>;
  return {
    needsIdentity: config.personalKyc?.enabled === true,
    needsCompany: config.companyKyc?.enabled === true,
  };
}

export function serviceReadiness(
  requirements: ServiceRequirements,
  account: AccountData
): ServiceReadiness {
  const missing: string[] = [];

  if (requirements.needsIdentity) {
    if (!account.hasPersonalData) missing.push('datele tale personale');
    if (!account.hasIdentityDocuments) missing.push('actul de identitate');
  }
  if (requirements.needsCompany && !account.hasCompanyData) {
    missing.push('datele firmei');
  }
  if (!account.hasAddress) missing.push('adresa de livrare');
  if (!account.hasBilling) missing.push('datele de facturare');

  return { ready: missing.length === 0, missing };
}

/** "actul de identitate și adresa de livrare" — a list a person can read. */
export function formatMissing(missing: string[]): string {
  if (missing.length === 0) return '';
  if (missing.length === 1) return missing[0];
  return `${missing.slice(0, -1).join(', ')} și ${missing[missing.length - 1]}`;
}
