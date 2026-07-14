/**
 * Order option normalization
 *
 * `selected_options` ends up in three shapes across the codebase:
 *
 * 1) Wizard runtime (camelCase):
 *    { optionId, optionName, optionDescription, priceModifier, quantity, code, metadata, bundledFor, isAutoApplied }
 *
 * 2) Persisted in DB (snake_case, written by modular-wizard-provider.tsx):
 *    { option_id, option_name, option_description, price_modifier, quantity, code, metadata, bundled_for, is_auto_applied }
 *
 * 3) Legacy admin saves: { name, price } or { option_name, option_price }
 *
 * This module converts any of those into a single canonical shape used
 * everywhere downstream (Oblio invoicing, Stripe metadata, summary cards).
 */
export interface OrderOptionLine {
  /** Option id — the raw `option_id` / `optionId` from the wizard state.
   *  Needed by callers that group bundled children under their parent
   *  (e.g. OrderSummaryCard nesting). May be a synthetic id like
   *  `bundled:<parent.id>:<bundled.id>` for cross-service add-ons. */
  optionId?: string;
  /** Stable code (e.g. 'apostila_haga'). May be undefined for legacy rows. */
  code?: string;
  /** Display name. Includes appended metadata (language/country) if present. */
  name: string;
  /** Display name WITHOUT the metadata suffix — for fiscal invoices, where a
   *  stale/wrong country-language detail is worse than no detail (incident
   *  E-260714-WXGYQ: „Apostilă de la Haga — Chile" pe factură, comanda era
   *  pentru Italia). Metadata stays on `name` for admin/summary surfaces. */
  baseName: string;
  /** Optional human description. */
  description?: string;
  /** Per-unit price in RON (TVA-inclusive — same convention as the rest of the app). */
  unitPrice: number;
  /** Number of units. Defaults to 1. */
  quantity: number;
  /** unitPrice × quantity, rounded to 2 decimals. */
  total: number;
  /** True for system-toggled flags like cetatean_strain. */
  isAutoApplied?: boolean;
  /** Cross-service bundling parent option id (for nested add-ons). */
  bundledForParentId?: string;
}

type RawOption = {
  optionId?: string;
  option_id?: string;
  optionName?: string;
  option_name?: string;
  name?: string;
  optionDescription?: string;
  option_description?: string;
  description?: string;
  priceModifier?: number | string;
  price_modifier?: number | string;
  price?: number | string;
  option_price?: number | string;
  quantity?: number | string;
  code?: string;
  isAutoApplied?: boolean;
  is_auto_applied?: boolean;
  metadata?: { language?: string; country?: string } | null;
  bundledFor?: { parentOptionId?: string } | null;
  bundled_for?: { parent_option_id?: string } | null;
};

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

/**
 * Strip the marketing disclaimer "(adaugă în aceeași comandă)" that lives on
 * cross-service add-on rows in the DB. It's necessary in the catalog row so
 * users understand the bundle in the options picker, but it's redundant
 * noise in the order summary and on the printed contract. We trim it
 * everywhere that goes through the canonical normalizer.
 *
 * Handles two shapes:
 *   1. Top-level parent service: "Certificat Integritate (adaugă în aceeași comandă)"
 *      → "Certificat Integritate"
 *   2. Nested bundled child: "Apostila de la Haga (Certificat Integritate (adaugă în aceeași comandă))"
 *      → "Apostila de la Haga"
 *      (the bundled child is already visually nested under its parent in the
 *      summary, so the parent name doesn't need to be repeated in the label)
 */
function stripSecondaryServiceSuffix(name: string): string {
  // Pass 1 — nested form first (more specific): drop the entire outer
  // parenthetical that contains the marketing string.
  let out = name.replace(/\s*\([^()]*\(adaugă în aceeași comandă\)\)\s*$/i, '');
  // Pass 2 — bare top-level form.
  out = out.replace(/\s*\(adaugă în aceeași comandă\)\s*$/i, '');
  return out.trim();
}

function appendMetadataToName(name: string, metadata?: { language?: string; country?: string } | null): string {
  const clean = stripSecondaryServiceSuffix(name);
  if (!metadata) return clean;
  const parts = [metadata.language, metadata.country].filter(Boolean);
  return parts.length ? `${clean} — ${parts.join(' · ')}` : clean;
}

/** Normalize a single raw option into the canonical shape. */
export function normalizeOrderOption(raw: RawOption): OrderOptionLine {
  const baseName =
    raw.optionName ?? raw.option_name ?? raw.name ?? 'Opțiune';
  const description =
    raw.optionDescription ?? raw.option_description ?? raw.description ?? undefined;
  const unitPrice = parseNumber(
    raw.priceModifier ?? raw.price_modifier ?? raw.price ?? raw.option_price,
    0
  );
  const quantity = Math.max(1, Math.round(parseNumber(raw.quantity, 1)));
  const total = Math.round(unitPrice * quantity * 100) / 100;
  const isAutoApplied = raw.isAutoApplied ?? raw.is_auto_applied ?? undefined;
  const bundledForParentId =
    raw.bundledFor?.parentOptionId ?? raw.bundled_for?.parent_option_id ?? undefined;

  return {
    optionId: raw.optionId ?? raw.option_id ?? undefined,
    code: raw.code,
    name: appendMetadataToName(baseName, raw.metadata ?? undefined),
    baseName: stripSecondaryServiceSuffix(baseName),
    description,
    unitPrice,
    quantity,
    total,
    isAutoApplied,
    bundledForParentId,
  };
}

/** Normalize all options. Filters out zero-price entries by default. */
export function normalizeOrderOptions(
  raw: RawOption[] | null | undefined,
  { includeZero = false }: { includeZero?: boolean } = {}
): OrderOptionLine[] {
  if (!raw) return [];
  const out = raw.map(normalizeOrderOption);
  return includeZero ? out : out.filter((o) => o.total > 0);
}
