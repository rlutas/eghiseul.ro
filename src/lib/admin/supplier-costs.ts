/**
 * Supplier-cost helpers (pure) for the "cost intern + marjă" feature.
 * A supplier cost = what a collaborator (translator/notary/…) charged US for
 * work on an order, recorded by the team so we can compute profit margin per
 * order and reconcile monthly invoices per supplier.
 * Table: order_supplier_costs (migration 136).
 */

export const SUPPLIER_CATEGORIES = [
  'traducere',
  'legalizare',
  'apostila',
  'supralegalizare',
  'copie_legalizata',
  'taxa_institutie',
  'curier',
  'alt',
] as const;

export type SupplierCategory = (typeof SUPPLIER_CATEGORIES)[number];

export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, string> = {
  traducere: 'Traducere',
  legalizare: 'Legalizare',
  apostila: 'Apostilă',
  supralegalizare: 'Supralegalizare',
  copie_legalizata: 'Copie legalizată',
  taxa_institutie: 'Taxă instituție',
  curier: 'Curier',
  alt: 'Alt cost',
};

/** Canonical supplier names — seeded in admin_settings.suppliers (migration 137). */
export const SUPPLIER_TRADUCATOR = 'Traducător';
export const SUPPLIER_NOTAR = 'Notar';
export const SUPPLIER_CAMERA_NOTARILOR = 'Camera Notarilor';
export const SUPPLIER_ONRC = 'ONRC';
export const SUPPLIER_ANCPI = 'ANCPI';

/**
 * Which supplier a category is normally paid to. The team never picks this by
 * hand in the finalize dialog — legalizarea se face la notar, apostila
 * notarială la Camera Notarilor.
 */
export const CATEGORY_DEFAULT_SUPPLIER: Record<SupplierCategory, string | null> = {
  traducere: SUPPLIER_TRADUCATOR,
  legalizare: SUPPLIER_NOTAR,
  copie_legalizata: SUPPLIER_NOTAR,
  apostila: SUPPLIER_CAMERA_NOTARILOR,
  supralegalizare: SUPPLIER_CAMERA_NOTARILOR,
  taxa_institutie: null, // depends on the service (ONRC vs ANCPI)
  curier: null,
  alt: null,
};

/**
 * Order options that cost US money, mapped to the cost category they create.
 *
 * `apostila_haga` is deliberately absent: the Hague apostille costs us nothing,
 * so it must not make the cost card appear. It stays in MARGIN_OPTION_CODES
 * below — on an order that also has a translation, those 198 lei are real
 * revenue at zero cost and excluding them would understate the margin.
 * Same for `urgenta` / `cetatean_strain` / `extras_*`: our own fees, no supplier.
 */
export const COST_BEARING_OPTION_CATEGORY: Record<string, SupplierCategory> = {
  traducere: 'traducere',
  legalizare: 'legalizare',
  apostila_notari: 'apostila',
  supralegalizare: 'supralegalizare',
  copie_legalizata: 'copie_legalizata',
  custom_extra: 'alt',
};

export interface SupplierCostRow {
  id: string;
  order_id: string;
  supplier: string;
  category: string;
  description: string | null;
  document_language: string | null;
  /** Which document of the order this cost belongs to (migration 141). */
  document_label: string | null;
  amount_ron: number;
  recorded_by: string | null;
  created_at: string;
}

export interface SupplierCostInput {
  supplier: string;
  category: string;
  description?: string | null;
  documentLanguage?: string | null;
  amountRon: number;
}

/** Validate a cost input (server-side). Returns error message or null. */
export function validateSupplierCost(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'Date invalide';
  const i = input as Record<string, unknown>;
  const supplier = typeof i.supplier === 'string' ? i.supplier.trim() : '';
  if (supplier.length < 2 || supplier.length > 120) return 'Furnizorul lipsește sau e invalid';
  if (!SUPPLIER_CATEGORIES.includes(String(i.category) as SupplierCategory)) {
    return 'Categoria e invalidă';
  }
  const amount = Number(i.amountRon);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
    return 'Suma trebuie să fie un număr între 0 și 100000';
  }
  if (i.description != null && (typeof i.description !== 'string' || (i.description as string).length > 300)) {
    return 'Descrierea e prea lungă (max 300)';
  }
  if (i.documentLanguage != null && (typeof i.documentLanguage !== 'string' || (i.documentLanguage as string).length > 60)) {
    return 'Limba e invalidă';
  }
  return null;
}

