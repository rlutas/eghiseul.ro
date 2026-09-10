/**
 * Eticheta metodei de plată — SURSĂ UNICĂ pentru toate ecranele de admin.
 *
 * `orders.payment_method` are valori venite din trei locuri diferite:
 *   - `'bank_transfer'` — pus în checkout când clientul alege IBAN-ul;
 *   - `'transfer'` / `'cash'` — puse de `fulfilManuallyPaidOrder` la
 *     confirmarea manuală, deci ele SUPRASCRIU `'bank_transfer'`;
 *   - `'card'` / `'stripe'` / `null` — plata cu cardul; webhook-ul Stripe nu
 *     scrie coloana deloc, deci pentru card valoarea e de obicei NULL și se
 *     deduce din identificatorii Stripe.
 *
 * Din cauza asta lista de comenzi arăta „Card" pe un transfer bancar
 * confirmat (10.09.2026): testa doar `=== 'bank_transfer'`, iar confirmarea
 * schimbase valoarea în `'transfer'`.
 */
export type PaymentMethodKind = 'card' | 'transfer' | 'cash' | 'unknown';

export interface PaymentMethodInput {
  method: string | null | undefined;
  /** Prezența oricărui identificator Stripe = plată cu cardul. */
  hasStripeIds?: boolean;
  /**
   * Coloană goală pe o comandă PLĂTITĂ înseamnă card: singurele plăți care
   * scriu `payment_method` sunt transferul și cash-ul, iar webhook-ul Stripe
   * nu atinge coloana. Ecranele care nu au la îndemână identificatorii Stripe
   * (lista de comenzi) folosesc asta ca să nu afișeze „—" pe fiecare plată cu
   * cardul din istoric.
   */
  paidWithoutMethod?: boolean;
}

export function paymentMethodKind({
  method,
  hasStripeIds,
  paidWithoutMethod,
}: PaymentMethodInput): PaymentMethodKind {
  const m = (method ?? '').toLowerCase();
  if (m === 'bank_transfer' || m === 'transfer') return 'transfer';
  if (m === 'cash' || m === 'numerar') return 'cash';
  if (m === 'card' || m === 'stripe') return 'card';
  if (!m && (hasStripeIds || paidWithoutMethod)) return 'card';
  return 'unknown';
}

const LONG: Record<PaymentMethodKind, string> = {
  card: 'Stripe (card)',
  transfer: 'Transfer bancar',
  cash: 'Cash',
  unknown: 'Necunoscută',
};

const SHORT: Record<PaymentMethodKind, string> = {
  card: 'Card',
  transfer: 'Transfer',
  cash: 'Cash',
  unknown: '—',
};

/** Etichetă completă (pagina comenzii). */
export function paymentMethodLabel(input: PaymentMethodInput): string {
  return LONG[paymentMethodKind(input)];
}

/** Etichetă scurtă, pentru badge-ul din lista de comenzi. */
export function paymentMethodShortLabel(input: PaymentMethodInput): string {
  return SHORT[paymentMethodKind(input)];
}
