/**
 * What a given service will still ask the customer for, given what their
 * account already holds.
 *
 * Never a gate: every service is orderable by anyone, including visitors with no
 * account at all, and the order form collects whatever is missing. This exists
 * so the account can answer "how much will I have to type this time" — which is
 * the only reason to keep data in a profile in the first place.
 *
 * The first version of this file read only `personalKyc` and `companyKyc` and
 * therefore told 20 of the 31 active services "avem toate datele tale" while the
 * order was about to ask for a land-registry number, five convention fields or a
 * dozen civil-status questions. Every module the wizard can turn on is now
 * accounted for, and the ones the account can never satisfy say so plainly
 * instead of being silently ignored.
 */

export interface ServiceRequirements {
  /** `personalKyc.enabled` — identity document and selfie. */
  needsIdentity: boolean;
  /** `companyKyc.enabled` — company details. */
  needsCompany: boolean;
  /** `propertyVerification.enabled` — land registry / cadastral number. */
  needsProperty: boolean;
  /** `civilStatus.enabled` — the marriage/birth questionnaire. */
  needsCivilStatus: boolean;
  /** `vehicleVerification.enabled` — plate, licence, VIN. */
  needsVehicle: boolean;
  /** `constatator.enabled` — what the company certificate should contain. */
  needsConstatator: boolean;
  /** `conventie.enabled` — the surveyor's engagement, with beneficiary details. */
  needsConventie: boolean;
  /** `signature.required` — drawn signature at the end. */
  needsSignature: boolean;
}

export interface AccountData {
  hasPersonalData: boolean;
  hasIdentityDocuments: boolean;
  hasCompanyData: boolean;
  hasAddress: boolean;
  hasBilling: boolean;
  hasVehicle: boolean;
}

export interface ServiceReadiness {
  /** The account covers everything it can possibly cover for this service. */
  ready: boolean;
  /** What the order form will still ask for, in the customer's words. */
  missing: string[];
}

interface ModuleFlags {
  enabled?: boolean;
  required?: boolean;
}

/**
 * Reads the flags off a service's `verification_config`. Written defensively:
 * the column is free-form JSON maintained per service, so a missing block means
 * the step is off and only a literal `true` counts as on.
 */
export function serviceRequirements(verificationConfig: unknown): ServiceRequirements {
  const config = (verificationConfig ?? {}) as Record<string, ModuleFlags | undefined>;
  const on = (key: string, flag: 'enabled' | 'required' = 'enabled') => config[key]?.[flag] === true;

  return {
    needsIdentity: on('personalKyc'),
    needsCompany: on('companyKyc'),
    needsProperty: on('propertyVerification'),
    needsCivilStatus: on('civilStatus'),
    needsVehicle: on('vehicleVerification'),
    needsConstatator: on('constatator'),
    needsConventie: on('conventie'),
    needsSignature: on('signature', 'required'),
  };
}

export function serviceReadiness(
  requirements: ServiceRequirements,
  account: AccountData
): ServiceReadiness {
  const missing: string[] = [];

  // Things the account CAN hold — listed only when it does not hold them.
  if (requirements.needsIdentity) {
    if (!account.hasPersonalData) missing.push('datele tale personale');
    if (!account.hasIdentityDocuments) missing.push('actul de identitate');
  }
  if (requirements.needsCompany && !account.hasCompanyData) {
    missing.push('datele firmei');
  }
  if (requirements.needsVehicle && !account.hasVehicle) {
    missing.push('datele mașinii sau ale permisului');
  }
  if (!account.hasAddress) missing.push('adresa de livrare');
  if (!account.hasBilling) missing.push('datele de facturare');

  // Things the account can NEVER hold, because they belong to the request and
  // not to the person. Listed always, so "avem toate datele tale" is never
  // printed over a step that is definitely coming.
  if (requirements.needsProperty) {
    missing.push('datele imobilului (număr carte funciară sau cadastral)');
  }
  if (requirements.needsCivilStatus) {
    missing.push('detaliile actului de stare civilă');
  }
  if (requirements.needsConstatator) {
    missing.push('ce trebuie să conțină certificatul');
  }
  if (requirements.needsConventie) {
    missing.push('confirmarea convenției cu topograful');
  }

  return { ready: missing.length === 0, missing };
}

/** "actul de identitate și adresa de livrare" — a list a person can read. */
export function formatMissing(missing: string[]): string {
  if (missing.length === 0) return '';
  if (missing.length === 1) return missing[0];
  return `${missing.slice(0, -1).join(', ')} și ${missing[missing.length - 1]}`;
}
