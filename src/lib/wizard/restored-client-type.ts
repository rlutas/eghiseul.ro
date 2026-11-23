import type { ClientType } from '@/types/verification-modules';

/**
 * PF/PJ for a draft reopened from the server (resume link, reload when the
 * server copy is newer).
 *
 * The saved `customer_data.clientType` is the client's own choice and wins.
 * Inferring it from `company` was wrong: services with a PF/PJ picker save an
 * empty company object for every client, so PF drafts came back as PJ and
 * were paid as „Persoană juridică" with no CUI (E-261118-X6FMM, 18.11.2026).
 *
 * Without a saved choice (services without the picker never store one) the
 * old inference stays, so PJ-only flows keep their company guards.
 */
export function clientTypeFromServerDraft(cd: Record<string, unknown>): ClientType | null {
  const saved = String(cd.clientType ?? '').toUpperCase();
  if (saved === 'PF' || saved === 'PJ') return saved;
  return cd.company ? 'PJ' : cd.contact || cd.personal ? 'PF' : null;
}

/**
 * Second line of defence at `/submit`: on a service with the PF/PJ picker,
 * „PJ" with no CUI and no company name cannot be a real company — the
 * company step refuses to continue without both. Such an order is a PF whose
 * choice got flipped, so it is saved as PF. Returns the corrected value, or
 * null when nothing has to change.
 */
export function flippedCompanyClientType(
  cd: Record<string, unknown>,
  hasClientTypePicker: boolean
): 'pf' | null {
  if (!hasClientTypePicker) return null;
  if (String(cd.clientType ?? '').toLowerCase() !== 'pj') return null;
  const company = (cd.company ?? {}) as { cui?: unknown; companyName?: unknown };
  const hasCui = typeof company.cui === 'string' && company.cui.trim() !== '';
  const hasName = typeof company.companyName === 'string' && company.companyName.trim() !== '';
  return hasCui || hasName ? null : 'pf';
}
