/**
 * Order-status badge config — SINGLE SOURCE for every admin surface that
 * renders a status pill (dashboard, orders list, …). Extracted 30.07.2026 from
 * the orders page: the dashboard had its own 9-entry copy, so every status
 * added since (documents_generated, standby, la_tradus…) showed up there as a
 * raw English slug.
 *
 * Labels match STATUS_OPTIONS (status-options.ts) — that list is what the
 * operator can SET; this map is how any status LOOKS.
 */

export interface StatusBadge {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const STATUS_BADGES: Record<string, StatusBadge> = {
  draft: { label: 'Ciornă', variant: 'secondary' },
  pending: { label: 'În așteptare', variant: 'outline' },
  abandoned: { label: 'Abandonată', variant: 'secondary', className: 'bg-neutral-200 text-neutral-700' },
  paid: { label: 'Plătită', variant: 'default', className: 'bg-green-600 text-white' },
  processing: { label: 'În procesare', variant: 'default', className: 'bg-blue-600 text-white' },
  documents_generated: { label: 'Documente generate', variant: 'default', className: 'bg-cyan-600 text-white' },
  submitted_to_institution: { label: 'Depus la instituție', variant: 'default', className: 'bg-indigo-500 text-white' },
  document_received: { label: 'Document primit', variant: 'default', className: 'bg-teal-600 text-white' },
  extras_in_progress: { label: 'Extras în lucru', variant: 'default', className: 'bg-orange-500 text-white' },
  la_tradus: { label: 'La traducere', variant: 'default', className: 'bg-sky-500 text-white' },
  la_legalizat: { label: 'La legalizare', variant: 'default', className: 'bg-fuchsia-500 text-white' },
  la_apostila_notari: { label: 'Apostilă Notari', variant: 'default', className: 'bg-pink-500 text-white' },
  eliberat_apostila_haga: { label: 'Apostilă Haga', variant: 'default', className: 'bg-purple-500 text-white' },
  delivered: { label: 'Livrată', variant: 'default', className: 'bg-green-600 text-white' },
  standby: { label: 'Așteptare client', variant: 'outline', className: 'border-amber-400 text-amber-800' },
  on_hold_institution: { label: 'Blocat instituție', variant: 'outline', className: 'border-red-400 text-red-800' },
  cancellation_requested: { label: 'Anulare solicitată', variant: 'destructive' },
  kyc_pending: { label: 'KYC în așteptare', variant: 'outline' },
  kyc_approved: { label: 'KYC aprobat', variant: 'default', className: 'bg-green-600 text-white' },
  kyc_rejected: { label: 'KYC respins', variant: 'destructive' },
  document_ready: { label: 'Document gata', variant: 'default', className: 'bg-indigo-600 text-white' },
  shipped: { label: 'Expediată', variant: 'default', className: 'bg-purple-600 text-white' },
  in_progress: { label: 'În lucru', variant: 'default', className: 'bg-blue-600 text-white' },
  completed: { label: 'Finalizată', variant: 'default', className: 'bg-green-700 text-white' },
  cancelled: { label: 'Anulată', variant: 'destructive' },
  refunded: { label: 'Rambursată', variant: 'destructive' },
};

/** Badge for a status — unknown statuses fall back to an outline pill with the
 *  raw value, so a brand-new status is visible (and obviously untranslated)
 *  instead of crashing. */
export function statusBadge(status: string | null | undefined): StatusBadge {
  return STATUS_BADGES[status ?? ''] ?? { label: status || 'N/A', variant: 'outline' };
}

/** Romanian label only (activity feed „→ Documente generate" etc.). */
export function statusLabel(status: string | null | undefined): string {
  return statusBadge(status).label;
}
