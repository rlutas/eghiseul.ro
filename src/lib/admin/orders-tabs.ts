// Status groupings for the admin /admin/orders tabs UI. Kept in one place so
// the visible list, the tab badges, and the dashboard stay in sync.

// Team rule: while there is STILL WORK to do on an order, it stays in the
// "În procesare" tab — every active workflow status between paid and shipped
// (incl. depus la instituție + the granular add-on stages). 'standby'
// (waiting on customer documents) is DELIBERATELY excluded — team asked
// (2026-07-21) that parked orders show ONLY under the dedicated "Așteptare
// client" tab, not double-listed in „În procesare".
//
// 'cancellation_requested' e INCLUS (2026-08-12, cerere Raul): o cerere de
// anulare e muncă de făcut — cineva trebuie să decidă și să dea refund. Înainte
// cădea doar în „Toate", sortată după paid_at, deci ajungea jos în listă și era
// ușor de ratat (CJO-20260811-23113). Rândul poartă badge-ul roșu „Anulare
// solicitată", deci se distinge imediat în tab.
export const PROCESSING_GROUP = [
  'processing',
  'cancellation_requested',
  'documents_generated',
  'submitted_to_institution',
  'identification_pending_ocpi',
  'document_received',
  'extras_in_progress',
  'la_tradus',
  'la_legalizat',
  'la_apostila_notari',
  'eliberat_apostila_haga',
  'kyc_pending',
  'kyc_approved',
  'document_ready',
  'in_progress',
] as const;

export const SHIPPED_GROUP = ['shipped'] as const;

// Statuses we hide from the default "Toate" tab. Pre-payment placeholders
// (draft, pending) and explicit abandons pollute the operational view, so
// they only appear on their dedicated tab.
export const HIDDEN_FROM_DEFAULT = ['draft', 'pending', 'abandoned'] as const;

export type StatusTabValue =
  | 'all'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'abandoned'
  | 'standby'
  | 'on_hold';

export interface StatusTab {
  value: StatusTabValue;
  label: string;
  countKey: keyof OrdersCounts;
}

export const STATUS_TABS: StatusTab[] = [
  { value: 'all', label: 'Toate', countKey: 'all' },
  // Transfer bancar ales de client, banii încă neconfirmați de echipă. Tab
  // propriu pentru că e o coadă de lucru zilnică: cineva compară extrasul cu
  // lista asta și apasă „Confirmă plata" (10.09.2026). Comenzile apar și în
  // „Toate" — NU sunt coșuri abandonate.
  { value: 'awaiting_payment', label: 'Așteptare plată', countKey: 'awaiting_payment' },
  { value: 'paid', label: 'Plătite', countKey: 'paid' },
  { value: 'processing', label: 'În procesare', countKey: 'processing' },
  { value: 'shipped', label: 'Expediate', countKey: 'shipped' },
  { value: 'completed', label: 'Finalizate', countKey: 'completed' },
  // "Neplătite" = draft + pending + abandoned: every order where the customer
  // started but never completed payment (incl. failed-payment pending orders).
  // These are hidden from the default "Toate" tab; this tab surfaces them so
  // the team can follow up / recover.
  { value: 'abandoned', label: 'Neplătite', countKey: 'abandoned' },
  // Comenzile parcate în așteptarea clientului (acte expirate, documente
  // cerute). Apar DOAR aici, nu și în „În procesare" (excluse din
  // PROCESSING_GROUP) — vederea dedicată pentru follow-up.
  { value: 'standby', label: 'Așteptare client', countKey: 'standby' },
  // Blocate de instituție (ANCPI picat, registru inaccesibil) — pauză care nu
  // e din vina clientului; separat de standby ca echipa/topograful să distingă
  // „așteptăm clientul" de „așteptăm instituția" (28.08.2026).
  { value: 'on_hold', label: 'Blocat instituție', countKey: 'on_hold' },
];

