/**
 * How an order status is shown to the CUSTOMER.
 *
 * `src/lib/admin/status-options.ts` is the operator's vocabulary and the source
 * of truth for what statuses exist. The account area used to keep its own much
 * shorter map — six entries in the list, nine on the detail page — and fell back
 * to "În așteptare" for everything else. The result: an order that was paid,
 * filed with the institution and shipped all looked identical to the customer,
 * a yellow clock reading "În așteptare". Refunded orders looked the same.
 *
 * So this file covers every status, in customer language rather than operator
 * language ("Trimis instituție" is what we do; "Depusă la instituție" is what
 * they understand), and `tests/unit/lib/orders/customer-status.test.ts` fails if
 * a status is ever added to the admin list without being described here.
 */

export type StatusTone = 'waiting' | 'progress' | 'done' | 'problem';

export interface CustomerStatus {
  label: string;
  tone: StatusTone;
  /** One line under the badge on the order page. Empty when the label says it all. */
  hint?: string;
}

const WAITING: StatusTone = 'waiting';
const PROGRESS: StatusTone = 'progress';
const DONE: StatusTone = 'done';
const PROBLEM: StatusTone = 'problem';

export const CUSTOMER_STATUS: Record<string, CustomerStatus> = {
  // Before payment
  draft: { label: 'Neterminată', tone: WAITING, hint: 'Comanda nu a fost trimisă. Poți relua de unde ai rămas.' },
  pending: { label: 'În așteptare', tone: WAITING, hint: 'Am primit comanda și urmează să o preluăm.' },
  pending_payment: { label: 'Așteaptă plata', tone: WAITING, hint: 'Finalizează plata ca să începem lucrul.' },
  awaiting_payment: {
    label: 'Așteptăm plata prin transfer',
    tone: WAITING,
    hint: 'Am rezervat comanda. Începem lucrul imediat ce vedem dovada plății.',
  },
  abandoned: { label: 'Abandonată', tone: PROBLEM, hint: 'Comanda nu a fost finalizată. Ne poți scrie dacă vrei să o reluăm.' },

  // Work in progress
  paid: { label: 'Plătită', tone: PROGRESS, hint: 'Plata a intrat. Pregătim documentele.' },
  processing: { label: 'În procesare', tone: PROGRESS, hint: 'Lucrăm la comanda ta.' },
  documents_generated: { label: 'Documente pregătite', tone: PROGRESS, hint: 'Am pregătit actele necesare pentru depunere.' },
  submitted_to_institution: { label: 'Depusă la instituție', tone: PROGRESS, hint: 'Dosarul este la instituție. Așteptăm eliberarea.' },
  identification_pending_ocpi: {
    label: 'Certificat oficial cerut la OCPI',
    tone: PROGRESS,
    hint: 'Imobilul nu apare în e-Terra. Am cerut OCPI certificatul oficial privind înscrierea lui; răspunsul vine în circa 10 zile lucrătoare.',
  },
  document_received: { label: 'Document primit', tone: PROGRESS, hint: 'Am primit documentul de la instituție.' },
  extras_in_progress: { label: 'Servicii suplimentare în lucru', tone: PROGRESS },

  // Add-on stages
  la_tradus: { label: 'La traducere', tone: PROGRESS },
  la_legalizat: { label: 'La legalizare', tone: PROGRESS },
  la_apostila_notari: { label: 'La apostilă (notariat)', tone: PROGRESS },
  eliberat_apostila_haga: { label: 'Apostilă Haga obținută', tone: PROGRESS },

  // Ready and out
  document_ready: { label: 'Document gata', tone: DONE, hint: 'Documentul este eliberat și urmează livrarea.' },
  shipped: { label: 'Expediată', tone: DONE, hint: 'Coletul este la curier. Poți urmări livrarea.' },
  delivered: { label: 'Livrată', tone: DONE },
  completed: { label: 'Finalizată', tone: DONE },

  // Paused
  standby: { label: 'Așteptăm un răspuns de la tine', tone: WAITING, hint: 'Avem nevoie de o informație sau un document ca să continuăm.' },
  on_hold_institution: {
    label: 'Blocată la instituție',
    tone: WAITING,
    hint: 'Instituția este temporar indisponibilă. Reluăm imediat ce se poate; termenul este pus pe pauză.',
  },

  // Cancel / refund
  cancellation_requested: { label: 'Anulare în curs', tone: PROBLEM, hint: 'Am primit cererea de anulare și o procesăm.' },
  cancelled: { label: 'Anulată', tone: PROBLEM },
  refunded: { label: 'Rambursată', tone: PROBLEM, hint: 'Banii au fost returnați pe cardul folosit la plată.' },
};

/**
 * Never returns undefined: an unknown status shows its own raw value rather
 * than silently masquerading as "În așteptare", so a new status added without
 * a translation is visible instead of misleading.
 */
export function customerStatus(status: string | null | undefined): CustomerStatus {
  if (!status) return { label: 'În așteptare', tone: WAITING };
  return CUSTOMER_STATUS[status] ?? { label: status, tone: PROGRESS };
}

/** Tailwind classes per tone, so list and detail page always agree. */
export const STATUS_TONE_CLASSES: Record<StatusTone, { text: string; bg: string; dot: string }> = {
  waiting: { text: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  progress: { text: 'text-blue-700', bg: 'bg-blue-100', dot: 'bg-blue-500' },
  done: { text: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  problem: { text: 'text-red-700', bg: 'bg-red-100', dot: 'bg-red-500' },
};
