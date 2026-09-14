/**
 * Badge shown in the admin orders list (/admin/orders) next to the order id
 * when the order has an ONRC automation job. Lets the team see, without
 * opening /admin/onrc, that the bot did NOT deliver and the certificate must be
 * obtained manually (incident 14.09.2026: two paid orders failed silently in
 * the worker, the list showed nothing).
 */

export type OnrcJobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'AWAITING_DOCUMENT'
  | 'NEEDS_OPERATOR'
  | 'DONE'
  | 'FAILED';

export interface OnrcJobSummary {
  status: OnrcJobStatus | string;
  error_message: string | null;
}

export interface OnrcBadge {
  tone: 'error' | 'info';
  label: string;
  /** Hover text — the worker's error, or what the state means. */
  title: string;
}

const MANUAL_LABEL = 'ONRC automat eșuat — manual';

export function onrcAutomationBadge(job: OnrcJobSummary | null | undefined): OnrcBadge | null {
  if (!job) return null;
  switch (job.status) {
    case 'FAILED':
      return {
        tone: 'error',
        label: MANUAL_LABEL,
        title: job.error_message || 'Botul ONRC a eșuat — obține certificatul manual și încarcă-l din /admin/onrc.',
      };
    case 'NEEDS_OPERATOR':
      return {
        tone: 'error',
        label: MANUAL_LABEL,
        title: job.error_message || 'Necesită operator — obține certificatul manual și încarcă-l din /admin/onrc.',
      };
    case 'PENDING':
    case 'PROCESSING':
    case 'AWAITING_DOCUMENT':
      return {
        tone: 'info',
        label: 'ONRC automat în lucru',
        title: 'Botul ONRC lucrează la comanda asta — nu o depune și manual.',
      };
    default:
      return null;
  }
}
