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
  curier: 'Curier',
  alt: 'Alt cost',
};

export interface SupplierCostRow {
  id: string;
  order_id: string;
  supplier: string;
  category: string;
  description: string | null;
  document_language: string | null;
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

/** Margin = revenue − cost. Returns nulls when there's nothing to compare. */
export function computeMargin(
  revenue: number,
  cost: number
): { revenue: number; cost: number; margin: number; marginPct: number | null } {
  const margin = Math.round((revenue - cost) * 100) / 100;
  const marginPct = revenue > 0 ? Math.round((margin / revenue) * 1000) / 10 : null;
  return { revenue, cost, margin, marginPct };
}