/** Sum of supplier costs (RON). */
export function totalSupplierCost(costs: Pick<SupplierCostRow, 'amount_ron'>[]): number {
  return Math.round(costs.reduce((s, c) => s + Number(c.amount_ron), 0) * 100) / 100;
}

/**
 * Revenue attributable to the extra/translation services on an order — i.e.
 * what the client paid for the options whose cost we're tracking. We sum the
 * option prices (traducere/legalizare/apostilă/… + custom_extra), NOT the base
 * service price, so the margin reflects the value-added services.
 */
export interface OptionLike {
  code?: string | null;
  priceModifier?: number | null;
  price_modifier?: number | null;
  quantity?: number | null;
}

const MARGIN_OPTION_CODES = new Set([
  'traducere',
  'legalizare',
  'apostila_haga',
  'apostila_notari',
  'cetatean_strain',
  'custom_extra',
]);

export function serviceRevenueForMargin(
  options: OptionLike[] | null | undefined,
  additionalPaidRon = 0
): number {
  let sum = Number(additionalPaidRon) || 0;
  for (const o of options ?? []) {
    if (!o.code || !MARGIN_OPTION_CODES.has(o.code)) continue;
    const unit = Number(o.priceModifier ?? o.price_modifier ?? 0);
    const qty = Number(o.quantity ?? 1);
    sum += unit * qty;
  }
  return Math.round(sum * 100) / 100;
}

/* ------------------------------------------------------------------ *
 * Tariffs (admin_settings.supplier_tariffs) + finalize-dialog rows
 * ------------------------------------------------------------------ */

/**
 * A configured tariff. Two shapes share one list:
 *  - per page (translator/notary): firstPageRon + extraPageRon
 *  - flat per service (ONRC/ANCPI institution fee): serviceSlug + amountRon
 */
export interface SupplierTariff {
  supplier: string;
  category: string;
  /** Only for translations — a tariff can differ per language. */
  language?: string | null;
  /** Only for institution fees — which service this fee belongs to. */
  serviceSlug?: string | null;
  firstPageRon?: number | null;
  extraPageRon?: number | null;
  amountRon?: number | null;
}

/**
 * Cost of `pages` pages under a tariff. First page costs firstPageRon, each
 * further page extraPageRon (ex. notar: 45 + 5 + 5 = 55 lei for 3 pages).
 * Flat tariffs (amountRon) ignore the page count. Returns null when the tariff
 * cannot produce a number — the caller then falls back to history.
 */
export function tariffAmount(tariff: SupplierTariff | null | undefined, pages = 1): number | null {
  if (!tariff) return null;
  const n = Math.max(1, Math.floor(Number(pages) || 1));
  if (tariff.amountRon != null && Number.isFinite(Number(tariff.amountRon))) {
    return Math.round(Number(tariff.amountRon) * 100) / 100;
  }
  const first = Number(tariff.firstPageRon);
  if (!Number.isFinite(first)) return null;
  const extra = Number.isFinite(Number(tariff.extraPageRon)) ? Number(tariff.extraPageRon) : 0;
  return Math.round((first + extra * (n - 1)) * 100) / 100;
}

