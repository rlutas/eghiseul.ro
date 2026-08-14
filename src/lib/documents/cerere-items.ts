/**
 * Pure helper: which "cerere de eliberare" documents does an order need?
 *
 * Combined civil-status orders carry MULTIPLE services in one order — e.g.
 * certificat-nastere (main) + Extras Multilingv (option `extras_multilingv`),
 * or extras-multilingv-certificat-* (main) + the certificate itself (option
 * `certificat_pachet`). Each service has its OWN official request form
 * (cerere-eliberare-pf) with its own template folder under `src/templates/`,
 * so the admin must be able to generate one cerere PER service, exactly like
 * împuternicirile (see `computeDelegationItems`).
 *
 * `computeDelegationItems` can NOT be reused here: its option allow-list
 * (DELEGATION_REQUIRING_OPTION_CODES) does not include `extras_multilingv` /
 * `certificat_pachet` — verified against real orders (E-260708-VYC2B:
 * certificat-nastere + extras_multilingv) — and its `serviceType` values are
 * delegation dedup keys (`bundled:<id>:...`), not template-folder slugs.
 *
 * Returned `serviceSlug` doubles as:
 *   - the template folder passed to `generateDocument(serviceSlug, ...)`;
 *   - `context.order.service_slug` so TIP_ACT / INSTITUTIE / celibat-variant
 *     selection resolve for the ADDITIONAL service, not the main one;
 *   - the `service_slug` body param + `metadata.service_type` of the saved
 *     order_documents row (mirrors the împuternicire per-service pattern).
 *
 * The main service is always item 0. Only slugs with their own
 * cerere-eliberare-pf template are ever returned as EXTRA items — anything
 * else would silently fall back to `templates/shared/cerere-eliberare-pf.docx`
 * (the cazier form) and produce a legally wrong request.
 */

import type { OrderForDelegations } from './delegation-items';

export interface CerereItem {
  /** Template-folder slug (src/templates/<slug>/cerere-eliberare-pf.docx). */
  serviceSlug: string;
  /** Human-readable label for the admin document row / log lines. */
  label: string;
}

/**
 * Civil-status slugs that own a cerere-eliberare-pf template. Keep in sync
 * with `src/templates/` when a new civil-status service gets its own cerere.
 */
export const CERERE_CAPABLE_CIVIL_SLUGS: ReadonlySet<string> = new Set([
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
]);

/**
 * Non-civil slugs that can appear as an ADDITIONAL service and own a real
 * cerere template (`src/templates/<slug>/cerere-eliberare-pf.docx`).
 * Today only cazier judiciar, added as an add-on on certificat-integritate.
 */
const CERERE_CAPABLE_EXTRA_SLUGS: ReadonlySet<string> = new Set([
  'cazier-judiciar',
]);

function isCerereCapableExtra(slug: string): boolean {
  return (
    CERERE_CAPABLE_CIVIL_SLUGS.has(slug) || CERERE_CAPABLE_EXTRA_SLUGS.has(slug)
  );
}

/**
 * Services that are obtained with an împuternicire ONLY — no cerere de
 * eliberare at all.
 *
 * Cazierul auto (fișa de evidență a conducătorului auto) și certificatul de
 * integritate comportamentală se ridică de avocat pe baza împuternicirii; IPJ
 * nu cere formular de eliberare pentru ele. Fără această listă, cererea cădea
 * pe `templates/shared/cerere-eliberare-pf.docx` — formularul de CAZIER
 * JUDICIAR — deci se genera un document greșit, care încurca echipa.
 *
 * Excepție (păstrată deliberat): o comandă de certificat integritate cu
 * add-on-ul `addon_cazier_judiciar` chiar are nevoie de cererea de cazier
 * judiciar — apare ca item SECUNDAR, pe template-ul `cazier-judiciar`.
 */
export const SERVICES_WITHOUT_CERERE: ReadonlySet<string> = new Set([
  'cazier-auto',
  'certificat-integritate',
]);

/**
 * Returns the list of cereri (one per service) this order needs.
 * Item 0 is the MAIN service (unless that service needs no cerere at all —
 * see SERVICES_WITHOUT_CERERE); extra items are appended for options that add
 * a separate service with its own cerere to the same order.
 *
 * An EMPTY array means "această comandă nu are nicio cerere de eliberare" —
 * callers must hide/refuse the cerere generation entirely.
 */
export function computeCerereItems(order: OrderForDelegations): CerereItem[] {
  const mainSlug = order.services?.slug || '';

  const items: CerereItem[] = SERVICES_WITHOUT_CERERE.has(mainSlug)
    ? []
    : [
        {
          serviceSlug: mainSlug,
          label: order.services?.name || 'Serviciu principal',
        },
      ];

  const selectedOptions = Array.isArray(order.selected_options)
    ? order.selected_options
    : [];

  for (const opt of selectedOptions) {
    const code: string = (opt?.code || '') as string;
    // Bundled metadata can be snake_case or camelCase depending on the
    // wizard's serialization — same coalescing as computeDelegationItems.
    const bundledMeta =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((opt?.bundled_for || opt?.bundledFor) as any) || null;
    const bundledServiceSlug: string | undefined =
      bundledMeta?.bundled_service_slug || bundledMeta?.bundledServiceSlug;

    let extraSlug: string | null = null;

    if (
      code === 'extras_multilingv' &&
      (mainSlug === 'certificat-nastere' || mainSlug === 'certificat-casatorie')
    ) {
      // Certificate main + multilingual extract add-on. The extras slug
      // composes from the certificate slug (extras-multilingv-certificat-*).
      extraSlug = `extras-multilingv-${mainSlug}`;
    } else if (
      code === 'certificat_pachet' &&
      mainSlug.startsWith('extras-multilingv-')
    ) {
      // Inverse combo: extras multilingv main + "adaugă și certificatul".
      extraSlug = mainSlug.replace('extras-multilingv-', '');
    } else if (code === 'addon_certificat_nastere') {
      extraSlug = 'certificat-nastere';
    } else if (code === 'addon_certificat_casatorie') {
      extraSlug = 'certificat-casatorie';
    } else if (code === 'addon_certificat_celibat') {
      extraSlug = 'certificat-celibat';
    } else if (code === 'addon_cazier_judiciar') {
      // Cazier judiciar adăugat pe o comandă de certificat integritate: e
      // singurul document din comandă care CHIAR are cerere de eliberare.
      extraSlug = 'cazier-judiciar';
    } else if (
      bundledServiceSlug &&
      isCerereCapableExtra(bundledServiceSlug)
    ) {
      // Generic bundled-service option pointing at a civil-status service.
      extraSlug = bundledServiceSlug;
    }

    if (!extraSlug || !isCerereCapableExtra(extraSlug)) continue;
    if (extraSlug === mainSlug) continue;
    if (items.some((i) => i.serviceSlug === extraSlug)) continue;

    items.push({
      serviceSlug: extraSlug,
      label:
        (opt?.option_name as string) ||
        (opt?.optionName as string) ||
        extraSlug,
    });
  }

  return items;
}
