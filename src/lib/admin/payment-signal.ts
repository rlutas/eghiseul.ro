/**
 * „Unde s-a oprit clientul?" pentru comenzile neplătite — o singură sursă pentru
 * lista Neplătite/Abandonuri și pentru Recuperare telefonică.
 *
 * `current_step` rămâne pe ultimul pas al wizardului (de obicei „Facturare")
 * chiar dacă clientul a trecut mai departe, la plata cu cardul. Așa că pasul
 * real se deduce din semnalele de plată:
 *   1. Stripe a refuzat cardul (webhook `payment_intent.payment_failed`) — cel
 *      mai cald lead: voia să plătească; soluția = IBAN sau alt card;
 *   2. s-a creat sesiunea Stripe (a apăsat „Plătește") — a ajuns la plată;
 *   3. altfel, pasul din wizard.
 */
import { stepLabel } from '@/lib/admin/wizard-steps';

export interface PaymentSignalInput {
  current_step?: string | null;
  stripe_checkout_session_id?: string | null;
  payment_failed_count?: number | null;
  payment_last_error?: string | null;
}

export type PaymentSignal =
  | { kind: 'failed'; label: string; reason: string; count: number; hint: string }
  | { kind: 'reached_payment'; label: string; hint: string }
  | { kind: 'step'; label: string };

/** Stripe `decline_code` / `code` → motiv pe înțelesul echipei. */
const DECLINE_REASONS: Record<string, string> = {
  insufficient_funds: 'fonduri insuficiente',
  expired_card: 'card expirat',
  incorrect_cvc: 'CVC greșit',
  invalid_cvc: 'CVC greșit',
  incorrect_number: 'număr de card greșit',
  invalid_number: 'număr de card greșit',
  invalid_expiry_month: 'dată de expirare greșită',
  invalid_expiry_year: 'dată de expirare greșită',
  card_velocity_exceeded: 'limita cardului depășită',
  withdrawal_count_limit_exceeded: 'limita cardului depășită',
  authentication_required: 'confirmarea 3D Secure n-a reușit',
  payment_intent_authentication_failure: 'confirmarea 3D Secure n-a reușit',
  card_not_supported: 'cardul nu acceptă plăți online',
  transaction_not_allowed: 'cardul nu acceptă plăți online',
  currency_not_supported: 'cardul nu acceptă plăți în lei',
  processing_error: 'eroare la bancă, de reîncercat',
  fraudulent: 'refuzat de bancă (suspiciune de fraudă)',
};

export function declineReason(code: string | null | undefined): string {
  if (!code) return 'card refuzat de bancă';
  return DECLINE_REASONS[code] ?? 'card refuzat de bancă';
}

/** Ce reținem din eroarea Stripe: codul cel mai specific. */
export function stripeErrorCode(
  err: { decline_code?: string | null; code?: string | null } | null | undefined
): string | null {
  if (!err) return null;
  // `card_declined` e generic; `decline_code` spune de ce (insufficient_funds…).
  return err.decline_code || err.code || null;
}

const IBAN_HINT = 'Propune plata prin transfer bancar (IBAN) sau cu alt card.';

export function paymentSignal(order: PaymentSignalInput): PaymentSignal {
  const count = Number(order.payment_failed_count ?? 0);
  if (count > 0) {
    const reason = declineReason(order.payment_last_error);
    return {
      kind: 'failed',
      label: count > 1 ? `Plată cu cardul eșuată (${count}×)` : 'Plată cu cardul eșuată',
      reason,
      count,
      hint: IBAN_HINT,
    };
  }
  if (order.stripe_checkout_session_id) {
    return {
      kind: 'reached_payment',
      label: 'A ajuns la plata cu cardul',
      hint: 'A ieșit de pe pagina de plată. Întreabă ce l-a oprit; IBAN e o variantă.',
    };
  }
  return { kind: 'step', label: `pas: ${stepLabel(order.current_step)}` };
}