/** Find the tariff matching a category (+ language / service), if configured. */
export function findTariff(
  tariffs: SupplierTariff[] | null | undefined,
  match: { category: string; language?: string | null; serviceSlug?: string | null }
): SupplierTariff | null {
  const list = tariffs ?? [];
  const sameCategory = list.filter((t) => t.category === match.category);
  if (sameCategory.length === 0) return null;

  const norm = (v: string | null | undefined) => (v ?? '').trim().toLowerCase();

  if (match.serviceSlug) {
    const byService = sameCategory.find((t) => norm(t.serviceSlug) === norm(match.serviceSlug));
    if (byService) return byService;
  }
  if (match.language) {
    const byLanguage = sameCategory.find((t) => norm(t.language) === norm(match.language));
    if (byLanguage) return byLanguage;
  }
  // A tariff with neither language nor service set is the category-wide default.
  return sameCategory.find((t) => !t.language && !t.serviceSlug) ?? null;
}

/**
 * Add-on codes that represent a SEPARATE document obtained in the same order
 * (cazier + certificat de integritate, pachet naștere…). Each such document can
 * carry its own translation/legalisation, so each gets its own cost line —
 * otherwise a two-document order collapses into one "Traducere" figure and you
 * can never tell what each document cost.
 *
 * `apostila_haga` is intentionally NOT here: it is a procedure applied to a
 * document, not a document of its own (and it costs us nothing anyway).
 */
export const DOCUMENT_ADDON_CODES: ReadonlySet<string> = new Set([
  'addon_certificat_integritate',
  'addon_certificat_nastere',
  'addon_certificat_casatorie',
  'addon_certificat_celibat',
  'addon_cazier_fiscal',
  'cazier_secundar',
  'certificat_pachet',
]);

/** One line the team is asked to price when finalizing an order. */
export interface PendingCostRow {
  category: SupplierCategory;
  /** Option code or service slug this row came from — for the description. */
  sourceCode: string;
  label: string;
  /** Which document this cost belongs to; null when the order has only one. */
  documentLabel: string | null;
  supplier: string | null;
  language: string | null;
  serviceSlug: string | null;
  /** Pre-filled amount: tariff first, last recorded amount second, else null. */
  suggestedAmount: number | null;
  suggestionSource: 'tarif' | 'istoric' | null;
  /** The tariff behind the suggestion, so the dialog can re-price on page count. */
  tariff: SupplierTariff | null;
}

interface OptionWithMeta extends OptionLike {
  option_name?: string | null;
  optionName?: string | null;
  metadata?: { language?: string | null; country?: string | null } | null;
}

/**
 * Which cost lines an order still needs. Empty array = no dialog, no card:
 * a plain cazier + urgency order never asks the team for anything.
 *
 * `existingCategories` are the categories already recorded on the order, so a
 * second finalize pass doesn't ask twice.
 */
