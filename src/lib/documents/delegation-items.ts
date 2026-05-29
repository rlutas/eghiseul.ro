/**
 * Pure helpers for deciding which delegation numbers an order needs.
 *
 * Extracted from `auto-generate.ts` so the logic can be unit-tested
 * without spinning up Supabase / the document generator. The actual
 * allocation (RPC call) still happens in auto-generate.ts and feeds
 * `number_registry`.
 *
 * Policy (lawyer bar / Barou compliance):
 *   - Every "official document we obtain on behalf of the client"
 *     requires its own împuternicire avocațială + delegation number.
 *   - The MAIN service always gets one delegation.
 *   - Options that produce a SEPARATE official document also get one
 *     (apostila Haga, certificat integritate add-on, certificat
 *     naștere/căsătorie/celibat, cazier fiscal add-on, etc.).
 *   - Processing-only options (urgenta, traducere, legalizare,
 *     apostila notari) DO NOT get a delegation — they are modifiers
 *     on existing documents, not new docs we obtain.
 *   - Bundled options (e.g., "apostila Haga ON certificat integritate"
 *     vs "apostila Haga ON cazier") get DIFFERENT delegations even
 *     though both share code `apostila_haga` — disambiguated via
 *     `service_type = bundled:<parentId>:<serviceSlug>:<code>`.
 *
 * Returned shape: `{ serviceType, label }`. `serviceType` is the dedup
 * key passed to `find_existing_number(p_service_type=...)`. `label`
 * is human-readable for log lines.
 */

export interface DelegationItem {
  serviceType: string;
  label: string;
}

export interface OrderForDelegations {
  services?: { name?: string | null; slug?: string | null } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected_options?: Array<any> | null;
}

/**
 * Option codes that require a separate delegation.
 * Add new codes here when a new addon represents a SEPARATE official
 * document obtained from a public authority on behalf of the client.
 */
export const DELEGATION_REQUIRING_OPTION_CODES: ReadonlySet<string> = new Set([
  'apostila_haga',
  'addon_certificat_integritate',
  'addon_certificat_nastere',
  'addon_certificat_casatorie',
  'addon_certificat_celibat',
  'addon_cazier_fiscal',
  'cazier_secundar',
]);

/**
 * Returns the list of (serviceType, label) tuples for which a delegation
 * must be allocated on this order. Always includes the main service as
 * the first item; appends one item per qualifying option.
 *
 * The result is order-stable so it can be diffed against the existing
 * number_registry rows for an order during re-allocation.
 */
export function computeDelegationItems(
  order: OrderForDelegations
): DelegationItem[] {
  const items: DelegationItem[] = [];

  // Main service — always.
  items.push({
    serviceType: order.services?.slug || order.services?.name || 'main',
    label: order.services?.name || 'Serviciu principal',
  });

  const selectedOptions = Array.isArray(order.selected_options)
    ? order.selected_options
    : [];

  for (const opt of selectedOptions) {
    const directCode: string = (opt?.code || '') as string;
    // Bundled metadata can be either `bundled_for` (snake) or `bundledFor`
    // (camel) depending on the wizard's serialization. Coalesce.
    const bundledMeta =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((opt?.bundled_for || opt?.bundledFor) as any) || null;
    const bundledCode: string | undefined =
      bundledMeta?.bundled_option_code || bundledMeta?.bundledOptionCode;
    const bundledParentId: string | undefined =
      bundledMeta?.parent_option_id || bundledMeta?.parentOptionId;
    const bundledServiceSlug: string | undefined =
      bundledMeta?.bundled_service_slug || bundledMeta?.bundledServiceSlug;

    const optionCode = directCode || bundledCode || '';
    if (!DELEGATION_REQUIRING_OPTION_CODES.has(optionCode)) continue;

    const serviceType = bundledCode
      ? `bundled:${bundledParentId || 'unknown'}:${bundledServiceSlug || 'unknown'}:${bundledCode}`
      : optionCode;

    items.push({
      serviceType,
      label: (opt?.option_name as string) || (opt?.optionName as string) || optionCode,
    });
  }

  return items;
}

/**
 * Returns true when the order's documents (contract, cerere eliberare,
 * împuternicire, etc.) should be generated as PJ (legal entity) variants
 * rather than PF.
 *
 * Critical distinction: this is NOT the same as "billing is PJ". A PF
 * customer (cazier pe persoană fizică) can have their invoice issued to
 * their employer (billing.type='persoana_juridica') and the service
 * remains PF. Treating that order as PJ for document generation produces
 * legally wrong documents (the cerere would name the wrong party).
 *
 * Only treat as PJ when:
 *   - customer_data.clientType is explicitly 'pj' (wizard's PJ entry), OR
 *   - companyKyc / companyData.uploadedDocuments exist (= service literally
 *     required PJ entity documents — e.g., Certificat constatator PJ).
 */
export function isPJForDocumentGeneration(
  customerData: Record<string, unknown> | null | undefined
): boolean {
  if (!customerData) return false;
  if (customerData.clientType === 'pj') return true;

  const companyData = (customerData.companyData ?? customerData.company) as
    | { uploadedDocuments?: unknown[] }
    | undefined;
  const hasCompanyDocs =
    !!(companyData?.uploadedDocuments && Array.isArray(companyData.uploadedDocuments) && companyData.uploadedDocuments.length > 0);

  return hasCompanyDocs || !!customerData.companyKyc;
}
