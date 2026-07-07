// Status groupings for the admin /admin/orders tabs UI. Kept in one place so
// the visible list, the tab badges, and the dashboard stay in sync.

export const PROCESSING_GROUP = [
  'processing',
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
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'abandoned';

export interface StatusTab {
  value: StatusTabValue;
  label: string;
  countKey: keyof OrdersCounts;
}

export const STATUS_TABS: StatusTab[] = [
  { value: 'all', label: 'Toate', countKey: 'all' },
  { value: 'paid', label: 'Plătite', countKey: 'paid' },
  { value: 'processing', label: 'În procesare', countKey: 'processing' },
  { value: 'shipped', label: 'Expediate', countKey: 'shipped' },
  { value: 'completed', label: 'Finalizate', countKey: 'completed' },
  // "Neplătite" = draft + pending + abandoned: every order where the customer
  // started but never completed payment (incl. failed-payment pending orders).
  // These are hidden from the default "Toate" tab; this tab surfaces them so
  // the team can follow up / recover.
  { value: 'abandoned', label: 'Neplătite', countKey: 'abandoned' },
];

export interface OrdersCounts {
  all: number;
  paid: number;
  processing: number;
  shipped: number;
  completed: number;
  abandoned: number;
  test_only: number;
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
}

export function resolveStatusFilter(tab: string | null | undefined): StatusFilterShape {
  switch (tab) {
    case 'paid':
      return { eq: 'paid' };
    case 'processing':
      return { in: PROCESSING_GROUP };
    case 'shipped':
      return { in: SHIPPED_GROUP };
    case 'completed':
      return { eq: 'completed' };
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