export interface OrdersCounts {
  all: number;
  awaiting_payment: number;
  paid: number;
  processing: number;
  shipped: number;
  completed: number;
  abandoned: number;
  standby: number;
  on_hold: number;
  test_only: number;
  // Quick-filter chip badges ("Filtre rapide")
  overdue: number;
  deadline_soon: number;
  with_coupon: number;
  extra_pending: number;
  // Workflow-stage chip badges ("Stadiu")
  stage_documents_generated: number;
  stage_submitted: number;
  stage_received: number;
  stage_la_tradus: number;
  stage_la_legalizat: number;
  stage_la_apostila_notari: number;
  stage_apostila_haga: number;
  stage_ready: number;
}

export type TestFilter = 'hide' | 'only' | 'all';

export function parseTestFilter(raw: string | null | undefined): TestFilter {
  const v = (raw || 'hide').toLowerCase();
  if (v === 'only' || v === 'all') return v;
  return 'hide';
}

// Resolves a tab value to the underlying SQL filter shape. The list endpoint
// uses this so the visible list always matches the tab badge.
export interface StatusFilterShape {
  // Equality on status — when this is set, the query uses .eq()
  eq?: string;
  // Set membership on status — when this is set, the query uses .in()
  in?: readonly string[];
  // Exclusion on status — when this is set, the query uses .not('status','in',...)
  notIn?: readonly string[];
  // Equality on payment_status — combinable with `notIn` (tabul „Așteptare
  // plată" = neîncasate, indiferent de statusul de lucru, minus cele moarte).
  paymentStatusEq?: string;
}

// Comenzi pe care nimeni nu mai așteaptă bani: transferul „abandonat" de
// operator (banii nu au venit), anulările și rambursările.
export const DEAD_FOR_PAYMENT = ['draft', 'abandoned', 'cancelled', 'refunded'] as const;

/**
 * Aplică o formă de filtru pe un builder Supabase pentru `orders`. Un singur
 * loc pentru list / export / counts, ca lista să nu se desincronizeze de badge.
 * Builder-ul e `any` — cele trei rute au tipuri de select diferite.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyStatusFilter<Q = any>(query: Q, shape: StatusFilterShape): Q {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q: any = query;
  const list = (xs: readonly string[]) => `(${xs.map((s) => `"${s}"`).join(',')})`;
  if (shape.eq) q = q.eq('status', shape.eq);
  else if (shape.in) q = q.filter('status', 'in', list(shape.in));
  else if (shape.notIn) q = q.not('status', 'in', list(shape.notIn));
  if (shape.paymentStatusEq) q = q.eq('payment_status', shape.paymentStatusEq);
  return q as Q;
}

export function resolveStatusFilter(tab: string | null | undefined): StatusFilterShape {
  switch (tab) {
    case 'awaiting_payment':
      // Pe PLATĂ, nu pe status (14.09.2026): o comandă pornită pe dovadă
      // („Dovadă verificată — pornește lucrul") e deja „În procesare", dar
      // banii încă nu sunt confirmați — rămâne aici până la „Confirmă plata".
      return { paymentStatusEq: 'awaiting_verification', notIn: DEAD_FOR_PAYMENT };
    case 'paid':
      return { eq: 'paid' };
    case 'processing':
      return { in: PROCESSING_GROUP };
    case 'shipped':
      return { in: SHIPPED_GROUP };
    case 'completed':
      return { eq: 'completed' };
    case 'standby':
      return { eq: 'standby' };
    case 'on_hold':
      return { eq: 'on_hold_institution' };
    case 'abandoned':
      // "Neplătite" tab — draft + pending + abandoned (all incomplete/unpaid).
      return { in: HIDDEN_FROM_DEFAULT };
    // Specific status not in the tab list — pass through verbatim. Lets the
    // debug URL `?status=draft` still work.
    case 'draft':
    case 'pending':
    case 'cancelled':
    case 'refunded':
      return { eq: tab };
    case 'all':
    case null:
    case undefined:
    case '':
      return { notIn: HIDDEN_FROM_DEFAULT };
    default:
      // Unknown tab — be conservative and treat as 'all'.
      return { notIn: HIDDEN_FROM_DEFAULT };
  }
}