export function pendingCostRows(params: {
  options: OptionWithMeta[] | null | undefined;
  serviceSlug?: string | null;
  /** Name of the main service — first document of the order. */
  serviceName?: string | null;
  /** Services whose institution fee we pay (ONRC / ANCPI), from tariffs. */
  institutionFeeSuppliers?: Record<string, string>;
  /** Already-recorded lines, as `pendingRowKey()` values. */
  existingKeys?: string[];
  tariffs?: SupplierTariff[] | null;
  lastAmounts?: Record<string, number>;
}): PendingCostRow[] {
  const done = new Set(params.existingKeys ?? []);
  const rows: PendingCostRow[] = [];

  // The documents this order produces. More than one → every cost line is
  // asked per document, so „cât a costat traducerea cazierului vs. a
  // certificatului de integritate" has an answer.
  const documents: string[] = [];
  for (const option of params.options ?? []) {
    if (!option.code || !DOCUMENT_ADDON_CODES.has(option.code)) continue;
    documents.push(option.option_name ?? option.optionName ?? option.code);
  }
  const hasMultipleDocuments = documents.length > 0;
  const mainDocument = params.serviceName ?? 'Serviciu principal';
  const documentTargets: Array<string | null> = hasMultipleDocuments
    ? [mainDocument, ...documents]
    : [null];

  const suggest = (
    category: SupplierCategory,
    supplier: string | null,
    language: string | null,
    serviceSlug: string | null
  ): Pick<PendingCostRow, 'suggestedAmount' | 'suggestionSource' | 'tariff'> => {
    const tariff = findTariff(params.tariffs, { category, language, serviceSlug });
    const fromTariff = tariffAmount(tariff, 1);
    if (fromTariff != null) {
      return { suggestedAmount: fromTariff, suggestionSource: 'tarif', tariff };
    }
    const key = lastAmountKey(supplier, category, language);
    const historic = params.lastAmounts?.[key];
    if (historic != null && Number.isFinite(historic)) {
      return { suggestedAmount: historic, suggestionSource: 'istoric', tariff: null };
    }
    return { suggestedAmount: null, suggestionSource: null, tariff: null };
  };

  // 1. Institution fee for the service itself (ONRC certificat constatator,
  //    ANCPI extras CF & co) — we pay it on every single one of these orders.
  const feeSupplier = params.serviceSlug
    ? params.institutionFeeSuppliers?.[params.serviceSlug]
    : undefined;
  if (feeSupplier && !done.has(pendingRowKey('taxa_institutie', null))) {
    rows.push({
      category: 'taxa_institutie',
      sourceCode: params.serviceSlug!,
      label: `Taxă ${feeSupplier}`,
      documentLabel: null,
      supplier: feeSupplier,
      language: null,
      serviceSlug: params.serviceSlug!,
      ...suggest('taxa_institutie', feeSupplier, null, params.serviceSlug!),
    });
  }

  // 2. Options bought from a collaborator — one line per document when the
  //    order carries more than one.
  for (const option of params.options ?? []) {
    const code = option.code ?? '';
    const category = COST_BEARING_OPTION_CATEGORY[code];
    if (!category) continue;
    const language = option.metadata?.language ?? null;
    const supplier = CATEGORY_DEFAULT_SUPPLIER[category];
    const name = option.option_name ?? option.optionName ?? SUPPLIER_CATEGORY_LABELS[category];

    for (const documentLabel of documentTargets) {
      const key = pendingRowKey(category, documentLabel);
      if (done.has(key) || rows.some((r) => pendingRowKey(r.category, r.documentLabel) === key)) {
        continue;
      }
      const base = language ? `${name} · ${language}` : name;
      rows.push({
        category,
        sourceCode: code,
        label: documentLabel ? `${base} — ${documentLabel}` : base,
        documentLabel,
        supplier,
        language,
        serviceSlug: null,
        ...suggest(category, supplier, language, null),
      });
    }
  }

  return rows;
}

/** Identity of a cost line: category + document. */
export function pendingRowKey(category: string, documentLabel: string | null | undefined): string {
  return `${category}|${(documentLabel ?? '').trim().toLowerCase()}`;
}

/**
 * Which services carry an institution fee, and to whom — derived from the
 * configured tariffs (`taxa_institutie` entries with a serviceSlug) rather than
 * hardcoded, so adding an ANCPI service is a settings change, not a deploy.
 * The amount may still be unset: the row then shows up with an empty field.
 */
export function institutionFeeMap(
  tariffs: SupplierTariff[] | null | undefined
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of tariffs ?? []) {
    if (t.category !== 'taxa_institutie') continue;
    const slug = (t.serviceSlug ?? '').trim();
    const supplier = (t.supplier ?? '').trim();
    if (slug && supplier) map[slug] = supplier;
  }
  return map;
}

/** Key for the "last amount used" lookup: supplier + category + language. */
export function lastAmountKey(
  supplier: string | null | undefined,
  category: string,
  language?: string | null
): string {
  return [
    (supplier ?? '').trim().toLowerCase(),
    category,
    (language ?? '').trim().toLowerCase(),
  ].join('|');
}

/** Margin = revenue − cost. Returns nulls when there's nothing to compare. */
export function computeMargin(
  revenue: number,
  cost: number
): { revenue: number; cost: number; margin: number; marginPct: number | null } {
  const margin = Math.round((revenue - cost) * 100) / 100;
  const marginPct = revenue > 0 ? Math.round((margin / revenue) * 1000) / 10 : null;
  return { revenue, cost, margin, marginPct };
}
