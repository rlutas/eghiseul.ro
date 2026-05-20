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
  /** Stable code (e.g. 'apostila_haga'). May be undefined for legacy rows. */
  code?: string;
  /** Display name. Includes appended metadata (language/country) if present. */
  name: string;
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

function appendMetadataToName(name: string, metadata?: { language?: string; country?: string } | null): string {
  if (!metadata) return name;
  const parts = [metadata.language, metadata.country].filter(Boolean);
  return parts.length ? `${name} — ${parts.join(' · ')}` : name;
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
    code: raw.code,
    name: appendMetadataToName(baseName, raw.metadata ?? undefined),
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
