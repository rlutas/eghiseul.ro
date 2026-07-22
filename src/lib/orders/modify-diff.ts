/**
 * Pure-function diff math for the admin "Modifică comandă" feature.
 *
 * The admin sends a desired new shape of the order (`selectedOptions`,
 * `deliveryPrice`). We compute the new total, compare against what the
 * customer has effectively paid (paid − refunded + extra paid), and tell
 * the caller whether a refund is owed, extra payment is needed, or nothing
 * moves.
 *
 * Kept separate from the route handler so the math is unit-testable and the
 * same helper can be reused by a future "preview before save" UI.
 */

export interface OrderOptionForDiff {
  /** Unit price in RON (TVA-inclusive — same convention as the rest of the app). */
  priceModifier?: number;
  price_modifier?: number;
  quantity?: number;
  code?: string;
  optionId?: string;
  option_id?: string;
  optionName?: string;
  option_name?: string;
}

export interface OrderForDiff {
  /** Stored on `orders.total_price` — the customer-facing total at order
   *  creation. */
  total_price: number;
  base_price: number;
  delivery_price: number;
  /** Cumulative RON refunded so far via previous Modify cycles. */
  refunded_amount?: number | null;
  /** Cumulative RON paid AFTER the original capture (extra-payment flow). */
  additional_paid_amount?: number | null;
  /** Original selected_options at order creation — used to compute the
   *  current total when there's no `total_price` corruption. */
  selected_options?: OrderOptionForDiff[] | null;
}

/** Ad-hoc service the operator types in free-form (not in the addon
 *  catalog) — e.g. "Traducere legalizată maghiară". Price in RON. */
export interface CustomExtraForDiff {
  name: string;
  price: number;
}

export interface ModifyChanges {
  /** Desired new options list (full replacement, not a delta). */
  selectedOptions: OrderOptionForDiff[];
  /** New delivery price in RON (e.g. 21.90 for Sameday). */
  deliveryPrice?: number;
  /** Optional free-form extra service; its price is added to the new total. */
  customExtra?: CustomExtraForDiff;
}

export interface DiffResult {
  /** New computed total (RON). */
  newTotal: number;
  /** What the customer has effectively paid right now (RON). */
  currentNetPaid: number;
  /** Original total at order creation (RON) — for display. */
  originalTotal: number;
  /** Already-refunded cumulative (RON). */
  refunded: number;
  /** Already-extra-paid cumulative (RON). */
  additionalPaid: number;
  /** newTotal − currentNetPaid. Negative = refund owed. Positive = customer
   *  owes more. Zero = no money moves. */
  diff: number;
  /** What the apply step needs to do. */
  action: 'refund' | 'extra_payment' | 'none';
}

function sumOptions(options: OrderOptionForDiff[] | null | undefined): number {
  if (!options) return 0;
  let sum = 0;
  for (const o of options) {
    const unit = o.priceModifier ?? o.price_modifier ?? 0;
    const qty = o.quantity ?? 1;
    sum += Number(unit) * Number(qty);
  }
  return Math.round(sum * 100) / 100;
}

export function computeModifyDiff(order: OrderForDiff, changes: ModifyChanges): DiffResult {
  const basePrice = Number(order.base_price ?? 0);
  const newOptionsSum = sumOptions(changes.selectedOptions);
  const newDelivery = changes.deliveryPrice ?? Number(order.delivery_price ?? 0);
  const customExtraPrice = changes.customExtra ? Number(changes.customExtra.price) : 0;
  const newTotal =
    Math.round((basePrice + newOptionsSum + customExtraPrice + newDelivery) * 100) / 100;

  const refunded = Number(order.refunded_amount ?? 0);
  const additionalPaid = Number(order.additional_paid_amount ?? 0);
  const originalTotal = Number(order.total_price ?? 0);
  // What the customer has paid net of refunds. We cap at 0 defensively in
  // case of legacy rows where refunded > paid (data corruption signal).
  // Round to 2 decimals to avoid IEEE-754 noise (e.g. 219.9 - 0 + 100 may
  // come out as 319.89999999999998 in plain JS arithmetic).
  const currentNetPaid =
    Math.round(Math.max(0, originalTotal - refunded + additionalPaid) * 100) / 100;

  const diff = Math.round((newTotal - currentNetPaid) * 100) / 100;
  let action: DiffResult['action'] = 'none';
  if (diff < 0) action = 'refund';
  else if (diff > 0) action = 'extra_payment';

  return {
    newTotal,
    currentNetPaid,
    originalTotal,
    refunded,
    additionalPaid,
    diff,
    action,
  };
}

/**
 * Human-readable summary of the changes, for Stripe descriptions + audit
 * notes + customer-facing emails. Truncated to 200 chars so we never blow
 * past Stripe's line-item-description limit.
 */
export function describeChanges(args: {
  oldOptions: OrderOptionForDiff[];
  newOptions: OrderOptionForDiff[];
  oldDeliveryPrice: number;
  newDeliveryPrice: number;
  /** Free-form extra service added by the operator (name + RON price). */
  customExtra?: CustomExtraForDiff;
}): string {
  const oldCodes = new Set(args.oldOptions.map((o) => o.code).filter(Boolean) as string[]);
  const newCodes = new Set(args.newOptions.map((o) => o.code).filter(Boolean) as string[]);

  const added = [...newCodes].filter((c) => !oldCodes.has(c));
  const removed = [...oldCodes].filter((c) => !newCodes.has(c));

  const labels: Record<string, string> = {
    urgenta: 'urgență',
    apostila_haga: 'apostilă Haga',
    apostila_notari: 'apostilă notari',
    traducere: 'traducere',
    legalizare: 'legalizare',
    verificare_expert: 'verificare expert',
    addon_certificat_integritate: 'certificat integritate',
    addon_cazier_judiciar: 'cazier judiciar (add-on)',
  };
  const fmt = (c: string) => labels[c] ?? c;

  const parts: string[] = [];
  if (added.length > 0) parts.push(`adăugat: ${added.map(fmt).join(', ')}`);
  if (removed.length > 0) parts.push(`scos: ${removed.map(fmt).join(', ')}`);
  if (args.customExtra) {
    parts.push(
      `serviciu extra: ${args.customExtra.name} (+${args.customExtra.price.toFixed(2)} RON)`
    );
  }
  if (args.oldDeliveryPrice !== args.newDeliveryPrice) {
    parts.push(`livrare ${args.oldDeliveryPrice.toFixed(2)} → ${args.newDeliveryPrice.toFixed(2)} RON`);
  }
  if (parts.length === 0) return 'modificare comandă';
  const joined = parts.join(' · ');
  return joined.length > 200 ? joined.slice(0, 197) + '...' : joined;
}
