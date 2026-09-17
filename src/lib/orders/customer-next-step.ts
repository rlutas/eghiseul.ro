/**
 * The two questions a customer actually opens the account to answer: what
 * happens next and who is doing it, and is there anything left for me to do.
 *
 * Faza 4 of `docs/dashboard-client/PLAN.md`. `customer-status.ts` says WHERE the
 * order is; this says WHAT HAPPENS NEXT. They are separate because the status
 * comes from the operator's workflow, while this is the promise we make about
 * it — and because only one status in the whole list actually needs the customer
 * to do something, which is the thing worth shouting about.
 *
 * Every status in `CUSTOMER_STATUS` has an entry here, enforced by
 * `tests/unit/lib/orders/customer-next-step.test.ts`. A status added to the
 * workflow without a next step fails the test rather than silently telling the
 * customer nothing.
 */

import { CUSTOMER_STATUS } from './customer-status';

/** Who the order is waiting on. */
export type Actor = 'noi' | 'institutia' | 'tu' | 'nimeni';

export interface CustomerNextStep {
  actor: Actor;
  /** One line, in the customer's words: what happens next. */
  text: string;
  /**
   * True only when the order cannot move until the customer does something.
   * Exactly one live status qualifies (`standby`), plus the two payment ones —
   * so when it is true it deserves the whole emphasis of the card.
   */
  needsCustomerAction: boolean;
  /** Present when there is a concrete thing to press. */
  action?: { label: string; kind: 'pay' | 'resume' | 'contact' | 'track' };
}

const WE = (text: string): CustomerNextStep => ({ actor: 'noi', text, needsCustomerAction: false });
const INSTITUTION = (text: string): CustomerNextStep => ({
  actor: 'institutia',
  text,
  needsCustomerAction: false,
});
const NOBODY = (text: string): CustomerNextStep => ({
  actor: 'nimeni',
  text,
  needsCustomerAction: false,
});

const NEXT_STEP: Record<string, CustomerNextStep> = {
  // Before payment — the customer's move.
  draft: {
    actor: 'tu',
    text: 'Comanda nu a fost trimisă. Reia de unde ai rămas și o preluăm.',
    needsCustomerAction: true,
    action: { label: 'Continuă comanda', kind: 'resume' },
  },
  pending: WE('O preluăm și îți scriem dacă mai avem nevoie de ceva.'),
  pending_payment: {
    actor: 'tu',
    text: 'Începem lucrul imediat ce plata e confirmată.',
    needsCustomerAction: true,
    action: { label: 'Plătește', kind: 'pay' },
  },
  awaiting_payment: {
    actor: 'tu',
    text: 'Am rezervat comanda. Trimite dovada transferului și pornim.',
    needsCustomerAction: true,
    action: { label: 'Trimite dovada plății', kind: 'contact' },
  },
  abandoned: {
    actor: 'tu',
    text: 'Comanda nu a fost finalizată. Scrie-ne dacă vrei să o reluăm.',
    needsCustomerAction: false,
    action: { label: 'Scrie-ne', kind: 'contact' },
  },

  // Ours to do.
  paid: WE('Pregătim actele și le depunem la instituție.'),
  processing: WE('Pregătim actele și le depunem la instituție.'),
  documents_generated: WE('Actele sunt gata; urmează depunerea la instituție.'),
  extras_in_progress: WE('Lucrăm la serviciile suplimentare cerute.'),
  la_tradus: WE('Documentul este la traducător autorizat.'),
  la_legalizat: WE('Documentul este la legalizare.'),
  la_apostila_notari: WE('Documentul este la notariat pentru apostilă.'),
  eliberat_apostila_haga: WE('Apostila e obținută; pregătim livrarea.'),
  document_received: WE('Am primit documentul și pregătim livrarea.'),
  document_ready: WE('Documentul e gata; îl trimitem către tine.'),

  // The institution's to do — the part we cannot hurry, and saying so is the
  // honest version of "în curs".
  submitted_to_institution: INSTITUTION('Dosarul e depus. Așteptăm eliberarea documentului.'),
  on_hold_institution: INSTITUTION(
    'Instituția e temporar indisponibilă. Termenul e pe pauză și reluăm imediat ce se poate.'
  ),

  // The one live status that is genuinely the customer's move.
  standby: {
    actor: 'tu',
    text: 'Avem nevoie de o informație sau un document de la tine ca să continuăm.',
    needsCustomerAction: true,
    action: { label: 'Vezi ce lipsește', kind: 'contact' },
  },

  // Out of our hands, in a good way.
  shipped: {
    actor: 'noi',
    text: 'Coletul e la curier.',
    needsCustomerAction: false,
    action: { label: 'Urmărește coletul', kind: 'track' },
  },
  delivered: NOBODY('Coletul a fost livrat.'),
  completed: NOBODY('Comanda e închisă. Documentele rămân în cont.'),

  // Ended.
  cancellation_requested: WE('Am primit cererea de anulare și o procesăm.'),
  cancelled: NOBODY('Comanda a fost anulată.'),
  refunded: NOBODY('Banii au fost returnați pe cardul folosit la plată.'),
};

export function customerNextStep(status: string | null | undefined): CustomerNextStep | null {
  if (!status) return null;
  return NEXT_STEP[status] ?? null;
}

/** Every status we describe here, for the coverage test. */
export const NEXT_STEP_STATUSES = Object.keys(NEXT_STEP);

/**
 * When the document is expected, and how sure we are about it.
 *
 * `GET /api/orders` already resolves the date the same way the order's own page
 * does — the stored `estimated_completion_date` when there is one (234 of the
 * 439 paid orders of the last 120 days), otherwise the same holiday- and
 * cutoff-aware calculation. This function must NOT invent a second answer: two
 * different dates for one order is how a tracker stops being believed.
 *
 * So the order of preference is:
 * - the date the API resolved;
 * - only as a last resort, payment + the raw service term, for a caller that has
 *   no resolved date at all.
 *
 * Returns null while the order is paused at the institution or waiting on the
 * customer: a date we know is wrong is worse than no date, and `on_hold_institution`
 * explicitly stops the clock.
 */
export interface EstimateInput {
  status?: string | null;
  estimatedCompletionDate?: string | Date | null;
  paidAt?: string | Date | null;
  createdAt?: string | Date | null;
  estimatedDays?: number | null;
}

export interface ReadyEstimate {
  date: Date;
  /** `set` = a date the team put on the order; `computed` = payment + estimated days. */
  source: 'set' | 'computed';
}

const CLOCK_STOPPED = new Set([
  'on_hold_institution',
  'standby',
  'pending_payment',
  'awaiting_payment',
  'draft',
  'abandoned',
  'cancelled',
  'cancellation_requested',
  'refunded',
]);

const FINISHED = new Set(['delivered', 'completed']);

export function estimatedReadyDate(input: EstimateInput): ReadyEstimate | null {
  const status = input.status ?? '';
  if (CLOCK_STOPPED.has(status) || FINISHED.has(status)) return null;

  const set = toDate(input.estimatedCompletionDate);
  if (set) return { date: set, source: 'set' };

  const start = toDate(input.paidAt) ?? toDate(input.createdAt);
  const days = input.estimatedDays;
  if (!start || !days || days <= 0) return null;

  const date = new Date(start.getTime());
  date.setDate(date.getDate() + days);
  return { date, source: 'computed' };
}

function toDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** „vineri, 26 septembrie" — a date, never an interval. */
export function formatReadyDate(date: Date): string {
  return date.toLocaleDateString('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** The statuses `CUSTOMER_STATUS` knows, so the test can compare the two maps. */
export const CUSTOMER_STATUS_KEYS = Object.keys(CUSTOMER_STATUS);
